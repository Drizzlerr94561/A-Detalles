const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const linksCombosAvif = [
  "https://ibb.co/JwJ4zz63",
  "https://ibb.co/sdThbpWq",
  "https://ibb.co/MWVg39s",
  "https://ibb.co/Zpm954xY",
  "https://ibb.co/wZQ26vBk",
  "https://ibb.co/62DzfK0",
  "https://ibb.co/nMppqnvg",
  "https://ibb.co/KjtJGf8Y",
  "https://ibb.co/8Lz93BLG",
  "https://ibb.co/DH156KPB"
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
  console.log("🔍 Escaneando las 10 páginas de ImgBB (Combos Luxury)...");
  const extraidos = [];

  for (const pageUrl of linksCombosAvif) {
    const data = await fetchImgBbDetails(pageUrl);
    if (data && data.directUrl) {
      extraidos.push(data);
      console.log(`✓ ${data.title} -> ${data.directUrl}`);
    } else {
      console.log(`❌ Falló la extracción para: ${pageUrl}`);
    }
  }

  console.log("\n--- RESULTADOS EXTRAÍDOS ---");
  console.log(JSON.stringify(extraidos, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
