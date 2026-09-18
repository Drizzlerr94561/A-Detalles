const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const linksAnchetasAvif = [
  "https://ibb.co/xKdMTZD3",
  "https://ibb.co/V095YNyc",
  "https://ibb.co/1fwgXv9C",
  "https://ibb.co/Tf6DDTk",
  "https://ibb.co/B5XFzQfX",
  "https://ibb.co/TDK55N89",
  "https://ibb.co/dJ5Qc5DC",
  "https://ibb.co/1tT5GBrq",
  "https://ibb.co/SwmV6BxH",
  "https://ibb.co/pSnctCd",
  "https://ibb.co/mFBj7YyH",
  "https://ibb.co/HLybSFvG",
  "https://ibb.co/7NBPTpBG",
  "https://ibb.co/gMyKYPxJ",
  "https://ibb.co/Qj9xpmY6",
  "https://ibb.co/C3v3cKJr",
  "https://ibb.co/fzST9Dpf",
  "https://ibb.co/p6kzW7Nt",
  "https://ibb.co/79fmjd8",
  "https://ibb.co/KckSfn2g",
  "https://ibb.co/Y4Rn4qqk",
  "https://ibb.co/b5fBmPB9",
  "https://ibb.co/ccXG45jh",
  "https://ibb.co/SDCrmvVq"
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
  console.log("🔍 Escaneando las 24 páginas de ImgBB (Anchetas AVIF)...");
  const extraidos = [];

  for (const pageUrl of linksAnchetasAvif) {
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
