import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET: Obtener todas las direcciones guardadas del usuario autenticado
export async function GET() {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const direcciones = await prisma.direccion.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ direcciones, success: true });
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    return NextResponse.json({ error: "Error al consultar direcciones." }, { status: 500 });
  }
}

// POST: Crear una nueva dirección guardada
export async function POST(request) {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const {
      etiqueta,
      direccion,
      barrio,
      ciudad,
      destinatario,
      telefonoDestinatario,
      indicaciones,
      esPrincipal,
    } = body;

    if (!direccion || !direccion.trim()) {
      return NextResponse.json({ error: "La dirección es obligatoria." }, { status: 400 });
    }

    // Si se marca como principal, desmarcar las anteriores
    if (esPrincipal) {
      await prisma.direccion.updateMany({
        where: { usuarioId: usuario.id },
        data: { esPrincipal: false },
      });
    }

    const nuevaDireccion = await prisma.direccion.create({
      data: {
        usuarioId: usuario.id,
        etiqueta: etiqueta?.trim() || "Casa",
        direccion: direccion.trim(),
        barrio: barrio?.trim() || null,
        ciudad: ciudad?.trim() || "Barranquilla",
        destinatario: destinatario?.trim() || null,
        telefonoDestinatario: telefonoDestinatario?.trim() || null,
        indicaciones: indicaciones?.trim() || null,
        esPrincipal: Boolean(esPrincipal),
      },
    });

    return NextResponse.json(nuevaDireccion, { status: 201 });
  } catch (error) {
    console.error("Error al guardar dirección:", error);
    return NextResponse.json({ error: "Error al guardar la dirección." }, { status: 500 });
  }
}

// PUT: Actualizar una dirección existente
export async function PUT(request) {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      etiqueta,
      direccion,
      barrio,
      ciudad,
      destinatario,
      telefonoDestinatario,
      indicaciones,
      esPrincipal,
    } = body;

    if (!id || !direccion) {
      return NextResponse.json({ error: "ID y dirección son obligatorios." }, { status: 400 });
    }

    // Verificar que la dirección pertenezca al usuario
    const direccionExistente = await prisma.direccion.findFirst({
      where: { id: parseInt(id), usuarioId: usuario.id },
    });

    if (!direccionExistente) {
      return NextResponse.json({ error: "Dirección no encontrada." }, { status: 404 });
    }

    if (esPrincipal) {
      await prisma.direccion.updateMany({
        where: { usuarioId: usuario.id },
        data: { esPrincipal: false },
      });
    }

    const direccionActualizada = await prisma.direccion.update({
      where: { id: parseInt(id) },
      data: {
        etiqueta: etiqueta?.trim() || direccionExistente.etiqueta,
        direccion: direccion.trim(),
        barrio: barrio !== undefined ? (barrio?.trim() || null) : direccionExistente.barrio,
        ciudad: ciudad?.trim() || "Barranquilla",
        destinatario: destinatario !== undefined ? (destinatario?.trim() || null) : direccionExistente.destinatario,
        telefonoDestinatario: telefonoDestinatario !== undefined ? (telefonoDestinatario?.trim() || null) : direccionExistente.telefonoDestinatario,
        indicaciones: indicaciones !== undefined ? (indicaciones?.trim() || null) : direccionExistente.indicaciones,
        esPrincipal: esPrincipal !== undefined ? Boolean(esPrincipal) : direccionExistente.esPrincipal,
      },
    });

    return NextResponse.json(direccionActualizada);
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return NextResponse.json({ error: "Error al actualizar dirección." }, { status: 500 });
  }
}

// DELETE: Eliminar una dirección guardada
export async function DELETE(request) {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta parámetro id." }, { status: 400 });
    }

    // Comprobar pertenencia antes de eliminar
    const direccionExistente = await prisma.direccion.findFirst({
      where: { id: parseInt(id), usuarioId: usuario.id },
    });

    if (!direccionExistente) {
      return NextResponse.json({ error: "Dirección no encontrada o no pertenece a tu cuenta." }, { status: 404 });
    }

    await prisma.direccion.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ ok: true, mensaje: "Dirección eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    return NextResponse.json({ error: "Error al eliminar dirección." }, { status: 500 });
  }
}
