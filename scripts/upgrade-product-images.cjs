const { PrismaClient } = require('@prisma/client');

async function revisarColumnaImagenes(cliente) {
  const columnas = await cliente.$queryRaw`
    SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos'
  `;
  if (!columnas.length) throw new Error('No existe la tabla productos en la base de datos seleccionada.');
  return { existe: columnas.some(c => c.COLUMN_NAME === 'imagenes'), columnas };
}

async function actualizarGaleria(cliente, { aplicar = false } = {}) {
  const inicial = await revisarColumnaImagenes(cliente);
  if (inicial.existe || !aplicar) return { existe: inicial.existe, modificada: false };
  // Solo se añade una columna nullable: no se borran ni reasignan registros.
  // MySQL hace commit implícito del DDL; se vuelve a comprobar antes de informar éxito.
  try {
    await cliente.$executeRaw`ALTER TABLE productos ADD COLUMN imagenes JSON NULL`;
  } catch (error) {
    // Otra instalación pudo agregarla entre la comprobación y el ALTER.
    if (!(await revisarColumnaImagenes(cliente)).existe) throw error;
  }
  const final = await revisarColumnaImagenes(cliente);
  if (!final.existe) throw new Error('No se pudo verificar la columna imagenes después de la actualización.');
  return { existe: true, modificada: true };
}

async function main() {
  const opciones = process.argv.slice(2);
  if (opciones.some(a => !['--check', '--apply'].includes(a)) || (opciones.includes('--check') && opciones.includes('--apply'))) {
    throw new Error('Uso: node scripts/upgrade-product-images.cjs --check | --apply');
  }
  require('@next/env').loadEnvConfig(process.cwd());
  const cliente = new PrismaClient();
  try {
    const resultado = await actualizarGaleria(cliente, { aplicar: opciones.includes('--apply') });
    console.log(JSON.stringify(resultado, null, 2));
    if (!resultado.existe) {
      console.log('Falta productos.imagenes. Revisa la conexión y ejecuta --apply en la base de datos prevista.');
      process.exitCode = 2;
    }
  } finally { await cliente.$disconnect(); }
}

module.exports = { revisarColumnaImagenes, actualizarGaleria };
if (require.main === module) main().catch(error => {
  console.error('No se completó la actualización de galería:', error.code || 'ERROR_BD');
  process.exitCode = 1;
});
