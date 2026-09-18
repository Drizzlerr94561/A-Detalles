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

export function obtenerImagenProducto(prod, index = 0) {
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
  return imagenesNuevas[idx % imagenesNuevas.length] || "/images/Canastita.png";
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
