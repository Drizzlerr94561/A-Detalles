import fs from "fs";
import path from "path";

const ORDEN_FILE_PATH = path.join(process.cwd(), "src", "lib", "categoriasOrden.json");

const ORDEN_POR_DEFECTO = [
  "Adicionales",
  "Anchetas",
  "Arreglos con Globos",
  "Arreglos Florales",
  "Cajas de regalo",
  "Combos Luxury",
  "Desayunos y Mediatarde",
  "General",
  "Peluches Gigantes",
  "Termos y Mugs",
  "Catálogo Flores Amarillas",
  "Manillas Pareja",
  "Llaveros Peluche",
];

export function obtenerOrdenCategorias() {
  try {
    if (fs.existsSync(ORDEN_FILE_PATH)) {
      const data = fs.readFileSync(ORDEN_FILE_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item) => typeof item === "string" && item.trim());
      }
    }
  } catch (error) {
    console.warn("No se pudo leer el archivo de orden de categorías:", error?.message);
  }
  return [...ORDEN_POR_DEFECTO];
}

export function guardarOrdenCategorias(nuevoOrden) {
  if (!Array.isArray(nuevoOrden)) {
    throw new Error("El orden debe ser un arreglo de nombres de categorías.");
  }
  const limpio = nuevoOrden
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim());

  // Evitar duplicados conservando el primer índice
  const sinDuplicados = Array.from(new Set(limpio));

  try {
    fs.writeFileSync(ORDEN_FILE_PATH, JSON.stringify(sinDuplicados, null, 2), "utf8");
    return sinDuplicados;
  } catch (error) {
    console.error("Error al escribir el archivo de orden de categorías:", error);
    throw error;
  }
}

export function ordenarCategorias(categorias, ordenPersonalizado) {
  if (!Array.isArray(categorias)) return [];
  const orden = Array.isArray(ordenPersonalizado) && ordenPersonalizado.length > 0
    ? ordenPersonalizado
    : obtenerOrdenCategorias();

  const mapaOrden = new Map();
  orden.forEach((nom, index) => {
    mapaOrden.set(nom.trim().toLowerCase(), index);
  });

  return [...categorias].sort((a, b) => {
    const nomA = (typeof a === "string" ? a : a?.nombre || "").trim().toLowerCase();
    const nomB = (typeof b === "string" ? b : b?.nombre || "").trim().toLowerCase();

    const posA = mapaOrden.has(nomA) ? mapaOrden.get(nomA) : 9999;
    const posB = mapaOrden.has(nomB) ? mapaOrden.get(nomB) : 9999;

    if (posA !== posB) {
      return posA - posB;
    }
    return nomA.localeCompare(nomB, "es");
  });
}
