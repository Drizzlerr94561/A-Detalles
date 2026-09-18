const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userLinks = [
  "https://ibb.co/spj2zcZY",
  "https://ibb.co/0pzvLbFq",
  "https://ibb.co/ZRjg3bnd",
  "https://ibb.co/21XFWp2h",
  "https://ibb.co/23XrykgT",
  "https://ibb.co/9kN0TG0K",
  "https://ibb.co/d0QwX689",
  "https://ibb.co/FLFvL9vy",
  "https://ibb.co/sp9sJc3x",
  "https://ibb.co/QFVPD8Wv",
  "https://ibb.co/Jw1RQ9PM",
  "https://ibb.co/5xFVDCcx",
  "https://ibb.co/SXgPTDYn",
  "https://ibb.co/fz7BbWJ2",
  "https://ibb.co/Xf6rcyV0",
  "https://ibb.co/TD6fN5J9",
  "https://ibb.co/354yssjS",
  "https://ibb.co/R4YtVG7W",
  "https://ibb.co/S4jHVCjW",
  "https://ibb.co/VGtKMRH",
  "https://ibb.co/hxLdCBvS",
  "https://ibb.co/qYLJ5xXL",
  "https://ibb.co/k6B0PmZr",
  "https://ibb.co/yF575fZb",
];

async function fetchImgBbDetails(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const ogImageMatch = html.match(/<meta property="og:image" content="(https:\/\/[^"]+)"/i);
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
    const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);

    let directUrl = ogImageMatch ? ogImageMatch[1] : null;
    let title = ogTitleMatch ? ogTitleMatch[1] : (titleTagMatch ? titleTagMatch[1] : "");

    title = title.replace(/\s+hosted at ImgBB.*$/i, "").replace(/\s+— ImgBB.*$/i, "").trim();

    return { pageUrl: url, directUrl, title };
  } catch (e) {
    console.error(`Error procesando ${url}:`, e.message);
    return null;
  }
}

async function main() {
  console.log("🔍 Escaneando las 24 páginas de ImgBB para obtener URLs directas 100% reales...");
  const extraidos = [];

  for (const pageUrl of userLinks) {
    const data = await fetchImgBbDetails(pageUrl);
    if (data && data.directUrl) {
      extraidos.push(data);
      console.log(`✓ ${data.title} -> ${data.directUrl}`);
    } else {
      console.log(`❌ Falló la extracción para: ${pageUrl}`);
    }
  }

  console.log("\n📦 Actualizando productos en MySQL...");
  const productos = await prisma.producto.findMany();

  for (const item of extraidos) {
    let prod = productos.find((p) => {
      const pNorm = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
      const iNorm = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      return pNorm === iNorm;
    });

    if (!prod) {
      prod = productos.find((p) => {
        const pNorm = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
        const iNorm = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        return pNorm.includes(iNorm) || iNorm.includes(pNorm);
      });
    }

    if (prod) {
      await prisma.producto.update({
        where: { id: prod.id },
        data: { imagen: item.directUrl },
      });
      console.log(`✅ [DB ${prod.id}] ${prod.nombre} -> ${item.directUrl}`);
    } else {
      const nuevo = await prisma.producto.create({
        data: {
          nombre: item.title,
          categoria: "Anchetas",
          etiqueta: "Anchetas",
          precio: 85000,
          stock: 999999,
          descripcion: `Excelente regalo artesanal de la categoría Anchetas con presentación de lujo y empaque decorado.`,
          imagen: item.directUrl,
        },
      });
      console.log(`✨ [CREADO ${nuevo.id}] ${nuevo.nombre} -> ${item.directUrl}`);
    }
  }

  console.log("\n📄 Generando objeto JS completo para la API de Vercel...");
  console.log(JSON.stringify(extraidos, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
