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

const imagenesLote4FloralesVerificadas = [
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

export async function GET() {
  try {
    const todosItems = [
      ...imagenesLote1,
      ...imagenesLote2AnchetasVerificadas,
      ...imagenesLote3GlobosVerificadas,
      ...imagenesLote4FloralesVerificadas,
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
