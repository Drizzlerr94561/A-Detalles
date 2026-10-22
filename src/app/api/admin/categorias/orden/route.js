import { NextResponse } from "next/server";
import { verifyIsAdmin } from "@/lib/auth";
import { obtenerOrdenCategorias, guardarOrdenCategorias } from "@/lib/categoriasOrden";
import { ErrorCatalogo, leerObjetoJson, datosErrorCatalogo } from "@/lib/integridadCatalogo";

function respuestaError(error) {
  if (error?.code === "P2025") return NextResponse.json({ error: "Las categorías cambiaron. Actualiza el listado." }, { status: 409 });
  const { status, body } = datosErrorCatalogo(error, "No se pudo guardar o consultar el orden. Intenta nuevamente.");
  return NextResponse.json(body, { status });
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, orden: await obtenerOrdenCategorias({ fallback: false }), source: "bd" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return respuestaError(error); }
}

export async function PUT(request) {
  try {
    if (!(await verifyIsAdmin())) throw new ErrorCatalogo("No autorizado. Solo el administrador puede modificar el orden.", 403);
    const body = await leerObjetoJson(request);
    return NextResponse.json({ success: true, orden: await guardarOrdenCategorias(body.orden), mensaje: "Orden de categorías actualizado exitosamente." });
  } catch (error) { return respuestaError(error); }
}

export const POST = PUT;
