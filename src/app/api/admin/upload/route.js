import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { verifyIsAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { assetPropioValido, GRACIA_ASSET_MS, publicIdGestionado } from "@/lib/assetsCatalogo";

const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request) {
  let reserva;
  try {
    if (!(await verifyIsAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    if (!["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((key) => process.env[key])) {
      return NextResponse.json({ error: "El servicio de imágenes no está configurado." }, { status: 503 });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");
    if (folder && folder !== "adetallesbq/productos") return NextResponse.json({ error: "La carpeta de destino no es válida." }, { status: 400 });
    if (!file || typeof file.arrayBuffer !== "function" || !TIPOS.has(file.type) || !Number.isFinite(file.size) || file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Selecciona una imagen JPG, PNG, WEBP, AVIF o GIF de hasta 10 MB." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length !== file.size) return NextResponse.json({ error: "No se pudo leer la imagen completa." }, { status: 400 });
    const id = randomUUID();
    reserva = await prisma.assetCatalogo.create({ data: {
      id, publicId: publicIdGestionado(id), estado: "SUBIENDO", eliminarDesde: new Date(Date.now() + GRACIA_ASSET_MS),
    } });
    const uploadResult = await cloudinary.uploader.upload(`data:${file.type};base64,${buffer.toString("base64")}`, {
      public_id: reserva.publicId, resource_type: "image", overwrite: false, unique_filename: false,
      context: { application: "adetallesbq", managed_id: id },
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    const guardado = { ...reserva, url: uploadResult.secure_url };
    if (uploadResult.public_id !== reserva.publicId || !assetPropioValido(guardado, process.env.CLOUDINARY_CLOUD_NAME)) throw new Error("RESPUESTA_PROVEEDOR_INVALIDA");
    await prisma.assetCatalogo.update({ where: { id }, data: {
      url: guardado.url, estado: "TEMPORAL", eliminarDesde: new Date(Date.now() + GRACIA_ASSET_MS), ultimoError: null,
    } });
    return NextResponse.json({ url: guardado.url, public_id: reserva.publicId, assetId: id, filename: file.name });
  } catch {
    if (reserva) {
      try {
        await prisma.assetCatalogo.updateMany({
          where: { id: reserva.id, estado: { in: ["SUBIENDO", "TEMPORAL"] } },
          data: { estado: "PENDIENTE", eliminarDesde: new Date(Date.now() + GRACIA_ASSET_MS), ultimoError: "SUBIDA_NO_CONFIRMADA" },
        });
      } catch { /* La reserva previa a la subida permanece recuperable por el cron. */ }
    }
    return NextResponse.json({ error: "No se pudo guardar la imagen. Intenta nuevamente." }, { status: 503 });
  }
}
