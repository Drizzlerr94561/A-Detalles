import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const ADMIN_EMAIL = "admin@adetallesbq.com";

/**
 * Obtiene los datos del usuario autenticado consultando la cookie y la base de datos MySQL.
 * @returns {Promise<{id: number, nombre: string, email: string, role: string}|null>}
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session") || cookieStore.get("user_session");

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    let sessionData = null;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return null;
    }

    if (!sessionData || !sessionData.email) {
      return null;
    }

    const emailLimpio = sessionData.email.toLowerCase().trim();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailLimpio },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true,
      },
    });

    return usuario || null;
  } catch (error) {
    console.error("Error en getAuthenticatedUser:", error);
    return null;
  }
}

/**
 * Verifica si el usuario autenticado tiene permisos de Administrador exclusivo.
 * Solo la cuenta admin@adetallesbq.com con rol ADMIN es admitida.
 * @returns {Promise<{id: number, nombre: string, email: string, role: string}|null>}
 */
export async function verifyIsAdmin() {
  const usuario = await getAuthenticatedUser();
  if (!usuario) {
    return null;
  }

  const emailLimpio = usuario.email.toLowerCase().trim();
  if (usuario.role === "ADMIN" && emailLimpio === ADMIN_EMAIL.toLowerCase().trim()) {
    return usuario;
  }

  return null;
}
