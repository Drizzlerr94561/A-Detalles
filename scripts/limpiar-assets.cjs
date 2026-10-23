// Por defecto solo revisa. --apply elimina exclusivamente assets registrados sin referencias.
async function main() {
  const opciones = process.argv.slice(2);
  if (opciones.some((arg) => !["--check", "--apply"].includes(arg)) || (opciones.includes("--check") && opciones.includes("--apply"))) throw new Error("Uso: node scripts/limpiar-assets.cjs --check | --apply");
  require("@next/env").loadEnvConfig(process.cwd());
  const { PrismaClient } = require("@prisma/client");
  const { v2: cloudinary } = require("cloudinary");
  const { pathToFileURL } = require("node:url");
  const path = require("node:path");
  const { procesarLimpiezaAssets } = await import(pathToFileURL(path.resolve(__dirname, "../src/lib/assetsCatalogo.js")).href);
  const aplicar = opciones.includes("--apply");
  if (!process.env.CLOUDINARY_CLOUD_NAME || (aplicar && (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET))) throw new Error("Falta configurar el servicio de imágenes en el entorno.");
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  const cliente = new PrismaClient();
  try {
    // Los no iniciados conservan su fecha y pueden procesarse en una nueva ejecución.
    const resultado = await procesarLimpiezaAssets({ cliente, proveedor: cloudinary, cloudName: process.env.CLOUDINARY_CLOUD_NAME, aplicar, limite: 50, presupuestoMs: 45000 });
    console.log(JSON.stringify({ modo: aplicar ? "aplicar" : "solo lectura", ...resultado }, null, 2));
    if (resultado.errores) process.exitCode = 1;
  } finally { await cliente.$disconnect(); }
}

if (require.main === module) main().catch(() => {
  console.error("No se pudo completar la revisión de imágenes. Revisa configuración y migración; los pendientes se conservan.");
  process.exitCode = 1;
});
