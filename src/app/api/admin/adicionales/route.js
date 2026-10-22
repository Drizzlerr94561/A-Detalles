import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";
import { ErrorCatalogo, validarIdCatalogo, leerObjetoJson, validarNombreCatalogo, datosErrorCatalogo } from "@/lib/integridadCatalogo";

const tieneCampo = (body, campo) => Object.prototype.hasOwnProperty.call(body, campo);

function datosAdicional(body, crear = false) {
  const data = {};
  if (crear || tieneCampo(body, "nombre")) data.nombre = validarNombreCatalogo(body.nombre, "nombre", 255);
  if (crear || tieneCampo(body, "precio")) {
    const valor = body.precio;
    if ((typeof valor !== "number" && typeof valor !== "string") || (typeof valor === "string" && !valor.trim())) throw new ErrorCatalogo("El precio debe ser un número mayor o igual a cero.");
    const precio = Number(valor);
    if (!Number.isFinite(precio) || precio < 0) throw new ErrorCatalogo("El precio debe ser un número mayor o igual a cero.");
    data.precio = precio;
  }
  if (tieneCampo(body, "disponible")) {
    if (typeof body.disponible !== "boolean") throw new ErrorCatalogo("Disponible debe ser verdadero o falso.");
    data.disponible = body.disponible;
  } else if (crear) data.disponible = true;
  if (!Object.keys(data).length) throw new ErrorCatalogo("No se enviaron cambios para el adicional.");
  return data;
}

function respuestaError(error) {
  const { status, body } = datosErrorCatalogo(error, "No se pudo completar la operación de adicionales. Intenta nuevamente.");
  if (status === 503) console.error("Error en adicionales:", error?.code || "ERROR_BD");
  return NextResponse.json(body, { status });
}

async function exigirAdmin() {
  if (!(await verifyIsAdmin())) throw new ErrorCatalogo("No autorizado. Solo el administrador puede modificar adicionales.", 403);
}

export async function GET() {
  try { return NextResponse.json(await prisma.adicional.findMany({ orderBy: { createdAt: "asc" } }), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    console.error("Error consultando adicionales:", error?.code || "ERROR_BD");
    return NextResponse.json({ error: "No se pudieron consultar los adicionales. Intenta nuevamente." }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    await exigirAdmin();
    const data = datosAdicional(await leerObjetoJson(request), true);
    return NextResponse.json(await prisma.adicional.create({ data }), { status: 201 });
  } catch (error) { return respuestaError(error); }
}

export async function PUT(request) {
  try {
    await exigirAdmin();
    const body = await leerObjetoJson(request);
    const id = validarIdCatalogo(body.id, "ID de adicional");
    return NextResponse.json(await prisma.adicional.update({ where: { id }, data: datosAdicional(body) }));
  } catch (error) { return respuestaError(error); }
}

export async function DELETE(request) {
  try {
    await exigirAdmin();
    const id = validarIdCatalogo(new URL(request.url).searchParams.get("id"), "ID de adicional");
    await prisma.adicional.delete({ where: { id } });
    return NextResponse.json({ ok: true, mensaje: "Adicional eliminado correctamente." });
  } catch (error) { return respuestaError(error); }
}
