import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
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

    const { nombre, email, password, confirmPassword, telefono } = await request.json();

    if (!nombre || !nombre.trim()) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Por favor ingresa tu nombre completo." },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico." },
        { status: 400 }
      );
    }

    const emailLimpio = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpio)) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico válido (ej: usuario@gmail.com)." },
        { status: 400 }
      );
    }

    // Validación estricta: contraseña con más de 7 caracteres (mínimo 8)
    if (!password || typeof password !== "string" || password.length <= 7) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "La contraseña debe ser segura y tener más de 7 caracteres (mínimo 8 caracteres)." },
        { status: 400 }
      );
    }

    // Validación de confirmación de contraseña si fue enviada
    if (confirmPassword !== undefined && password !== confirmPassword) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Las contraseñas no coinciden. Por favor escríbelas iguales." },
        { status: 400 }
      );
    }

    // Bloquear intentos de registrar la cuenta de administrador oficial
    if (emailLimpio === "admin@adetallesbq.com") {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Este correo es exclusivo de la administración. Por favor inicia sesión directamente." },
        { status: 400 }
      );
    }

    // Verificar si el correo ya existe en MySQL
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailLimpio },
    });

    if (usuarioExistente) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Este correo electrónico ya se encuentra registrado. Intenta iniciar sesión." },
        { status: 400 }
      );
    }

    // Cifrar la contraseña con bcrypt antes de almacenarla en MySQL
    const hashedPassword = await bcrypt.hash(password, 10);

    // Todo nuevo usuario registrado a través de la web tiene rol estrictamente CLIENTE
    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: emailLimpio,
        telefono: telefono ? telefono.trim() : null,
        password: hashedPassword,
        role: "CLIENTE",
      },
    });

    // Registro exitoso: Reiniciamos el contador de la IP
    resetRateLimit(ip);

    // Enviar correo de bienvenida a su Gmail/email registrado
    sendWelcomeEmail({
      to: usuario.email,
      nombre: usuario.nombre,
    }).catch((err) => {
      console.error("Error no bloqueante al despachar correo de bienvenida:", err);
    });

    // Crear cookie de sesión
    const response = NextResponse.json({
      ok: true,
      mensaje: "Cuenta creada exitosamente.",
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
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error en API auth register:", error);
    return NextResponse.json(
      { error: "Error en el servidor al crear la cuenta." },
      { status: 500 }
    );
  }
}

