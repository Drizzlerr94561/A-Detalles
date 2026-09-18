const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesLote1 = [
  { nombre: "Copa Fruité", url: "https://i.ibb.co/sdNRB3Sn/Copa-Fruit.jpg" },
  { nombre: "Brunch L’Amour", url: "https://i.ibb.co/8nJBgPpk/Brunch-L-Amour.jpg" },
  { nombre: "Desayuno Romance", url: "https://i.ibb.co/JjqwRdYX/Desayuno-Romance.jpg" },
  { nombre: "Box Roses", url: "https://i.ibb.co/v41FgBsh/Box-Roses.jpg" },
  { nombre: "Ramo Deluxe", url: "https://i.ibb.co/QFVxXVw3/Ramo-Deluxe.jpg" },
  { nombre: "Rosa Encapsulada", url: "https://i.ibb.co/Y7kjHmXx/Rosa-Encapsulada.jpg" },
  { nombre: "Rosa Encapsulada XL", url: "https://i.ibb.co/yFct79GM/Rosa-Encapsulada-XL.jpg" },
  { nombre: "Cuadro Love", url: "https://i.ibb.co/Fb3zBMhb/Cuadro-Love.jpg" },
  { nombre: "Box Peluche", url: "https://i.ibb.co/rfwVg0B4/Box-Peluche.jpg" },
  { nombre: "Mug Amour", url: "https://i.ibb.co/N2FqPRLh/Mug-Amour.jpg" },
];

const imagenesLote2Anchetas = [
  { nombre: "Silver Gift", url: "https://i.ibb.co/1GKjKvPw/Silver-Gift.jpg" },
  { nombre: "Ferreros Ballons", url: "https://i.ibb.co/DgWkjrd6/Ferreros-Ballons.jpg" },
  { nombre: "Bloom Gift", url: "https://i.ibb.co/N2gTS7Qg/Bloom-Gift.jpg" },
  { nombre: "Baúl Cervecero", url: "https://i.ibb.co/JWmpCvP9/Ba-l-Cervecero.jpg" },
  { nombre: "Arreglo Girl Elegant", url: "https://i.ibb.co/DFtqwhG/Arreglo-Girl-Elegant.jpg" },
  { nombre: "Arreglo Encantador", url: "https://i.ibb.co/yc9Kgj9G/Arreglo-Encantador.jpg" },
  { nombre: "Arreglo Copa Luxury", url: "https://i.ibb.co/TqYJFDr5/Arreglo-Copa-Luxury.jpg" },
  { nombre: "Arreglo Cervezas", url: "https://i.ibb.co/ymdnRRZg/Arreglo-Cervezas.jpg" },
  { nombre: "Arreglo Baileys 750ML", url: "https://i.ibb.co/LDmFsfBV/Arreglo-Baileys-750-ML.jpg" },
  { nombre: "Ancheta Romantic", url: "https://i.ibb.co/spcd85tx/Ancheta-Romantic.jpg" },
  { nombre: "Ancheta Premium", url: "https://i.ibb.co/5gVtd3Z6/Ancheta-Premium.jpg" },
  { nombre: "Ancheta Mug Beers", url: "https://i.ibb.co/KjgXZc4q/Ancheta-Mug-Beers.jpg" },
  { nombre: "Ancheta Mega Premium", url: "https://i.ibb.co/93tjXBY3/Ancheta-Mega-Premium.jpg" },
  { nombre: "Ancheta Luxury Chocolates", url: "https://i.ibb.co/Xrb83z8b/Ancheta-Luxury-Chocolates.jpg" },
  { nombre: "Ancheta L’Amour", url: "https://i.ibb.co/hR037Wcx/Ancheta-L-Amour.jpg" },
  { nombre: "Ancheta Ferreros Luxury", url: "https://i.ibb.co/LdXv0Psp/Ancheta-Ferreros-Luxury.jpg" },
  { nombre: "Ancheta Dad", url: "https://i.ibb.co/6c2r9k0X/Ancheta-Dad.jpg" },
  { nombre: "Ancheta Deluxe Gorra", url: "https://i.ibb.co/p6V83b2N/Ancheta-Deluxe-Gorra.jpg" },
  { nombre: "Ancheta Deluxe", url: "https://i.ibb.co/1tw5b550/Ancheta-Deluxe.jpg" },
  { nombre: "Ancheta Cheers Dulcera", url: "https://i.ibb.co/7xcY9jW0/Ancheta-Cheers-Dulcera.jpg" },
  { nombre: "Ancheta Candies", url: "https://i.ibb.co/bMC2V0mC/Ancheta-Candies.jpg" },
  { nombre: "Ancheta Beers", url: "https://i.ibb.co/HL7V3Rj8/Ancheta-Beers.jpg" },
];

async function main() {
  console.log("🚀 Sincronizando Lote 1 y Lote 2 (Anchetas) desde ImgBB a MySQL...");

  const todosItems = [...imagenesLote1, ...imagenesLote2Anchetas];
  const productos = await prisma.producto.findMany();

  for (const item of todosItems) {
    // Prioridad 1: Coincidencia exacta
    let prod = productos.find((p) => {
      const pNorm = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
      const iNorm = item.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
      return pNorm === iNorm;
    });

    // Prioridad 2: Coincidencia parcial si no hay exacta
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
      console.log(`✓ [${prod.id}] ${prod.nombre} -> ${item.url}`);
    } else {
      // Si no existía el producto en la base de datos, crearlo automáticamente en la categoría "Anchetas"
      const nuevo = await prisma.producto.create({
        data: {
          nombre: item.nombre,
          categoria: "Anchetas",
          etiqueta: "Anchetas",
          precio: 85000,
          stock: 999999,
          descripcion: `Excelente regalo artesanal de la categoría Anchetas con presentación de lujo y empaque decorado.`,
          imagen: item.url,
        },
      });
      console.log(`✨ [NUEVO ${nuevo.id}] ${nuevo.nombre} creado en Anchetas -> ${item.url}`);
    }
  }

  console.log("✨ Sincronización completada con éxito.");
}

main()
  .catch((e) => {
    console.error("Error al sincronizar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
