export class ErrorCatalogo extends Error {
  constructor(message, status = 400, detalles = {}) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

export function validarIdCatalogo(valor, campo = "ID") {
  const texto = typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
  if (!/^\d+$/.test(texto)) throw new ErrorCatalogo(`${campo} debe ser un entero positivo válido.`);
  const id = Number(texto);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) throw new ErrorCatalogo(`${campo} debe ser un entero entre 1 y 2147483647.`);
  return id;
}

export async function leerObjetoJson(request) {
  let body;
  try { body = await request.json(); }
  catch { throw new ErrorCatalogo("El cuerpo debe contener JSON válido."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ErrorCatalogo("Los datos deben ser un objeto.");
  return body;
}

export function validarNombreCatalogo(valor, campo = "nombre", maximo = 100) {
  if (typeof valor !== "string" || !valor.trim() || valor.trim().length > maximo) throw new ErrorCatalogo(`El ${campo} debe tener entre 1 y ${maximo} caracteres.`);
  return valor.trim().replace(/\s+/g, " ");
}

export async function transaccionCatalogo(cliente, operacion) {
  for (let intento = 0; intento < 3; intento++) {
    try { return await cliente.$transaction(operacion, { isolationLevel: "Serializable" }); }
    catch (error) { if (error?.code !== "P2034" || intento === 2) throw error; }
  }
}

export async function exigirCategoria(tx, nombre) {
  const categoria = await tx.categoria.findUnique({ where: { nombre } });
  if (!categoria) throw new ErrorCatalogo("La categoría ya no existe. Actualiza el catálogo y elige otra categoría.", 409, { codigo: "CATEGORIA_NO_EXISTE" });
  return categoria.nombre;
}

export function datosErrorCatalogo(error, mensaje) {
  if (error instanceof ErrorCatalogo) return { status: error.status, body: { error: error.message, ...error.detalles } };
  if (error?.code === "P2025") return { status: 404, body: { error: "El registro no existe o ya fue eliminado." } };
  if (error?.code === "P2002") return { status: 409, body: { error: "Ya existe un registro con ese nombre o identificador." } };
  if (error?.code === "P2003") return { status: 409, body: { error: "La categoría cambió o todavía tiene productos. Actualiza los datos e inténtalo de nuevo." } };
  return { status: 503, body: { error: mensaje } };
}
