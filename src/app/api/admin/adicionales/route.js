import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";

const ADICIONALES_DEFECTO = [
  { nombre: "Globo metalizado decorativo", precio: 10000, disponible: true },
  { nombre: "Peluche mediano abrazable", precio: 25000, disponible: true },
  { nombre: "Caja de Chocolates Ferrero", precio: 20000, disponible: true },
  { nombre: "Tarjeta personalizada con dedicatoria", precio: 0, disponible: true },
  { nombre: "Botella de Vino / Espumoso", precio: 35000, disponible: true },
  { nombre: "Serie de Luces LED decorativas", precio: 15000, disponible: true },
];

// GET: Obtener lista completa de adicionales configurados
export async function GET() {
  try {
    const adicionales = await prisma.adicional.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(adicionales);
  } catch (error) {
    console.error("Error al obtener adicionales:", error);
    return NextResponse.json([]);
  }
}

// POST: Crear nuevo adicional (Admin exclusivo)
export async function POST(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede crear adicionales." }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, precio, disponible } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre del adicional es obligatorio." }, { status: 400 });
    }

    const nuevoAdicional = await prisma.adicional.create({
      data: {
        nombre: nombre.trim(),
        precio: parseFloat(precio) || 0,
        disponible: disponible !== undefined ? Boolean(disponible) : true,
      },
    });

    return NextResponse.json(nuevoAdicional, { status: 201 });
  } catch (error) {
    console.error("Error al crear adicional:", error);
    return NextResponse.json({ error: "Error al guardar el adicional." }, { status: 500 });
  }
}

// PUT: Editar adicional existente
export async function PUT(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede modificar adicionales." }, { status: 403 });
    }

    const body = await request.json();
    const { id, nombre, precio, disponible } = body;

    if (!id) {
      return NextResponse.json({ error: "Se requiere ID de adicional para actualizar." }, { status: 400 });
    }

    const adicionalActualizado = await prisma.adicional.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre?.trim(),
        precio: precio !== undefined ? parseFloat(precio) : undefined,
        disponible: disponible !== undefined ? Boolean(disponible) : undefined,
      },
    });

    return NextResponse.json(adicionalActualizado);
  } catch (error) {
    console.error("Error al actualizar adicional:", error);
    return NextResponse.json({ error: "Error al actualizar el adicional." }, { status: 500 });
  }
}

// DELETE: Eliminar adicional
export async function DELETE(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede eliminar adicionales." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta parámetro id." }, { status: 400 });
    }

    await prisma.adicional.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ ok: true, mensaje: "Adicional eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar adicional:", error);
    return NextResponse.json({ error: "Error al eliminar el adicional." }, { status: 500 });
  }
}
