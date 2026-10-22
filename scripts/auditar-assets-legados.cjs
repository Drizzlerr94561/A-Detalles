// Inventario de SOLO LECTURA. No adopta registros y nunca llama a destroy/delete/update.
function publicIdPropio(value, cloudName) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.username || url.password || !url.pathname.startsWith(`/${cloudName}/image/upload/`)) return null;
    const ruta = decodeURIComponent(url.pathname);
    const inicio = ruta.indexOf('/adetallesbq/');
    if (inicio < 0) return null;
    return ruta.slice(inicio + 1).replace(/\.[a-z0-9]+$/i, '');
  } catch { return null; }
}

function referenciasDe(value, cloudName, referencias = new Set()) {
  if (typeof value === "string") {
    const id = publicIdPropio(value, cloudName);
    if (id) referencias.add(id);
    else {
      try { const json = JSON.parse(value); if (json !== value) referenciasDe(json, cloudName, referencias); } catch { /* Texto sin URL o JSON. */ }
    }
  } else if (Array.isArray(value)) value.forEach(item => referenciasDe(item, cloudName, referencias));
  else if (value && typeof value === "object") Object.values(value).forEach(item => referenciasDe(item, cloudName, referencias));
  return referencias;
}

async function auditarAssetsLegados({ cliente, cloudName, oficial = [], proveedor = null }) {
  if (!cloudName) throw new Error('Falta configurar el nombre del servicio de imágenes.');
  const columnas = await cliente.$queryRaw`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos'`;
  if (!columnas.length) throw new Error('No existe la tabla productos en la base prevista.');
  const tieneGaleria = columnas.some(c => c.COLUMN_NAME === 'imagenes');
  const tablasAsset = await cliente.$queryRaw`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assets_catalogo'`;
  const [productos, pedidos, registro] = await Promise.all([
    cliente.producto.findMany({ select: { imagen: true, ...(tieneGaleria ? { imagenes: true } : {}) } }),
    cliente.pedido.findMany({ select: { items: true } }),
    tablasAsset.length ? cliente.assetCatalogo.findMany({ select: { publicId: true } }) : [],
  ]);
  const referencias = {
    productos: referenciasDe(productos, cloudName), pedidos: referenciasDe(pedidos, cloudName), oficial: referenciasDe(oficial, cloudName),
  };
  const todos = new Set([...referencias.productos, ...referencias.pedidos, ...referencias.oficial]);
  const registrados = new Set(registro.map(asset => asset.publicId));
  const detalle = [...todos].sort().map(publicId => ({ publicId, enProductos: referencias.productos.has(publicId), enPedidos: referencias.pedidos.has(publicId), enOficial: referencias.oficial.has(publicId), registrado: registrados.has(publicId) }));
  const resultado = {
    modo: 'solo lectura; sin adopción ni borrado',
    referencias: { productos: referencias.productos.size, pedidos: referencias.pedidos.size, oficial: referencias.oficial.size, unicas: todos.size, legadasSinRegistro: detalle.filter(item => !item.registrado).length },
    proveedorConsultado: false, inventarioCompleto: false,
    sinReferenciasLegadas: null, detalle,
  };
  if (!proveedor) return resultado;
  let cursor;
  const recursos = [];
  for (let pagina = 0; pagina < 10; pagina++) {
    const lote = await proveedor.api.resources({ resource_type: 'image', type: 'upload', prefix: 'adetallesbq/', max_results: 100, ...(cursor ? { next_cursor: cursor } : {}) });
    if (!Array.isArray(lote.resources)) throw new Error('El inventario del proveedor está incompleto.');
    recursos.push(...lote.resources.filter(resource => typeof resource.public_id === 'string' && resource.public_id.startsWith('adetallesbq/')));
    cursor = lote.next_cursor;
    if (!cursor) break;
  }
  resultado.proveedorConsultado = true;
  resultado.inventarioCompleto = !cursor;
  resultado.recursosPropiosConsultados = recursos.length;
  resultado.sinReferenciasLegadas = recursos
    .filter(resource => !todos.has(resource.public_id) && !registrados.has(resource.public_id))
    .map(resource => ({ publicId: resource.public_id, requiereRevisionYAdopcion: true }));
  return resultado;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--provider', '--details'].includes(arg))) throw new Error('Uso: node scripts/auditar-assets-legados.cjs [--provider] [--details]');
  require('@next/env').loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const { PrismaClient } = require('@prisma/client');
  const { pathToFileURL } = require('node:url');
  const path = require('node:path');
  const { catalogoOficial } = await import(pathToFileURL(path.resolve(__dirname, '../src/lib/catalogoOficial.js')).href);
  let proveedor;
  if (args.includes('--provider')) {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) throw new Error('Configura credenciales nuevas para consultar el inventario.');
    proveedor = require('cloudinary').v2;
    proveedor.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  }
  const cliente = new PrismaClient();
  try {
    const reporte = await auditarAssetsLegados({ cliente, cloudName: process.env.CLOUDINARY_CLOUD_NAME, oficial: catalogoOficial, proveedor });
    if (!args.includes('--details')) {
      delete reporte.detalle;
      if (Array.isArray(reporte.sinReferenciasLegadas)) reporte.sinReferenciasLegadas = reporte.sinReferenciasLegadas.length;
    }
    console.log(JSON.stringify(reporte, null, 2));
  } finally { await cliente.$disconnect(); }
}

module.exports = { auditarAssetsLegados, publicIdPropio };
if (require.main === module) main().catch(() => {
  console.error('No se pudo completar el inventario de imágenes. No se modificó ningún recurso ni registro.');
  process.exitCode = 1;
});
