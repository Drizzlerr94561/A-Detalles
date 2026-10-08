import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { catalogoOficial } from "@/lib/catalogoOficial";
import { verifyIsAdmin } from "@/lib/auth";

// GET: Obtener lista completa de productos (fusionando BD y catálogo oficial sin perder tarjetas)
export async function GET() {
  try {
    const productosDB = await prisma.producto.findMany({
      orderBy: { createdAt: "desc" },
    });
    const dbProds = Array.isArray(productosDB) ? productosDB : [];
    const dbIds = new Set(dbProds.map((p) => p.id));
    const dbNombres = new Set(dbProds.map((p) => (p.nombre || "").trim().toLowerCase()));

    const oficialesFiltrados = catalogoOficial.filter(
      (c) => !dbIds.has(c.id) && !dbNombres.has((c.nombre || "").trim().toLowerCase())
    );

    const combinados = [...dbProds, ...oficialesFiltrados];
    return NextResponse.json(combinados);
  } catch (error) {
    console.error("Error al consultar productos desde MySQL:", error);
    return NextResponse.json(catalogoOficial);
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
    const { nombre, descripcion, precio, categoria, etiqueta, imagen, imagenes } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio." }, { status: 400 });
    }

    const listaImagenes = Array.isArray(imagenes) && imagenes.length > 0
      ? imagenes.filter(Boolean)
      : (imagen ? [imagen] : []);
    const imagenPortada = listaImagenes[0] || imagen || "https://res.cloudinary.com/enwlpozz/image/upload/v1789706771/adetallesbq/banners/canastita.jpg";

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || "",
        precio: parseFloat(precio) || 0,
        stock: 999999,
        categoria: categoria || "General",
        etiqueta: etiqueta?.trim() || categoria || "General",
        imagen: imagenPortada,
        imagenes: JSON.parse(JSON.stringify(listaImagenes)),
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
    const { id, nombre, descripcion, precio, categoria, etiqueta, imagen, imagenes } = body;

    if (!id) {
      return NextResponse.json({ error: "Se requiere ID de producto para actualizar." }, { status: 400 });
    }

    const listaImagenes = Array.isArray(imagenes) && imagenes.length > 0
      ? imagenes.filter(Boolean)
      : (imagen ? [imagen] : []);
    const imagenPortada = listaImagenes[0] || imagen || "https://res.cloudinary.com/enwlpozz/image/upload/v1789706771/adetallesbq/banners/canastita.jpg";

    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion: descripcion || "",
        precio: parseFloat(precio) || 0,
        stock: 999999,
        categoria: categoria || "General",
        etiqueta: etiqueta !== undefined ? etiqueta?.trim() : undefined,
        imagen: imagenPortada,
        imagenes: JSON.parse(JSON.stringify(listaImagenes)),
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
