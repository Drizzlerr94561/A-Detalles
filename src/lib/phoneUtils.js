/**
 * phoneUtils.js - Utilidades de Telefonía Móvil de Colombia
 * 
 * Reglas basadas en la Comisión de Regulación de Comunicaciones (CRC):
 * - Longitud: 10 dígitos exactos.
 * - Inicia estrictamente por 3.
 * - Prefijos oficiales asignados por operador:
 *   - Tigo: 300, 301, 302, 304, 305
 *   - Claro: 310, 311, 312, 313, 314, 320, 321, 322, 323
 *   - Movistar: 315, 316, 317, 318, 319
 *   - WOM / Avantel: 350, 351
 *   - Virgin / Móviles Virtuales: 324
 */

// Mapeo de prefijos a operadores oficiales en Colombia
export const OPERADORES_COLOMBIA = {
  // Tigo
  "300": { name: "Tigo", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  "301": { name: "Tigo", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  "302": { name: "Tigo", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  "303": { name: "Tigo", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  "304": { name: "Tigo", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  "305": { name: "Tigo", badge: "bg-blue-100 text-blue-800 border-blue-200" },

  // Claro
  "310": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "311": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "312": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "313": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "314": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "320": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "321": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "322": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },
  "323": { name: "Claro", badge: "bg-red-100 text-red-800 border-red-200" },

  // Movistar
  "315": { name: "Movistar", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "316": { name: "Movistar", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "317": { name: "Movistar", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "318": { name: "Movistar", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "319": { name: "Movistar", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },

  // WOM / Avantel
  "350": { name: "WOM", badge: "bg-purple-100 text-purple-800 border-purple-200" },
  "351": { name: "WOM", badge: "bg-purple-100 text-purple-800 border-purple-200" },

  // Virgin / Móviles virtuales
  "324": { name: "Virgin / Móvil", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  "333": { name: "Móvil / OMV", badge: "bg-amber-100 text-amber-800 border-amber-200" },
};

/**
 * Extrae solo los dígitos de un valor de teléfono.
 * @param {string} val 
 * @returns {string} Dígitos limpios
 */
export function getCleanPhone(val) {
  return (val || "").replace(/\D/g, "");
}

/**
 * Formatea un número de celular colombiano de manera interactiva mientras se escribe:
 * Ej: 3012345678 -> 301 234 5678
 * @param {string} val 
 * @returns {string} Formateado
 */
export function formatPhoneCO(val) {
  const digits = getCleanPhone(val).slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/**
 * Normaliza un celular colombiano para enlaces oficiales de WhatsApp (prefijo 57).
 * @param {string} val 
 * @returns {string} Ej: 573012345678
 */
export function toWhatsAppCOPhone(val) {
  const clean = getCleanPhone(val);
  if (clean.startsWith("57") && clean.length === 12) {
    return clean;
  }
  return `57${clean.slice(0, 10)}`;
}

/**
 * Obtiene la información del operador celular a partir de los primeros 3 dígitos.
 * @param {string} phone 
 * @returns {{ name: string, badge: string } | null}
 */
export function getColombianOperator(phone) {
  const clean = getCleanPhone(phone);
  if (clean.length < 3) return null;
  const prefix = clean.slice(0, 3);
  return OPERADORES_COLOMBIA[prefix] || null;
}

/**
 * Valida de forma estricta un número de celular de Colombia.
 * Aplica validaciones de longitud, prefijos CRC y filtros de números ficticios.
 * 
 * @param {string} phone 
 * @param {{ required?: boolean, label?: string }} options 
 * @returns {{ valid: boolean, msg: string, operator: { name: string, badge: string } | null, clean: string, formatted: string }}
 */
export function validateColombianPhone(phone, { required = true, label = "El número celular" } = {}) {
  const raw = (phone || "").trim();
  const clean = getCleanPhone(raw);
  const formatted = formatPhoneCO(clean);

  // Si no es obligatorio y está vacío, es válido
  if (!required && !clean) {
    return { valid: true, msg: "", operator: null, clean: "", formatted: "" };
  }

  // Comprobar si está vacío
  if (!clean) {
    return {
      valid: false,
      msg: `${label} es obligatorio.`,
      operator: null,
      clean: "",
      formatted: "",
    };
  }

  // Comprobar inicio con '3'
  if (!clean.startsWith("3")) {
    return {
      valid: false,
      msg: `${label} debe ser un celular colombiano e iniciar por 3 (ej: 300 123 4567).`,
      operator: null,
      clean,
      formatted,
    };
  }

  // Comprobar longitud de 10 dígitos
  if (clean.length < 10) {
    return {
      valid: false,
      msg: `Faltan dígitos (${clean.length}/10). Debe tener 10 dígitos exactos.`,
      operator: getColombianOperator(clean),
      clean,
      formatted,
    };
  }

  if (clean.length > 10) {
    return {
      valid: false,
      msg: `Tiene demasiados dígitos (${clean.length}/10). Debe ser de 10 dígitos.`,
      operator: getColombianOperator(clean),
      clean: clean.slice(0, 10),
      formatted: formatPhoneCO(clean.slice(0, 10)),
    };
  }

  // Comprobar prefijo oficial de Colombia
  const prefix = clean.slice(0, 3);
  const operator = OPERADORES_COLOMBIA[prefix];
  if (!operator) {
    return {
      valid: false,
      msg: `El prefijo "${prefix}" no corresponde a un operador móvil en Colombia. Debe iniciar por 300-305, 310-324 o 350-351.`,
      operator: null,
      clean,
      formatted,
    };
  }

  // Filtro anti-ficticios (dígitos todos iguales, e.g. 3111111111, o parte posterior con ceros repetidos 3000000000)
  const sufijo = clean.slice(3);
  if (/^(\d)\1+$/.test(clean)) {
    return {
      valid: false,
      msg: "Por favor ingresa un número de celular real, no repetitivo.",
      operator,
      clean,
      formatted,
    };
  }

  if (/^0+$/.test(sufijo)) {
    return {
      valid: false,
      msg: "El número no puede terminar en todos ceros. Ingresa una línea activa real.",
      operator,
      clean,
      formatted,
    };
  }

  // Si pasa todas las validaciones
  return {
    valid: true,
    msg: "",
    operator,
    clean,
    formatted,
  };
}

/**
 * Calcula la posición precisa del cursor después de formatear interactivamente un teléfono.
 * Evita que el cursor salte al final cuando el usuario borra o inserta dígitos en el medio.
 * 
 * @param {string} rawVal - Valor sin formatear o recién modificado en el input
 * @param {number} cursorBefore - Posición del cursor antes del formateo
 * @param {string} formattedVal - Valor formateado resultante
 * @returns {number} Nueva posición adecuada del cursor
 */
export function calculatePhoneCursorPosition(rawVal, cursorBefore, formattedVal) {
  const digitsBeforeCursor = (rawVal || "").slice(0, cursorBefore).replace(/\D/g, "").length;
  if (digitsBeforeCursor === 0) return 0;

  let newCursor = 0;
  let counted = 0;
  for (let i = 0; i < formattedVal.length; i++) {
    if (/\d/.test(formattedVal[i])) {
      counted++;
    }
    if (counted === digitsBeforeCursor) {
      newCursor = i + 1;
      break;
    }
  }

  if (newCursor < formattedVal.length && formattedVal[newCursor] === " ") {
    newCursor++;
  }

  return newCursor;
}
