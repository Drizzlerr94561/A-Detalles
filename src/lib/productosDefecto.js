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
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return url;
  }
  if (url.includes("/upload/f_auto") || url.includes("/upload/w_") || url.includes("/upload/c_")) {
    return url;
  }
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${ancho}/`);
}

export function obtenerImagenProducto(prod, index = 0, optimizar = true) {
  let url = "";
  if (prod && typeof prod.imagen === "string" && prod.imagen.includes("res.cloudinary.com")) {
    url = prod.imagen;
  } else if (prod && prod.nombre) {
    const match = catalogoOficial.find((x) => x.nombre === prod.nombre);
    if (match && match.imagen && match.imagen.includes("res.cloudinary.com")) {
      url = match.imagen;
    }
  } else if (prod && typeof prod.imagen === "string" && prod.imagen.trim() !== "") {
    url = prod.imagen;
  } else {
    const idx = Math.abs(Number(index) || 0);
    url = imagenesNuevas[idx % imagenesNuevas.length] || "https://res.cloudinary.com/enwlpozz/image/upload/v1789706771/adetallesbq/banners/canastita.jpg";
  }

  if (optimizar && url.includes("res.cloudinary.com")) {
    return optimizarUrlCloudinary(url, 600);
  }
  return url;
}

export function obtenerImagenEdicionEspecial(prod, index = 0) {
  if (prod && typeof prod.imagen === "string" && prod.imagen.includes("res.cloudinary.com")) {
    return prod.imagen;
  }
  if (prod && prod.nombre) {
    const match = catalogoOficial.find((x) => x.nombre === prod.nombre);
    if (match && match.imagen && match.imagen.includes("res.cloudinary.com")) {
      return match.imagen;
    }
  }
  if (prod && typeof prod.imagen === "string" && prod.imagen.trim() !== "") {
    return prod.imagen;
  }
  const idx = Math.abs(Number(index) || 0);
  return imagenesEdicionEspecial[idx % imagenesEdicionEspecial.length] || "https://res.cloudinary.com/enwlpozz/image/upload/v1789706785/adetallesbq/banners/desayuno.jpg";
}

export function obtenerCategoriaProducto(prod) {
  if (!prod) return "General";
  const catActual = prod.categoria;
  if (catActual && catActual !== "General" && catActual !== "SIN_CATEGORIA" && catActual.trim() !== "") {
    return catActual.trim();
  }

  const nom = (prod.nombre || "").toLowerCase();
  const desc = (prod.descripcion || "").toLowerCase();

  if (nom.includes("ancheta") || desc.includes("ancheta")) return "Anchetas";
  if (nom.includes("globo") || nom.includes("bouquet") || desc.includes("globo")) return "Arreglos con Globos";
  if (nom.includes("ramo") || nom.includes("rosa") || nom.includes("girasol") || nom.includes("flor") || desc.includes("rosas")) return "Arreglos Florales";
  if (nom.includes("caja") || nom.includes("box") || desc.includes("caja de regalo")) return "Cajas de Regalo";
  if (nom.includes("cuadro") || nom.includes("spotify") || nom.includes("álbum") || nom.includes("album")) return "Cuadros Personalizados";
  if (nom.includes("llavero")) return "Llaveros Peluche";
  if (nom.includes("manilla") || nom.includes("pulsera") || nom.includes("balin")) return "Manillas Pareja";
  if (nom.includes("oso") || nom.includes("peluche") || nom.includes("stitch") || nom.includes("kitty") || nom.includes("kuromi") || nom.includes("elefante")) return "Peluches Gigantes";
  if (nom.includes("desayuno") || desc.includes("desayuno")) return "Desayunos Sorpresa";
  if (nom.includes("luxury") || nom.includes("combo") || nom.includes("deluxe")) return "Combos Luxury";

  return "General";
}

export const productosDefecto = [];
export const productosEdicionEspecial = [];
