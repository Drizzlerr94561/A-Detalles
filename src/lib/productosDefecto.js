import { catalogoOficial } from "./catalogoOficial.js";

export const imagenesNuevas = [
  "/images/Canastita.png",
  "/images/Champan.png",
  "/images/Corazon.png",
  "/images/Desayuno.png",
  "/images/Paquete.png",
  "/images/Peluche.png",
  "/images/PelucheRosa.png",
];

export const imagenesEdicionEspecial = [
  "/images/Todito.png",
  "/images/Rosasychocolate.png",
  "/images/Elefante.png",
  "/images/Peluchee.png",
  "/images/Luces.png",
  "/images/Rossas.png",
  "/images/Rosas.png",
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
    url = imagenesNuevas[idx % imagenesNuevas.length] || "/images/Canastita.png";
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
  return imagenesEdicionEspecial[idx % imagenesEdicionEspecial.length] || "/images/Desayuno.png";
}

export const productosDefecto = [];
export const productosEdicionEspecial = [];
