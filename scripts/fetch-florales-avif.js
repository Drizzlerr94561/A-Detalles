const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const linksFloralesAvif = [
  "https://ibb.co/wqk96pP",
  "https://ibb.co/j9bT8Wd8",
  "https://ibb.co/4R7NRyx9",
  "https://ibb.co/7xZSZz3f",
  "https://ibb.co/M5nTJD0m",
  "https://ibb.co/Y9yTHf6",
  "https://ibb.co/JwvcCGmS",
  "https://ibb.co/gZsxJbZP",
  "https://ibb.co/tMJCJxmg",
  "https://ibb.co/11Lwhd1",
  "https://ibb.co/WNYg61fx",
  "https://ibb.co/4Rm4qfbN",
  "https://ibb.co/qMtsP0pD",
  "https://ibb.co/20xhVLQg",
  "https://ibb.co/rG9FXp4v",
  "https://ibb.co/FLbtRZt8",
  "https://ibb.co/yc9PLfhL",
  "https://ibb.co/DgPJcDbC",
  "https://ibb.co/jkn59q3h",
  "https://ibb.co/zT6Njr7j",
  "https://ibb.co/3yrdjCqL",
  "https://ibb.co/5XNmFDSC",
  "https://ibb.co/ks0Q6bw6",
  "https://ibb.co/qLv8LW7B",
  "https://ibb.co/pvQPdT2X",
  "https://ibb.co/9kGVPW0J",
  "https://ibb.co/chdSrmYC",
  "https://ibb.co/4wvCkkx4",
  "https://ibb.co/zVsJGm4X",
  "https://ibb.co/nJ74L8c",
  "https://ibb.co/tMwkX3JG",
  "https://ibb.co/wrsL8KDG",
  "https://ibb.co/8Lmgygz3",
  "https://ibb.co/Y7tQnCyQ",
  "https://ibb.co/Nn7MmY93",
  "https://ibb.co/v6h4NJr3",
  "https://ibb.co/0R7SgM3S",
  "https://ibb.co/CpmxJTQH",
  "https://ibb.co/My7Lt9qR",
  "https://ibb.co/673gdVQ8",
  "https://ibb.co/Y7XkHPxg",
  "https://ibb.co/VcG20xjy",
  "https://ibb.co/hFLjLHkv",
  "https://ibb.co/Wptnz9QT",
  "https://ibb.co/pBwJ2vRd",
  "https://ibb.co/GfQtfyd4",
  "https://ibb.co/Kpsp0cG7",
  "https://ibb.co/Xx1CXf5H",
  "https://ibb.co/WNNvLSG5",
  "https://ibb.co/xS9M90dC"
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
  console.log("🔍 Escaneando las 50 páginas de ImgBB (Arreglos Florales)...");
  const extraidos = [];

  for (const pageUrl of linksFloralesAvif) {
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
