const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesCombosAvif = [
  { nombre: "Baúl Cervezas Cuadro", url: "https://i.ibb.co/9k5LqqKZ/Ba-l-Cervezas-Cuadro.avif" },
  { nombre: "Cuadro + Caja madera", url: "https://i.ibb.co/FLQ9mkHz/Cuadro-Caja-madera.avif" },
  { nombre: "Girasoles Peluche", url: "https://i.ibb.co/QzNJ1Xf/Girasoles-Peluche.avif" },
  { nombre: "Oso Deluxe Balloons", url: "https://i.ibb.co/TxLy6jtb/Oso-Deluxe-Balloons.avif" },
  { nombre: "Peluche 50 Roses", url: "https://i.ibb.co/dspHKhjT/Peluche-50-Roses.avif" },
  { nombre: "Peluche Flowers", url: "https://i.ibb.co/Y6fmq5B/Peluche-Flowers.avif" },
  { nombre: "Peluche Premium", url: "https://i.ibb.co/PGkks9nm/Peluche-Premium.avif" },
  { nombre: "Ramo Rosas Cuadro", url: "https://i.ibb.co/ccWjvZsP/Ramo-Rosas-Cuadro.avif" },
  { nombre: "Rose Luces Peluche", url: "https://i.ibb.co/9kwWXvkB/Rose-Luces-Peluche.avif" },
  { nombre: "Stitch Gigante Flowers", url: "https://i.ibb.co/hJgDn8xG/Stitch-Gigante-Flowers.avif" },
];

async function main() {
  console.log("🔄 Actualizando las 10 imágenes de 'Combos Luxury' en MySQL...");
  const prodsCat = await prisma.producto.findMany({
    where: { categoria: "Combos Luxury" },
  });

  for (const item of imagenesCombosAvif) {
    const nombreLimpioItem = item.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");

    let prod = prodsCat.find((p) => {
      const nombreLimpioProd = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
      return nombreLimpioProd === nombreLimpioItem;
    });

    if (!prod) {
      prod = prodsCat.find((p) => {
        const pNorm = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
        return pNorm.startsWith(nombreLimpioItem) || nombreLimpioItem.startsWith(pNorm);
      });
    }

    if (prod) {
      await prisma.producto.update({
        where: { id: prod.id },
        data: { imagen: item.url },
      });
      console.log(`✅ [DB ${prod.id}] ${prod.nombre} -> ${item.url}`);
    } else {
      const nuevo = await prisma.producto.create({
        data: {
          nombre: item.nombre,
          categoria: "Combos Luxury",
          etiqueta: "Combos Luxury",
          precio: 250000,
          stock: 999999,
          descripcion: `Exclusivo combo de lujo con combinación artesanal premium.`,
          imagen: item.url,
        },
      });
      console.log(`✨ [DB CREADO ${nuevo.id}] ${nuevo.nombre} -> ${item.url}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
