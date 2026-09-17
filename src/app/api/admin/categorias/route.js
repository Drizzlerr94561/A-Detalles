import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";

const CATEGORIAS_DEFECTO = [
  "Amor y Amistad",
  "Regalos Sorpresa y Desayunos",
  "Arreglos Florales",
  "Catálogo de Decoraciones",
  "Cuadros Personalizados",
  "Peluches",
  "Catálogo Flores Amarillas",
];

// GET: Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json([]);
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

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre de la categoría es obligatorio." }, { status: 400 });
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

    if (!id || !nuevoNombre || !nuevoNombre.trim()) {
      return NextResponse.json({ error: "Se requiere ID y el nuevo nombre para la categoría." }, { status: 400 });
    }

    const catId = parseInt(id, 10);
    const nombreLimpio = nuevoNombre.trim();

    const catExistente = await prisma.categoria.findUnique({
      where: { id: catId },
    });

    if (!catExistente) {
      return NextResponse.json({ error: "La categoría no existe." }, { status: 404 });
    }

    // Verificar si el nuevo nombre ya lo usa otra categoría
    const nombreDuplicado = await prisma.categoria.findFirst({
      where: {
        nombre: nombreLimpio,
        id: { not: catId },
      },
    });

    if (nombreDuplicado) {
      return NextResponse.json({ error: "Ya existe otra categoría con ese nombre." }, { status: 400 });
    }

    // Actualizar nombre de la categoría
    const categoriaActualizada = await prisma.categoria.update({
      where: { id: catId },
      data: { nombre: nombreLimpio },
    });

    // Actualizar todos los productos vinculados a la categoría anterior
    await prisma.producto.updateMany({
      where: { categoria: catExistente.nombre },
      data: { categoria: nombreLimpio },
    });

    return NextResponse.json({
      success: true,
      categoria: categoriaActualizada,
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

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID de la categoría a eliminar." }, { status: 400 });
    }

    const catId = parseInt(id, 10);

    const catExistente = await prisma.categoria.findUnique({
      where: { id: catId },
    });

    if (!catExistente) {
      return NextResponse.json({ error: "La categoría no existe o ya fue eliminada." }, { status: 404 });
    }

    // Asegurar que la categoría "General" existe en la base de datos
    await prisma.categoria.upsert({
      where: { nombre: "General" },
      update: {},
      create: { nombre: "General" },
    });

    // Reasignar los productos que pertenecían a esta categoría a "General"
    if (catExistente.nombre !== "General") {
      await prisma.producto.updateMany({
        where: { categoria: catExistente.nombre },
        data: { categoria: "General" },
      });
    }

    // Eliminar la categoría
    await prisma.categoria.delete({
      where: { id: catId },
    });

    return NextResponse.json({
      success: true,
      id: catId,
      nombre: catExistente.nombre,
      mensaje: `Categoría "${catExistente.nombre}" eliminada. Los productos asociados pasaron a "General".`,
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ error: "Error al eliminar la categoría." }, { status: 500 });
  }
}
