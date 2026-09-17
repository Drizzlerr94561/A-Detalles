import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET: Obtener datos del perfil del usuario autenticado
export async function GET() {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || "",
        role: usuario.role,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ error: "Error al consultar perfil." }, { status: 500 });
  }
}

// PUT: Actualizar datos personales del usuario (nombre y teléfono)
export async function PUT(request) {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { nombre, telefono } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        nombre: nombre.trim(),
        telefono: telefono ? telefono.trim() : null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true,
      },
    });

    return NextResponse.json({
      ok: true,
      mensaje: "Datos actualizados correctamente.",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error al actualizar perfil." }, { status: 500 });
  }
}
