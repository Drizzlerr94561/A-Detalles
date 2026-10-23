const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm.cjs');

async function apiAdicionales({ error = null, admin = true } = {}) {
  const escrituras = [];
  const ejecutar = async (op, args) => {
    if (error) throw error;
    escrituras.push({ op, ...args });
    return { id: args.where?.id || 1, ...args.data };
  };
  const prisma = { adicional: {
    findMany: async () => { if (error) throw error; return []; },
    create: (args) => ejecutar('create', args), update: (args) => ejecutar('update', args), delete: (args) => ejecutar('delete', args),
  } };
  const api = await loadEsm('src/app/api/admin/adicionales/route.js', { mocks: {
    '@/lib/prisma': { default: prisma }, '@/lib/auth': { verifyIsAdmin: async () => admin ? { role: 'ADMIN' } : null },
    'next/server': { NextResponse: { json: (body, init = {}) => ({ status: init.status || 200, json: async () => body }) } },
  } });
  return { api, escrituras };
}

test('adicionales: PUT/DELETE rechazan el ID completo inválido sin escribir', async () => {
  const { api, escrituras } = await apiAdicionales();
  for (const id of ['1abc', '2.9', '3e4', '-1', '0', '2147483648', true]) {
    assert.equal((await api.DELETE({ url: `https://tienda.test/api/admin/adicionales?id=${id}` })).status, 400);
    assert.equal((await api.PUT({ json: async () => ({ id, nombre: 'Nombre' }) })).status, 400);
  }
  assert.equal(escrituras.length, 0);
});

test('adicionales: nombre/precio/disponibilidad inválidos no llegan a la BD', async () => {
  const { api, escrituras } = await apiAdicionales();
  for (const data of [{ nombre: '' }, { nombre: 'A'.repeat(256) }, { precio: -1 }, { precio: true }, { precio: 'Infinity' }, { disponible: 'false' }, { disponible: 0 }]) {
    assert.equal((await api.POST({ json: async () => ({ nombre: 'Extra', precio: 100, ...data }) })).status, 400);
  }
  assert.equal(escrituras.length, 0);
});

test('adicionales: cero y false conservan sus valores explícitos', async () => {
  const { api, escrituras } = await apiAdicionales();
  const response = await api.POST({ json: async () => ({ nombre: '  Tarjeta  ', precio: 0, disponible: false }) });
  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(JSON.stringify(escrituras[0].data)), { nombre: 'Tarjeta', precio: 0, disponible: false });
});

test('adicionales: inexistencia devuelve 404 y una lectura fallida devuelve 503', async () => {
  const inexistente = await apiAdicionales({ error: Object.assign(new Error('No existe'), { code: 'P2025' }) });
  assert.equal((await inexistente.api.DELETE({ url: 'https://tienda.test/api/admin/adicionales?id=1' })).status, 404);
  const sinConexion = await apiAdicionales({ error: Object.assign(new Error('No conecta'), { code: 'P1001' }) });
  const response = await sinConexion.api.GET();
  assert.equal(response.status, 503);
  assert.equal(Array.isArray(await response.json()), false);
});

test('adicionales: un usuario sin permisos no escribe', async () => {
  const { api, escrituras } = await apiAdicionales({ admin: false });
  assert.equal((await api.DELETE({ url: 'https://tienda.test/api/admin/adicionales?id=1' })).status, 403);
  assert.equal((await api.POST({ json: async () => ({ nombre: 'Extra', precio: 1 }) })).status, 403);
  assert.equal(escrituras.length, 0);
});
