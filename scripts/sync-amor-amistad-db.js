const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesLote1 = [
  { nombre: "Box Peluche", url: "https://i.ibb.co/QFwHq5Vg/Box-Peluche.avif" },
  { nombre: "Box Roses", url: "https://i.ibb.co/ZpKT2zrf/Box-Roses.avif" },
  { nombre: "Brunch L’Amour", url: "https://i.ibb.co/Q7CJDxMh/Brunch-L-Amour.avif" },
  { nombre: "Copa Fruité", url: "https://i.ibb.co/jv9VHKKV/Copa-Fruit.avif" },
  { nombre: "Cuadro Love", url: "https://i.ibb.co/Wmg3P9m/Cuadro-Love.avif" },
  { nombre: "Desayuno Romance", url: "https://i.ibb.co/Fq8P5TL4/Desayuno-Romance.avif" },
  { nombre: "Mug Amour", url: "https://i.ibb.co/Xfg9LXYx/Mug-Amour.avif" },
  { nombre: "Ramo Deluxe", url: "https://i.ibb.co/fG927nfm/Ramo-Deluxe.avif" },
  { nombre: "Rosa Encapsulada", url: "https://i.ibb.co/QFq6jxsR/Rosa-Encapsulada.avif" },
  { nombre: "Rosa Encapsulada XL", url: "https://i.ibb.co/YFkyL7MQ/Rosa-Encapsulada-XL.avif" },
];

async function main() {
  console.log("🔄 Actualizando las 10 imágenes de 'Amor y Amistad' en MySQL...");
  const productos = await prisma.producto.findMany();

  for (const item of imagenesLote1) {
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
