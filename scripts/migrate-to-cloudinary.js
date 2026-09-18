const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: 'enwlpozz',
  api_key: '676424772427112',
  api_secret: 'Gj93-nrNpQPvJelmSN2mewHrgBY',
  secure: true
});

async function uploadLocalFetch(url, publicId) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Error descargando imagen (${res.status} ${res.statusText})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = res.headers.get('content-type') || 'image/avif';
  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const uploadResult = await cloudinary.uploader.upload(base64Data, {
    folder: 'adetallesbq/productos',
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  });

  let cloudinaryUrl = uploadResult.secure_url;
  if (cloudinaryUrl.includes('/upload/')) {
    cloudinaryUrl = cloudinaryUrl.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return cloudinaryUrl;
}

async function main() {
  console.log("🚀 Iniciando migración 100% nativa a tu cuenta de Cloudinary (enwlpozz)...\n");

  const productos = await prisma.producto.findMany({
    where: {
      imagen: {
        not: null,
      },
    },
    orderBy: { id: 'asc' },
  });

  const productosConImagen = productos.filter((p) => p.imagen && !p.imagen.includes('res.cloudinary.com'));

  console.log(`📦 Encontrados ${productosConImagen.length} productos pendientes de migrar a Cloudinary.\n`);

  let migrados = 0;
  let errores = 0;

  for (let i = 0; i < productosConImagen.length; i++) {
    const prod = productosConImagen[i];
    const nombreLimpio = prod.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
    const publicId = `prod_${prod.id}_${nombreLimpio}`;

    console.log(`⏳ [${i + 1}/${productosConImagen.length}] Subiendo [${prod.id}] "${prod.nombre}"...`);

    try {
      const cloudinaryUrl = await uploadLocalFetch(prod.imagen, publicId);

      await prisma.producto.update({
        where: { id: prod.id },
        data: { imagen: cloudinaryUrl },
      });

      migrados++;
      console.log(`  ✅ Exitoso -> ${cloudinaryUrl}\n`);
    } catch (err) {
      errores++;
      console.error(`  ❌ Error subiendo [${prod.id}] "${prod.nombre}":`, err.message, "\n");
    }
  }

  console.log(`\n🎉 MIGRACIÓN COMPLETADA: ${migrados} imágenes subidas a Cloudinary, ${errores} errores.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
