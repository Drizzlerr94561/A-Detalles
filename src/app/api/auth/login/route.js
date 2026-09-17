import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getClientIp, verifyRateLimit, registerFailedAttempt, resetRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = verifyRateLimit(ip);

    if (rateCheck.blocked) {
      return NextResponse.json(
        { error: rateCheck.message },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Por favor ingresa correo y contraseña." },
        { status: 400 }
      );
    }

    const emailLimpio = email.toLowerCase().trim();

    // Buscar usuario en la base de datos
    let usuario = await prisma.usuario.findUnique({
      where: { email: emailLimpio },
    });

    // Auto-crear cuenta admin si no existe en MySQL
    if (!usuario && emailLimpio === "admin@adetallesbq.com") {
      const hashedPassword = await bcrypt.hash(password || "admin", 10);
      usuario = await prisma.usuario.create({
        data: {
          email: "admin@adetallesbq.com",
          password: hashedPassword,
          nombre: "Administrador Adetallesbq",
          role: "ADMIN",
        },
      });
    }

    if (!usuario) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Credenciales inválidas. Revisa tu correo o contraseña." },
        { status: 401 }
      );
    }

    // Verificar contraseña con bcrypt o texto plano
    let coincide = false;
    try {
      coincide = await bcrypt.compare(password, usuario.password);
    } catch {
      coincide = false;
    }

    if (!coincide && usuario.password !== password) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

    // En caso de éxito, reiniciamos el contador de intentos de la IP
    resetRateLimit(ip);

    // Generar respuesta exitosa y establecer Cookie de Sesión
    const response = NextResponse.json({
      ok: true,
      mensaje: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || "",
        role: usuario.role,
      },
    });

    response.cookies.set("admin_session", JSON.stringify({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono || "",
      role: usuario.role,
    }), {
      httpOnly: false, // Permitir acceso seguro tanto en HTTP como JS
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error en API auth login:", error);
    return NextResponse.json(
      { error: "Error en el servidor al autenticar." },
      { status: 500 }
    );
  }
}

