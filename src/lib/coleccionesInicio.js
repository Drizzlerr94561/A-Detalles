import { agruparProductosPorCategorias } from "./carruselOrden.js";
import { obtenerCategoriaProducto } from "./productosDefecto.js";
import { FILTRO_TODAS_CATEGORIAS } from "./catalogoAdminEstado.js";

const clave = (nombre) => nombre.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

// Comparte el orden del catálogo, pero conserva TODOS los productos de cada colección.
export function crearColeccionesInicio(productos, ordenCategorias = []) {
  const nombres = new Map();
  if (Array.isArray(ordenCategorias)) {
    for (const nombre of ordenCategorias) {
      if (typeof nombre === "string" && nombre.trim() && !nombres.has(clave(nombre))) {
        nombres.set(clave(nombre), nombre.trim().replace(/\s+/g, " "));
      }
    }
  }
  const colecciones = new Map();
  for (const producto of agruparProductosPorCategorias(productos, ordenCategorias, Number.MAX_SAFE_INTEGER)) {
    const categoria = obtenerCategoriaProducto(producto);
    const id = clave(categoria);
    if (!colecciones.has(id)) colecciones.set(id, { clave: id, nombre: nombres.get(id) || categoria, productos: [] });
    colecciones.get(id).productos.push(producto);
  }
  return [...colecciones.values()];
}

export function leerOrdenColecciones(respuesta) {
  const orden = Array.isArray(respuesta) ? respuesta : respuesta?.success === true && respuesta.source === "bd" ? respuesta.orden : null;
  if (!Array.isArray(orden) || orden.some((nombre) => typeof nombre !== "string" || !nombre.trim())) return null;
  if (new Set(orden.map(clave)).size !== orden.length) return null;
  return orden;
}

export function resolverCategoriaCatalogo(nombre, productos) {
  if (typeof nombre !== "string" || !nombre.trim() || !Array.isArray(productos)) return FILTRO_TODAS_CATEGORIAS;
  const producto = productos.find((item) => item && clave(obtenerCategoriaProducto(item)) === clave(nombre));
  return producto ? obtenerCategoriaProducto(producto) : FILTRO_TODAS_CATEGORIAS;
}
