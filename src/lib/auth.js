import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const ADMIN_EMAIL = "admin@adetallesbq.com";
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "adetallesbq_super_secret_session_key_2026";

/**
 * Genera un token firmado criptográficamente con HMAC-SHA256.
 * @param {object} payload 
 * @returns {string} Token firmado en formato base64url: payload.firma
 */
export function signSessionToken(payload) {
  const payloadConExp = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días de validez
  };
  const payloadStr = Buffer.from(JSON.stringify(payloadConExp)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

/**
 * Valida la firma criptográfica y expiración de un token de sesión.
 * @param {string} token 
 * @returns {object|null} Payload decodificado si la firma es válida, o null si fue alterado
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payloadStr, signature] = token.split(".");
  if (!payloadStr || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadStr)
    .digest("base64url");

  // Comparación resistente a ataques de temporización (timing-safe)
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null; // Firma inválida o cookie falsificada
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Token expirado
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Obtiene los datos del usuario autenticado validando la firma criptográfica de la cookie.
 * @returns {Promise<{id: number, nombre: string, email: string, role: string}|null>}
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session") || cookieStore.get("user_session");

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    // Validar token firmado
    const sessionData = verifySessionToken(sessionCookie.value);
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
