// DDL idempotente y explícito. --check no escribe; --apply nunca borra tablas ni productos.
const ESQUEMA_ASSET = {
  id: { tipo: 'varchar(36)', nullable: 'NO', defecto: null },
  publicId: { tipo: 'varchar(255)', nullable: 'NO', defecto: null },
  url: { tipo: 'varchar(500)', nullable: 'YES', defecto: null },
  estado: { tipo: 'varchar(24)', nullable: 'NO', defecto: 'SUBIENDO' },
  eliminarDesde: { tipo: 'datetime(3)', nullable: 'YES', defecto: null },
  intentos: { tipo: 'int', nullable: 'NO', defecto: '0' },
  ultimoError: { tipo: 'varchar(100)', nullable: 'YES', defecto: null },
  createdAt: { tipo: 'datetime(3)', nullable: 'NO', defecto: 'current_timestamp(3)' },
  updatedAt: { tipo: 'datetime(3)', nullable: 'NO', defecto: null },
};
const ORDEN_INICIAL = require('../src/lib/categoriasOrden.json');

function indiceExacto(indices, tabla, columnas, unico = false, nombre = null) {
  const grupos = new Map();
  for (const fila of indices.filter((i) => i.TABLE_NAME === tabla)) {
    const grupo = grupos.get(fila.INDEX_NAME) || [];
    grupo.push(fila);
    grupos.set(fila.INDEX_NAME, grupo);
  }
  return [...grupos.values()].some((grupo) => (!nombre || grupo[0].INDEX_NAME === nombre)
    && (!unico || Number(grupo[0].NON_UNIQUE) === 0) && grupo.every((i) => i.SUB_PART == null)
    && grupo.sort((a, b) => Number(a.SEQ_IN_INDEX) - Number(b.SEQ_IN_INDEX)).map((i) => i.COLUMN_NAME).join(',') === columnas.join(','));
}

function verificarEsquemaAssets(columnas, indices) {
  for (const [nombre, previsto] of Object.entries(ESQUEMA_ASSET)) {
    const columna = columnas.find((c) => c.TABLE_NAME === 'assets_catalogo' && c.COLUMN_NAME === nombre);
    const tipo = String(columna?.COLUMN_TYPE || '').toLowerCase().replace(/^int\(\d+\)$/, 'int');
    const defecto = columna?.COLUMN_DEFAULT == null ? null : String(columna.COLUMN_DEFAULT);
    const defectoEsperado = previsto.defecto;
    const defectoValido = nombre === 'createdAt' ? defecto?.toLowerCase() === defectoEsperado : defecto === defectoEsperado;
    if (!columna || tipo !== previsto.tipo || columna.IS_NULLABLE !== previsto.nullable || !defectoValido) {
      throw new Error(`assets_catalogo.${nombre} tiene un esquema incompatible; requiere revisión manual.`);
    }
  }
  for (const [columnasIndice, unico, nombre] of [
    [['id'], true, 'PRIMARY'], [['publicId'], true, null], [['url'], true, null],
    [['estado', 'eliminarDesde'], false, null],
  ]) {
    if (!indiceExacto(indices, 'assets_catalogo', columnasIndice, unico, nombre)) {
      throw new Error(`assets_catalogo requiere el índice ${nombre || columnasIndice.join(',')}${unico ? ' único' : ''}; requiere revisión manual.`);
    }
  }
}

async function revisarIntegridad(cliente) {
  const columnas = await cliente.$queryRaw`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLLATION_NAME
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('productos', 'categorias', 'pedidos', 'assets_catalogo')`;
  const columna = (tabla, nombre) => columnas.find((c) => c.TABLE_NAME === tabla && c.COLUMN_NAME === nombre);
  const categoria = columna('productos', 'categoria');
  const nombre = columna('categorias', 'nombre');
  const estado = columna('pedidos', 'estado');
  if (!categoria || !nombre || !estado) throw new Error('Faltan tablas o columnas requeridas; verifica la base seleccionada.');
  if (categoria.COLUMN_TYPE.toLowerCase() !== 'varchar(100)' || nombre.COLUMN_TYPE.toLowerCase() !== 'varchar(100)'
    || categoria.COLLATION_NAME !== nombre.COLLATION_NAME || categoria.IS_NULLABLE !== 'NO' || nombre.IS_NULLABLE !== 'NO') {
    throw new Error('Las columnas de categoría deben ser varchar(100), NOT NULL y compartir collation. Requieren revisión manual.');
  }
  if (estado.COLUMN_TYPE.toLowerCase() !== 'varchar(50)') throw new Error('pedidos.estado tiene un tipo inesperado; requiere revisión manual.');
  const indices = await cliente.$queryRaw`
    SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME, SUB_PART FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('productos', 'categorias', 'assets_catalogo')`;
  const claves = await cliente.$queryRaw`
    SELECT k.TABLE_NAME, k.COLUMN_NAME, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE
    FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r
    ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND r.TABLE_NAME = k.TABLE_NAME
    WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME = 'productos' AND k.COLUMN_NAME = 'categoria'`;
  const fk = claves.find((k) => k.REFERENCED_TABLE_NAME === 'categorias' && k.REFERENCED_COLUMN_NAME === 'nombre'
    && k.UPDATE_RULE === 'CASCADE' && k.DELETE_RULE === 'RESTRICT');
  if (claves.length && (!fk || claves.length !== 1)) throw new Error('Existe una FK de categoría distinta de la prevista. No se modifica automáticamente.');
  const [calidad] = await cliente.$queryRaw`
    SELECT (SELECT COUNT(*) FROM productos p LEFT JOIN categorias c ON c.nombre = p.categoria WHERE c.id IS NULL) AS huerfanos,
      (SELECT COUNT(*) FROM productos WHERE TRIM(categoria) = '') AS categoriasVacias,
      (SELECT COUNT(*) FROM (SELECT nombre FROM categorias GROUP BY nombre HAVING COUNT(*) > 1) d) AS duplicadas,
      (SELECT COUNT(*) FROM pedidos WHERE estado IS NULL) AS estadosNulos`;
  const conteos = Object.fromEntries(Object.entries(calidad).map(([k, v]) => [k, Number(v)]));
  if (conteos.huerfanos || conteos.categoriasVacias || conteos.duplicadas) throw new Error('Hay productos huérfanos o categorías vacías/duplicadas. Reasigna los datos explícitamente antes de migrar.');
  const tieneAssets = columnas.some((c) => c.TABLE_NAME === 'assets_catalogo');
  if (tieneAssets) verificarEsquemaAssets(columnas, indices);
  const pendientes = [];
  if (!indiceExacto(indices, 'categorias', ['nombre'], true)) pendientes.push('categoria_nombre_unico');
  if (!indiceExacto(indices, 'productos', ['categoria'])) pendientes.push('producto_categoria_indice');
  if (categoria.COLUMN_DEFAULT !== null) pendientes.push('producto_categoria_sin_default');
  if (estado.IS_NULLABLE !== 'NO' || estado.COLUMN_DEFAULT !== 'PENDIENTE') pendientes.push('pedido_estado_obligatorio');
  if (!tieneAssets) pendientes.push('assets_catalogo');
  const orden = columna('categorias', 'orden');
  if (orden && orden.DATA_TYPE !== 'int') throw new Error('categorias.orden tiene un tipo inesperado; requiere revisión manual.');
  if (!orden || orden.IS_NULLABLE !== 'NO' || String(orden.COLUMN_DEFAULT) !== '0') pendientes.push('categoria_orden');
  if (!fk) pendientes.push('producto_categoria_fk');
  return { lista: pendientes.length === 0, pendientes, conteos };
}

async function actualizarIntegridad(cliente, { aplicar = false } = {}) {
  const inicial = await revisarIntegridad(cliente);
  if (!aplicar || inicial.lista) return { ...inicial, modificada: false };
  // MySQL confirma DDL implícitamente; cada paso se comprueba y puede reanudarse.
  const pasos = [
    ['categoria_orden', async () => {
      const columnas = await cliente.$queryRaw`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categorias' AND COLUMN_NAME = 'orden'`;
      if (!columnas.length) await cliente.$executeRaw`ALTER TABLE categorias ADD COLUMN orden INT NULL DEFAULT NULL`;
      // NULL es el marcador de inicialización pendiente: nunca sobrescribe un orden ya guardado.
      await cliente.$transaction(async (tx) => {
        const categorias = await tx.$queryRaw`SELECT id, nombre, orden FROM categorias ORDER BY nombre, id`;
        const posiciones = new Map(ORDEN_INICIAL.map((nombre, index) => [nombre, index]));
        const pendientes = categorias.filter((c) => c.orden === null).sort((a, b) =>
          (posiciones.get(a.nombre) ?? Infinity) - (posiciones.get(b.nombre) ?? Infinity) || a.nombre.localeCompare(b.nombre, 'es'));
        let posicion = Math.max(-1, ...categorias.filter((c) => c.orden !== null).map((c) => Number(c.orden))) + 1;
        for (const categoria of pendientes) await tx.$executeRaw`UPDATE categorias SET orden = ${posicion++} WHERE id = ${categoria.id} AND orden IS NULL`;
      }, { isolationLevel: 'Serializable' });
      await cliente.$executeRaw`ALTER TABLE categorias MODIFY COLUMN orden INT NOT NULL DEFAULT 0`;
    }],
    ['categoria_nombre_unico', () => cliente.$executeRaw`ALTER TABLE categorias ADD UNIQUE INDEX categorias_nombre_key (nombre)`],
    ['producto_categoria_indice', () => cliente.$executeRaw`ALTER TABLE productos ADD INDEX productos_categoria_idx (categoria)`],
    ['producto_categoria_sin_default', () => cliente.$executeRaw`ALTER TABLE productos ALTER COLUMN categoria DROP DEFAULT`],
    ['pedido_estado_obligatorio', async () => {
      await cliente.$executeRaw`UPDATE pedidos SET estado = 'PENDIENTE' WHERE estado IS NULL`;
      await cliente.$executeRaw`ALTER TABLE pedidos MODIFY COLUMN estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE'`;
    }],
    ['assets_catalogo', () => cliente.$executeRaw`
      CREATE TABLE IF NOT EXISTS assets_catalogo (
        id VARCHAR(36) NOT NULL, publicId VARCHAR(255) NOT NULL, url VARCHAR(500) NULL,
        estado VARCHAR(24) NOT NULL DEFAULT 'SUBIENDO', eliminarDesde DATETIME(3) NULL,
        intentos INT NOT NULL DEFAULT 0, ultimoError VARCHAR(100) NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id), UNIQUE INDEX assets_catalogo_publicId_key (publicId),
        UNIQUE INDEX assets_catalogo_url_key (url), INDEX assets_catalogo_estado_eliminarDesde_idx (estado, eliminarDesde)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`],
    ['producto_categoria_fk', () => cliente.$executeRaw`
      ALTER TABLE productos ADD CONSTRAINT productos_categoria_fkey FOREIGN KEY (categoria)
      REFERENCES categorias(nombre) ON UPDATE CASCADE ON DELETE RESTRICT`],
  ];
  for (const [nombre, ejecutar] of pasos) {
    if (!(await revisarIntegridad(cliente)).pendientes.includes(nombre)) continue;
    try { await ejecutar(); }
    catch (error) {
      if ((await revisarIntegridad(cliente)).pendientes.includes(nombre)) throw error;
    }
    if ((await revisarIntegridad(cliente)).pendientes.includes(nombre)) throw new Error(`No se pudo verificar el paso ${nombre}.`);
  }
  return { ...(await revisarIntegridad(cliente)), modificada: true };
}

async function main() {
  const opciones = process.argv.slice(2);
  if (opciones.length !== 1 || !['--check', '--apply'].includes(opciones[0])) throw new Error('Uso: node scripts/upgrade-catalog-integrity.cjs --check | --apply');
  require('@next/env').loadEnvConfig(process.cwd());
  const { PrismaClient } = require('@prisma/client');
  const cliente = new PrismaClient();
  try {
    const resultado = await actualizarIntegridad(cliente, { aplicar: opciones[0] === '--apply' });
    console.log(JSON.stringify(resultado, null, 2));
    if (!resultado.lista) process.exitCode = 2;
  } finally { await cliente.$disconnect(); }
}

module.exports = { revisarIntegridad, actualizarIntegridad };
if (require.main === module) main().catch((error) => {
  console.error('No se completó la migración de integridad:', error.code || 'REVISION_REQUERIDA');
  process.exitCode = 1;
});
