const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repoRoot = process.env.TEST_REPO_ROOT || process.cwd();
const rutaCategorias = path.join(repoRoot, 'src/app/api/admin/categorias/route.js');
const rutaSeed = path.join(repoRoot, 'prisma/seed.js');
const copia = (value) => JSON.parse(JSON.stringify(value));

// El doble aplica cambios solo al confirmar la transacción. Una escritura fuera
// de tx es un error del test; nunca carga Prisma real ni abre una conexión.
function crearDbCategorias({ falloMovimiento = false, falloLectura = false } = {}) {
  let state = {
    categorias: [{ id: 1, nombre: 'Arreglos Florales' }, { id: 2, nombre: 'General' }],
    productos: [{ id: 10, categoria: 'Arreglos Florales' }, { id: 11, categoria: 'Arreglos Florales' }, { id: 12, categoria: 'General' }],
  };
  const llamadas = { transacciones: 0, renombres: 0, movimientos: 0, borrados: 0 };
  const prisma = {
    categoria: {
      async findMany() {
        if (falloLectura) throw new Error('Lectura no disponible');
        return copia(state.categorias);
      },
    },
    async $transaction(callback, options) {
      llamadas.transacciones++;
      assert.equal(options.isolationLevel, 'Serializable');
      const draft = copia(state);
      const tx = {
        categoria: {
          async findUnique({ where }) { return copia(draft.categorias.find((c) => c.id === where.id) || null); },
          async findFirst({ where }) { return copia(draft.categorias.find((c) => c.nombre === where.nombre && c.id !== where.id.not) || null); },
          async update({ where, data }) {
            llamadas.renombres++;
            const categoria = draft.categorias.find((c) => c.id === where.id);
            Object.assign(categoria, data);
            return copia(categoria);
          },
          async upsert({ where, create }) {
            const categoria = draft.categorias.find((c) => c.nombre === where.nombre);
            if (categoria) return copia(categoria);
            const nueva = { id: Math.max(0, ...draft.categorias.map((c) => c.id)) + 1, ...create };
            draft.categorias.push(nueva);
            return copia(nueva);
          },
          async delete({ where }) {
            llamadas.borrados++;
            const categoria = draft.categorias.find((c) => c.id === where.id);
            draft.categorias = draft.categorias.filter((c) => c.id !== where.id);
            return copia(categoria);
          },
        },
        producto: {
          async count({ where }) { return draft.productos.filter((p) => p.categoria === where.categoria).length; },
          async updateMany({ where, data }) {
            llamadas.movimientos++;
            if (falloMovimiento) throw new Error('Fallo posterior al cambio de categoría');
            let count = 0;
            for (const producto of draft.productos) {
              if (producto.categoria === where.categoria) { Object.assign(producto, data); count++; }
            }
            return { count };
          },
        },
      };
      const result = await callback(tx);
      state = draft;
      return result;
    },
  };
  return { prisma, llamadas, snapshot: () => copia(state) };
}

async function cargarCategorias(prisma) {
  const { loadEsm } = require('./load-esm.cjs');
  return loadEsm(rutaCategorias, { projectRoot: repoRoot, mocks: {
    'next/server': { NextResponse: { json: (data, options = {}) => ({ status: options.status || 200, json: async () => data }) } },
    '@/lib/prisma': { default: prisma },
    '@/lib/auth': { verifyIsAdmin: async () => ({ id: 1, role: 'ADMIN' }) },
  } });
}

const bodyRequest = (body) => ({ json: async () => body });

test('categorías: un renombrado mueve todos sus productos dentro de la transacción', async () => {
  const db = crearDbCategorias();
  const route = await cargarCategorias(db.prisma);
  const response = await route.PUT(bodyRequest({ id: 1, nuevoNombre: 'Flores' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(db.llamadas.transacciones, 1);
  assert.deepEqual(db.snapshot(), {
    categorias: [{ id: 1, nombre: 'Flores' }, { id: 2, nombre: 'General' }],
    productos: [{ id: 10, categoria: 'Flores' }, { id: 11, categoria: 'Flores' }, { id: 12, categoria: 'General' }],
  });
});

test('categorías: fallo al mover productos revierte también el renombrado', async () => {
  const db = crearDbCategorias({ falloMovimiento: true });
  const antes = db.snapshot();
  const route = await cargarCategorias(db.prisma);
  const response = await route.PUT(bodyRequest({ id: 1, nuevoNombre: 'Flores' }));
  assert.equal(response.status, 500);
  assert.equal(db.llamadas.renombres, 1, 'El fallo sucede después de intentar renombrar');
  assert.equal(db.llamadas.movimientos, 1);
  assert.deepEqual(db.snapshot(), antes, 'Ningún cambio parcial se confirma');
});

test('categorías: General con productos devuelve 409 y conserva categoría y productos', async () => {
  const db = crearDbCategorias();
  const antes = db.snapshot();
  const route = await cargarCategorias(db.prisma);
  const response = await route.DELETE({ url: 'https://tienda.test/api/admin/categorias?id=2' });
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /General/);
  assert.equal(db.llamadas.borrados, 0);
  assert.equal(db.llamadas.movimientos, 0);
  assert.deepEqual(db.snapshot(), antes);
});

test('categorías: borrar otra colección mueve productos a General y elimina solo su categoría', async () => {
  const db = crearDbCategorias();
  const route = await cargarCategorias(db.prisma);
  const response = await route.DELETE({ url: 'https://tienda.test/api/admin/categorias?id=1' });
  assert.equal(response.status, 200);
  assert.deepEqual(db.snapshot(), {
    categorias: [{ id: 2, nombre: 'General' }],
    productos: [{ id: 10, categoria: 'General' }, { id: 11, categoria: 'General' }, { id: 12, categoria: 'General' }],
  });
});

test('categorías: falla al mover durante borrado conserva la categoría original', async () => {
  const db = crearDbCategorias({ falloMovimiento: true });
  const antes = db.snapshot();
  const route = await cargarCategorias(db.prisma);
  const response = await route.DELETE({ url: 'https://tienda.test/api/admin/categorias?id=1' });
  assert.equal(response.status, 500);
  assert.equal(db.llamadas.movimientos, 1);
  assert.deepEqual(db.snapshot(), antes);
});

test('categorías: error de lectura devuelve 503 con error y no una lista vacía exitosa', async () => {
  const route = await cargarCategorias(crearDbCategorias({ falloLectura: true }).prisma);
  const response = await route.GET();
  assert.equal(response.status, 503);
  assert.equal(Array.isArray(await response.json()), false);
  assert.equal(typeof (await response.json()).error, 'string');
});

test('categorías: rechaza IDs inválidos antes de iniciar una transacción', async () => {
  const db = crearDbCategorias();
  const route = await cargarCategorias(db.prisma);
  for (const id of ['1abc', '1.5', '-1', '0', '2147483648', true, [1], {}]) {
    const response = await route.PUT(bodyRequest({ id, nuevoNombre: 'Flores' }));
    assert.equal(response.status, 400, `ID rechazado: ${JSON.stringify(id)}`);
  }
  assert.equal(db.llamadas.transacciones, 0);
});

function crearDbSeed({ existente, falloProducto = false } = {}) {
  const tablas = ['producto', 'pedido', 'usuario', 'categoria', 'adicional'];
  let state = Object.fromEntries(tablas.map((tabla) => [tabla, tabla === existente ? [{ id: 1, marca: 'dato existente' }] : []]));
  const llamadas = { escrituras: 0, transacciones: 0, opciones: null };
  const prisma = {
    async $transaction(callback, options) {
      llamadas.transacciones++;
      llamadas.opciones = options;
      const draft = copia(state);
      const tx = Object.fromEntries(tablas.map((tabla) => [tabla, {
        async count() { return draft[tabla].length; },
        async create({ data }) {
          llamadas.escrituras++;
          if (tabla === 'producto' && falloProducto && draft.producto.length === 5) throw new Error('Fallo de escritura en catálogo');
          const item = { id: draft[tabla].length + 1, ...copia(data) };
          draft[tabla].push(item);
          return copia(item);
        },
      }]));
      const result = await callback(tx);
      state = draft;
      return result;
    },
  };
  return { prisma, llamadas, snapshot: () => copia(state) };
}

function cargarSeed(prisma) {
  const source = fs.readFileSync(rutaSeed, 'utf8');
  const entry = source.lastIndexOf('\nmain()');
  assert.ok(entry > 0, 'Se encuentra la entrada del seed para impedir la autoejecución');
  const sandbox = {
    console: { log() {}, error() {}, warn() {} },
    require(specifier) {
      if (specifier === '@prisma/client') return { PrismaClient: class { constructor() { return prisma; } } };
      if (specifier === 'bcryptjs') return { hash: async () => 'hash-simulado' };
      throw new Error(`El seed intentó importar un módulo real no permitido: ${specifier}`);
    },
  };
  vm.runInNewContext(`${source.slice(0, entry)}\nglobalThis.seedMain = main;`, sandbox, { filename: rutaSeed });
  return sandbox.seedMain;
}

for (const tabla of ['producto', 'pedido', 'usuario', 'categoria', 'adicional']) {
  test(`seed: datos existentes en ${tabla} cancelan sin ninguna escritura`, async () => {
    const db = crearDbSeed({ existente: tabla });
    const antes = db.snapshot();
    const main = cargarSeed(db.prisma);
    await assert.rejects(main(), /Seed cancelado.*base de datos ya contiene información/);
    assert.equal(db.llamadas.transacciones, 1);
    assert.equal(db.llamadas.escrituras, 0);
    assert.deepEqual(db.snapshot(), antes);
  });
}

test('seed: DB vacía crea 303 productos y doce categorías en una única transacción', async () => {
  const db = crearDbSeed();
  await cargarSeed(db.prisma)();
  const data = db.snapshot();
  assert.equal(db.llamadas.transacciones, 1);
  assert.equal(db.llamadas.opciones.isolationLevel, 'Serializable');
  assert.ok(db.llamadas.opciones.timeout >= 120000);
  assert.equal(data.producto.length, 303);
  assert.equal(data.categoria.length, 12);
  assert.equal(data.usuario.length, 1);
  assert.equal(data.adicional.length, 8);
  assert.equal(data.pedido.length, 0);
  assert.equal(db.llamadas.escrituras, 324);
  const cantidades = Object.fromEntries(data.categoria.map((categoria) => [categoria.nombre, data.producto.filter((p) => p.categoria === categoria.nombre).length]));
  assert.deepEqual(cantidades, {
    'Amor y Amistad': 10, 'Desayunos Sorpresa': 34, 'Peluches Gigantes': 73,
    'Arreglos Florales': 50, 'Cuadros Personalizados': 37, 'Cajas de regalo': 33,
    'Catálogo Flores Amarillas': 7, Anchetas: 24, 'Arreglos con Globos': 8,
    'Llaveros Peluche': 13, 'Manillas Pareja': 4, 'Combos Luxury': 10,
  });
});

test('seed: fallo después de crear usuario/categorías/productos revierte toda la carga', async () => {
  const db = crearDbSeed({ falloProducto: true });
  const antes = db.snapshot();
  await assert.rejects(cargarSeed(db.prisma)(), /Fallo de escritura en catálogo/);
  assert.ok(db.llamadas.escrituras > 18, 'Se alcanza un fallo después de varias escrituras simuladas');
  assert.deepEqual(db.snapshot(), antes);
});
