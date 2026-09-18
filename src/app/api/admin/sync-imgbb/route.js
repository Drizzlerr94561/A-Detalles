import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const imagenesLote1 = [
  { nombre: "Copa Fruité", url: "https://i.ibb.co/jv9VHKKV/Copa-Fruit.avif" },
  { nombre: "Brunch L’Amour", url: "https://i.ibb.co/Q7CJDxMh/Brunch-L-Amour.avif" },
  { nombre: "Desayuno Romance", url: "https://i.ibb.co/Fq8P5TL4/Desayuno-Romance.avif" },
  { nombre: "Box Roses", url: "https://i.ibb.co/ZpKT2zrf/Box-Roses.avif" },
  { nombre: "Ramo Deluxe", url: "https://i.ibb.co/fG927nfm/Ramo-Deluxe.avif" },
  { nombre: "Rosa Encapsulada", url: "https://i.ibb.co/QFq6jxsR/Rosa-Encapsulada.avif" },
  { nombre: "Rosa Encapsulada XL", url: "https://i.ibb.co/YFkyL7MQ/Rosa-Encapsulada-XL.avif" },
  { nombre: "Cuadro Love", url: "https://i.ibb.co/Wmg3P9m/Cuadro-Love.avif" },
  { nombre: "Box Peluche", url: "https://i.ibb.co/QFwHq5Vg/Box-Peluche.avif" },
  { nombre: "Mug Amour", url: "https://i.ibb.co/Xfg9LXYx/Mug-Amour.avif" },
];

const imagenesLote2AnchetasVerificadas = [
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

const imagenesLote3GlobosVerificadas = [
  { nombre: "Bouquet Balloons", url: "https://i.ibb.co/Kxkr25Mx/Bouquet-Balloons.avif" },
  { nombre: "Bouquet Deluxe", url: "https://i.ibb.co/MxdsJm3k/Bouquet-Deluxe.avif" },
  { nombre: "Bouquet Elegant", url: "https://i.ibb.co/j9gJk4hT/Bouquet-Elegant.avif" },
  { nombre: "Bouquet Golden", url: "https://i.ibb.co/tTBTxP6T/Bouquet-Golden.avif" },
  { nombre: "Bouquet Luxury", url: "https://i.ibb.co/d41VdnLn/Bouquet-Luxury.avif" },
  { nombre: "Bouquet Numbers Helio", url: "https://i.ibb.co/PzYXgYGV/Bouquet-Numbers-Helio.avif" },
  { nombre: "Bouquet Shine Luxury", url: "https://i.ibb.co/LDXjkx4p/Bouquet-Shine-Luxury.avif" },
  { nombre: "Bouquets Decoración Deluxe", url: "https://i.ibb.co/HpphCG4c/Bouquets-Decoraci-n-Deluxe.avif" },
];

export async function GET() {
  try {
    const todosItems = [
      ...imagenesLote1,
      ...imagenesLote2AnchetasVerificadas,
      ...imagenesLote3GlobosVerificadas,
    ];
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
