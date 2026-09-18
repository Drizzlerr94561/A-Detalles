const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const linksGlobosAvif = [
  "https://ibb.co/d4q5Pfd4",
  "https://ibb.co/pBqxkS9j",
  "https://ibb.co/BHqn2sLt",
  "https://ibb.co/MxnxG5Hx",
  "https://ibb.co/gZHf5sPs",
  "https://ibb.co/k6ybXy2P",
  "https://ibb.co/5XgpMrqc",
  "https://ibb.co/TqqW1P2Q"
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
  console.log("🔍 Escaneando las 8 páginas de ImgBB (Arreglos con Globos)...");
  const extraidos = [];

  for (const pageUrl of linksGlobosAvif) {
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
