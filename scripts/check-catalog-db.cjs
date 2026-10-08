const { PrismaClient } = require('@prisma/client');
const { revisarColumnaImagenes } = require('./upgrade-product-images.cjs');

async function main() {
  require('@next/env').loadEnvConfig(process.cwd());
  const cliente = new PrismaClient();
  try {
    const esquema = await revisarColumnaImagenes(cliente);
    const productos = await cliente.producto.findMany({
      select: { id: true, nombre: true, categoria: true, ...(esquema.existe ? { imagenes: true } : {}) },
    });
    const categorias = await cliente.categoria.findMany({ select: { nombre: true } });
    const nombres = new Set(categorias.map(c => c.nombre.trim().toLowerCase()));
    const conteos = {};
    const categoriasSinRegistro = new Set();
    for (const producto of productos) {
      const categoria = typeof producto.categoria === 'string' && producto.categoria.trim() ? producto.categoria.trim() : 'General';
      conteos[categoria] = (conteos[categoria] || 0) + 1;
      if (!nombres.has(categoria.toLowerCase())) categoriasSinRegistro.add(categoria);
    }
    console.log(JSON.stringify({
      origen: 'base de datos (consulta de solo lectura)',
      columnaImagenesDisponible: esquema.existe,
      totalProductos: productos.length,
      categorias: conteos,
      categoriasSinRegistro: [...categoriasSinRegistro],
      productosConVariasImagenes: esquema.existe ? productos.filter(p => Array.isArray(p.imagenes) && p.imagenes.length > 1).length : null,
    }, null, 2));
  } finally { await cliente.$disconnect(); }
}

if (require.main === module) main().catch(error => {
  console.error('No se pudo auditar la base de datos:', error.code || 'ERROR_BD');
  process.exitCode = 1;
});
