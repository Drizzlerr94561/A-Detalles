import prisma from "./prisma.js";
import ordenInicial from "./categoriasOrden.json";
import { ErrorCatalogo, transaccionCatalogo } from "./integridadCatalogo.js";

export async function obtenerOrdenCategorias({ cliente = prisma, fallback = true } = {}) {
  try {
    const categorias = await cliente.categoria.findMany({ orderBy: [{ orden: "asc" }, { nombre: "asc" }], select: { nombre: true } });
    return categorias.map((cat) => cat.nombre);
  } catch (error) {
    if (!fallback) throw error;
    // Solo aporta prioridad visual; nunca agrega categorías o productos al catálogo.
    return [...ordenInicial];
  }
}

export async function guardarOrdenCategorias(orden, { cliente = prisma } = {}) {
  if (!Array.isArray(orden) || orden.some((n) => typeof n !== "string" || !n.trim() || n.length > 100)) throw new ErrorCatalogo("El orden debe ser una lista de nombres de categorías.");
  const limpio = orden.map((nombre) => nombre.trim());
  if (new Set(limpio).size !== limpio.length) throw new ErrorCatalogo("El orden no puede repetir categorías.");
  return transaccionCatalogo(cliente, async (tx) => {
    const categorias = await tx.categoria.findMany({ select: { id: true, nombre: true } });
    const ids = new Map(categorias.map((c) => [c.nombre, c.id]));
    if (categorias.length !== limpio.length || limpio.some((n) => !ids.has(n))) throw new ErrorCatalogo("Las categorías cambiaron. Actualiza el listado antes de guardar el orden.", 409);
    for (const [posicion, nombre] of limpio.entries()) await tx.categoria.update({ where: { id: ids.get(nombre) }, data: { orden: posicion } });
    return limpio;
  });
}

export function ordenarCategorias(categorias, ordenPersonalizado = ordenInicial) {
  if (!Array.isArray(categorias)) return [];
  const orden = Array.isArray(ordenPersonalizado) ? ordenPersonalizado : ordenInicial;
  const posiciones = new Map(orden.map((n, i) => [n.trim().toLowerCase(), i]));
  return [...categorias].sort((a, b) => {
    const nombreA = (typeof a === "string" ? a : a?.nombre || "").trim().toLowerCase();
    const nombreB = (typeof b === "string" ? b : b?.nombre || "").trim().toLowerCase();
    return (posiciones.get(nombreA) ?? Infinity) - (posiciones.get(nombreB) ?? Infinity) || nombreA.localeCompare(nombreB, "es");
  });
}
