import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";

function parseCategoriaId(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = typeof value === "string" ? value.trim() : String(value ?? "");
  if (!/^\d+$/.test(text)) return null;
  const id = Number(text);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

const TRANSACTION_OPTIONS = { isolationLevel: "Serializable" };

// GET: Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar las categorías. Intenta nuevamente." },
      { status: 503 }
    );
  }
}

// POST: Crear una nueva categoría
export async function POST(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede crear categorías." }, { status: 403 });
    }

    const body = await request.json();
    const { nombre } = body;

    if (typeof nombre !== "string" || !nombre.trim() || nombre.trim().length > 100) {
      return NextResponse.json({ error: "El nombre de la categoría debe tener entre 1 y 100 caracteres." }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();

    // Verificar si ya existe
    const existente = await prisma.categoria.findUnique({
      where: { nombre: nombreLimpio },
    });

    if (existente) {
      return NextResponse.json({ error: "La categoría ya existe." }, { status: 400 });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre: nombreLimpio },
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json({ error: "Error al guardar la categoría." }, { status: 500 });
  }
}

// PUT: Renombrar categoría existente y actualizar productos vinculados
export async function PUT(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede modificar categorías." }, { status: 403 });
    }

    const body = await request.json();
    const { id, nuevoNombre } = body;

    const catId = parseCategoriaId(id);
    if (catId === null || typeof nuevoNombre !== "string" || !nuevoNombre.trim() || nuevoNombre.trim().length > 100) {
      return NextResponse.json({ error: "Se requiere un ID válido y un nombre de categoría de entre 1 y 100 caracteres." }, { status: 400 });
    }

    const nombreLimpio = nuevoNombre.trim();

    const resultado = await prisma.$transaction(async (tx) => {
      const catExistente = await tx.categoria.findUnique({ where: { id: catId } });
      if (!catExistente) {
        return { error: "La categoría no existe.", status: 404 };
      }

      const nombreDuplicado = await tx.categoria.findFirst({
        where: { nombre: nombreLimpio, id: { not: catId } },
      });
      if (nombreDuplicado) {
        return { error: "Ya existe otra categoría con ese nombre.", status: 409 };
      }

      const categoriaActualizada = await tx.categoria.update({
        where: { id: catId },
        data: { nombre: nombreLimpio },
      });
      await tx.producto.updateMany({
        where: { categoria: catExistente.nombre },
        data: { categoria: nombreLimpio },
      });
      return { categoria: categoriaActualizada };
    }, TRANSACTION_OPTIONS);

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }

    return NextResponse.json({
      success: true,
      categoria: resultado.categoria,
      mensaje: `Categoría renombrada a "${nombreLimpio}" y productos actualizados.`,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json({ error: "Error al modificar la categoría." }, { status: 500 });
  }
}

// DELETE: Eliminar categoría y reasignar productos huérfanos a "General"
export async function DELETE(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede eliminar categorías." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (id === null || id === undefined || id === "") {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    const catId = parseCategoriaId(id);
    if (catId === null) {
      return NextResponse.json({ error: "Se requiere un ID de categoría válido para eliminar." }, { status: 400 });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const catExistente = await tx.categoria.findUnique({ where: { id: catId } });
      if (!catExistente) {
        return { error: "La categoría no existe o ya fue eliminada.", status: 404 };
      }

      const productosEnCategoria = await tx.producto.count({
        where: { categoria: catExistente.nombre },
      });
      if (productosEnCategoria > 0 && catExistente.nombre.toLowerCase() === "general") {
        return {
          error: "No se puede eliminar General mientras tenga productos. Reasigna sus productos antes de eliminarla.",
          status: 409,
        };
      }

      if (productosEnCategoria > 0) {
        await tx.categoria.upsert({
          where: { nombre: "General" },
          update: {},
          create: { nombre: "General" },
        });
        await tx.producto.updateMany({
          where: { categoria: catExistente.nombre },
          data: { categoria: "General" },
        });
      }
      await tx.categoria.delete({ where: { id: catId } });
      return { nombre: catExistente.nombre, productosEnCategoria };
    }, TRANSACTION_OPTIONS);

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }

    const mensajeRespuesta = resultado.productosEnCategoria > 0
      ? `Categoría "${resultado.nombre}" eliminada. Sus ${resultado.productosEnCategoria} productos pasaron a "General".`
      : `Categoría "${resultado.nombre}" eliminada con éxito.`;

    return NextResponse.json({
      success: true,
      id: catId,
      nombre: resultado.nombre,
      mensaje: mensajeRespuesta,
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ error: "Error al eliminar la categoría." }, { status: 500 });
  }
}
