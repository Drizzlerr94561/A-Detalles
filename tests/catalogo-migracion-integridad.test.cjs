const test = require('node:test');
const assert = require('node:assert/strict');
const { actualizarIntegridad } = require('../scripts/upgrade-catalog-integrity.cjs');

function base({ completa = false, huerfanos = 0, falloFk = false, transformarColumnas = (columnas) => columnas, transformarIndices = (indices) => indices } = {}) {
  const s = { orden: completa, ordenNullable: false, unico: completa, indice: completa, defecto: !completa, estadoNullable: !completa, assets: completa, fk: completa, nulos: completa ? 0 : 1, escrituras: [], categorias: [{ id: 1, nombre: 'Flores', orden: completa ? 8 : null }, { id: 2, nombre: 'Adicionales', orden: completa ? 2 : null }], productos: [{ id: 1, categoria: 'Flores' }], legado: ['direcciones', 'tarjetas_inicio'] };
  const columna = (tabla, nombre, tipo, nullable, defecto = null) => ({ TABLE_NAME: tabla, COLUMN_NAME: nombre, DATA_TYPE: tipo.startsWith('varchar') ? 'varchar' : tipo, COLUMN_TYPE: tipo, IS_NULLABLE: nullable ? 'YES' : 'NO', COLUMN_DEFAULT: defecto, COLLATION_NAME: 'utf8mb4_unicode_ci' });
  const db = {
    async $queryRaw(strings) {
      const sql = strings.join('?');
      if (sql.includes('information_schema.COLUMNS') && sql.includes("COLUMN_NAME = 'orden'")) return s.orden ? [{ COLUMN_NAME: 'orden' }] : [];
      if (sql.includes('information_schema.COLUMNS')) return transformarColumnas([
        columna('productos', 'categoria', 'varchar(100)', false, s.defecto ? 'General' : null),
        columna('categorias', 'nombre', 'varchar(100)', false), columna('pedidos', 'estado', 'varchar(50)', s.estadoNullable, 'PENDIENTE'),
        ...(s.orden ? [columna('categorias', 'orden', 'int', s.ordenNullable, '0')] : []),
        ...(s.assets ? [
          columna('assets_catalogo', 'id', 'varchar(36)', false),
          columna('assets_catalogo', 'publicId', 'varchar(255)', false),
          columna('assets_catalogo', 'url', 'varchar(500)', true),
          columna('assets_catalogo', 'estado', 'varchar(24)', false, 'SUBIENDO'),
          columna('assets_catalogo', 'eliminarDesde', 'datetime(3)', true),
          columna('assets_catalogo', 'intentos', 'int', false, '0'),
          columna('assets_catalogo', 'ultimoError', 'varchar(100)', true),
          columna('assets_catalogo', 'createdAt', 'datetime(3)', false, 'CURRENT_TIMESTAMP(3)'),
          columna('assets_catalogo', 'updatedAt', 'datetime(3)', false),
        ] : []),
      ]);
      if (sql.includes('information_schema.STATISTICS')) return transformarIndices([
        ...(s.unico ? [{ TABLE_NAME: 'categorias', INDEX_NAME: 'categorias_nombre_key', NON_UNIQUE: 0, SEQ_IN_INDEX: 1, COLUMN_NAME: 'nombre' }] : []),
        ...(s.indice ? [{ TABLE_NAME: 'productos', INDEX_NAME: 'productos_categoria_idx', NON_UNIQUE: 1, SEQ_IN_INDEX: 1, COLUMN_NAME: 'categoria' }] : []),
        ...(s.assets ? [
          { TABLE_NAME: 'assets_catalogo', INDEX_NAME: 'PRIMARY', NON_UNIQUE: 0, SEQ_IN_INDEX: 1, COLUMN_NAME: 'id' },
          { TABLE_NAME: 'assets_catalogo', INDEX_NAME: 'assets_catalogo_publicId_key', NON_UNIQUE: 0, SEQ_IN_INDEX: 1, COLUMN_NAME: 'publicId' },
          { TABLE_NAME: 'assets_catalogo', INDEX_NAME: 'assets_catalogo_url_key', NON_UNIQUE: 0, SEQ_IN_INDEX: 1, COLUMN_NAME: 'url' },
          { TABLE_NAME: 'assets_catalogo', INDEX_NAME: 'assets_catalogo_estado_eliminarDesde_idx', NON_UNIQUE: 1, SEQ_IN_INDEX: 1, COLUMN_NAME: 'estado' },
          { TABLE_NAME: 'assets_catalogo', INDEX_NAME: 'assets_catalogo_estado_eliminarDesde_idx', NON_UNIQUE: 1, SEQ_IN_INDEX: 2, COLUMN_NAME: 'eliminarDesde' },
        ] : []),
      ]);
      if (sql.includes('information_schema.KEY_COLUMN_USAGE')) return s.fk ? [{ REFERENCED_TABLE_NAME: 'categorias', REFERENCED_COLUMN_NAME: 'nombre', UPDATE_RULE: 'CASCADE', DELETE_RULE: 'RESTRICT' }] : [];
      if (sql.includes('AS huerfanos')) return [{ huerfanos, categoriasVacias: 0, duplicadas: 0, estadosNulos: s.nulos }];
      if (sql.includes('SELECT id, nombre, orden')) return structuredClone(s.categorias);
      throw new Error(`Consulta inesperada: ${sql}`);
    },
    async $executeRaw(strings, ...valores) {
      const sql = strings.join('?'); s.escrituras.push(sql);
      if (sql.includes('ADD UNIQUE INDEX')) s.unico = true;
      else if (sql.includes('ADD INDEX')) s.indice = true;
      else if (sql.includes('DROP DEFAULT')) s.defecto = false;
      else if (sql.includes('UPDATE pedidos')) s.nulos = 0;
      else if (sql.includes('MODIFY COLUMN estado')) s.estadoNullable = false;
      else if (sql.includes('CREATE TABLE IF NOT EXISTS assets')) s.assets = true;
      else if (sql.includes('FOREIGN KEY')) { if (falloFk) throw Object.assign(new Error('DDL denegado'), { code: 'P2010' }); s.fk = true; }
      else if (sql.includes('ADD COLUMN orden')) { s.orden = true; s.ordenNullable = true; }
      else if (sql.includes('UPDATE categorias')) s.categorias.find((c) => c.id === valores[1]).orden = valores[0];
      else if (sql.includes('MODIFY COLUMN orden')) s.ordenNullable = false;
      else throw new Error(`Escritura inesperada: ${sql}`);
      return 0;
    },
  };
  db.$transaction = async (cb) => cb(db);
  return { db, s };
}

test('migración integridad: check detecta pendientes sin escribir', async () => {
  const { db, s } = base();
  const result = await actualizarIntegridad(db);
  assert.equal(result.lista, false);
  assert.equal(s.escrituras.length, 0);
});

test('migración integridad: conserva productos/legado, rellena solo estados nulos e inicializa orden', async () => {
  const { db, s } = base();
  const productos = structuredClone(s.productos), legado = [...s.legado];
  assert.equal((await actualizarIntegridad(db, { aplicar: true })).lista, true);
  assert.deepEqual(s.productos, productos); assert.deepEqual(s.legado, legado);
  assert.equal(s.nulos, 0);
  assert.ok(s.categorias.find((c) => c.nombre === 'Adicionales').orden < s.categorias.find((c) => c.nombre === 'Flores').orden);
  assert.equal(s.escrituras.some((sql) => /^\s*(DELETE|DROP TABLE)/i.test(sql)), false);
  const total = s.escrituras.length;
  assert.equal((await actualizarIntegridad(db, { aplicar: true })).modificada, false);
  assert.equal(s.escrituras.length, total);
});

test('migración integridad: un esquema completo no reescribe orden ni datos', async () => {
  const { db, s } = base({ completa: true });
  const antes = structuredClone(s.categorias);
  assert.equal((await actualizarIntegridad(db, { aplicar: true })).modificada, false);
  assert.deepEqual(s.categorias, antes);
  assert.equal(s.escrituras.length, 0);
});

test('migración integridad: huérfanos bloquean todas las escrituras', async () => {
  const { db, s } = base({ huerfanos: 1 });
  await assert.rejects(actualizarIntegridad(db, { aplicar: true }), /huérfanos/);
  assert.equal(s.escrituras.length, 0);
});

test('migración integridad: fallo de FK no se anuncia como éxito', async () => {
  const { db } = base({ falloFk: true });
  await assert.rejects(actualizarIntegridad(db, { aplicar: true }), (error) => error.code === 'P2010');
});

for (const [nombre, transformar] of [
  ['columna ausente', (columnas) => columnas.filter((c) => c.COLUMN_NAME !== 'ultimoError')],
  ['tipos incorrectos que antes pasaban', (columnas) => columnas.map((c) => ({ ...c, COLUMN_TYPE: 'varchar(100)' }))],
  ['URL obligatoria incompatible con reservas', (columnas) => columnas.map((c) => c.COLUMN_NAME === 'url' ? { ...c, IS_NULLABLE: 'NO' } : c)],
  ['precisión temporal insuficiente', (columnas) => columnas.map((c) => c.COLUMN_NAME === 'eliminarDesde' ? { ...c, COLUMN_TYPE: 'datetime' } : c)],
  ['default de estado incorrecto', (columnas) => columnas.map((c) => c.COLUMN_NAME === 'estado' ? { ...c, COLUMN_DEFAULT: 'VINCULADO' } : c)],
  ['contador unsigned incompatible', (columnas) => columnas.map((c) => c.COLUMN_NAME === 'intentos' ? { ...c, COLUMN_TYPE: 'int unsigned' } : c)],
]) {
  test(`migración integridad: assets con ${nombre} bloquean antes de escribir`, async () => {
    const { db, s } = base({ completa: true, transformarColumnas: (columnas) => [
      ...columnas.filter((c) => c.TABLE_NAME !== 'assets_catalogo'),
      ...transformar(columnas.filter((c) => c.TABLE_NAME === 'assets_catalogo')),
    ] });
    await assert.rejects(actualizarIntegridad(db, { aplicar: true }), /assets_catalogo.*revisión manual/);
    assert.equal(s.escrituras.length, 0);
  });
}

for (const [nombre, transformar] of [
  ['sin primary key', (indices) => indices.filter((i) => i.INDEX_NAME !== 'PRIMARY')],
  ['publicId no único', (indices) => indices.map((i) => i.COLUMN_NAME === 'publicId' ? { ...i, NON_UNIQUE: 1 } : i)],
  ['URL con índice parcial', (indices) => indices.map((i) => i.COLUMN_NAME === 'url' ? { ...i, SUB_PART: 191 } : i)],
  ['sin índice de cola', (indices) => indices.filter((i) => i.INDEX_NAME !== 'assets_catalogo_estado_eliminarDesde_idx')],
  ['índice de cola con orden invertido', (indices) => indices.map((i) => i.INDEX_NAME === 'assets_catalogo_estado_eliminarDesde_idx' ? { ...i, SEQ_IN_INDEX: 3 - i.SEQ_IN_INDEX } : i)],
]) {
  test(`migración integridad: assets ${nombre} no anuncian esquema listo`, async () => {
    const { db, s } = base({ completa: true, transformarIndices: (indices) => [
      ...indices.filter((i) => i.TABLE_NAME !== 'assets_catalogo'),
      ...transformar(indices.filter((i) => i.TABLE_NAME === 'assets_catalogo')),
    ] });
    await assert.rejects(actualizarIntegridad(db, { aplicar: true }), /assets_catalogo requiere el índice/);
    assert.equal(s.escrituras.length, 0);
  });
}

test('migración integridad: acepta display width de MySQL antiguo y mayúsculas en now', async () => {
  const { db, s } = base({ completa: true, transformarColumnas: (columnas) => columnas.map((c) => c.TABLE_NAME !== 'assets_catalogo' ? c
    : c.COLUMN_NAME === 'intentos' ? { ...c, COLUMN_TYPE: 'int(11)' }
      : c.COLUMN_NAME === 'createdAt' ? { ...c, COLUMN_DEFAULT: 'current_timestamp(3)' } : c) });
  assert.equal((await actualizarIntegridad(db, { aplicar: true })).lista, true);
  assert.equal(s.escrituras.length, 0);
});
