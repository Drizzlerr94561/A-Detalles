const assert = require('node:assert/strict');
const test = require('node:test');
const { loadEsm } = require('./load-esm.cjs');
const estado = () => loadEsm('src/lib/catalogoAdminEstado.js');

test('un filtro eliminado vuelve a Todos, sin dejar el catálogo aparentemente vacío', async () => {
  const { reconciliarFiltroCategoria } = await estado();
  assert.equal(reconciliarFiltroCategoria('Antigua', [{ nombre: 'Flores' }]), 0);
  assert.equal(reconciliarFiltroCategoria('flores', [{ nombre: 'Flores' }]), 'Flores');
});

test('nombres de categoría parecidos a Todos mantienen selección y administración independientes', async () => {
  const { FILTRO_TODAS_CATEGORIAS, reconciliarFiltroCategoria } = await estado();
  const categorias = [
    { id: FILTRO_TODAS_CATEGORIAS, nombre: 'Todas las categorías' },
    { id: 21, dbId: 21, nombre: 'TODOS' },
    { id: 22, dbId: 22, nombre: 'Todas las categorías' },
  ];
  assert.equal(reconciliarFiltroCategoria(FILTRO_TODAS_CATEGORIAS, categorias), FILTRO_TODAS_CATEGORIAS);
  assert.equal(reconciliarFiltroCategoria('TODOS', categorias), 'TODOS');
  assert.equal(reconciliarFiltroCategoria('Todas las categorías', categorias), 'Todas las categorías');
  assert.deepEqual(categorias.filter(c => c.id !== FILTRO_TODAS_CATEGORIAS).map(c => c.dbId), [21, 22]);
});

test('renombrar la categoría actualiza el formulario y su etiqueta automática', async () => {
  const { cambiarCategoriaFormulario } = await estado();
  const form = cambiarCategoriaFormulario({ categoria: 'Antigua', etiqueta: 'Antigua', nombre: 'Ramo' }, 'Antigua', 'Flores');
  assert.equal(form.categoria, 'Flores'); assert.equal(form.etiqueta, 'Flores'); assert.equal(form.nombre, 'Ramo');
});

test('mover una categoría conserva las etiquetas editoriales independientes', async () => {
  const { cambiarCategoriaFormulario } = await estado();
  const form = cambiarCategoriaFormulario({ categoria: 'Antigua', etiqueta: 'Más vendido' }, 'Antigua', 'Flores');
  assert.equal(form.categoria, 'Flores'); assert.equal(form.etiqueta, 'Más vendido');
});

test('borrar categoría vacía obliga a seleccionar una vigente en un formulario anterior', async () => {
  const { cambiarCategoriaFormulario } = await estado();
  const form = cambiarCategoriaFormulario({ categoria: 'General', etiqueta: 'General' }, 'General');
  assert.equal(form.categoria, ''); assert.equal(form.etiqueta, '');
});

test('el formulario de otra categoría no cambia al retirar una colección', async () => {
  const { cambiarCategoriaFormulario } = await estado();
  const form = { categoria: 'Flores', etiqueta: 'Regalo' };
  assert.equal(cambiarCategoriaFormulario(form, 'General', 'Mugs'), form);
});
