const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadEsm } = require('./load-esm.cjs');

async function cargar({ fallo = false } = {}) {
  let categorias = [{ id: 1, nombre: 'Flores', orden: 0 }, { id: 2, nombre: 'Regalos', orden: 1 }];
  const db = { categoria: { findMany: async () => { if (fallo) throw Object.assign(new Error('No conecta'), { code: 'P1001' }); return structuredClone(categorias).sort((a, b) => a.orden - b.orden); } } };
  db.$transaction = async (callback) => {
    const draft = structuredClone(categorias);
    const result = await callback({ categoria: {
      findMany: async () => draft,
      update: async ({ where, data }) => Object.assign(draft.find((c) => c.id === where.id), data),
    } });
    categorias = draft;
    return result;
  };
  const mocks = {
    [path.resolve('src/lib/prisma.js')]: { default: db },
    [path.resolve('src/lib/categoriasOrden.json')]: { default: ['Regalos', 'Flores'] },
  };
  const orden = await loadEsm('src/lib/categoriasOrden.js', { mocks });
  const api = await loadEsm('src/app/api/admin/categorias/orden/route.js', { mocks: {
    ...mocks, '@/lib/auth': { verifyIsAdmin: async () => ({ role: 'ADMIN' }) },
    'next/server': { NextResponse: { json: (body, init = {}) => ({ status: init.status || 200, json: async () => body }) } },
  } });
  return { orden, api, snapshot: () => structuredClone(categorias) };
}

test('orden: persiste en BD y una lectura nueva obtiene las posiciones guardadas', async () => {
  const { orden, api, snapshot } = await cargar();
  assert.equal((await api.PUT({ json: async () => ({ orden: ['Regalos', 'Flores'] }) })).status, 200);
  assert.deepEqual(Array.from(await orden.obtenerOrdenCategorias()), ['Regalos', 'Flores']);
  assert.deepEqual(snapshot().map((c) => [c.nombre, c.orden]), [['Flores', 1], ['Regalos', 0]]);
});

test('orden: duplicados, nombres ajenos o lista obsoleta no modifican posiciones', async () => {
  const { api, snapshot } = await cargar();
  const antes = snapshot();
  for (const [lista, status] of [[['Flores', 'Flores'], 400], [['Flores'], 409], [['Flores', 'No existe'], 409], [[true], 400]]) {
    assert.equal((await api.PUT({ json: async () => ({ orden: lista }) })).status, status);
    assert.deepEqual(snapshot(), antes);
  }
});

test('orden: GET fallido es 503; fallback de prioridad solo se permite a la página', async () => {
  const { orden, api } = await cargar({ fallo: true });
  assert.equal((await api.GET()).status, 503);
  assert.deepEqual(Array.from(await orden.obtenerOrdenCategorias()), ['Regalos', 'Flores']);
  assert.deepEqual(Array.from(orden.ordenarCategorias([{ nombre: 'Otra' }, { nombre: 'Flores' }], ['Flores'])).map((c) => c.nombre), ['Flores', 'Otra']);
});
