import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PUT(request) {
  try {
    const usuarioAuth = await getAuthenticatedUser();
    if (!usuarioAuth) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const passwordActual = body.passwordActual;
    const passwordNueva = body.passwordNueva || body.nuevaPassword;
    const confirmPassword = body.confirmPassword || body.confirmarPassword;

    if (!passwordActual || !passwordNueva) {
      return NextResponse.json({ error: "Por favor completa todos los campos de contraseña." }, { status: 400 });
    }

    // Validar longitud de la nueva contraseña (> 7 caracteres)
    if (typeof passwordNueva !== "string" || passwordNueva.length <= 7) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener más de 7 caracteres (mínimo 8)." },
        { status: 400 }
      );
    }

    if (confirmPassword && passwordNueva !== confirmPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña y la confirmación no coinciden." },
        { status: 400 }
      );
    }

    // Obtener contraseña almacenada en la base de datos
    const usuarioDB = await prisma.usuario.findUnique({
      where: { id: usuarioAuth.id },
      select: { id: true, password: true },
    });

    if (!usuarioDB) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // Comparar contraseña actual con bcrypt o texto plano
    let coincide = false;
    try {
      coincide = await bcrypt.compare(passwordActual, usuarioDB.password);
    } catch {
      coincide = false;
    }

    if (!coincide && usuarioDB.password !== passwordActual) {
      return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 400 });
    }

    // Hashear la nueva contraseña con bcrypt
    const hashedNewPassword = await bcrypt.hash(passwordNueva, 10);

    await prisma.usuario.update({
      where: { id: usuarioDB.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      ok: true,
      mensaje: "¡Contraseña cambiada exitosamente!",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ error: "Error en el servidor al cambiar contraseña." }, { status: 500 });
  }
}
