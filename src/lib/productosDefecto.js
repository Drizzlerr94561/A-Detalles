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
  if (
    prod &&
    typeof prod.imagen === "string" &&
    prod.imagen.trim() !== "" &&
    !prod.imagen.includes("breakfast") &&
    !prod.imagen.includes("hero") &&
    !prod.imagen.includes("category")
  ) {
    return prod.imagen;
  }
  const idx = Math.abs(Number(index) || 0);
  return imagenesNuevas[idx % imagenesNuevas.length] || "/images/Canastita.png";
}

export function obtenerImagenEdicionEspecial(prod, index = 0) {
  if (
    prod &&
    typeof prod.imagen === "string" &&
    prod.imagen.trim() !== "" &&
    !prod.imagen.includes("breakfast") &&
    !prod.imagen.includes("hero") &&
    !prod.imagen.includes("category")
  ) {
    return prod.imagen;
  }
  const idx = Math.abs(Number(index) || 0);
  return imagenesEdicionEspecial[idx % imagenesEdicionEspecial.length] || "/images/Desayuno.png";
}

export const productosDefecto = [];

export const productosEdicionEspecial = [];
