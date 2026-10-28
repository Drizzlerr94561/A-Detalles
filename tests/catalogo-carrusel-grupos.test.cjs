const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm.cjs');

const cargar = () => loadEsm('src/lib/carruselOrden.js');
const ids = (productos) => Array.from(productos, (producto) => producto.id);
const producto = (id, categoria, dia) => ({
  id,
  categoria,
  ...(dia ? { createdAt: `2026-10-${String(dia).padStart(2, '0')}T12:00:00Z` } : {}),
});

test('selecciona solo cuatro recientes por categoría en el orden del catálogo, sin otra ronda', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  const entrada = Object.freeze([
    producto('F2', 'Flores', 2), producto('D1', 'Desayunos', 1), producto('A1', 'Anchetas', 1),
    producto('D5', 'Desayunos', 5), producto('F1', 'Flores', 1), producto('D3', 'Desayunos', 3),
    producto('A2', 'Anchetas', 2), producto('D4', 'Desayunos', 4), producto('F3', 'Flores', 3),
    producto('D2', 'Desayunos', 2), producto('D6', 'Desayunos', 6), producto('F4', 'Flores', 4),
    producto('F5', 'Flores', 5),
  ].map(Object.freeze));
  const antes = JSON.stringify(entrada);
  const orden = Object.freeze(['Desayunos', 'Flores', 'Anchetas']);
  const salida = agruparProductosPorCategorias(entrada, orden);
  assert.deepEqual(ids(salida), ['D6', 'D5', 'D4', 'D3', 'F5', 'F4', 'F3', 'F2', 'A2', 'A1']);
  assert.equal(new Set(salida).size, salida.length);
  assert.ok(salida.every((item) => entrada.includes(item)));
  assert.equal(JSON.stringify(entrada), antes);
});

test('agregar N a A B C D muestra N A B C y conserva D en el catálogo completo', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  const anteriores = Object.freeze([
    producto('C', 'Flores', 2), producto('A', 'Flores', 4),
    producto('D', 'Flores', 1), producto('B', 'Flores', 3),
  ].map(Object.freeze));
  assert.deepEqual(ids(agruparProductosPorCategorias(anteriores)), ['A', 'B', 'C', 'D']);
  const catalogo = Object.freeze([...anteriores, Object.freeze(producto('Nuevo', 'Flores', 5))]);
  assert.deepEqual(ids(agruparProductosPorCategorias(catalogo)), ['Nuevo', 'A', 'B', 'C']);
  assert.equal(catalogo.length, 5);
  assert.ok(catalogo.some((item) => item.id === 'D'));
  assert.equal(anteriores.length, 4);
});

test('editar un producto antiguo no lo convierte en uno recién creado', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  const entrada = [
    { ...producto('Antiguo editado', 'Flores', 1), updatedAt: '2026-10-28T12:00:00Z' },
    ...[2, 3, 4, 5].map((dia) => producto(dia, 'Flores', dia)),
  ];
  assert.deepEqual(ids(agruparProductosPorCategorias(entrada)), [5, 4, 3, 2]);
});

test('conserva el orden en empates y coloca fechas ausentes o inválidas al final', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  const entrada = [
    producto('Sin fecha', 'Flores'), producto('A', 'Flores', 2),
    { ...producto('Inválida', 'Flores'), createdAt: 'fecha inválida' },
    producto('B', 'Flores', 2), producto('Nuevo', 'Flores', 3),
  ];
  assert.deepEqual(ids(agruparProductosPorCategorias(entrada)), ['Nuevo', 'A', 'B', 'Sin fecha']);
});

test('omite categorías vacías y no rellena los grupos pequeños con duplicados', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  const entrada = [producto(1, 'Flores'), producto(2, 'Anchetas'), producto(3, 'Flores')];
  assert.deepEqual(ids(agruparProductosPorCategorias(entrada, ['Vacía', 'Flores', 'Anchetas', 'General'])), [1, 3, 2]);
});

test('normaliza los nombres y coloca las categorías desconocidas al final', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  const entrada = [producto(1, 'Zeta'), producto(2, ' cajas de   regalo '), producto(3, 'ARREGLOS FLORALES'), producto(4, 'Alfa')];
  const orden = [' Arreglos Florales ', 'Cajas de regalo', 'arreglos florales', null];
  assert.deepEqual(ids(agruparProductosPorCategorias(entrada, orden)), [3, 2, 4, 1]);
});

test('acepta listas inválidas y usa cuatro cuando el límite es inválido', async () => {
  const { agruparProductosPorCategorias } = await cargar();
  assert.deepEqual(ids(agruparProductosPorCategorias(null)), []);
  assert.deepEqual(ids(agruparProductosPorCategorias([null, false, 'texto', []])), []);
  const entrada = [...Array.from({ length: 5 }, (_, i) => producto(`F${i}`, 'Flores')), producto('D0', 'Desayunos')];
  assert.deepEqual(ids(agruparProductosPorCategorias(entrada, ['Flores', 'Desayunos'], 0)), ['F0', 'F1', 'F2', 'F3', 'D0']);
});


