import prisma from "./prisma.js";
import { catalogoOficial } from "./catalogoOficial.js";
import { obtenerListaImagenes } from "./productosDefecto.js";

// Consulta compatible con instalaciones anteriores a la galería multimagen.
export const productoLegacySelect = {
  id: true,
  nombre: true,
  descripcion: true,
  precio: true,
  stock: true,
  categoria: true,
  etiqueta: true,
  imagen: true,
  createdAt: true,
  updatedAt: true,
};

export function esColumnaImagenesAusente(error) {
  if (error?.code !== "P2022" || typeof error?.meta?.column !== "string") return false;
  const columna = error.meta.column.split(".").at(-1).replace(/[`'"\s]/g, "").toLowerCase();
  return columna === "imagenes";
}

function prepararProductos(productos, source, writable) {
  return JSON.parse(JSON.stringify(productos)).map((producto) => {
    const imagenes = obtenerListaImagenes(producto);
    return {
      ...producto,
      imagen: imagenes[0] || producto.imagen || null,
      imagenes,
      source,
      writable,
    };
  });
}

export async function cargarCatalogo({ cliente = prisma } = {}) {
  try {
    const productos = await cliente.producto.findMany({ orderBy: { createdAt: "desc" } });
    return {
      productos: prepararProductos(productos, "bd", true),
      source: "bd",
      writable: true,
      canWriteImages: true,
    };
  } catch (error) {
    if (esColumnaImagenesAusente(error)) {
      try {
        const productos = await cliente.producto.findMany({
          select: productoLegacySelect,
          orderBy: { createdAt: "desc" },
        });
        console.warn("El catálogo usa la consulta compatible: falta la columna productos.imagenes.");
        return {
          productos: prepararProductos(productos, "bd", true),
          source: "bd",
          writable: true,
          canWriteImages: false,
        };
      } catch (errorLegacy) {
        console.error("No se pudo cargar el catálogo desde la base de datos:", errorLegacy?.code || "ERROR_BD");
      }
    } else {
      console.error("No se pudo cargar el catálogo desde la base de datos:", error?.code || "ERROR_BD");
    }

    return {
      productos: prepararProductos(catalogoOficial, "respaldo", false),
      source: "respaldo",
      writable: false,
      canWriteImages: false,
    };
  }
}
