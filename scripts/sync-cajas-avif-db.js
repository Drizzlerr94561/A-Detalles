const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenesCajasAvif = [
  { nombre: "Caja Elegant", url: "https://i.ibb.co/VcGtN0gB/Caja-Elegant.avif" },
  { nombre: "Caja Especial", url: "https://i.ibb.co/xKgwTw7r/Caja-Especial.avif" },
  { nombre: "Caja Luxury Copa", url: "https://i.ibb.co/dJ6j5TSH/Caja-Luxury-Copa.avif" },
  { nombre: "Cuadro Caja de dulces", url: "https://i.ibb.co/zL78J3B/Cuadro-Caja-de-dulces.avif" },
  { nombre: "Cuadro Caja Luxury", url: "https://i.ibb.co/ymszC0kK/Cuadro-Caja-Luxury.avif" },
  { nombre: "Mug Man", url: "https://i.ibb.co/zVM9G7vJ/Mug-Man.avif" },
  { nombre: "Mug Women", url: "https://i.ibb.co/HLdrL5T6/Mug-Women.avif" },
  { nombre: "Secret Sweet Box", url: "https://i.ibb.co/RG9cm0VL/Secret-Sweet-Box.avif" },
  { nombre: "Termo Personalizado", url: "https://i.ibb.co/bgH1qXnP/Termo-Personalizado.avif" },
  { nombre: "Bear Box", url: "https://i.ibb.co/fYLhKTbD/Bear-Box.avif" },
  { nombre: "Box Cervecero", url: "https://i.ibb.co/d48r6csP/Box-Cervecero.avif" },
  { nombre: "Box Cheers Man", url: "https://i.ibb.co/GNtszMx/Box-Cheers-Man.avif" },
  { nombre: "Box Fabuloso", url: "https://i.ibb.co/q3T0B92C/Box-Fabuloso.avif" },
  { nombre: "Box Fantastic", url: "https://i.ibb.co/rN898fM/Box-Fantastic.avif" },
  { nombre: "Box Flork Romantic (1)", url: "https://i.ibb.co/0Rsv0p3j/Box-Flork-Romantic-1.avif" },
  { nombre: "Box Him Elegant", url: "https://i.ibb.co/5WM0GHKS/Box-Him-Elegant.avif" },
  { nombre: "Box Lampara Cristal", url: "https://i.ibb.co/1f0FJ918/Box-Lampara-Cristal.avif" },
  { nombre: "Box Lámpara Tulipanes", url: "https://i.ibb.co/V08V7BTY/Box-L-mpara-Tulipanes.avif" },
  { nombre: "Box Luxury Madera", url: "https://i.ibb.co/1hsTVZm/Box-Luxury-Madera.avif" },
  { nombre: "Box Peluche Tierno", url: "https://i.ibb.co/yFV1jLjH/Box-Peluche-Tierno.avif" },
  { nombre: "Box Peluche", url: "https://i.ibb.co/9kfqZMQz/Box-Peluche.avif" },
  { nombre: "Box Perfect", url: "https://i.ibb.co/KcZ577vD/Box-Perfect.avif" },
  { nombre: "Box Shine", url: "https://i.ibb.co/YTFVSkh0/Box-Shine.avif" },
  { nombre: "Box Skin Care", url: "https://i.ibb.co/vxHffMwt/Box-Skin-Care.avif" },
  { nombre: "Box Snack", url: "https://i.ibb.co/pvbjRLhQ/Box-Snack.avif" },
  { nombre: "Box Termo", url: "https://i.ibb.co/yMW1210/Box-Termo.avif" },
  { nombre: "Box Valentine", url: "https://i.ibb.co/6R4t12ny/Box-Valentine.avif" },
  { nombre: "Box Vinero", url: "https://i.ibb.co/6cKr0bqR/Box-Vinero.avif" },
  { nombre: "Box Vino", url: "https://i.ibb.co/yBVbGTkw/Box-Vino.avif" },
  { nombre: "Buchanans Box", url: "https://i.ibb.co/3mvp8Dkh/Buchanans-Box.avif" },
  { nombre: "Caja Buchana s Elegant", url: "https://i.ibb.co/P0wHWFW/Caja-Buchana-s-Elegant.avif" },
  { nombre: "Caja Cervecera", url: "https://i.ibb.co/hpT07px/Caja-Cervecera.avif" },
  { nombre: "Caja corazón valiente", url: "https://i.ibb.co/gZ0RH852/Caja-coraz-n-valiente.avif" },
];

async function main() {
  console.log("🔄 Actualizando las 33 imágenes de 'Cajas de regalo' en MySQL...");
  const productos = await prisma.producto.findMany();

  for (const item of imagenesCajasAvif) {
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
          categoria: "Cajas de regalo",
          etiqueta: "Cajas de regalo",
          precio: 110000,
          stock: 999999,
          descripcion: `Caja regalo artesanal con delicada presentación y sorpresas especiales.`,
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
