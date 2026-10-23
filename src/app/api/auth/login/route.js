import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getClientIp, verifyRateLimit, registerFailedAttempt, resetRateLimit } from "@/lib/rateLimit";
import { signSessionToken, getAuthSecret } from "@/lib/auth";

export async function POST(request) {
  try {
    if (!getAuthSecret()) return NextResponse.json({ error: "La autenticación no está configurada. Contacta al administrador." }, { status: 503 });
    const ip = getClientIp(request);
    const rateCheck = verifyRateLimit(ip);

    if (rateCheck.blocked) {
      return NextResponse.json(
        { error: rateCheck.message },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (typeof email !== "string" || !email.trim() || email.length > 255 || typeof password !== "string" || !password || password.length > 512) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Por favor ingresa correo y contraseña." },
        { status: 400 }
      );
    }

    const emailLimpio = email.toLowerCase().trim();

    // Buscar usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailLimpio },
    });

    // Las cuentas administrativas se crean únicamente mediante el procedimiento de instalación.
    if (!usuario) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Credenciales inválidas. Revisa tu correo o contraseña." },
        { status: 401 }
      );
    }

    // Verificar contraseña con bcrypt
    let coincide = false;
    try {
      coincide = await bcrypt.compare(password, usuario.password);
    } catch {
      coincide = false;
    }

    // Si coincide con texto plano histórico, actualizar a hash bcrypt inmediatamente
    if (!coincide && !/^\$2[aby]\$\d{2}\$/.test(usuario.password) && usuario.password === password) {
      coincide = true;
      try {
        const nuevoHash = await bcrypt.hash(password, 10);
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { password: nuevoHash },
        });
      } catch (errHash) {
        console.error("Error al actualizar hash de password:", errHash?.code || "ERROR_BD");
      }
    }

    if (!coincide) {
      registerFailedAttempt(ip);
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

    // En caso de éxito, reiniciamos el contador de intentos de la IP
    resetRateLimit(ip);

    // Generar token firmado con HMAC-SHA256
    const token = signSessionToken({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono || "",
      role: usuario.role,
    });

    // Generar respuesta exitosa y establecer Cookie de Sesión blindada (httpOnly)
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

    response.cookies.set("admin_session", token, {
      httpOnly: true, // 🛡️ Proteger contra robo o manipulación vía JavaScript (XSS / DevTools)
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error en API auth login:", error?.code || "ERROR_AUTH");
    return NextResponse.json(
      { error: "Error en el servidor al autenticar." },
      { status: 500 }
    );
  }
}

