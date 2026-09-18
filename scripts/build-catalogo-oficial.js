const fs = require("fs");
const path = require("path");

const seedContent = fs.readFileSync(path.join(__dirname, "../prisma/seed.js"), "utf8");

const arrayMatches = seedContent.match(/const\s+productos\w+\s*=\s*(\[[\s\S]*?\]);/g);

let allProducts = [];

if (arrayMatches) {
  arrayMatches.forEach((arrStr) => {
    try {
      const jsonStr = arrStr.replace(/^const\s+productos\w+\s*=\s*/, "").replace(/;$/, "");
      const fn = new Function(`return ${jsonStr};`);
      const prods = fn();
      if (Array.isArray(prods)) {
        allProducts = allProducts.concat(prods);
      }
    } catch (e) {
      console.error("Error evaluating array:", e.message);
    }
  });
}

console.log(`📦 Encontrados ${allProducts.length} productos en seed.js.`);

allProducts = allProducts.map((p, index) => ({
  id: index + 1,
  nombre: p.nombre,
  descripcion: p.descripcion || "",
  precio: p.precio || 0,
  stock: p.stock || 999999,
  categoria: p.categoria || "General",
  etiqueta: p.etiqueta || p.categoria || "General",
  imagen: p.imagen || "/images/Canastita.png",
}));

const fileContent = `// Catálogo Oficial de Fallback para Adetallesbq con URLs nativas de Cloudinary
export const catalogoOficial = ${JSON.stringify(allProducts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "../src/lib/catalogoOficial.js"), fileContent, "utf8");
console.log("🎉 `src/lib/catalogoOficial.js` generado exitosamente con Cloudinary URLs!");
