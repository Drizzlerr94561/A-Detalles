const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const { loadEsm } = require("./load-esm.cjs");

const projectRoot = process.env.CATALOGO_TEST_ROOT || path.resolve(__dirname, "..");
const prismaPath = path.resolve(projectRoot, "src/lib/prisma.js");
const authPath = path.resolve(projectRoot, "src/lib/auth.js");
const routePath = path.resolve(projectRoot, "src/app/api/admin/productos/route.js");
const sourcePaths = process.env.CATALOGO_ROUTE_PATH ? { [routePath]: process.env.CATALOGO_ROUTE_PATH } : {};
const plain = (value) => JSON.parse(JSON.stringify(value));
const fotoA = "https://example.com/portada.jpg";
const fotoB = "https://example.com/segunda.jpg";
const fotoC = "https://example.com/tercera.jpg";
const producto = (overrides = {}) => ({
  id: 51,
  nombre: "Producto guardado",
  descripcion: "Descripción que debe conservarse",
  precio: 155000,
  stock: 17,
  categoria: "Catálogo Flores Amarillas",
  etiqueta: "Colección original",
  imagen: fotoA,
  imagenes: [fotoA, fotoB],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  ...overrides,
});
const columnaAusente = (column = "productos.imagenes") => Object.assign(new Error("Falta una columna"), {
  code: "P2022",
  meta: { column },
});
const solicitud = (body) => ({ json: async () => body });

async function cargarLoader(db) {
  return loadEsm("src/lib/cargarCatalogo.js", {
    projectRoot,
    mocks: { [prismaPath]: { default: db } },
  });
}

async function apiSimulada(options = {}) {
  const registros = (options.productos || [producto()]).map(plain);
  const llamadas = { escrituras: [], lecturas: [] };
  const copiaRegistro = (registro) => {
    if (!registro) return null;
    const copia = plain(registro);
    if (options.legacy) delete copia.imagenes;
    return copia;
  };
  const db = {
    producto: {
      async findMany(args) {
        llamadas.lecturas.push({ metodo: "findMany", args: plain(args) });
        if (options.failure) throw options.failure;
        if (options.legacy && !args.select) throw columnaAusente();
        return registros.map(copiaRegistro);
      },
      async findUnique(args) {
        llamadas.lecturas.push({ metodo: "findUnique", args: plain(args) });
        if (options.failure) throw options.failure;
        if (options.legacy && !args.select) throw columnaAusente();
        return copiaRegistro(registros.find((p) => p.id === args.where.id));
      },
      async findFirst(args) {
        llamadas.lecturas.push({ metodo: "findFirst", args: plain(args) });
        if (options.failure) throw options.failure;
        if (options.legacy && args.select?.imagenes) throw columnaAusente();
        return copiaRegistro(registros[0]);
      },
      async update(args) {
        llamadas.escrituras.push({ metodo: "update", args: plain(args) });
        const registro = registros.find((p) => p.id === args.where.id);
        if (!registro) throw Object.assign(new Error("No existe"), { code: "P2025" });
        Object.assign(registro, plain(args.data));
        return copiaRegistro(registro);
      },
      async create(args) {
        llamadas.escrituras.push({ metodo: "create", args: plain(args) });
        const registro = { id: Math.max(0, ...registros.map((p) => p.id)) + 1, ...plain(args.data) };
        registros.push(registro);
        return copiaRegistro(registro);
      },
      async delete(args) {
        llamadas.escrituras.push({ metodo: "delete", args: plain(args) });
        const indice = registros.findIndex((p) => p.id === args.where.id);
        if (indice < 0) throw Object.assign(new Error("No existe"), { code: "P2025" });
        const [registro] = registros.splice(indice, 1);
        return { id: registro.id };
      },
    },
  };
  const api = await loadEsm("src/app/api/admin/productos/route.js", {
    projectRoot,
    sourcePaths,
    mocks: {
      [prismaPath]: { default: db },
      [authPath]: { verifyIsAdmin: async () => options.autorizado === false ? null : { role: "ADMIN" } },
      "next/server": { NextResponse: { json: (body, init = {}) => new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json", ...init.headers },
      }) } },
    },
  });
  return { api, db, llamadas, registros };
}

test("loader: una BD vacía permanece vacía sin reinyectar tarjetas", async () => {
  const { cargarCatalogo } = await cargarLoader({ producto: { findMany: async () => [] } });
  const catalogo = await cargarCatalogo();
  assert.deepEqual(plain(catalogo.productos), []);
  assert.equal(catalogo.source, "bd");
  assert.equal(catalogo.writable, true);
  assert.equal(catalogo.canWriteImages, true);
});

test("loader: IDs coincidentes con catálogo y productos homónimos no suprimen registros de BD", async () => {
  const registros = [producto({ id: 1, nombre: "Copa Fruité" }), producto({ id: 2, nombre: "Copa Fruité", categoria: "Anchetas" })];
  const { cargarCatalogo } = await cargarLoader({ producto: { findMany: async () => registros } });
  const catalogo = await cargarCatalogo();
  assert.deepEqual(plain(catalogo.productos.map((p) => [p.id, p.nombre, p.categoria])), registros.map((p) => [p.id, p.nombre, p.categoria]));
  assert.equal(catalogo.productos.length, 2);
  assert.ok(catalogo.productos.every((p) => p.source === "bd" && p.writable));
});

test("loader: P2022 de imagenes usa consulta antigua y conserva categoría y foto", async () => {
  const consultas = [];
  const antiguo = producto({ imagenes: undefined });
  const { cargarCatalogo } = await cargarLoader({ producto: { findMany: async (args) => {
    consultas.push(args);
    if (!args.select) throw columnaAusente("`productos`.`imagenes`");
    return [antiguo];
  } } });
  const catalogo = await cargarCatalogo();
  assert.equal(consultas.length, 2);
  assert.equal(consultas[1].select.imagenes, undefined);
  assert.equal(consultas[1].select.categoria, true);
  assert.equal(catalogo.source, "bd");
  assert.equal(catalogo.writable, true);
  assert.equal(catalogo.canWriteImages, false);
  assert.equal(catalogo.productos[0].categoria, "Catálogo Flores Amarillas");
  assert.deepEqual(plain(catalogo.productos[0].imagenes), [fotoA]);
});

test("loader: P2022 de otra columna no se confunde con migración de galería", async () => {
  let consultas = 0;
  const { cargarCatalogo } = await cargarLoader({ producto: { findMany: async () => {
    consultas++;
    throw columnaAusente("productos.precio");
  } } });
  const catalogo = await cargarCatalogo();
  assert.equal(consultas, 1);
  assert.equal(catalogo.source, "respaldo");
  assert.equal(catalogo.writable, false);
  assert.equal(catalogo.canWriteImages, false);
  assert.equal(catalogo.productos.length, 303);
  assert.ok(catalogo.productos.every((p) => p.source === "respaldo" && p.writable === false));
});

test("loader: un fallo de conexión muestra respaldo explícito sin escrituras", async () => {
  const { cargarCatalogo } = await cargarLoader({ producto: { findMany: async () => {
    throw Object.assign(new Error("No conecta"), { code: "P1001" });
  } } });
  const catalogo = await cargarCatalogo();
  assert.equal(catalogo.source, "respaldo");
  assert.equal(catalogo.productos.length, 303);
  assert.equal(catalogo.writable, false);
});

test("loader: si también falla la lectura antigua, usa respaldo marcado", async () => {
  let consultas = 0;
  const { cargarCatalogo } = await cargarLoader({ producto: { findMany: async () => {
    consultas++;
    throw consultas === 1 ? columnaAusente() : Object.assign(new Error("No conecta"), { code: "P1001" });
  } } });
  const catalogo = await cargarCatalogo();
  assert.equal(consultas, 2);
  assert.equal(catalogo.source, "respaldo");
  assert.equal(catalogo.writable, false);
});

test("PUT: actualizar solo galería conserva categoría, precio, stock y descripción", async () => {
  const { api, llamadas } = await apiSimulada();
  const response = await api.PUT(solicitud({ id: 51, imagenes: [` ${fotoC} `, fotoB, fotoC] }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.categoria, "Catálogo Flores Amarillas");
  assert.equal(result.precio, 155000);
  assert.equal(result.stock, 17);
  assert.equal(result.descripcion, "Descripción que debe conservarse");
  assert.equal(result.imagen, fotoC);
  assert.deepEqual(result.imagenes, [fotoC, fotoB]);
  assert.deepEqual(llamadas.escrituras[0].args.data, { imagenes: [fotoC, fotoB], imagen: fotoC });
});

test("PUT: omitir fotografías y categoría preserva las existentes", async () => {
  const { api, llamadas } = await apiSimulada();
  const response = await api.PUT(solicitud({ id: "51", nombre: "Nombre corregido" }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.categoria, "Catálogo Flores Amarillas");
  assert.deepEqual(result.imagenes, [fotoA, fotoB]);
  assert.deepEqual(llamadas.escrituras[0].args.data, { nombre: "Nombre corregido" });
});

test("PUT: cambiar solo imagen conserva las fotografías adicionales", async () => {
  const { api } = await apiSimulada();
  const response = await api.PUT(solicitud({ id: 51, imagen: fotoC }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.imagen, fotoC);
  assert.deepEqual(result.imagenes, [fotoC, fotoA, fotoB]);
});

test("PUT: galería explícitamente vacía borra fotos sin asignar portada genérica", async () => {
  const { api } = await apiSimulada();
  const response = await api.PUT(solicitud({ id: 51, imagenes: [] }));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.imagen, null);
  assert.deepEqual(result.imagenes, []);
});

test("PUT: registro inexistente devuelve404 sin escribir", async () => {
  const { api, llamadas } = await apiSimulada();
  const response = await api.PUT(solicitud({ id: 999, nombre: "Intento" }));
  assert.equal(response.status, 404);
  assert.equal(llamadas.escrituras.length, 0);
});

test("PUT: datos inválidos devuelven400 sin escrituras", async (t) => {
  for (const [nombre, body] of [
    ["id malformado", { id: "51extra", nombre: "Intento" }],
    ["id fuera de Int32", { id: 2147483648, nombre: "Intento" }],
    ["nombre vacío", { id: 51, nombre: "  " }],
    ["categoría vacía", { id: 51, categoria: "" }],
    ["precio inválido", { id: 51, precio: "20pesos" }],
    ["precio negativo", { id: 51, precio: -1 }],
    ["stock negativo", { id: 51, stock: -3 }],
    ["galería objeto", { id: 51, imagenes: {} }],
    ["imagen objeto", { id: 51, imagenes: [{}] }],
    ["imagen vacía", { id: 51, imagenes: [""] }],
    ["protocolo inválido", { id: 51, imagenes: ["javascript:alert(1)"] }],
    ["imagen blob temporal", { id: 51, imagenes: ["blob:https://example.com/123"] }],
    ["imagen data no permanente", { id: 51, imagenes: ["data:image/png;base64,AAAA"] }],
    ["imagen demasiado larga", { id: 51, imagenes: [`https://example.com/${"x".repeat(501)}.jpg`] }],
    ["sin campos editables", { id: 51 }],
  ]) {
    await t.test(nombre, async () => {
      const { api, llamadas } = await apiSimulada();
      const response = await api.PUT(solicitud(body));
      assert.equal(response.status, 400);
      assert.equal(llamadas.escrituras.length, 0);
    });
  }
});

test("PUT: galería JSON serializada conserva compatibilidad sin perder fotos", async () => {
  const { api } = await apiSimulada();
  const response = await api.PUT(solicitud({ id: 51, imagenes: JSON.stringify([fotoB, fotoC]) }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.imagenes, [fotoB, fotoC]);
  assert.equal(result.imagen, fotoB);
});

test("PUT legacy: intento de guardar fotos devuelve503 antes de escribir cualquier campo", async () => {
  const { api, llamadas } = await apiSimulada({ legacy: true });
  const response = await api.PUT(solicitud({ id: 51, nombre: "No debe guardarse", imagenes: [fotoC] }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /columna.*imagenes/i);
  assert.equal(llamadas.escrituras.length, 0);
});

test("PUT legacy: metadatos sin fotografías pueden actualizarse", async () => {
  const { api, llamadas } = await apiSimulada({ legacy: true });
  const response = await api.PUT(solicitud({ id: 51, descripcion: "Texto corregido" }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.descripcion, "Texto corregido");
  assert.equal(result.categoria, "Catálogo Flores Amarillas");
  assert.deepEqual(llamadas.escrituras[0].args.data, { descripcion: "Texto corregido" });
  assert.equal(llamadas.escrituras[0].args.select.imagenes, undefined);
});

test("GET: mantiene array y señala fuente y disponibilidad de imágenes", async () => {
  const { api } = await apiSimulada();
  const response = await api.GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Catalogo-Fuente"), "bd");
  assert.equal(response.headers.get("X-Catalogo-Imagenes-Disponibles"), "true");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const body = await response.json();
  assert.ok(Array.isArray(body));
  assert.equal(body.length, 1);
});

test("GET legacy: conserva BD y señala fotografías no disponibles para escritura", async () => {
  const { api } = await apiSimulada({ legacy: true });
  const response = await api.GET();
  assert.equal(response.headers.get("X-Catalogo-Fuente"), "bd");
  assert.equal(response.headers.get("X-Catalogo-Imagenes-Disponibles"), "false");
  assert.equal((await response.json())[0].categoria, "Catálogo Flores Amarillas");
});

test("GET con falloDB: señala respaldo y marca todas las tarjetas readonly", async () => {
  const { api, llamadas } = await apiSimulada({ failure: Object.assign(new Error("No conecta"), { code: "P1001" }) });
  const response = await api.GET();
  assert.equal(response.headers.get("X-Catalogo-Fuente"), "respaldo");
  assert.equal(response.headers.get("X-Catalogo-Imagenes-Disponibles"), "false");
  const body = await response.json();
  assert.equal(body.length, 303);
  assert.ok(body.every((p) => p.writable === false));
  assert.equal(llamadas.escrituras.length, 0);
});

test("DELETE: un producto borrado no resucita desde el catálogo estático", async () => {
  const { api, llamadas } = await apiSimulada({ productos: [producto({ id: 1, nombre: "Copa Fruité" })] });
  const response = await api.DELETE({ url: "https://example.com/api/admin/productos?id=1" });
  assert.equal(response.status, 200);
  assert.deepEqual(llamadas.escrituras[0].args.select, { id: true });
  const recarga = await api.GET();
  assert.deepEqual(await recarga.json(), []);
  assert.equal(recarga.headers.get("X-Catalogo-Fuente"), "bd");
});

test("DELETE legacy: no requiere seleccionar la columna de imágenes", async () => {
  const { api, llamadas } = await apiSimulada({ legacy: true });
  const response = await api.DELETE({ url: "https://example.com/api/admin/productos?id=51" });
  assert.equal(response.status, 200);
  assert.deepEqual(llamadas.escrituras[0].args.select, { id: true });
});

test("POST: categoría omitida no crea General accidental ni escribe", async () => {
  const { api, llamadas } = await apiSimulada();
  const response = await api.POST(solicitud({ nombre: "Nuevo producto", precio: 2000 }));
  assert.equal(response.status, 400);
  assert.equal(llamadas.escrituras.length, 0);
});

test("POST: crea producto con categoría explícita y portada de galería limpia", async () => {
  const { api, llamadas } = await apiSimulada();
  const response = await api.POST(solicitud({ nombre: "Nuevo producto", precio: "2000", categoria: "Anchetas", imagenes: [fotoC, fotoC, fotoB] }));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.categoria, "Anchetas");
  assert.equal(result.precio, 2000);
  assert.equal(result.imagen, fotoC);
  assert.deepEqual(result.imagenes, [fotoC, fotoB]);
  assert.equal(llamadas.escrituras.length, 1);
});

test("POST legacy: fotos pendientes de migración no causan inserción parcial", async () => {
  const { api, llamadas } = await apiSimulada({ legacy: true });
  const response = await api.POST(solicitud({ nombre: "Nuevo", precio: 10, categoria: "Anchetas", imagenes: [fotoC] }));
  assert.equal(response.status, 503);
  assert.equal(llamadas.escrituras.length, 0);
});

test("POST legacy: permite crear sin enviar fotografías y usa select compatible", async () => {
  const { api, llamadas } = await apiSimulada({ legacy: true });
  const response = await api.POST(solicitud({ nombre: "Nuevo", precio: 10, categoria: "Anchetas" }));
  assert.equal(response.status, 201);
  assert.equal(llamadas.escrituras[0].args.data.imagenes, undefined);
  assert.equal(llamadas.escrituras[0].args.select.imagenes, undefined);
});

test("CRUD: solicitudes no autorizadas no consultan ni modifican productos", async (t) => {
  for (const metodo of ["POST", "PUT", "DELETE"]) {
    await t.test(metodo, async () => {
      const { api, llamadas } = await apiSimulada({ autorizado: false });
      const response = await api[metodo](metodo === "DELETE" ? { url: "https://example.com/api/admin/productos?id=51" } : solicitud({ id: 51 }));
      assert.equal(response.status, 403);
      assert.equal(llamadas.lecturas.length, 0);
      assert.equal(llamadas.escrituras.length, 0);
    });
  }
});
