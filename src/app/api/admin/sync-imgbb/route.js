import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function GET() {
  try {
    const productos = await prisma.producto.findMany();
    const actualizados = [];

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
        actualizados.push({ id: prod.id, nombre: prod.nombre, url: item.url });
      }
    }

    return NextResponse.json({ success: true, actualizados });
  } catch (error) {
    console.error("Error al sincronizar imágenes ImgBB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
