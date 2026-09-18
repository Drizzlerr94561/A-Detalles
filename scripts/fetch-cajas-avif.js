const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const linksCajasAvif = [
  "https://ibb.co/KpgXGc2y",
  "https://ibb.co/V0Cb4bqk",
  "https://ibb.co/fGtqxgbT",
  "https://ibb.co/nVn3CXY",
  "https://ibb.co/twC06B2n",
  "https://ibb.co/TMfjmb3L",
  "https://ibb.co/zWJSWqVp",
  "https://ibb.co/sp2qGwML",
  "https://ibb.co/Rph2ZcW9",
  "https://ibb.co/pv5tskgh",
  "https://ibb.co/7tsXVzxn",
  "https://ibb.co/5wnYbjM",
  "https://ibb.co/VcfHVDkx",
  "https://ibb.co/Z74941K",
  "https://ibb.co/XrYMnfTZ",
  "https://ibb.co/gMj2mK4f",
  "https://ibb.co/RpgR4Cfz",
  "https://ibb.co/mr7JLz45",
  "https://ibb.co/2m8d2qk",
  "https://ibb.co/PGtnHBHq",
  "https://ibb.co/RkMCj5RZ",
  "https://ibb.co/RGngPPwN",
  "https://ibb.co/M5xJHV7B",
  "https://ibb.co/Y73JJVRr",
  "https://ibb.co/7JjtR1kQ",
  "https://ibb.co/8R6pkpM",
  "https://ibb.co/xSMgfyC2",
  "https://ibb.co/zW3QVbth",
  "https://ibb.co/4gJ59yS6",
  "https://ibb.co/MkfcjY9N",
  "https://ibb.co/V524CJC",
  "https://ibb.co/Qsx0bs7",
  "https://ibb.co/RTXDZKxF"
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
  console.log("🔍 Escaneando las 33 páginas de ImgBB (Cajas de regalo)...");
  const extraidos = [];

  for (const pageUrl of linksCajasAvif) {
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
