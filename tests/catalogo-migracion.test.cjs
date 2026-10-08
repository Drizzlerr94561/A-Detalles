const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { actualizarGaleria } = require(path.join(process.env.CATALOGO_REPO_ROOT || path.resolve(__dirname, '..'), 'scripts/upgrade-product-images.cjs'));

function simularBase({ columna = false, tabla = true, fallo = null } = {}) {
  const estado = { columna, escrituras: [], productos: [{ id: 297, categoria: 'Catálogo Flores Amarillas', imagen: '/flor.jpg' }] };
  const cliente = {
    $queryRaw: async () => tabla ? [{ COLUMN_NAME: 'id', DATA_TYPE: 'int' }, ...(estado.columna ? [{ COLUMN_NAME: 'imagenes', DATA_TYPE: 'json' }] : [])] : [],
    $executeRaw: async (consulta) => {
      estado.escrituras.push(consulta.join(''));
      if (fallo) throw fallo;
      estado.columna = true;
      return 0;
    },
  };
  return { cliente, estado };
}

test('comprobar columna ausente no modifica la base de datos', async () => {
  const { cliente, estado } = simularBase();
  assert.deepEqual(await actualizarGaleria(cliente), { existe: false, modificada: false });
  assert.equal(estado.escrituras.length, 0);
});

test('la actualización es idempotente cuando la columna ya existe', async () => {
  const { cliente, estado } = simularBase({ columna: true });
  assert.deepEqual(await actualizarGaleria(cliente, { aplicar: true }), { existe: true, modificada: false });
  assert.equal(estado.escrituras.length, 0);
});

test('añade solamente la columna nullable y conserva los productos', async () => {
  const { cliente, estado } = simularBase();
  const productosAntes = structuredClone(estado.productos);
  assert.deepEqual(await actualizarGaleria(cliente, { aplicar: true }), { existe: true, modificada: true });
  assert.equal(estado.escrituras.length, 1);
  assert.match(estado.escrituras[0], /^ALTER TABLE productos ADD COLUMN imagenes JSON NULL$/);
  assert.deepEqual(estado.productos, productosAntes);
  assert.deepEqual(await actualizarGaleria(cliente, { aplicar: true }), { existe: true, modificada: false });
});

test('rechaza una base equivocada sin la tabla productos', async () => {
  const { cliente, estado } = simularBase({ tabla: false });
  await assert.rejects(actualizarGaleria(cliente, { aplicar: true }), /No existe la tabla productos/);
  assert.equal(estado.escrituras.length, 0);
});

test('un fallo SQL no se presenta como migración exitosa', async () => {
  const fallo = Object.assign(new Error('permiso DDL denegado'), { code: 'P2010' });
  const { cliente, estado } = simularBase({ fallo });
  await assert.rejects(actualizarGaleria(cliente, { aplicar: true }), error => error === fallo);
  assert.equal(estado.columna, false);
});
