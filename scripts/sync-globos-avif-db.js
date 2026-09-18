const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesGlobosAvif = [
  { nombre: "Bouquet Balloons", url: "https://i.ibb.co/Kxkr25Mx/Bouquet-Balloons.avif" },
  { nombre: "Bouquet Deluxe", url: "https://i.ibb.co/MxdsJm3k/Bouquet-Deluxe.avif" },
  { nombre: "Bouquet Elegant", url: "https://i.ibb.co/j9gJk4hT/Bouquet-Elegant.avif" },
  { nombre: "Bouquet Golden", url: "https://i.ibb.co/tTBTxP6T/Bouquet-Golden.avif" },
  { nombre: "Bouquet Luxury", url: "https://i.ibb.co/d41VdnLn/Bouquet-Luxury.avif" },
  { nombre: "Bouquet Numbers Helio", url: "https://i.ibb.co/PzYXgYGV/Bouquet-Numbers-Helio.avif" },
  { nombre: "Bouquet Shine Luxury", url: "https://i.ibb.co/LDXjkx4p/Bouquet-Shine-Luxury.avif" },
  { nombre: "Bouquets Decoración Deluxe", url: "https://i.ibb.co/HpphCG4c/Bouquets-Decoraci-n-Deluxe.avif" },
];

async function main() {
  console.log("🔄 Actualizando las 8 imágenes de 'Arreglos con Globos' en MySQL...");
  const productos = await prisma.producto.findMany();

  for (const item of imagenesGlobosAvif) {
    let prod = productos.find((p) => {
      const pNorm = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
      const iNorm = item.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
      return pNorm === iNorm;
    });

    if (!prod) {
      prod = productos.find((p) => {
        const pNorm = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
        const iNorm = item.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
        return pNorm.includes(iNorm) || iNorm.includes(pNorm);
      });
    }

    if (prod) {
      await prisma.producto.update({
        where: { id: prod.id },
        data: { imagen: item.url },
      });
      console.log(`✅ [DB ${prod.id}] ${prod.nombre} -> ${item.url}`);
    } else {
      console.log(`⚠️ No encontrado: ${item.nombre}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
