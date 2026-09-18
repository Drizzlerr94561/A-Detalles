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

const imagenesLote2AnchetasVerificadas = [
  { nombre: "Ancheta Beers", url: "https://i.ibb.co/HL7V3Rj8/Ancheta-Beers.jpg" },
  { nombre: "Ancheta Candies", url: "https://i.ibb.co/8nQtwZdM/Ancheta-Candies.jpg" },
  { nombre: "Ancheta Cheers Dulcera", url: "https://i.ibb.co/Gf6MXrK7/Ancheta-Cheers-Dulcera.jpg" },
  { nombre: "Ancheta Deluxe Gorra", url: "https://i.ibb.co/7d7Sj0cC/Ancheta-Deluxe-Gorra.jpg" },
  { nombre: "Ancheta Deluxe", url: "https://i.ibb.co/QvsVfKr4/Ancheta-Deluxe.jpg" },
  { nombre: "Ancheta Elegant", url: "https://i.ibb.co/W46XysX8/Ancheta-Elegant.jpg" },
  { nombre: "Ancheta Fabulosa", url: "https://i.ibb.co/8DjLG213/Ancheta-Fabulosa.jpg" },
  { nombre: "Ancheta Love Candies", url: "https://i.ibb.co/tT9fTSfv/Ancheta-Love-Candies.jpg" },
  { nombre: "Ancheta Luxur", url: "https://i.ibb.co/7xtrNByM/Ancheta-Luxur.jpg" },
  { nombre: "Ancheta Luxury", url: "https://i.ibb.co/4ZL81sbR/Ancheta-Luxury.jpg" },
  { nombre: "Ancheta Magic", url: "https://i.ibb.co/TxfBLs5F/Ancheta-Magic.jpg" },
  { nombre: "Ancheta Mega Premium", url: "https://i.ibb.co/jZRFKq4Z/Ancheta-Mega-Premium.jpg" },
  { nombre: "Ancheta Mug Beers", url: "https://i.ibb.co/Fb1KvkZw/Ancheta-Mug-Beers.jpg" },
  { nombre: "Ancheta Premium", url: "https://i.ibb.co/C3FNqyLz/Ancheta-Premium.jpg" },
  { nombre: "Ancheta Romantic", url: "https://i.ibb.co/WN74mDs8/Ancheta-Romantic.jpg" },
  { nombre: "Arreglo Baileys 750ML", url: "https://i.ibb.co/DPhJjnm0/Arreglo-Baileys-750-ML.jpg" },
  { nombre: "Arreglo Cervezas", url: "https://i.ibb.co/XfjZ44KF/Arreglo-Cervezas.jpg" },
  { nombre: "Arreglo Copa Luxury", url: "https://i.ibb.co/tPQnWw35/Arreglo-Copa-Luxury.jpg" },
  { nombre: "Arreglo Encantador", url: "https://i.ibb.co/fzgZrwgB/Arreglo-Encantador.jpg" },
  { nombre: "Arreglo Girl Elegant", url: "https://i.ibb.co/g83ntNv/Arreglo-Girl-Elegant.jpg" },
  { nombre: "Baúl Cervecero", url: "https://i.ibb.co/bjQv7snk/Ba-l-Cervecero.jpg" },
  { nombre: "Bloom Gift", url: "https://i.ibb.co/LdDN5vbD/Bloom-Gift.jpg" },
  { nombre: "Ferreros Ballons", url: "https://i.ibb.co/Pzj4VDkb/Ferreros-Ballons.jpg" },
  { nombre: "Silver Gift", url: "https://i.ibb.co/tpcFcmvW/Silver-Gift.jpg" },
];

export async function GET() {
  try {
    const todosItems = [...imagenesLote1, ...imagenesLote2AnchetasVerificadas];
    const productos = await prisma.producto.findMany();
    const actualizados = [];

    for (const item of todosItems) {
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
      } else {
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
        actualizados.push({ id: nuevo.id, nombre: nuevo.nombre, url: item.url, nuevo: true });
      }
    }

    return NextResponse.json({ success: true, total: actualizados.length, actualizados });
  } catch (error) {
    console.error("Error al sincronizar imágenes ImgBB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
