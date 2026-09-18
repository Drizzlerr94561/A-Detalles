const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const linksAmorAmistad = [
  "https://ibb.co/nsJ1VWyG",
  "https://ibb.co/MxpNBkHg",
  "https://ibb.co/LDJ0Ns1B",
  "https://ibb.co/nsq3R223",
  "https://ibb.co/yHWRYTH",
  "https://ibb.co/k6qd4Cs2",
  "https://ibb.co/ym1DP04F",
  "https://ibb.co/93hNjV6R",
  "https://ibb.co/bgyrRGpZ",
  "https://ibb.co/hJWZmRj9"
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
  console.log("🔍 Escaneando los 10 nuevos links de Amor y Amistad...");
  const extraidos = [];

  for (const pageUrl of linksAmorAmistad) {
    const data = await fetchImgBbDetails(pageUrl);
    if (data && data.directUrl) {
      extraidos.push(data);
      console.log(`✓ ${data.title} -> ${data.directUrl}`);
    } else {
      console.log(`❌ Falló extracción para ${pageUrl}`);
    }
  }

  console.log("\n--- RESULTADOS EXTRAÍDOS ---");
  console.log(JSON.stringify(extraidos, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
