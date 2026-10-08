import { catalogoOficial } from "./catalogoOficial.js";

export const imagenesNuevas = [
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706771/adetallesbq/banners/canastita.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706773/adetallesbq/banners/champan.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706779/adetallesbq/banners/corazon.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706785/adetallesbq/banners/desayuno.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706837/adetallesbq/banners/paquete.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706843/adetallesbq/banners/peluche.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706851/adetallesbq/banners/pelucherosa.jpg",
];

export const imagenesEdicionEspecial = [
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706880/adetallesbq/banners/todito.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706870/adetallesbq/banners/rosasychocolate.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706790/adetallesbq/banners/elefante.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706846/adetallesbq/banners/peluchee.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706825/adetallesbq/banners/luces.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706874/adetallesbq/banners/rossas.jpg",
  "https://res.cloudinary.com/enwlpozz/image/upload/v1789706865/adetallesbq/banners/rosas.jpg",
];

export function optimizarUrlCloudinary(url, ancho = 600) {
  if (!url || typeof url !== "string") {
    return url;
  }
  try {
    if (new URL(url, "https://localhost").hostname !== "res.cloudinary.com") return url;
  } catch {
    return url;
  }
  if (url.includes("/upload/f_auto") || url.includes("/upload/w_") || url.includes("/upload/c_")) {
    return url;
  }
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${ancho}/`);
}

export function normalizarUrlImagen(valor) {
  if (typeof valor !== "string") return "";
  const url = valor.trim();
  if (!url) return "";

  if (/^https?:\/\//i.test(url) || /^\/\//.test(url)) {
    try {
      const parsed = new URL(url, "https://localhost");
      return parsed.hostname && ["http:", "https:"].includes(parsed.protocol) ? url : "";
    } catch {
      return "";
    }
  }

  if (/^\/(?!\/)/.test(url) || /^\.{1,2}\//.test(url)) return url;
  if (/^blob:https?:\/\//i.test(url) || /^data:image\/[a-z0-9.+-]+;base64,/i.test(url)) return url;
  return "";
}

export function obtenerListaImagenes(prod) {
  if (!prod) return [];
  let lista = prod.imagenes;
  if (typeof lista === "string") {
    try {
      lista = JSON.parse(lista);
    } catch {
      // También se admiten registros antiguos con una sola URL sin JSON.
    }
  }

  const valores = Array.isArray(lista) ? lista : [lista];
  const fotos = [...new Set(valores.map(normalizarUrlImagen).filter(Boolean))];
  if (fotos.length > 0) return fotos;

  const portada = normalizarUrlImagen(prod.imagen);
  return portada ? [portada] : [];
}

function obtenerImagenPropiaOReferencia(prod) {
  const fotos = obtenerListaImagenes(prod);
  if (fotos.length > 0) return fotos[0];
  if (typeof prod?.nombre !== "string") return "";

  const nombre = prod.nombre.trim().toLowerCase();
  let candidatos = catalogoOficial.filter((p) => p.nombre.trim().toLowerCase() === nombre);
  if (candidatos.length > 1) {
    const categoria = obtenerCategoriaProducto(prod).toLowerCase();
    candidatos = candidatos.filter((p) => obtenerCategoriaProducto(p).toLowerCase() === categoria);
  }

  // Un nombre repetido entre colecciones no identifica por sí solo una tarjeta.
  return candidatos.length === 1 ? obtenerListaImagenes(candidatos[0])[0] || "" : "";
}

export function obtenerImagenProducto(prod, index = 0, optimizar = true) {
  const idx = Math.floor(Math.abs(Number(index) || 0)) % imagenesNuevas.length;
  const url = obtenerImagenPropiaOReferencia(prod) || imagenesNuevas[idx] || imagenesNuevas[0];
  return optimizar ? optimizarUrlCloudinary(url, 600) : url;
}

export function obtenerImagenEdicionEspecial(prod, index = 0) {
  const idx = Math.floor(Math.abs(Number(index) || 0)) % imagenesEdicionEspecial.length;
  return obtenerImagenPropiaOReferencia(prod) || imagenesEdicionEspecial[idx] || imagenesEdicionEspecial[0];
}

export function obtenerCategoriaProducto(prod) {
  const categoria = typeof prod?.categoria === "string" ? prod.categoria.trim().replace(/\s+/g, " ") : "";
  if (!categoria || ["general", "sin_categoria"].includes(categoria.toLowerCase())) return "General";
  return categoria;
}

export const productosDefecto = [];
export const productosEdicionEspecial = [];
