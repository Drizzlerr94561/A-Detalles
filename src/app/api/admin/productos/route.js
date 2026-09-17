import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";

// GET: Obtener lista completa de productos
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error al consultar la base de datos." }, { status: 500 });
  }
}

// POST: Crear nuevo producto en la base de datos
export async function POST(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede crear productos." }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, descripcion, precio, categoria, etiqueta, imagen, stock } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio." }, { status: 400 });
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || "",
        precio: parseFloat(precio) || 0,
        stock: 999999,
        categoria: categoria || "General",
        etiqueta: etiqueta?.trim() || categoria || "General",
        imagen: imagen || "/images/Canastita.png",
      },
    });

    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: "Error al crear el producto en MySQL." }, { status: 500 });
  }
}

// PUT: Editar producto existente
export async function PUT(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede modificar productos." }, { status: 403 });
    }

    const body = await request.json();
    const { id, nombre, descripcion, precio, categoria, etiqueta, imagen, stock } = body;

    if (!id) {
      return NextResponse.json({ error: "Se requiere ID de producto para actualizar." }, { status: 400 });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion: descripcion || "",
        precio: parseFloat(precio) || 0,
        stock: 999999,
        categoria: categoria || "General",
        etiqueta: etiqueta !== undefined ? etiqueta?.trim() : undefined,
        imagen: imagen || "/images/Canastita.png",
      },
    });

    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error al actualizar producto." }, { status: 500 });
  }
}

// DELETE: Eliminar producto
export async function DELETE(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede eliminar productos." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta parámetro id." }, { status: 400 });
    }

    await prisma.producto.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ ok: true, mensaje: "Producto eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto." }, { status: 500 });
  }
}
