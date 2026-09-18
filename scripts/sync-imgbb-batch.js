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

async function main() {
  console.log("🚀 Sincronizando imágenes de 'Amor y Amistad' desde ImgBB a MySQL...");

  for (const item of imagenesLote1) {
    const productos = await prisma.producto.findMany();
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
      console.log(`⚠️ No se encontró producto para "${item.nombre}"`);
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
