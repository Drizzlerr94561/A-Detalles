import { NextResponse } from "next/server";
import { verifyIsAdmin } from "@/lib/auth";
import { obtenerOrdenCategorias, guardarOrdenCategorias } from "@/lib/categoriasOrden";

// GET: Obtener el orden actual configurado para las categorías
export async function GET() {
  try {
    const orden = obtenerOrdenCategorias();
    return NextResponse.json({ success: true, orden });
  } catch (error) {
    console.error("Error al obtener orden de categorías:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el orden de categorías." },
      { status: 500 }
    );
  }
}

// PUT / POST: Guardar el nuevo orden de categorías (Solo Administrador)
export async function PUT(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "No autorizado. Solo el administrador puede modificar el orden de las categorías." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { orden } = body;

    if (!Array.isArray(orden) || orden.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un arreglo con los nombres de las categorías en su nuevo orden." },
        { status: 400 }
      );
    }

    const ordenGuardado = guardarOrdenCategorias(orden);

    return NextResponse.json({
      success: true,
      mensaje: "Orden de categorías actualizado exitosamente.",
      orden: ordenGuardado,
    });
  } catch (error) {
    console.error("Error al guardar orden de categorías:", error);
    return NextResponse.json(
      { error: "Error al guardar el nuevo orden de categorías." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return PUT(request);
}
