const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const lotes = [
  {
    categoria: "Amor y Amistad",
    items: [
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
    ],
  },
  {
    categoria: "Anchetas",
    items: [
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
    ],
  },
  {
    categoria: "Arreglos con Globos",
    items: [
      { nombre: "Bouquet Balloons", url: "https://i.ibb.co/Kxkr25Mx/Bouquet-Balloons.avif" },
      { nombre: "Bouquet Deluxe", url: "https://i.ibb.co/MxdsJm3k/Bouquet-Deluxe.avif" },
      { nombre: "Bouquet Elegant", url: "https://i.ibb.co/j9gJk4hT/Bouquet-Elegant.avif" },
      { nombre: "Bouquet Golden", url: "https://i.ibb.co/tTBTxP6T/Bouquet-Golden.avif" },
      { nombre: "Bouquet Luxury", url: "https://i.ibb.co/d41VdnLn/Bouquet-Luxury.avif" },
      { nombre: "Bouquet Numbers Helio", url: "https://i.ibb.co/PzYXgYGV/Bouquet-Numbers-Helio.avif" },
      { nombre: "Bouquet Shine Luxury", url: "https://i.ibb.co/LDXjkx4p/Bouquet-Shine-Luxury.avif" },
      { nombre: "Bouquets Decoración Deluxe", url: "https://i.ibb.co/HpphCG4c/Bouquets-Decoraci-n-Deluxe.avif" },
    ],
  },
  {
    categoria: "Arreglos Florales",
    items: [
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
    ],
  },
  {
    categoria: "Cajas de regalo",
    items: [
      { nombre: "Caja Elegant", url: "https://i.ibb.co/VcGtN0gB/Caja-Elegant.avif" },
      { nombre: "Caja Especial", url: "https://i.ibb.co/xKgwTw7r/Caja-Especial.avif" },
      { nombre: "Caja Luxury Copa", url: "https://i.ibb.co/dJ6j5TSH/Caja-Luxury-Copa.avif" },
      { nombre: "Cuadro + Caja de dulces", url: "https://i.ibb.co/zL78J3B/Cuadro-Caja-de-dulces.avif" },
      { nombre: "Cuadro + Caja Luxury", url: "https://i.ibb.co/ymszC0kK/Cuadro-Caja-Luxury.avif" },
      { nombre: "Mug Man", url: "https://i.ibb.co/zVM9G7vJ/Mug-Man.avif" },
      { nombre: "Mug Women", url: "https://i.ibb.co/HLdrL5T6/Mug-Women.avif" },
      { nombre: "Secret Sweet Box", url: "https://i.ibb.co/RG9cm0VL/Secret-Sweet-Box.avif" },
      { nombre: "Termo Personalizado", url: "https://i.ibb.co/bgH1qXnP/Termo-Personalizado.avif" },
      { nombre: "Bear Box", url: "https://i.ibb.co/fYLhKTbD/Bear-Box.avif" },
      { nombre: "Box Cervecero", url: "https://i.ibb.co/d48r6csP/Box-Cervecero.avif" },
      { nombre: "Box Cheers Man", url: "https://i.ibb.co/GNtszMx/Box-Cheers-Man.avif" },
      { nombre: "Box Fabuloso", url: "https://i.ibb.co/q3T0B92C/Box-Fabuloso.avif" },
      { nombre: "Box Fantastic", url: "https://i.ibb.co/rN898fM/Box-Fantastic.avif" },
      { nombre: "Box Flork Romantic", url: "https://i.ibb.co/0Rsv0p3j/Box-Flork-Romantic-1.avif" },
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
      { nombre: "Caja Buchana's Elegant", url: "https://i.ibb.co/P0wHWFW/Caja-Buchana-s-Elegant.avif" },
      { nombre: "Caja Cervecera", url: "https://i.ibb.co/hpT07px/Caja-Cervecera.avif" },
      { nombre: "Caja corazón valiente", url: "https://i.ibb.co/gZ0RH852/Caja-coraz-n-valiente.avif" },
    ],
  },
];

async function main() {
  console.log("🛠️ Sincronizando estrictamente por CATEGORÍA Y NOMBRE EXACTO...");

  for (const lote of lotes) {
    const prodsCat = await prisma.producto.findMany({
      where: { categoria: lote.categoria },
    });

    console.log(`\n📦 Procesando categoría: ${lote.categoria} (${prodsCat.length} productos en DB)`);

    for (const item of lote.items) {
      const nombreLimpioItem = item.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");

      // 1. Coincidencia exacta de nombre dentro de su categoría
      let prod = prodsCat.find((p) => {
        const nombreLimpioProd = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, "");
        return nombreLimpioProd === nombreLimpioItem;
      });

      // 2. Si no hay exacta, coincidencia estricta sin números o guiones extra
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
        console.log(`  ✅ [${prod.id}] "${prod.nombre}" -> ${item.url}`);
      } else {
        console.log(`  ⚠️ No se encontró en ${lote.categoria}: "${item.nombre}"`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
