import { obtenerCategoriaProducto } from "./productosDefecto.js";

const claveCategoria = (nombre) => nombre.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

const fechaCreacion = (producto) => {
  const fecha = Date.parse(producto.createdAt);
  return Number.isFinite(fecha) ? fecha : -Infinity;
};

// Selecciona los más recientes de cada categoría sin modificar el catálogo completo.
export function agruparProductosPorCategorias(productos, ordenCategorias = [], tamanoGrupo = 4) {
  if (!Array.isArray(productos)) return [];

  const grupos = new Map();
  for (const producto of productos) {
    if (!producto || typeof producto !== "object" || Array.isArray(producto)) continue;
    const clave = claveCategoria(obtenerCategoriaProducto(producto));
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(producto);
  }

  const posiciones = new Map();
  if (Array.isArray(ordenCategorias)) {
    ordenCategorias.forEach((nombre, posicion) => {
      if (typeof nombre !== "string" || !nombre.trim()) return;
      const clave = claveCategoria(nombre);
      if (!posiciones.has(clave)) posiciones.set(clave, posicion);
    });
  }

  const categorias = [...grupos.keys()].sort((a, b) => {
    const diferencia = (posiciones.get(a) ?? Infinity) - (posiciones.get(b) ?? Infinity);
    return diferencia || a.localeCompare(b, "es");
  });
  const cantidad = Number.isSafeInteger(tamanoGrupo) && tamanoGrupo > 0 ? tamanoGrupo : 4;
  const resultado = [];
  for (const categoria of categorias) {
    const recientes = grupos.get(categoria).sort((a, b) => (fechaCreacion(b) - fechaCreacion(a)) || 0);
    resultado.push(...recientes.slice(0, cantidad));
  }
  return resultado;
}
