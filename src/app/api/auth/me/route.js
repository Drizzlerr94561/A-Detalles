import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const usuario = await getAuthenticatedUser();

    if (!usuario) {
      return NextResponse.json({ autenticado: false }, { status: 200 });
    }

    return NextResponse.json({
      autenticado: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || "",
        role: usuario.role,
      },
    });
  } catch (error) {
    console.error("Error al verificar sesión me:", error);
    return NextResponse.json({ autenticado: false }, { status: 200 });
  }
}
