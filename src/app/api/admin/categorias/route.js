import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";
import { ErrorCatalogo, validarIdCatalogo, leerObjetoJson, validarNombreCatalogo, transaccionCatalogo, datosErrorCatalogo } from "@/lib/integridadCatalogo";

function respuestaError(error) {
  const { status, body } = datosErrorCatalogo(error, "No se pudo completar la operación de categorías. Intenta nuevamente.");
  if (status === 503) console.error("Error en categorías:", error?.code || "ERROR_BD");
  return NextResponse.json(body, { status });
}

async function exigirAdmin() {
  if (!(await verifyIsAdmin())) throw new ErrorCatalogo("No autorizado. Solo el administrador puede modificar categorías.", 403);
}

export async function GET() {
  try { return NextResponse.json(await prisma.categoria.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }] }), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    console.error("Error consultando categorías:", error?.code || "ERROR_BD");
    return NextResponse.json({ error: "No se pudieron consultar las categorías. Intenta nuevamente." }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    await exigirAdmin();
    const body = await leerObjetoJson(request);
    const nombre = validarNombreCatalogo(body.nombre, "nombre de categoría");
    const categoria = await transaccionCatalogo(prisma, async (tx) => {
      if (await tx.categoria.findUnique({ where: { nombre } })) throw new ErrorCatalogo("La categoría ya existe.", 409);
      const maximo = await tx.categoria.aggregate({ _max: { orden: true } });
      return tx.categoria.create({ data: { nombre, orden: (maximo._max.orden ?? -1) + 1 } });
    });
    return NextResponse.json(categoria, { status: 201 });
  } catch (error) { return respuestaError(error); }
}

export async function PUT(request) {
  try {
    await exigirAdmin();
    const body = await leerObjetoJson(request);
    const id = validarIdCatalogo(body.id, "ID de categoría");
    const nombre = validarNombreCatalogo(body.nuevoNombre, "nombre de categoría");
    const categoria = await transaccionCatalogo(prisma, async (tx) => {
      const anterior = await tx.categoria.findUnique({ where: { id } });
      if (!anterior) throw new ErrorCatalogo("La categoría no existe.", 404);
      const duplicada = await tx.categoria.findFirst({ where: { nombre, id: { not: id } } });
      if (duplicada) throw new ErrorCatalogo("Ya existe otra categoría con ese nombre.", 409);
      const actualizada = await tx.categoria.update({ where: { id }, data: { nombre } });
      // Compatible antes de migrar; con la FK el cambio ya se propaga por CASCADE.
      await tx.producto.updateMany({ where: { categoria: anterior.nombre }, data: { categoria: nombre } });
      await tx.producto.updateMany({ where: { categoria: nombre, etiqueta: anterior.nombre }, data: { etiqueta: nombre } });
      return actualizada;
    });
    return NextResponse.json({ success: true, categoria, mensaje: `Categoría renombrada a "${categoria.nombre}" y productos actualizados.` });
  } catch (error) { return respuestaError(error); }
}

export async function DELETE(request) {
  try {
    await exigirAdmin();
    const { searchParams } = new URL(request.url);
    let body = {};
    try { body = await request.json(); }
    catch {
      if (request.headers?.get("content-type")?.includes("application/json")) throw new ErrorCatalogo("El cuerpo debe contener JSON válido.");
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ErrorCatalogo("Los datos deben ser un objeto.");
    const id = validarIdCatalogo(searchParams.get("id") || body.id, "ID de categoría");
    const destinoRaw = body.categoriaDestinoId ?? searchParams.get("categoriaDestinoId");
    const destinoId = destinoRaw === null || destinoRaw === undefined ? null : validarIdCatalogo(destinoRaw, "ID de categoría destino");
    if (destinoId === id) throw new ErrorCatalogo("La categoría destino debe ser distinta de la que eliminas.");
    const resultado = await transaccionCatalogo(prisma, async (tx) => {
      const categoria = await tx.categoria.findUnique({ where: { id } });
      if (!categoria) throw new ErrorCatalogo("La categoría no existe o ya fue eliminada.", 404);
      const productosEnCategoria = await tx.producto.count({ where: { categoria: categoria.nombre } });
      if (productosEnCategoria > 0 && destinoId === null) throw new ErrorCatalogo("Elige una categoría de destino para conservar sus productos antes de eliminarla.", 409, { codigo: "CATEGORIA_OCUPADA", productosEnCategoria });
      let destino = null;
      if (destinoId !== null) {
        destino = await tx.categoria.findUnique({ where: { id: destinoId } });
        if (!destino) throw new ErrorCatalogo("La categoría destino no existe. Actualiza el listado.", 404);
      }
      if (productosEnCategoria > 0) {
        await tx.producto.updateMany({ where: { categoria: categoria.nombre, etiqueta: categoria.nombre }, data: { etiqueta: destino.nombre } });
        await tx.producto.updateMany({ where: { categoria: categoria.nombre }, data: { categoria: destino.nombre } });
      }
      await tx.categoria.delete({ where: { id } });
      return { categoria, destino, productosEnCategoria };
    });
    const { categoria, destino, productosEnCategoria } = resultado;
    return NextResponse.json({
      success: true, id, nombre: categoria.nombre, categoriaDestino: destino,
      productosReasignados: productosEnCategoria,
      mensaje: productosEnCategoria > 0 ? `Categoría "${categoria.nombre}" eliminada. Sus ${productosEnCategoria} productos pasaron a "${destino.nombre}".` : `Categoría "${categoria.nombre}" eliminada con éxito.`,
    });
  } catch (error) { return respuestaError(error); }
}
