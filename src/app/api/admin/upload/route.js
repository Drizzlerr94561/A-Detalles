import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { verifyIsAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { assetPropioValido, GRACIA_ASSET_MS, publicIdGestionado } from "@/lib/assetsCatalogo";
import { validarImagenSubida } from "@/lib/imagenesSubida";

const TIMEOUT_SUBIDA_MS = 30000;
const CODIGOS_DIAGNOSTICO = new Set([
  "P1000", "P1001", "P1002", "P1008", "P1010", "P1011", "P1013", "P1014", "P1017",
  "P2000", "P2002", "P2003", "P2004", "P2006", "P2009", "P2010", "P2011", "P2012", "P2013",
  "P2021", "P2022", "P2023", "P2024", "P2025", "P2028", "P2034",
  "ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "TIMEOUT_SUBIDA",
  "RESPUESTA_PUBLIC_ID_INVALIDA", "RESPUESTA_URL_INVALIDA",
]);

function registrarFalloSubida(fase, error) {
  // Los errores del proveedor pueden contener claves, firmas y URLs: nunca se registran completos.
  const detalle = { fase, codigo: `SUBIDA_${fase}` };
  if (CODIGOS_DIAGNOSTICO.has(error?.code)) detalle.causa = error.code;
  if (fase === "PROVEEDOR" && typeof error?.message === "string") {
    // Se reconocen prefijos conocidos y solo sale una constante; el mensaje puede incluir credenciales.
    if (/^(?:Invalid api_key|Unknown API key)(?:\b|:)/i.test(error.message)) detalle.causa = "PROVEEDOR_CLAVE_INVALIDA";
    else if (/^Invalid Signature(?:\b|:)/i.test(error.message)) detalle.causa = "PROVEEDOR_FIRMA_INVALIDA";
    else if (/^(?:Unknown cloud name|Invalid cloud_name|cloud_name is (?:disabled|invalid))(?:\b|:)/i.test(error.message)) detalle.causa = "PROVEEDOR_CUENTA_INVALIDA";
  }
  if (Number.isInteger(error?.http_code) && error.http_code >= 100 && error.http_code <= 599) detalle.http_code = error.http_code;
  console.error("FALLO_SUBIDA_IMAGEN", detalle);
  return detalle.codigo;
}

async function subirConTimeout(archivo, opciones) {
  let timer;
  try {
    return await Promise.race([
      cloudinary.uploader.upload(archivo, { ...opciones, timeout: TIMEOUT_SUBIDA_MS }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error("Tiempo de subida agotado."), { code: "TIMEOUT_SUBIDA" })), TIMEOUT_SUBIDA_MS);
      }),
    ]);
  } finally { clearTimeout(timer); }
}

export async function POST(request) {
  let reserva;
  let fase = "AUTORIZACION";
  try {
    if (!(await verifyIsAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    if (!["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((key) => process.env[key])) {
      const code = registrarFalloSubida("CONFIGURACION");
      return NextResponse.json({ error: "El servicio de imágenes no está configurado.", code }, { status: 503 });
    }
    fase = "LECTURA";
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");
    if (folder && folder !== "adetallesbq/productos") return NextResponse.json({ error: "La carpeta de destino no es válida." }, { status: 400 });
    const errorImagen = validarImagenSubida(file);
    if (errorImagen) return NextResponse.json({ error: errorImagen.error }, { status: errorImagen.status });
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length !== file.size) return NextResponse.json({ error: "No se pudo leer la imagen completa." }, { status: 400 });
    const id = randomUUID();
    fase = "RESERVA";
    reserva = await prisma.assetCatalogo.create({ data: {
      id, publicId: publicIdGestionado(id), estado: "SUBIENDO", eliminarDesde: new Date(Date.now() + GRACIA_ASSET_MS),
    } });
    fase = "PROVEEDOR";
    const uploadResult = await subirConTimeout(`data:${file.type};base64,${buffer.toString("base64")}`, {
      public_id: reserva.publicId, resource_type: "image", overwrite: false, unique_filename: false,
      context: { application: "adetallesbq", managed_id: id },
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    fase = "VALIDACION_RESPUESTA";
    const guardado = { ...reserva, url: uploadResult.secure_url };
    if (uploadResult.public_id !== reserva.publicId) throw Object.assign(new Error("Respuesta de imagen no verificable."), { code: "RESPUESTA_PUBLIC_ID_INVALIDA" });
    if (!assetPropioValido(guardado, process.env.CLOUDINARY_CLOUD_NAME)) throw Object.assign(new Error("Respuesta de imagen no verificable."), { code: "RESPUESTA_URL_INVALIDA" });
    fase = "CONFIRMACION";
    await prisma.assetCatalogo.update({ where: { id }, data: {
      url: guardado.url, estado: "TEMPORAL", eliminarDesde: new Date(Date.now() + GRACIA_ASSET_MS), ultimoError: null,
    } });
    return NextResponse.json({ url: guardado.url, public_id: reserva.publicId, assetId: id, filename: file.name });
  } catch (error) {
    const code = registrarFalloSubida(fase, error);
    if (reserva) {
      try {
        await prisma.assetCatalogo.updateMany({
          where: { id: reserva.id, estado: { in: ["SUBIENDO", "TEMPORAL"] } },
          data: { estado: "PENDIENTE", eliminarDesde: new Date(Date.now() + GRACIA_ASSET_MS), ultimoError: "SUBIDA_NO_CONFIRMADA" },
        });
      } catch (errorRecuperacion) {
        registrarFalloSubida("RECUPERACION", errorRecuperacion);
        // La reserva previa a la subida permanece recuperable por el cron.
      }
    }
    return NextResponse.json({ error: "No se pudo guardar la imagen. Intenta nuevamente.", code }, { status: 503 });
  }
}
