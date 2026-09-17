/**
 * Rate Limiter en memoria para proteger las rutas de autenticación (/api/auth/login y /api/auth/register)
 * contra ataques de fuerza bruta.
 * 
 * Regla: Si una IP acumula 5 o más intentos fallidos en menos de 15 minutos,
 * se bloquean temporalmente sus nuevos intentos retornando un código HTTP 429.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos en milisegundos
const MAX_INTENTOS_FALLIDOS = 5; // Máximo 5 intentos fallidos antes del bloqueo

// Preservar la memoria en globalThis para resistir recargas HMR en Next.js
if (!globalThis.__authRateLimitStore) {
  globalThis.__authRateLimitStore = new Map();
}

const rateLimitStore = globalThis.__authRateLimitStore;

/**
 * Obtiene la dirección IP real del cliente desde la solicitud HTTP.
 * @param {Request} request 
 * @returns {string} IP del cliente
 */
export function getClientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Limpia automáticamente de la memoria los registros cuyo tiempo de ventana (15 min) haya expirado.
 */
function cleanupExpired() {
  const ahora = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (ahora > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Verifica si una IP está bloqueada por haber superado el límite de intentos fallidos.
 * @param {string} ip 
 * @returns {{ blocked: boolean, message?: string }}
 */
export function verifyRateLimit(ip) {
  cleanupExpired();
  const ahora = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    return { blocked: false };
  }

  // Si la ventana de 15 minutos transcurrió, reiniciar el registro
  if (ahora > record.resetTime) {
    rateLimitStore.delete(ip);
    return { blocked: false };
  }

  // Si ha alcanzado o superado los 5 intentos fallidos
  if (record.intentos >= MAX_INTENTOS_FALLIDOS) {
    const minutosRestantes = Math.ceil((record.resetTime - ahora) / 60000);
    return {
      blocked: true,
      message: `Has superado el límite de 5 intentos fallidos desde tu IP. Por seguridad, los accesos se encuentran bloqueados temporalmente. Por favor intenta de nuevo en ${minutosRestantes} minuto(s).`,
    };
  }

  return { blocked: false };
}

/**
 * Registra un intento de autenticación fallido para la IP correspondiente.
 * @param {string} ip 
 */
export function registerFailedAttempt(ip) {
  cleanupExpired();
  const ahora = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || ahora > record.resetTime) {
    rateLimitStore.set(ip, {
      intentos: 1,
      resetTime: ahora + WINDOW_MS,
    });
  } else {
    record.intentos += 1;
    rateLimitStore.set(ip, record);
  }
}

/**
 * Elimina los intentos acumulados de la IP cuando el login o registro sea exitoso.
 * @param {string} ip 
 */
export function resetRateLimit(ip) {
  rateLimitStore.delete(ip);
}
