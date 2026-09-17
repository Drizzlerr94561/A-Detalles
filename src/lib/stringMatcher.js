/**
 * Algoritmo robusto de normalización y emparejamiento inteligente de cadenas para fotos de productos
 */

// Normalizar texto eliminando acentos, símbolos, mayúsculas y caracteres especiales
export function normalizarTexto(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]/g, " ")     // Reemplazar signos por espacios
    .replace(/\s+/g, " ")          // Unificar múltiples espacios
    .trim();
}

// Extraer el nombre base del archivo sin extensión (ej: "bear_box_1.jpg" -> "bear box 1")
export function limpiarNombreArchivo(filename = "") {
  const sinExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;
  return normalizarTexto(sinExtension);
}

// Calcular la similitud entre el nombre del archivo y el nombre del producto en la DB
export function calcularSimilitud(nombreArchivo, nombreProducto) {
  const normArchivo = limpiarNombreArchivo(nombreArchivo);
  const normProducto = normalizarTexto(nombreProducto);

  if (normArchivo === normProducto) return 1.0; // Coincidencia exacta (100%)

  const palabrasArchivo = normArchivo.split(" ").filter((w) => w.length > 1);
  const palabrasProducto = normProducto.split(" ").filter((w) => w.length > 1);

  if (palabrasArchivo.length === 0 || palabrasProducto.length === 0) return 0;

  // Palabras coincidentes
  let coincidentes = 0;
  for (const palabra of palabrasArchivo) {
    if (palabrasProducto.some((p) => p.includes(palabra) || palabra.includes(p))) {
      coincidentes++;
    }
  }

  const score = (coincidentes * 2) / (palabrasArchivo.length + palabrasProducto.length);
  return Math.min(1.0, score);
}

/**
 * Emparejar una lista de archivos de fotos contra una lista de productos de la base de datos
 */
export function emparejarFotosConProductos(archivos = [], productos = []) {
  const resultados = [];
  const productosSinEmparejar = [...productos];

  for (const archivo of archivos) {
    let mejorMatch = null;
    let mejorScore = 0;

    for (const prod of productosSinEmparejar) {
      const score = calcularSimilitud(archivo.name || archivo, prod.nombre);
      if (score > mejorScore) {
        mejorScore = score;
        mejorMatch = prod;
      }
    }

    // Umbral mínimo de coincidencia (por ejemplo 0.40)
    if (mejorMatch && mejorScore >= 0.35) {
      resultados.push({
        archivo: archivo.name || archivo,
        productoId: mejorMatch.id,
        productoNombre: mejorMatch.nombre,
        score: Math.round(mejorScore * 100),
      });
    } else {
      resultados.push({
        archivo: archivo.name || archivo,
        productoId: null,
        productoNombre: null,
        score: 0,
      });
    }
  }

  return resultados;
}
