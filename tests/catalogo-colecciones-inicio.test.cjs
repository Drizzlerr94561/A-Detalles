const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm.cjs');
const cargar = () => loadEsm('src/lib/coleccionesInicio.js');
const producto = (id, categoria, dia = 1) => Object.freeze({ id, nombre: `Regalo ${id}`, categoria, createdAt: `2026-10-${String(dia).padStart(2, '0')}T12:00:00Z` });

test('cada colección conserva todos sus productos, recientes primero y sin modificar la entrada', async () => {
  const { crearColeccionesInicio } = await cargar();
  const productos = Object.freeze([producto(1, 'Flores', 1), producto(7, 'Desayunos', 7), ...[2,3,4,5,6].map(id => producto(id, 'Flores', id))]);
  const antes = JSON.stringify(productos);
  const colecciones = crearColeccionesInicio(productos, ['Desayunos', 'Flores']);
  assert.deepEqual(Array.from(colecciones, c => c.nombre), ['Desayunos', 'Flores']);
  assert.deepEqual(Array.from(colecciones[1].productos, p => p.id), [6,5,4,3,2,1]);
  assert.equal(colecciones.flatMap(c => c.productos).length, productos.length);
  assert.equal(JSON.stringify(productos), antes);
});

test('mover una categoría modifica las secciones y conserva sus productos asociados', async () => {
  const { crearColeccionesInicio } = await cargar();
  const productos = [producto(1, 'Flores'), producto(2, 'Desayunos')];
  const inicial = crearColeccionesInicio(productos, ['Desayunos', 'Flores']);
  const movido = crearColeccionesInicio(productos, ['Flores', 'Desayunos']);
  assert.deepEqual(Array.from(inicial, c => c.nombre), ['Desayunos', 'Flores']);
  assert.deepEqual(Array.from(movido, c => c.nombre), ['Flores', 'Desayunos']);
  assert.equal(movido[0].productos[0], productos[0]);
  assert.equal(movido[1].productos[0], productos[1]);
});

test('normaliza categorías, omite las vacías y coloca las nuevas al final', async () => {
  const { crearColeccionesInicio } = await cargar();
  const colecciones = crearColeccionesInicio([producto(1,' flores '), producto(2,'FLORES'), producto(3,'Zeta'), producto(4,'Alfa')], ['Flores','Vacía','flores']);
  assert.deepEqual(Array.from(colecciones, c => c.nombre), ['Flores','Alfa','Zeta']);
  assert.equal(colecciones[0].productos.length, 2);
  assert.equal(crearColeccionesInicio(null).length, 0);
});

test('lee el orden persistido de producción y el de la copia de pruebas, rechazando respuestas inválidas', async () => {
  const { leerOrdenColecciones } = await cargar();
  assert.deepEqual(Array.from(leerOrdenColecciones({success:true,source:'bd',orden:['Flores','Desayunos']})), ['Flores','Desayunos']);
  assert.deepEqual(Array.from(leerOrdenColecciones(['Desayunos','Flores'])), ['Desayunos','Flores']);
  for (const entrada of [null, {}, {success:false,orden:['Flores']}, {success:true,source:'fallback',orden:['Flores']}, ['Flores','flores'], [''], [false]]) {
    assert.equal(leerOrdenColecciones(entrada), null);
  }
});

test('Ver todos selecciona la categoría correcta, incluso si se llama Todos', async () => {
  const { resolverCategoriaCatalogo } = await cargar();
  const productos = [producto(1,'Arreglos Florales'), producto(2,'Todos'), producto(3,'Termos & Mugs')];
  assert.equal(resolverCategoriaCatalogo(' arreglos   florales ', productos), 'Arreglos Florales');
  assert.equal(resolverCategoriaCatalogo('Todos', productos), 'Todos');
  const categoria = 'Termos & Mugs';
  const consulta = new URL(`https://local/productos?categoria=${encodeURIComponent(categoria)}`).searchParams.get('categoria');
  assert.equal(resolverCategoriaCatalogo(consulta, productos), categoria);
  for (const entrada of [null, [], 'No existe', '']) assert.equal(resolverCategoriaCatalogo(entrada, productos), 0);
});

test('las secciones completas mantienen todos los productos y no cambian el límite del carrusel destacado', async () => {
  const { crearColeccionesInicio } = await cargar();
  const { agruparProductosPorCategorias } = await loadEsm('src/lib/carruselOrden.js');
  const productos = Array.from({length:20}, (_, i) => producto(i, i < 10 ? 'Flores' : 'Desayunos', i+1));
  assert.equal(crearColeccionesInicio(productos, ['Desayunos','Flores']).flatMap(c => c.productos).length, 20);
  assert.equal(agruparProductosPorCategorias(productos, ['Desayunos','Flores']).length, 8);
});

test('los termos y mugs reasignados aparecen en Cajas de regalo sin recrear su categoría eliminada', async () => {
  const { crearColeccionesInicio } = await cargar();
  const catalogoActual = [
    { ...producto(1, 'Cajas de regalo', 1), nombre: 'Termo personalizado' },
    { ...producto(2, 'Cajas de regalo', 2), nombre: 'Mug personalizado' },
    producto(3, 'Cajas de regalo', 3),
    producto(4, 'Flores', 4),
  ];
  const colecciones = crearColeccionesInicio(catalogoActual, ['Flores', 'Cajas de regalo']);
  assert.deepEqual(Array.from(colecciones, c => c.nombre), ['Flores', 'Cajas de regalo']);
  assert.deepEqual(Array.from(colecciones[1].productos, p => p.id), [3,2,1]);
  assert.equal(colecciones.flatMap(c => c.productos).length, catalogoActual.length);
});
