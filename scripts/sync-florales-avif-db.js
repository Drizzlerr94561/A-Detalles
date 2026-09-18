const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesFloralesAvif = [
  { nombre: "Rosa Encapsulada XL", url: "https://i.ibb.co/Cyck0VY/Rosa-Encapsulada-XL.avif" },
  { nombre: "Roses Box", url: "https://i.ibb.co/dsjrfLSf/Roses-Box.avif" },
  { nombre: "Roses Perfect", url: "https://i.ibb.co/v4Hz458g/Roses-Perfect.avif" },
  { nombre: "Roses Primavera", url: "https://i.ibb.co/V0zLzNF1/Roses-Primavera.avif" },
  { nombre: "Soft Luxe", url: "https://i.ibb.co/G37wrvSq/Soft-Luxe.avif" },
  { nombre: "Sweet Romance", url: "https://i.ibb.co/g1PFktG/Sweet-Romance.avif" },
  { nombre: "Arreglo Flowers Luxury", url: "https://i.ibb.co/S4t6JM5Z/Arreglo-Flowers-Luxury.avif" },
  { nombre: "Arreglo Luxury Roses", url: "https://i.ibb.co/5hqPLXhn/Arreglo-Luxury-Roses.avif" },
  { nombre: "Aurora Rose", url: "https://i.ibb.co/XZCJC321/Aurora-Rose.avif" },
  { nombre: "Bear Flowers", url: "https://i.ibb.co/Mrs3WGr/Bear-Flowers.avif" },
  { nombre: "Bouquet Flowers Blue", url: "https://i.ibb.co/9mCsNjW8/Bouquet-Flowers-Blue.avif" },
  { nombre: "Bouquet Flowers Pink", url: "https://i.ibb.co/TMvPfTQh/Bouquet-Flowers-Pink.avif" },
  { nombre: "Bouquet Oso Lotso Luxury", url: "https://i.ibb.co/LzLt2Q10/Bouquet-Oso-Lotso-Luxury.avif" },
  { nombre: "Bouquet Oso Lotso", url: "https://i.ibb.co/Ng5CDkPZ/Bouquet-Oso-Lotso.avif" },
  { nombre: "Box Flork Romantic", url: "https://i.ibb.co/4ZkK0SPJ/Box-Flork-Romantic.avif" },
  { nombre: "Box Flowers Rosé", url: "https://i.ibb.co/JwRPD6Pr/Box-Flowers-Ros.avif" },
  { nombre: "Box Girasoles", url: "https://i.ibb.co/ks7BYH3Y/Box-Girasoles.avif" },
  { nombre: "Box Love Elegant", url: "https://i.ibb.co/XkfQ0Z4s/Box-Love-Elegant.avif" },
  { nombre: "Box Roses", url: "https://i.ibb.co/YBHW4Jf2/Box-Roses.avif" },
  { nombre: "Buchon 12 Roses", url: "https://i.ibb.co/8LYXT0dT/Buchon-12-Roses.avif" },
  { nombre: "Canasta Roses", url: "https://i.ibb.co/MD2StC43/Canasta-Roses.avif" },
  { nombre: "Cilindro Buchón Luxury", url: "https://i.ibb.co/vC7pY5Tf/Cilindro-Buch-n-Luxury.avif" },
  { nombre: "Corazón Deluxe", url: "https://i.ibb.co/FLJgqZyq/Coraz-n-Deluxe.avif" },
  { nombre: "Corazón Luxury Ferreros", url: "https://i.ibb.co/TDsGDbYc/Coraz-n-Luxury-Ferreros.avif" },
  { nombre: "Deluxe 100 Roses", url: "https://i.ibb.co/PZMYgyxC/Deluxe-100-Roses.avif" },
  { nombre: "Deluxe 200 Roses", url: "https://i.ibb.co/Mx9Gd7Hb/Deluxe-200-Roses.avif" },
  { nombre: "Deluxe Girasoles", url: "https://i.ibb.co/xqQt74Ff/Deluxe-Girasoles.avif" },
  { nombre: "Eternal Roses", url: "https://i.ibb.co/WN87CC1B/Eternal-Roses.avif" },
  { nombre: "Flowers 100 Roses", url: "https://i.ibb.co/B2LNqfCy/Flowers-100-Roses.avif" },
  { nombre: "Girasol Encapsulado", url: "https://i.ibb.co/V4gbqpS/Girasol-Encapsulado.avif" },
  { nombre: "Girasoles Bear", url: "https://i.ibb.co/VW0rm3q1/Girasoles-Bear.avif" },
  { nombre: "Girasoles Bloom", url: "https://i.ibb.co/7N4zBG7M/Girasoles-Bloom.avif" },
  { nombre: "Heart Love", url: "https://i.ibb.co/mVR5n5vs/Heart-Love.avif" },
  { nombre: "Luxury Flowers", url: "https://i.ibb.co/nsDmdGnm/Luxury-Flowers.avif" },
  { nombre: "Luxury Red Rose", url: "https://i.ibb.co/93G7VYbv/Luxury-Red-Rose.avif" },
  { nombre: "Opulent Roses", url: "https://i.ibb.co/G49QZV1W/Opulent-Roses.avif" },
  { nombre: "Premium Ferreros", url: "https://i.ibb.co/nNGvHcSv/Premium-Ferreros.avif" },
  { nombre: "Ramo Deluxe", url: "https://i.ibb.co/BHc84SBC/Ramo-Deluxe.avif" },
  { nombre: "Ramo Elegant 60 Roses", url: "https://i.ibb.co/V0T8z3Xv/Ramo-Elegant-60-Roses.avif" },
  { nombre: "Ramo Flowers", url: "https://i.ibb.co/Rkxz5Z8N/Ramo-Flowers.avif" },
  { nombre: "Ramo Love Ferreros", url: "https://i.ibb.co/LzrtVY3K/Ramo-Love-Ferreros.avif" },
  { nombre: "Ramo Luxury 200 rosas", url: "https://i.ibb.co/1tN8YMvV/Ramo-Luxury-200-rosas.avif" },
  { nombre: "Ramo Luxury Primaveral", url: "https://i.ibb.co/whBXBCT1/Ramo-Luxury-Primaveral.avif" },
  { nombre: "Ramo Luxury Red Pink", url: "https://i.ibb.co/Z1mdgs3Z/Ramo-Luxury-Red-Pink.avif" },
  { nombre: "Ramo Premuim", url: "https://i.ibb.co/4ntPWZYp/Ramo-Premuim.avif" },
  { nombre: "Ramo Primavera", url: "https://i.ibb.co/ymFYmtNc/Ramo-Primavera.avif" },
  { nombre: "Ramo Womens", url: "https://i.ibb.co/1tXtvYnK/Ramo-Womens.avif" },
  { nombre: "Red Flowers", url: "https://i.ibb.co/4RzVWwSk/Red-Flowers.avif" },
  { nombre: "Rosa Encapsulada Roja", url: "https://i.ibb.co/ZRRz0yGX/Rosa-Encapsulada-Roja.avif" },
  { nombre: "Rosa Encapsulada Rosada", url: "https://i.ibb.co/4ZvjvG3m/Rosa-Encapsulada-Rosada.avif" },
];

async function main() {
  console.log("🔄 Actualizando las 50 imágenes de 'Arreglos Florales' en MySQL...");
  const productos = await prisma.producto.findMany();

  for (const item of imagenesFloralesAvif) {
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
      const nuevo = await prisma.producto.create({
        data: {
          nombre: item.nombre,
          categoria: "Arreglos Florales",
          etiqueta: "Arreglos Florales",
          precio: 150000,
          stock: 999999,
          descripcion: `Hermoso arreglo floral artesanal con rosas y flores frescas seleccionadas.`,
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
