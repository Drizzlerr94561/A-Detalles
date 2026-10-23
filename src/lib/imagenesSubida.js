// Deja margen para multipart por debajo del límite de 4.5 MB de Vercel.
export const MAX_IMAGEN_BYTES = 4 * 1024 * 1024;
export const TIPOS_IMAGEN = Object.freeze(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
export const ACEPTAR_IMAGENES = TIPOS_IMAGEN.join(",");
export const AYUDA_IMAGEN = "JPG, PNG, WEBP, AVIF o GIF. Máximo 4 MB por foto.";
export const ERROR_IMAGEN_TAMANO = "La imagen supera el límite de 4 MB. Elige una foto más liviana e intenta nuevamente.";

export function validarImagenSubida(file) {
  if (!file || typeof file.arrayBuffer !== "function" || !TIPOS_IMAGEN.includes(file.type)
    || !Number.isFinite(file.size) || file.size < 1) {
    return { error: "Selecciona una imagen JPG, PNG, WEBP, AVIF o GIF de hasta 4 MB.", status: 400 };
  }
  if (file.size > MAX_IMAGEN_BYTES) return { error: ERROR_IMAGEN_TAMANO, status: 413 };
  return null;
}
