const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const repoRoot = process.env.ADETALLES_REPO_ROOT || path.resolve(__dirname, "..");
const espree = require(require.resolve("espree", { paths: [repoRoot] }));
const { catalogoOficial } = require(path.join(repoRoot, "src/lib/catalogoOficial.js"));
const {
  imagenesNuevas, imagenesEdicionEspecial, normalizarUrlImagen, obtenerListaImagenes,
  obtenerCategoriaProducto, obtenerImagenProducto, obtenerImagenEdicionEspecial,
  optimizarUrlCloudinary,
} = require(path.join(repoRoot, "src/lib/productosDefecto.js"));

const colecciones = {
  productosAmorAmistad: ["Amor y Amistad", 10],
  productosDesayunos: ["Desayunos Sorpresa", 34],
  productosPeluchesList: ["Peluches Gigantes", 73],
  productosCuadrosList: ["Cuadros Personalizados", 37],
  productosFloralesList: ["Arreglos Florales", 50],
  productosCajasList: ["Cajas de regalo", 33],
  productosAnchetasList: ["Anchetas", 24],
  productosGlobosList: ["Arreglos con Globos", 8],
  productosLlaverosList: ["Llaveros Peluche", 13],
  productosManillasList: ["Manillas Pareja", 4],
  productosCombosLuxuryList: ["Combos Luxury", 10],
  productosFloresAmarillasList: ["Catálogo Flores Amarillas", 7],
};

function valorEstatico(node) {
  if (node.type === "Literal") return node.value;
  if (node.type === "ArrayExpression") return node.elements.map(valorEstatico);
  if (node.type === "ObjectExpression") return Object.fromEntries(node.properties.map((p) => [p.key.name || p.key.value, valorEstatico(p.value)]));
  throw new Error(`Valor no estático en la semilla: ${node.type}`);
}
function leerSemilla() {
  // Solo analiza el texto: nunca importa ni ejecuta seed/main ni accede a MySQL.
  const source = fs.readFileSync(path.join(repoRoot, "prisma/seed.js"), "utf8");
  const ast = espree.parse(source, { ecmaVersion: "latest", sourceType: "script" });
  const arrays = {};
  function visitar(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "VariableDeclarator" && node.init?.type === "ArrayExpression" && Object.hasOwn(colecciones, node.id.name)) arrays[node.id.name] = valorEstatico(node.init);
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach(visitar);
      else if (child && typeof child === "object") visitar(child);
    }
  }
  visitar(ast);
  return arrays;
}

test("303 tarjetas con 303 ids únicos", () => {
  assert.equal(catalogoOficial.length, 303);
  assert.equal(new Set(catalogoOficial.map((p) => p.id)).size, 303);
});
test("12 colecciones suman 303 sin doble conteo ni General", () => {
  const counts = {};
  for (const p of catalogoOficial) { const cat = obtenerCategoriaProducto(p); counts[cat] = (counts[cat] || 0) + 1; }
  assert.deepEqual(counts, Object.fromEntries(Object.values(colecciones)));
  assert.equal(Object.keys(counts).length, 12);
  assert.equal(Object.values(counts).reduce((total, count) => total + count, 0), 303);
  assert.equal(counts.General || 0, 0);
});
test("las siete Flores Amarillas conservan su colección específica", () => {
  assert.deepEqual(catalogoOficial.filter((p) => p.categoria === "Catálogo Flores Amarillas").map((p) => p.nombre), ["Ramo Yellow", "Flor Encapsulado", "Bouquet Girasoles", "Ramo Premium", "Corazón Love Yellow", "Ramo 24 roses", "Bouquet Girasoles Deluxe"]);
});
test("nombre, precio, categoría y etiqueta coinciden con los 303 originales de seed", () => {
  const arrays = leerSemilla();
  const esperado = Object.entries(colecciones).flatMap(([name, [categoria, count]]) => {
    assert.equal(arrays[name]?.length, count, name);
    return arrays[name].map((p) => ({ nombre: p.nombre, precio: p.precio, categoria, etiqueta: p.etiqueta || categoria }));
  });
  assert.equal(esperado.length, 303);
  assert.deepEqual(catalogoOficial.map(({ nombre, precio, categoria, etiqueta }) => ({ nombre, precio, categoria, etiqueta })), esperado);
});
test("los seis nombres repetidos entre colecciones preservan ambas variantes", () => {
  const esperado = {
    "box roses": [[4, "Amor y Amistad"], [167, "Arreglos Florales"]],
    "ramo deluxe": [[5, "Amor y Amistad"], [186, "Arreglos Florales"]],
    "rosa encapsulada xl": [[7, "Amor y Amistad"], [199, "Arreglos Florales"]],
    "cuadro love": [[8, "Amor y Amistad"], [141, "Cuadros Personalizados"]],
    "box peluche": [[9, "Amor y Amistad"], [215, "Cajas de regalo"]],
    "box flork romantic": [[163, "Arreglos Florales"], [211, "Cajas de regalo"]],
  };
  const grupos = {};
  for (const p of catalogoOficial) (grupos[p.nombre.trim().toLowerCase()] ||= []).push([p.id, p.categoria]);
  assert.deepEqual(Object.fromEntries(Object.entries(grupos).filter(([, productos]) => productos.length > 1)), esperado);
});
test("categoría explícita prevalece sobre nombre y descripción", () => {
  assert.equal(obtenerCategoriaProducto({ nombre: "Bouquet Girasoles Deluxe", descripcion: "globos y rosas", categoria: "  Catálogo Flores   Amarillas  " }), "Catálogo Flores Amarillas");
  assert.equal(obtenerCategoriaProducto({ nombre: "Cuadro + Caja madera", categoria: "Combos Luxury" }), "Combos Luxury");
});
test("General y categorías vacías no se reasignan por palabras", () => {
  for (const categoria of ["General", " general ", "SIN_CATEGORIA", "", null, undefined, 42]) assert.equal(obtenerCategoriaProducto({ nombre: "Ramo con peluche y globos", categoria }), "General");
  assert.equal(obtenerCategoriaProducto(null), "General");
});

const primera = "https://example.com/primera.jpg", segunda = "https://example.com/segunda.jpg", portada = "https://example.com/portada.jpg";
test("galería array limpia tipos inválidos, espacios y duplicados conservando el orden", () => {
  assert.deepEqual(obtenerListaImagenes({ imagenes: [null, 9, {}, " ", ` ${primera} `, segunda, primera, "javascript:alert(1)"] }), [primera, segunda]);
});
test("galería JSON array conserva todas sus fotos válidas", () => {
  assert.deepEqual(obtenerListaImagenes({ imagenes: JSON.stringify([primera, segunda, primera]) }), [primera, segunda]);
});
test("una sola URL acepta string normal y string JSON", () => {
  assert.deepEqual(obtenerListaImagenes({ imagenes: ` ${primera} ` }), [primera]);
  assert.deepEqual(obtenerListaImagenes({ imagenes: JSON.stringify(primera) }), [primera]);
});
test("portada se recupera después de limpiar una galería inválida", () => {
  for (const imagenes of [[null, {}, " "], [], "[null,42]", "{malformed", "null", { invalid: true }, 7]) assert.deepEqual(obtenerListaImagenes({ imagenes, imagen: ` ${portada} ` }), [portada]);
});
test("sin galería ni portada válidas se devuelve una lista vacía", () => {
  assert.deepEqual(obtenerListaImagenes({ imagenes: [null, "javascript:alert(1)"], imagen: {} }), []);
  assert.deepEqual(obtenerListaImagenes(null), []);
});
test("normalizador acepta las URL y rutas soportadas y rechaza tipos/esquemas inválidos", () => {
  for (const url of [primera, "http://example.com/foto.jpg", "//example.com/foto.jpg", "/images/foto.jpg", "./images/foto.jpg", "../images/foto.jpg", "blob:https://example.com/id", "data:image/png;base64,aGVsbG8="]) assert.equal(normalizarUrlImagen(` ${url} `), url);
  for (const url of [null, 3, {}, "", "https://", "javascript:alert(1)", "data:text/html;base64,aGVsbG8=", "not-a-url"]) assert.equal(normalizarUrlImagen(url), "");
});
test("portada subida propia gana al histórico y a la imagen anterior en ambas colecciones", () => {
  const p = { nombre: "Cuadro Love", categoria: "Amor y Amistad", imagenes: [primera, segunda], imagen: catalogoOficial[7].imagen };
  assert.equal(obtenerImagenProducto(p, 0, false), primera);
  assert.equal(obtenerImagenProducto(p), primera);
  assert.equal(obtenerImagenEdicionEspecial(p), primera);
});
test("portada legacy propia no se reemplaza por Cloudinary histórico", () => {
  const p = { nombre: "Cuadro Love", categoria: "Amor y Amistad", imagen: portada };
  assert.equal(obtenerImagenProducto(p, 0, false), portada);
  assert.equal(obtenerImagenEdicionEspecial(p), portada);
});
test("el respaldo de imagen distingue homónimos por colección", () => {
  const amor = catalogoOficial.find((p) => p.id === 8), cuadros = catalogoOficial.find((p) => p.id === 141);
  const originales = [amor.imagen, cuadros.imagen];
  // Hoy comparten URL. Fotos distintas en memoria permiten detectar una elección equivocada.
  try {
    amor.imagen = primera;
    cuadros.imagen = segunda;
    assert.equal(obtenerImagenProducto({ nombre: "Cuadro Love", categoria: "Amor y Amistad" }, 0, false), primera);
    assert.equal(obtenerImagenProducto({ nombre: "Cuadro Love", categoria: "Cuadros Personalizados" }, 0, false), segunda);
    assert.equal(obtenerImagenEdicionEspecial({ nombre: "Cuadro Love", categoria: "Cuadros Personalizados" }), segunda);
  } finally {
    [amor.imagen, cuadros.imagen] = originales;
  }
});
test("un homónimo sin colección identificable no toma la primera variante", () => {
  assert.equal(obtenerImagenProducto({ nombre: "Cuadro Love", categoria: "General" }, 0, false), imagenesNuevas[0]);
  assert.equal(obtenerImagenEdicionEspecial({ nombre: "Cuadro Love" }), imagenesEdicionEspecial[0]);
});
test("optimización solo transforma el host real de Cloudinary", () => {
  assert.equal(optimizarUrlCloudinary("https://res.cloudinary.com/demo/image/upload/v1/foto.jpg"), "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/v1/foto.jpg");
  const externa = "https://example.com/upload/foto.jpg?source=res.cloudinary.com";
  assert.equal(optimizarUrlCloudinary(externa), externa);
});
