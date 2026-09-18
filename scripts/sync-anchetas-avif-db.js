const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesAnchetasAvif = [
  { nombre: "Ancheta Beers", url: "https://i.ibb.co/j9sLXtTH/Ancheta-Beers.avif" },
  { nombre: "Ancheta Candies", url: "https://i.ibb.co/kVBv2yns/Ancheta-Candies.avif" },
  { nombre: "Ancheta Cheers Dulcera", url: "https://i.ibb.co/TBFf0vHQ/Ancheta-Cheers-Dulcera.avif" },
  { nombre: "Ancheta Deluxe Gorra", url: "https://i.ibb.co/mjkrrBG/Ancheta-Deluxe-Gorra.avif" },
  { nombre: "Ancheta Deluxe", url: "https://i.ibb.co/jPcs6Q8c/Ancheta-Deluxe.avif" },
  { nombre: "Ancheta Elegant", url: "https://i.ibb.co/wZJ112W5/Ancheta-Elegant.avif" },
  { nombre: "Ancheta Fabulosa", url: "https://i.ibb.co/x87Ms769/Ancheta-Fabulosa.avif" },
  { nombre: "Ancheta Love Candies", url: "https://i.ibb.co/DHQyfm9C/Ancheta-Love-Candies.avif" },
  { nombre: "Ancheta Luxur", url: "https://i.ibb.co/nM1Qwj04/Ancheta-Luxur.avif" },
  { nombre: "Ancheta Luxury", url: "https://i.ibb.co/zzNpyKZ/Ancheta-Luxury.avif" },
  { nombre: "Ancheta Magic", url: "https://i.ibb.co/rftjJLpZ/Ancheta-Magic.avif" },
  { nombre: "Ancheta Mega Premium", url: "https://i.ibb.co/35bj3rXS/Ancheta-Mega-Premium.avif" },
  { nombre: "Ancheta Mug Beers", url: "https://i.ibb.co/YTJmKdJt/Ancheta-Mug-Beers.avif" },
  { nombre: "Ancheta Premium", url: "https://i.ibb.co/Z6dD9Y0x/Ancheta-Premium.avif" },
  { nombre: "Ancheta Romantic", url: "https://i.ibb.co/h1sTL82K/Ancheta-Romantic.avif" },
  { nombre: "Arreglo Baileys 750ML", url: "https://i.ibb.co/Mxpxvk8X/Arreglo-Baileys-750-ML.avif" },
  { nombre: "Arreglo Cervezas", url: "https://i.ibb.co/MxhJfBVr/Arreglo-Cervezas.avif" },
  { nombre: "Arreglo Copa Luxury", url: "https://i.ibb.co/hxTWX6rP/Arreglo-Copa-Luxury.avif" },
  { nombre: "Arreglo Encantador", url: "https://i.ibb.co/PSLHFv3/Arreglo-Encantador.avif" },
  { nombre: "Arreglo Girl Elegant", url: "https://i.ibb.co/BHxFQkyJ/Arreglo-Girl-Elegant.avif" },
  { nombre: "Baúl Cervecero", url: "https://i.ibb.co/wZ0GZxxW/Ba-l-Cervecero.avif" },
  { nombre: "Bloom Gift", url: "https://i.ibb.co/B21Z3tZM/Bloom-Gift.avif" },
  { nombre: "Ferreros Ballons", url: "https://i.ibb.co/qMFtTGvY/Ferreros-Ballons.avif" },
  { nombre: "Silver Gift", url: "https://i.ibb.co/My061NPq/Silver-Gift.avif" },
];

async function main() {
  console.log("🔄 Actualizando las 24 imágenes de 'Anchetas' en MySQL...");
  const productos = await prisma.producto.findMany();

  for (const item of imagenesAnchetasAvif) {
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
