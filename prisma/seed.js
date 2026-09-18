const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categoriasOficiales = [
  'Amor y Amistad',
  'Desayunos Sorpresa',
  'Peluches Gigantes',
  'Arreglos Florales',
  'Cuadros Personalizados',
  'Cajas de regalo',
  'Catálogo Flores Amarillas',
  'Anchetas',
  'Arreglos con Globos',
  'Llaveros Peluche',
  'Manillas Pareja',
  'Combos Luxury'
];

async function main() {
  console.log("🌱 Limpiando y preparando datos iniciales en MySQL...");
  await prisma.producto.deleteMany({});
  await prisma.adicional.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.direccion.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.usuario.deleteMany({});

  console.log("👑 Creando cuenta de Administrador de Producción...");
  const hashedPassword = await bcrypt.hash("admin", 10);
  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador Adetallesbq",
      email: "admin@adetallesbq.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin creado: ${admin.email}`);

  console.log("🏷️ Registrando las Categorías Oficiales...");
  for (const catName of categoriasOficiales) {
    await prisma.categoria.create({
      data: { nombre: catName },
    });
  }
  console.log(`✓ ${categoriasOficiales.length} categorías creadas.`);

  console.log("📦 Registrando los 10 Productos Oficiales (Amor y Amistad)...");
  const productosAmorAmistad = [
    {
      nombre: "Copa Fruité",
      precio: 45000,
      stock: 999999,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Nuestra referencia Fruité es un parfait con una combinación de yogurt cremoso, mermelada, granola crocante y una selección de frutas: fresa, kiwi y mango. Servida en una copa de vidrio y presentada en una caja, acompañada de cuchara y una tarjeta alusiva de amor y amistad. Perfecta para sorprender a un amigo dulce, celebrar una amistad especial o tener un detalle con tu pareja.",
      imagen: "https://i.ibb.co/sdNRB3Sn/Copa-Fruit.jpg",
    },
    {
      nombre: "Brunch L’Amour",
      precio: 90000,
      stock: 999999,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Una experiencia pensada para convertir un brunch en un momento inolvidable. Una exquisita selección que combina un sándwich de jamón pietran y queso, tostada artesanal con jamón serrano, mini hojaldre, jamón de cerdo, palitroques y fresas frescas, acompañado de jugo de naranja y milo. Todo presentado en una caja decorada con cintas y una tarjeta con mensaje.",
      imagen: "https://i.ibb.co/8nJBgPpk/Brunch-L-Amour.jpg",
    },
    {
      nombre: "Desayuno Romance",
      precio: 110000,
      stock: 999999,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Nuestro desayuno romance es una opción muy completa ya que contiene; dos mini sandwich con jamón, queso y salami, mix de frutas de kiwi y fresas, rollitos con jamón pietran y queso finelle, jugo de naranja en botella decorada y un delicioso postre de napoleón con jet y leche klim.",
      imagen: "https://i.ibb.co/JjqwRdYX/Desayuno-Romance.jpg",
    },
    {
      nombre: "Box Roses",
      precio: 160000,
      stock: 12,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Un elegante arreglo de rosas rojas y blancas en una caja gamusada en forma de corazón. Incluye tarjeta personalizada. Esta combinación transmite sentimientos y cariño, es perfecta para sorprender a esa persona especial.",
      imagen: "https://i.ibb.co/v41FgBsh/Box-Roses.jpg",
    },
    {
      nombre: "Ramo Deluxe",
      precio: 185000,
      stock: 10,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Un bouquet que habla por sí solo. Elaborado con rosas rojas seleccionadas y envuelto en elegante coreano texturizado en tonos blanco, con un lazo rojo que realza su presentación.",
      imagen: "https://i.ibb.co/QFVxXVw3/Ramo-Deluxe.jpg",
    },
    {
      nombre: "Rosa Encapsulada",
      precio: 85000,
      stock: 999999,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Esta rosa encapsulada contiene dos rosas rojas, envuelta en malín blanco con lazo, incluye una tarjeta dedicatoria y una bolsa donde va empacada. Medidas: 23 cm alto | Diámetro: 22 cm.",
      imagen: "https://i.ibb.co/Y7kjHmXx/Rosa-Encapsulada.jpg",
    },
    {
      nombre: "Rosa Encapsulada XL",
      precio: 100000,
      stock: 999999,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Esta rosa encapsulada tiene forma de ramillete, envuelta en malín blanco con lazo, incluye una tarjeta dedicatoria y una bolsa donde va empacada. Medidas: 27 cm alto | Diámetro: 30 cm.",
      imagen: "https://i.ibb.co/yFct79GM/Rosa-Encapsulada-XL.jpg",
    },
    {
      nombre: "Cuadro Love",
      precio: 50000,
      stock: 999999,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Es el detalle perfecto para obsequiar. Incluye vidrio con marco negro o blanco según disponibilidad, envuelto con papel fino, lazo y tarjeta de la tienda. Solicita nuestro catálogo de diseños.",
      imagen: "https://i.ibb.co/Fb3zBMhb/Cuadro-Love.jpg",
    },
    {
      nombre: "Box Peluche",
      precio: 95000,
      stock: 12,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Nuestra Box Peluche incluye galletas Moments, un contenedor con mini brownies, fresas y masmelos, papas monterojo, una foto personalizada y un peluche a tu elección.",
      imagen: "https://i.ibb.co/rfwVg0B4/Box-Peluche.jpg",
    },
    {
      nombre: "Mug Amour",
      precio: 30000,
      stock: 25,
      categoria: "Amor y Amistad",
      etiqueta: "Edición Especial",
      descripcion: "Resiste bebidas frías y calientes, puedes colocarle el nombre de tu preferencia. Este mug es el detalle ideal si deseas dar una pista a tu amigo secreto o sorprender a alguien.",
      imagen: "https://i.ibb.co/N2FqPRLh/Mug-Amour.jpg",
    },
  ];

  for (const prod of productosAmorAmistad) {
    await prisma.producto.create({ data: prod });
  }
  console.log(`✓ 10 productos de 'Amor y Amistad' cargados exitosamente.`);

  console.log("🥞 Registrando los 34 Productos Oficiales de 'Desayunos Sorpresa' (Sin imagen por ahora)...");
  const productosDesayunos = [
    {
      nombre: "Ancheta Dad Deluxe",
      precio: 190000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Croissant de la casa. Mini pincho de chorizo y butifarra preparado en air fryer. Parfait de yogurt con granola, fresas y toque de kiwi. Jugo de naranja natural decorado. Contenedor con deditos y empanadas horneadas. Canapés de jamón y queso. Bandeja de madera decorativa. 5 globos con helio. Decoración temática. Cubiertos de lujo. Pitillo. Tarjeta con mensaje personalizado.",
      imagen: null,
    },
    {
      nombre: "Brunch Peluche",
      precio: 100000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Contenedor con sandwich de la casa. Jugo de naranja. Avena. Porción de fruta. Peluche mediano a elección. Tarjeta dedicatoria. Caja corazón decorada con lazo.",
      imagen: null,
    },
    {
      nombre: "Desayuno Floral",
      precio: 155000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Parfait de frutas. Jugo de naranja. Avena. Sandwich de la casa. Tostadas. Postre de mini brownies con arequipe. Base decorada con arreglo de flores. Base de dos pisos alta con decoración. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Tote Bag",
      precio: 120000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Croissant de Jamón y queso. Jugo de naranja. Parfait con granola fruta y mermelada. Ramito de flores. Bolso en yute plastificado decorada con pañoleta de seda y detalle de rosa. Tarjeta personalizada.",
      imagen: null,
    },
    {
      nombre: "Brunch Love",
      precio: 80000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Papas Monterojo. Croissant con jamón y queso. Parfait con yogurt, granola y fruta. Te hatsu. Jugo de naranja. Cuchara y pitillo decorados. Caja con lazo. Decoración y tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Canasta Morning",
      precio: 90000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sandwich de la casa. Jugo de naranja natural. Porción con mix de frutas. Arreglo de flores en tonos primaverales. Canasta decorada. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Amour Deluxe",
      precio: 175000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Milo. Parfait con granola yogurt y fruta. Croissant de la casa. Galletas de hojaldre. Ferreros. Jarrón con 12 rosas. Decoración en base de madera. Globo y tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Ballons",
      precio: 195000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Milo frío. Jugo de naranja. Torta decorada. Tostadas. Fruta de temporada. Sándwich de la casa. Decoración. Base con globos. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Box Deluxe",
      precio: 110000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Arreglo de flores. Yogurt griego de mora. Porción de fruta. Galletas. Sándwich de la casa. Jugo de naranja.",
      imagen: null,
    },
    {
      nombre: "Desayuno Brunch",
      precio: 100000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Un jugo de naranja. Una avena. Sándwich de la casa. Porción de fruta picada. Porción con plataneros. Base madera. Decoración y tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Costeño",
      precio: 135000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "4 empanadas. Croissant con jamón y queso. 3 arepitas de huevo. Huevos revueltos. Jugo de naranja. Milo. Galleta tosh. Decoración en base de madera con globos. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Deluxe",
      precio: 185000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sandwich de la casa. Parfait con yogurt griego granola y fresa. Un jugo de naranja. Papas Monterrojo. Yogurt de fresa. Postre de tres leches. Contenedor con galletas. Jarrón con flores. Taza personalizada decorada. Globos con helio. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Deluxe Cake",
      precio: 150000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Torta decorada. Milo y jugo de naranja. Dos porciones con fruta. Una manzana. Una galleta tosh. Un snicker. Un sándwich. Una piazza arequipe. Decoración con globos con helio. Base de madera. Tarjeta.",
      imagen: null,
    },
    {
      nombre: "Desayuno Encanto",
      precio: 105000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sándwich de la casa. Jugo de naranja. Porción con fruta. Porción con platanitos o tostadas. Galleta tosh. Decoración con globos y tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Flowers Love",
      precio: 90000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Pastel de pollo, jamón y queso. Porción de fruta. Maní especial. Jugo de naranja. Caja decorada. Topper y decoración. Arreglo de flores. Tarjeta alusiva a la ocasión. Envío adicional.",
      imagen: null,
    },
    {
      nombre: "Desayuno Girasoles",
      precio: 180000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sándwich de la casa. Porción de fruta. Porción con brownie. Jugo de naranja. Milo. Contenedor con jamón y queso. Arreglo de hortensias y girasoles. Bandeja de madera grande decorada en el color que desees. Globos con helio. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Glamour",
      precio: 170000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Vaso de vidrio con tapa de bambú y pitillo, con frase especial para la ocasión. Dúo de mini sándwiches con pan artesanal: Sándwich de la casa, Jamón de pollo, lechuga y tomate. Waffles. Fruta. Tarjeta con un mensaje. 3 globos con helio.",
      imagen: null,
    },
    {
      nombre: "Desayuno Hexagonal",
      precio: 90000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Yogurt de fresa. Té de mora. Sándwich de la casa. Porción con fruta. Brownie con topping de arequipe. Decoración en base de madera. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Ilusión",
      precio: 115000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Croissant de la casa. Mini pincho de chorizo y butifarra preparado en air fryer. Parfait de yogurt con granola, fresas y toque de kiwi. Jugo de naranja natural decorado. Galleta Tosh. Contenedor con deditos horneados. Canapés de jamón y queso. Chocolates Ferrero Rocher. Box tipo libro decorativa. Decoración temática. Cubiertos de lujo. Pitillo.",
      imagen: null,
    },
    {
      nombre: "Desayuno Love",
      precio: 115000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Yogurt con granola. Croissant con jamón y queso. Platanitos en contenedor decorado. Vasito de frutas con letrerito. Yogurt de fresa. Decoración en bandeja con globos. Corazoncitos. Tarjeta dedicatoria con mensaje. Tarjeta con mensaje personalizado.",
      imagen: null,
    },
    {
      nombre: "Desayuno Luxury Heart",
      precio: 190000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Yogurt. 2 croissant Con jamón y queso. Parfait con yogurt granola y fruta. Porción con maní. Porción con galletas. Jarrón con flores. Decoración con globos. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Magie",
      precio: 200000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Una torta de chocolate o arequipe. Un jugo de naranja en frasco decorado. Un milo en frasco decorado. Dos contenedores con fruta. Una manzana verde. Un brownie. Un snicker. Globo burbuja personalizada. 6 globos con helio. Base de madera. Mantel tipo picnic. Una carta impresa personalizada.",
      imagen: null,
    },
    {
      nombre: "Desayuno Merienda",
      precio: 75000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sándwich de la casa. Porción con fruta. Jugo de naranja. Mani especial. Yogurt de fresa. Porción con galletas. Tarjeta con mensaje. Caja decorada.",
      imagen: null,
    },
    {
      nombre: "Desayuno Mom",
      precio: 85000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Porción de fruta. Sándwich de la casa. Yogurt. Contenedor con galletas. Caja decorada marcada. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Morning",
      precio: 105000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sándwich de la casa. Jugo de naranja. Porción con fruta. Porción con platanitos o tostadas. Galleta tosh. Decoración con globos y tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Morning Love",
      precio: 125000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Croissant de la casa. Hatsu. Parfait con yogurt granola y fresa. Galletas empacadas. Decoración con globo. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Papá",
      precio: 90000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Croissant de la casa. Mini pincho de chorizo y butifarra preparado en air fryer. Parfait de yogurt con granola, fresas y toque de kiwi. Jugo de naranja natural decorado. Galletas Tosh. Box tipo libro decorativa. Decoración temática. Cubiertos de lujo. Tarjeta con mensaje personalizada.",
      imagen: null,
    },
    {
      nombre: "Desayuno Personaje",
      precio: 160000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Sándwich de la casa. Porción con fruta. Pringles. Brownie. Gomitas. Pingüino pudín. Huevo kinder. Nutella mini. Milo. Jugo de naranja. Porción con platanitos. Peluche pequeño. Decoración en la temática que desees. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Premium",
      precio: 125000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Te hatsu. Croissant con jamón y queso. Parfait con granola y fruta. Porción con galletas. Maní. Decoración. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Premium Man",
      precio: 140000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Te Hatsu. Pringles. Sándwich de la casa. Galletas Noel. Rosquitas. Maní. Parfait. Decoración. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Romance para 2",
      precio: 300000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "JP Chenet 200ml. 2 parfait de frutos rojos en copa de champaña. Tabla de quesos (rosa de chorizo español, quesillo suave y grissini). Pancakes con nutella, fresa, kiwi y arandanos. 2 sandwich. 2 Zumos de naranja. Mini cake. Tarjeta.",
      imagen: null,
    },
    {
      nombre: "Desayuno Shine",
      precio: 170000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Avena y jugo de naranja. Parfait de frutas. Sandwich de la casa. Postre de tres leches. Contenedor con tostadas. Arreglo de flores. Arreglo con globos. Backing con nombre personalizado. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Desayuno Temática Pantuflas",
      precio: 200000,
      stock: 999999,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Dulces surtidos entre chocolates, galletas y gomitas. Pantuflas a elección. Decoración con la temática escogida ya sea para niño o niña. Base de madera decorada. Tarjeta con mensaje.",
      imagen: null,
    },
    {
      nombre: "Mediatarde Romantic",
      precio: 80000,
      stock: 15,
      categoria: "Desayunos Sorpresa",
      etiqueta: "Desayunos Sorpresa",
      descripcion: "Jugo de naranja. Un bonyourt. Sándwich de la casa. Avena alpina. Galleta oreo grande. Porción con fruta. Base de madera decorada con mini globitos.",
      imagen: null,
    },
  ];

  for (const prod of productosDesayunos) {
    await prisma.producto.create({ data: prod });
  }
  console.log(`✓ 34 productos de 'Desayunos Sorpresa' cargados exitosamente.`);

  console.log("🧸 Registrando los 73 Productos Oficiales de 'Peluches Gigantes'...");
  const productosPeluchesList = [
    { nombre: "Angel Stitch 40cm", precio: 90000 },
    { nombre: "Angel Stitch rosita 40cm", precio: 90000 },
    { nombre: "Hello Kitty + Cobija 45cm", precio: 160000 },
    { nombre: "Hello Kitty 25cm", precio: 65000 },
    { nombre: "Hello Kitty 35cm", precio: 100000 },
    { nombre: "Hello Kitty 70cm", precio: 245000 },
    { nombre: "Hello Kitty 80cm", precio: 370000 },
    { nombre: "Hello Kitty y Kuromi 35cm", precio: 80000 },
    { nombre: "Oso 40cm", precio: 100000 },
    { nombre: "Oso blanco 2 Metros", precio: 750000 },
    { nombre: "Oso bufanda 30cm", precio: 60000 },
    { nombre: "Oso Bufanda 45cm", precio: 100000 },
    { nombre: "Oso Bufanda marrón 45cm", precio: 100000 },
    { nombre: "Oso Bufanda 55cm (120k)", precio: 120000 },
    { nombre: "Oso Bufandass 55cm", precio: 135000 },
    { nombre: "Oso Bufanda 55cm (130k)", precio: 130000 },
    { nombre: "Oso Bufanda 65cm", precio: 160000 },
    { nombre: "Oso Bufanda 80cm", precio: 350000 },
    { nombre: "Oso Bufanda rojita 80cm", precio: 360000 },
    { nombre: "Oso Camiseta 55cm", precio: 150000 },
    { nombre: "Oso Camiseta 60cm", precio: 290000 },
    { nombre: "Oso Camiseta gris y marrón 60cm", precio: 240000 },
    { nombre: "Oso Camiseta rayitas 60cm", precio: 260000 },
    { nombre: "Oso Camiseta 80cm", precio: 360000 },
    { nombre: "Oso Collar 60cm", precio: 235000 },
    { nombre: "Oso Corazón 1,20m", precio: 550000 },
    { nombre: "Oso Corazón 40cm", precio: 85000 },
    { nombre: "Oso Corazón Rojito 40cm", precio: 95000 },
    { nombre: "Oso Corazón 50cm", precio: 150000 },
    { nombre: "Oso Corbatín 1,20m", precio: 550000 },
    { nombre: "Oso Corbatín 65cm", precio: 150000 },
    { nombre: "Oso Corbatín 75cm", precio: 175000 },
    { nombre: "Oso Corbatín 85cm", precio: 370000 },
    { nombre: "Oso Corbatín Gigante 1,90m", precio: 730000 },
    { nombre: "Oso corbatín patas largas 60cm", precio: 180000 },
    { nombre: "Oso Huella 100cm", precio: 400000 },
    { nombre: "Oso Huella 60cm", precio: 240000 },
    { nombre: "Oso Huella 90cm", precio: 400000 },
    { nombre: "Oso Lazo 1,20m", precio: 520000 },
    { nombre: "Oso Lazo 1,30m", precio: 550000 },
    { nombre: "Oso Lazo 50cm", precio: 150000 },
    { nombre: "Oso Lazo 60cm", precio: 170000 },
    { nombre: "Oso Lazo blanquito 60cm", precio: 240000 },
    { nombre: "Oso Lazo 65cm", precio: 200000 },
    { nombre: "Oso Lazo 80cm", precio: 350000 },
    { nombre: "Oso Lazo 90cm", precio: 360000 },
    { nombre: "Oso lazo love 45cm", precio: 105000 },
    { nombre: "Oso lazo Patas Largas 1,20m", precio: 360000 },
    { nombre: "Oso lazo y Estrella 50cm", precio: 140000 },
    { nombre: "Oso marrón 2 Metros", precio: 750000 },
    { nombre: "Oso Panda 50cm", precio: 110000 },
    { nombre: "Oso Panda 90cm", precio: 370000 },
    { nombre: "Oso panda fútbol 45cm", precio: 85000 },
    { nombre: "Oso Panda vestido 55cm", precio: 130000 },
    { nombre: "Oso patas largas 55cm", precio: 105000 },
    { nombre: "Oso patas largas 60cm", precio: 180000 },
    { nombre: "Oso Vestido 45cm", precio: 100000 },
    { nombre: "Oso vestido 50cm (100k)", precio: 100000 },
    { nombre: "Oso Vestido 50cm (170k)", precio: 170000 },
    { nombre: "Perro Camiseta 50cm", precio: 200000 },
    { nombre: "Perro Camiseta 60cm", precio: 260000 },
    { nombre: "Perro Camiseta 75cm", precio: 240000 },
    { nombre: "Perro Camiseta Acostado 55cm", precio: 150000 },
    { nombre: "Perro collar 60cm", precio: 200000 },
    { nombre: "Perro collar hueso 50cm", precio: 220000 },
    { nombre: "Pingüino 50cm", precio: 85000 },
    { nombre: "Pingüino acostado 40cm", precio: 65000 },
    { nombre: "Spiderman 30cm", precio: 50000 },
    { nombre: "Spiderman 50cm", precio: 80000 },
    { nombre: "Stitch 70cm", precio: 240000 },
    { nombre: "Stitch y Angel 35cm", precio: 85000 },
    { nombre: "Stitch y Angel 40cm", precio: 120000 },
    { nombre: "Stitch y Angel 50cm", precio: 130000 },
  ];

  for (const pel of productosPeluchesList) {
    await prisma.producto.create({
      data: {
        nombre: pel.nombre,
        precio: pel.precio,
        stock: 999999,
        categoria: "Peluches Gigantes",
        etiqueta: "Peluches Gigantes",
        descripcion: "Peluche de textura ultrasuave, materiales hipoalergénicos de alta calidad e ideal para regalar y sorprender en cualquier ocasión especial.",
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosPeluchesList.length} productos de 'Peluches Gigantes' cargados exitosamente.`);

  console.log("🖼️ Registrando los 37 Productos de 'Cuadros Personalizados'...");
  const productosCuadrosList = [
    { nombre: "Álbum de fotos y frases", precio: 60000, descripcion: "Cajita de regalo decorada con un contenido de 32 tarjetas divididas en: 15 fotos, 15 frases personalizadas, portada y tarjeta con mensaje. Si deseas una cantidad distinta, cotizar por WhatsApp." },
    { nombre: "Álbum de Fotos", precio: 45000, descripcion: "Álbum de fotos personalizadas. Incluye empaque de cajita con lazo y tarjeta dedicatoria. Precios según fotos: 15 fotos ($45.000), 20 fotos ($53.000), 30 fotos ($80.000)." },
    { nombre: "Caja metalizada", precio: 15000, descripcion: "Caja metalizada con lazo, papelitos y tarjeta personalizada." },
    { nombre: "Cajita para llaveros", precio: 5000, descripcion: "Cajita con lazo y decoración para empacar los llaveros." },
    { nombre: "Empaque fino con lazo", precio: 5000, descripcion: "Empaque fino con lazo sin costo adicional al armar tu regalo." },
    { nombre: "Cuadro 1 foto y frase", precio: 50000, descripcion: "1 foto (opción de 1 a 12 fotos elegibles), una frase o fecha especial." },
    { nombre: "Cuadro 1 foto", precio: 50000, descripcion: "Cuadro personalizado con 1 foto principal." },
    { nombre: "Cuadro amor", precio: 50000, descripcion: "10 fotos, una fecha y una frase corta." },
    { nombre: "Cuadro amoroso", precio: 50000, descripcion: "4 fotos, con una de fondo, un título, un párrafo y una fecha." },
    { nombre: "Cuadro calendario", precio: 50000, descripcion: "Cuadro estilo calendario con fecha especial resaltada." },
    { nombre: "Cuadro canción", precio: 50000, descripcion: "1 foto, una estrofa de una canción y código escaneable de Spotify." },
    { nombre: "Cuadro collage 9 fotos", precio: 50000, descripcion: "9 fotos, un título, frase o fecha especial." },
    { nombre: "Cuadro Collage 12 fotos", precio: 50000, descripcion: "12 fotos, dos nombres y un texto corto." },
    { nombre: "Cuadro collage corazón", precio: 50000, descripcion: "14 fotos en forma de corazón, un título y una frase corta." },
    { nombre: "Cuadro dibujo", precio: 50000, descripcion: "1 dibujo personalizado y una frase especial." },
    { nombre: "Cuadro Especial (7 Fotos)", precio: 50000, descripcion: "7 fotos y una frase corta especial." },
    { nombre: "Cuadro especial Una Foto", precio: 50000, descripcion: "Una foto, una fecha, una frase corta y una canción." },
    { nombre: "Cuadro Familia", precio: 50000, descripcion: "3 fotos, un título y una frase dedicada a la familia." },
    { nombre: "Cuadro fecha especial", precio: 50000, descripcion: "Cuadro conmemorativo con fecha especial." },
    { nombre: "Cuadro fecha", precio: 50000, descripcion: "4 fotos, una fecha especial y dos nombres." },
    { nombre: "Cuadro foto y texto", precio: 50000, descripcion: "1 foto y 1 párrafo de dedicatoria." },
    { nombre: "Cuadro Infinity", precio: 50000, descripcion: "30 fotos, un título y una frase romántica." },
    { nombre: "Cuadro inspired", precio: 50000, descripcion: "12 fotos, un título y un texto." },
    { nombre: "Cuadro Love", precio: 50000, descripcion: "8 fotos y frase corta opcional." },
    { nombre: "Cuadro lover", precio: 50000, descripcion: "5 fotos y una frase especial." },
    { nombre: "Cuadro papá", precio: 50000, descripcion: "8 fotos familiares dedicadas a papá." },
    { nombre: "Cuadro recuerdo", precio: 50000, descripcion: "8 fotos, un título y una frase corta del recuerdo." },
    { nombre: "Cuadro Spotify fondo blanco", precio: 50000, descripcion: "1 foto, 1 canción y código de Spotify sobre fondo blanco." },
    { nombre: "Cuadro Spotify fondo negro", precio: 50000, descripcion: "1 foto, 1 canción y código de Spotify (opción elegible de fondo negro o blanco)." },
    { nombre: "Cuadro texto y fotos", precio: 50000, descripcion: "4 fotos, 4 párrafos y dos títulos." },
    { nombre: "Cuadro único", precio: 50000, descripcion: "Un título, 1 foto y un párrafo de dedicatoria." },
    { nombre: "Globo burbuja personalizado", precio: 18000, descripcion: "Color y frase a elección del cliente." },
    { nombre: "Globos con helio c/u", precio: 8000, descripcion: "Color a elección del cliente." },
    { nombre: "Imanes personalizados", precio: 10000, descripcion: "Una forma diferente de guardar tus fotos favoritas en imán." },
    { nombre: "Llavero con foto personalizada", precio: 9000, descripcion: "Llavero acrílico o metálico con foto personalizada." },
    { nombre: "Par de llaveros con Spotify personalizado", precio: 18000, descripcion: "Par de llaveros personalizados con canción de Spotify." },
    { nombre: "Trío de llaveros con diseño personalizado", precio: 26000, descripcion: "Trío de llaveros con diseño personalizado." },
  ];

  for (const cua of productosCuadrosList) {
    await prisma.producto.create({
      data: {
        nombre: cua.nombre,
        precio: cua.precio,
        stock: 999999,
        categoria: "Cuadros Personalizados",
        etiqueta: "Cuadros Personalizados",
        descripcion: cua.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosCuadrosList.length} productos de 'Cuadros Personalizados' cargados exitosamente.`);

  console.log("🌹 Registrando los 50 Productos de 'Arreglos Florales'...");
  const productosFloralesList = [
    { nombre: "Arreglo Flowers Luxury", precio: 400000, descripcion: "" },
    { nombre: "Arreglo Luxury Roses", precio: 500000, descripcion: "Bouquet de rosas y Ferreros. Globos con helio. Globo burbuja. Tarjeta con mensaje" },
    { nombre: "Aurora Rose", precio: 160000, descripcion: "25 a 30 rosas entre rosadas y blancas. Relleno." },
    { nombre: "Bear Flowers", precio: 190000, descripcion: "Cilindro con rosas y ferreros. Peluche de elección del cliente. Decoración y tarjeta con mensaje" },
    { nombre: "Bouquet Flowers Blue", precio: 195000, descripcion: "Cilindro con arreglo de 25 rosas. Aster blanco. Globo burbuja personalizado marcado. Tarjeta con mensaje" },
    { nombre: "Bouquet Flowers Pink", precio: 185000, descripcion: "Cilindro con arreglo de 24 rosas. Aster blanco. Globo burbuja personalizado marcado. Tarjeta con mensaje" },
    { nombre: "Bouquet Oso Lotso", precio: 350000, descripcion: "Arreglo floral con 40 rosas y relleno. Caja decorada. Peluche a elección según disponibilidad. Tarjeta con mensaje" },
    { nombre: "Bouquet Oso Lotso Luxury", precio: 350000, descripcion: "Arreglo floral oro rosa con 40 rosas y relleno. Caja decorada. Peluche a elección según disponibilidad. Tarjeta con mensaje" },
    { nombre: "Box Flork Romantic", precio: 115000, descripcion: "Arreglo de rosas. Unas galletas mini oreo. Una hershey. Un vaso decorado con frase. Un mym. Una piazza. Letreros de flork personalizados con frases. Caja metalizada decorada con lazo. Tarjeta dedicatoria con mensaje" },
    { nombre: "Box Flowers Rosé", precio: 280000, descripcion: "Arreglo de 25 de rosas con 10 fresas con chocolate. Botella de vino. Decoración y Tarjeta con mensajes" },
    { nombre: "Box Girasoles", precio: 100000, descripcion: "Caja con 3 girasoles, dulces surtidos entre chocolates, galletas y gomitas. Caja decorada marcada. Tarjeta con mensaje" },
    { nombre: "Box Love Elegant", precio: 200000, descripcion: "Arreglo de rosas en caja, con Ferreros Rocher y tapa personalizada con la frase que desees. Tarjeta con mensaje" },
    { nombre: "Box Roses", precio: 170000, descripcion: "Un elegante arreglo de rosas rojas y blancas en una caja gamusada en forma de corazón. Incluye tarjeta personalizada. Esta combinación transmite sentimientos y cariño, es perfecta para sorprender a esa persona especial, celebrar el amor, la amistad o simplemente regalar un detalle inolvidable." },
    { nombre: "Buchon 12 Roses", precio: 100000, descripcion: "Ramo de rosas naturales y gipsofilias en papel decorativo, incluye tarjeta con mensaje" },
    { nombre: "Canasta Roses", precio: 160000, descripcion: "Hermosa canasta con 18 rosas, relleno como gipsofilias, aster y eucalipto, puedes agregarle una tarjeta con mensaje sin costo adicional." },
    { nombre: "Cilindro Buchón Luxury", precio: 470000, descripcion: "Cilindro con 110 rosas aproximadamente. 2 globos de corazón en helio. Decoración y Tarjeta con mensaje personalizado" },
    { nombre: "Corazón Deluxe", precio: 760000, descripcion: "Caja de corazón con 150 a 170 rosas aproximadamente. Tarjeta con mensaje personalizado" },
    { nombre: "Corazón Luxury Ferreros", precio: 290000, descripcion: "Arreglo de 12 a 15 rosas y 20 Ferreros. Caja corazón. Tarjeta con mensaje" },
    { nombre: "Deluxe 100 Roses", precio: 500000, descripcion: "Ramo buchón de 100 rosas aprox. Emboltura y decoración. Tarjeta con mensaje" },
    { nombre: "Deluxe 200 Roses", precio: 1380000, descripcion: "" },
    { nombre: "Deluxe Girasoles", precio: 120000, descripcion: "Girasoles con relleno. Envueltos en yute. Empaque de decoración y tarjeta con mensaje" },
    { nombre: "Eternal Roses", precio: 165000, descripcion: "Caja Corazon 24 rosas con gipsofilia. Color de rosa a elección. Tarjeta con mensaje" },
    { nombre: "Flowers 100 Roses", precio: 550000, descripcion: "100-110 rosas. Dos globos de corazón con helio. Relleno y papel decorativo. Tarjeta con mensaje" },
    { nombre: "Girasol Encapsulado", precio: 85000, descripcion: "Incluye caja y bolsa de la tienda. Y tarjeta personalizada" },
    { nombre: "Girasoles Bear", precio: 140000, descripcion: "Ramo de girasoles deluxe. Peluche 25-30cm aproximadamente" },
    { nombre: "Girasoles Bloom", precio: 85000, descripcion: "Ramo de tres girasoles con relleno y empaque en forma de decoración. Incluye tarjeta con mensaje" },
    { nombre: "Heart Love", precio: 170000, descripcion: "Arreglo de rosas con gipsofilias. Caja de chocolates. Nutella mini. Peluche (A elección). Hershey. Vaso decorado. Galletas ducales tentación. Corazón grande decorado. Tarjeta con mensaje" },
    { nombre: "Luxury Flowers", precio: 1250000, descripcion: "200-250 rosas en caja decorada. Mensaje personalizado. Tarjeta con mensaje" },
    { nombre: "Luxury Red Rose", precio: 500000, descripcion: "Caja redonda decorada con 120 a 140 rosas. Color de rosa a elección del cliente. Tarjeta con mensaje" },
    { nombre: "Opulent Roses", precio: 450000, descripcion: "Caja decorada con 80 a 90 rosas. Tarjeta con mensaje" },
    { nombre: "Premium Ferreros", precio: 160000, descripcion: "Ramo de 18 rosas naturales y gipsofilias en papel decorativo, incluye tarjeta con mensaje y 4 Ferreros Rocher" },
    { nombre: "Ramo Deluxe", precio: 185000, descripcion: "Un bouquet que habla por sí solo. Elaborado con rosas rojas seleccionadas y envuelto en elegante coreano texturizado en tonos blanco, con un lazo rojo que realza su presentación. Un detalle clásico, perfecto para celebrar el amor, la amistad o simplemente recordarle a alguien lo especial que es" },
    { nombre: "Ramo Elegant 60 Roses", precio: 320000, descripcion: "Ramo buchón 50-60 rosas. Relleno y papel decorativo. Tarjeta con mensaje" },
    { nombre: "Ramo Flowers", precio: 115000, descripcion: "Ramo premium de flores naturales y gipsofilias en papel decorativo, incluye tarjeta con mensaje" },
    { nombre: "Ramo Love Ferreros", precio: 200000, descripcion: "Arreglo de rosas rojas con gipsofilias. Corazón de Ferreros. Empaque con papel decorativo. Lazo y tarjeta" },
    { nombre: "Ramo Luxury 200 rosas", precio: 1150000, descripcion: "200 rosas color a elección del cliente. Gipsofilia. Empaque con papel coreano. Tarjeta con mensaje" },
    { nombre: "Ramo Luxury Primaveral", precio: 145000, descripcion: "Ramo de rosas con Hortensia, en tonos primaverales decorado con papel coreano y también incluye tarjeta con mensaje." },
    { nombre: "Ramo Luxury Red Pink", precio: 320000, descripcion: "Ramo de 60 rosas de dos o tres colores de rosas con relleno. Decoración y tarjeta con mensaje" },
    { nombre: "Ramo Premuim", precio: 150000, descripcion: "Arreglo con 18 a 20 rosas, envueltos en papel coreano decorado. Incluye en tarjeta con mensaje." },
    { nombre: "Ramo Primavera", precio: 115000, descripcion: "Arreglo en tonos primaverales con rosas, astromelias, claveles y gerberas. Envuelto en papel coreano y tarjeta con mensaje" },
    { nombre: "Ramo Womens", precio: 90000, descripcion: "Ramo premium de flores naturales y gipsofilias en papel decorativo, incluye tarjeta con mensaje" },
    { nombre: "Red Flowers", precio: 400000, descripcion: "Corazón en caja con 100 rosas aproximadamente. Dos colores a elección del cliente. Tarjeta con mensaje" },
    { nombre: "Rosa Encapsulada Roja", precio: 85000, descripcion: "Rosa encapsulada con luces. Caja de regalo. Tarjeta con mensaje" },
    { nombre: "Rosa Encapsulada Rosada", precio: 85000, descripcion: "Rosa encapsulada con luces. Caja de regalo. Tarjeta con mensaje" },
    { nombre: "Rosa Encapsulada XL", precio: 100000, descripcion: "Esta rosa encapsulada tiene forma de ramillete, envuelta en malín blanco con lazo, incluye una tarjeta dedicatoria y una bolsa donde va empacada. Es perfecta para sorprender a esa persona especial. Medidas: 27cm alto. Diametro: 30cm" },
    { nombre: "Roses Box", precio: 120000, descripcion: "Caja de corazón con 12 a 14 rosas (color de rosa a elección del cliente). Tarjeta con mensaje" },
    { nombre: "Roses Perfect", precio: 100000, descripcion: "Arreglo de rosas con gipsofilias. Empaque y lazo. Tarjeta con mensaje opcional. Caja de ferreros para adicionar $16.000" },
    { nombre: "Roses Primavera", precio: 95000, descripcion: "Ramo de flores naturales y gipsofilias en papel decorativo, incluye tarjeta con mensaje" },
    { nombre: "Soft Luxe", precio: 150000, descripcion: "Cilindro con flores surtidas entre hortensias, rosas, astromelias y claveles. Tarjeta dedicatoria personalizada" },
    { nombre: "Sweet Romance", precio: 190000, descripcion: "Ramo de 30 rosas con relleno. Decoración con papel coreano. Lazo y tarjeta con mensaje" },
  ];

  for (const flo of productosFloralesList) {
    await prisma.producto.create({
      data: {
        nombre: flo.nombre,
        precio: flo.precio,
        stock: 999999,
        categoria: "Arreglos Florales",
        etiqueta: "Arreglos Florales",
        descripcion: flo.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosFloralesList.length} productos de 'Arreglos Florales' cargados exitosamente.`);

  console.log("🎁 Registrando los 33 Productos de 'Cajas de regalo'...");
  const productosCajasList = [
    { nombre: "Box Lampara Cristal", precio: 115000, descripcion: "Lámpara tulipanes, contenedor con mini brownies y fresas, papas Monterojo, té Hatsu decorado, caja de acetato decorada y tarjeta con mensaje." },
    { nombre: "Bear Box", precio: 95000, descripcion: "Peluche a elección, papas Monterojo, galletas Biscolatta, galleta Oreo, contenedor con galletas punto rojo, caja decorada y tarjeta con mensaje." },
    { nombre: "Box Cervecero", precio: 90000, descripcion: "3 cervezas Corona (opcionalmente cambiables por Hatsu o Coca-Cola), brownie melcochudo, papas Monterojo, galletas Noel, frasco con maní, caja decorada y tarjeta personalizada." },
    { nombre: "Box Cheers Man", precio: 85000, descripcion: "Cervezas o Hatsu, papas Monterojo, contenedor con rosquitas, maní, galletas Noel, caja decorada y tarjeta con mensaje." },
    { nombre: "Box Fabuloso", precio: 45000, descripcion: "Monterojo BBQ, té Hatsu, galletas, caja decorada alusiva a la ocasión y tarjeta con mensaje." },
    { nombre: "Box Fantastic", precio: 100000, descripcion: "Arreglo de 8 rosas, dulces surtidos entre chocolates, galletas y gomitas, 2 fotos y mensaje en caja decorada marcada." },
    { nombre: "Box Flork Romantic", precio: 115000, descripcion: "Arreglo de rosas, galletas mini Oreo, Hershey, vaso decorado con frase, M&M, Piazza, letreros de Flork personalizados, caja metalizada y tarjeta dedicatoria." },
    { nombre: "Box Him Elegant", precio: 170000, descripcion: "Botella de vino 750ML, termo personalizado (soporta bebidas frías y calientes), Ferreros Rocher, agenda personalizada, frasco con galletas, base decorada y tarjeta con mensaje." },
    { nombre: "Box Lámpara Tulipanes", precio: 130000, descripcion: "Lámpara de nube, peluche a elección, gomitas, gancho de felpita, moña, Nutella mini, Piazza, caja decorada marcada y tarjeta con mensaje." },
    { nombre: "Box Luxury Madera", precio: 135000, descripcion: "Arreglo de rosas, caja de madera con 12 fotos personalizadas, cajón de 9 cupones personalizados, caja de Ferreros X4, decoración y tarjeta personalizada." },
    { nombre: "Box Peluche", precio: 95000, descripcion: "Peluche a elección, frasco con gomitas, frasco con masmelos, Doritos, chocolate Jet, decoración en caja y tarjeta con mensaje." },
    { nombre: "Box Peluche Tierno", precio: 90000, descripcion: "Peluche a elección del cliente, dulces surtidos según disponibilidad y tarjeta con mensaje." },
    { nombre: "Box Perfect", precio: 110000, descripcion: "Caja blanca o Kraft decorada, peluche a elección, Piazzas, galletas punto rojo, contenedor con gomitas, Nutella pequeña y tarjeta con mensaje." },
    { nombre: "Box Shine", precio: 80000, descripcion: "Un peluche a elección, dulces surtidos entre chocolates, galletas y gomitas, caja metalizada decorada y tarjeta dedicatoria personalizada." },
    { nombre: "Box Skin Care", precio: 80000, descripcion: "Diadema facial, 2 velos faciales, moña satinada, papas Monterojo, té Hatsu, caja decorada y tarjeta con mensaje." },
    { nombre: "Box Snack", precio: 55000, descripcion: "Té Hatsu grande, 2 velos faciales, maní especial, contenedor con galletas, papas Monterojo, Biscolatta y tarjeta dedicatoria con mensaje." },
    { nombre: "Box Termo", precio: 65000, descripcion: "Termo tipo vaso que resiste bebidas calientes y frías por más de 12 horas. Personalízalo con el nombre que desees." },
    { nombre: "Box Valentine", precio: 90000, descripcion: "Portarretrato con foto personalizada, papas Monterojo, contenedor con mini brownies, maní especial, galletas, té Hatsu, caja decorada y tarjeta con mensaje." },
    { nombre: "Box Vinero", precio: 130000, descripcion: "Botella de Vino 750ML, copa cristalina, decoración elegante y tarjeta con mensaje." },
    { nombre: "Box Vino", precio: 160000, descripcion: "Botella de vino, galletas Noel, Ferreros Rocher, maní, caja de madera decorada y tarjeta con mensaje." },
    { nombre: "Buchanans Box", precio: 290000, descripcion: "Barquillos Piazza, botella de Buchanan’s 350ML, Mini Chips, vaso whiskero de vidrio, barra de chocolate, caja de madera grande decorada y tarjeta con mensaje." },
    { nombre: "Caja Buchana's Elegant", precio: 310000, descripcion: "Caja de madera decorada, Buchanan’s 750ML, vaso de whiskey, chocolate, decoración y tarjeta con mensaje." },
    { nombre: "Caja Cervecera", precio: 85000, descripcion: "Brownie decorado, 3 cervezas, Pringles, maní especial, mini Coca-Cola, Nutella mini y tarjeta con mensaje." },
    { nombre: "Caja corazón valiente", precio: 85000, descripcion: "Té Hatsu, mix de frutas, Ferreros X4, mug personalizado con nombre, galleta de fresa, caja corazón y tarjeta dedicatoria." },
    { nombre: "Caja Elegant", precio: 100000, descripcion: "Peluche a elección, caja Choco Breaks, frasco con chocolates, frasco con frases, Ferreros, Piazza grande, galleta Milo, caja metalizada y tarjeta." },
    { nombre: "Caja Especial", precio: 80000, descripcion: "Doritos grande, cerveza, mini Oreo, dulces surtidos, frasco con frases personalizadas, carta personalizada y caja decorada marcada." },
    { nombre: "Caja Luxury Copa", precio: 130000, descripcion: "JP Chenet personal, copa marcada, mini tabla de quesos y jamón, Ferreros X3, rosas y claveles, caja decorada y tarjeta con mensaje." },
    { nombre: "Cuadro + Caja de dulces", precio: 100000, descripcion: "Cuadro personalizado, caja de dulces surtidos entre chocolates, galletas y gomitas, caja decorada marcada y tarjeta con mensaje." },
    { nombre: "Cuadro + Caja Luxury", precio: 120000, descripcion: "Cuadro personalizado, caja con mecatos, cervezas y dulces con tarjeta con mensaje." },
    { nombre: "Mug Man", precio: 29000, descripcion: "Taza metalizada personalizada que resiste bebidas frías y calientes. Personalízala con el nombre que desees." },
    { nombre: "Mug Women", precio: 29000, descripcion: "Taza personalizada que resiste bebidas frías y calientes. Personalízala con el nombre que desees." },
    { nombre: "Secret Sweet Box", precio: 70000, descripcion: "Doritos grande, Coronita, Cocosette, Pingüino Cookies & Cream, galleta Oreo, contenedor con galletas, caja y tarjeta con mensaje." },
    { nombre: "Termo Personalizado", precio: 90000, descripcion: "Termo personalizado que conserva bebidas frías y calientes por 24 horas. Personalízalo con tu nombre o palabra especial." },
  ];

  for (const caj of productosCajasList) {
    await prisma.producto.create({
      data: {
        nombre: caj.nombre,
        precio: caj.precio,
        stock: 999999,
        categoria: "Cajas de regalo",
        etiqueta: "Cajas de regalo",
        descripcion: caj.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosCajasList.length} productos de 'Cajas de regalo' cargados exitosamente.`);

  console.log("🧺 Registrando los 24 Productos de 'Anchetas'...");
  const productosAnchetasList = [
    { nombre: "Ancheta Beers", precio: 110000, descripcion: "3 cervezas Corona (opcionalmente pueden cambiarse por Hatzu o Coca-Cola), galletas Noel grandes, papas Monterojo, chocolates Ferrero Rocher, ramita de eucalipto aromática, ancheta decorativa, globo burbuja personalizado, decoración temática, cintas decorativas y tarjeta con mensaje personalizado." },
    { nombre: "Ancheta Candies", precio: 120000, descripcion: "Base de madera decorada, dulces surtidos entre chocolates, galletas y gomitas, 2 manzanas, peluche, globo marcado decorado y tarjeta con mensaje." },
    { nombre: "Ancheta Cheers Dulcera", precio: 110000, descripcion: "Dulces surtidos, Pringles, Bimbolete, 2 cervezas decoradas, decoración con globitos en los colores que desees y tarjeta con mensaje." },
    { nombre: "Ancheta Deluxe", precio: 120000, descripcion: "3 cervezas Stella (puedes cambiarlas), Doritos, platanitos, M&M, Pingüino pudín, galleta Club Social, galleta Chokis, ancheta con globos, decoración alusiva al motivo que desees y carta con mensaje." },
    { nombre: "Ancheta Deluxe Gorra", precio: 170000, descripcion: "Gorra a elección, mini Coca-Cola, galleta Oreo, frasco con maní, rosquitas, cervezas, pudín Pingüino, Cocosette, gomitas, dulces, decoración en base de madera y tarjeta con mensaje." },
    { nombre: "Ancheta Elegant", precio: 100000, descripcion: "Monterojo BBQ, dos Coronitas, Coca-Cola, arreglo con globo burbuja decorado, ramito de eucalipto, cilindro con decoración y tarjeta con mensaje." },
    { nombre: "Ancheta Fabulosa", precio: 85000, descripcion: "Té Hatsu, Hershey, maní especial, avena, brownie, decoración en cilindro decorado, globo corazón marcado y tarjeta con mensaje." },
    { nombre: "Ancheta Love Candies", precio: 125000, descripcion: "Dulces surtidos entre chocolates, galletas y gomitas, fotos, base corazón, globo burbuja personalizado y tarjeta con mensaje." },
    { nombre: "Ancheta Luxur", precio: 90000, descripcion: "Monterojo BBQ, 3 Coronitas, frasco con maní, galletas Biscolatta, Coca-Cola, cilindro con decoración alusiva a la ocasión y tarjeta con mensaje. Agrégale dos globos con helio por $16.000." },
    { nombre: "Ancheta Luxury", precio: 230000, descripcion: "Dulces surtidos entre chocolates, galletas y gomitas, botella de JP Chenet personal, arreglo en base con papelitos, globo burbuja marcado, arreglo de globos burbuja cromados y tarjeta con mensaje." },
    { nombre: "Ancheta Magic", precio: 190000, descripcion: "Dulces surtidos entre chocolates, gomitas y galletas, peluche a elección, arreglo de margaritas, globos con números, globo burbuja, 6 globos con helio, decoración en el color que desees y tarjeta con mensaje." },
    { nombre: "Ancheta Mega Premium", precio: 185000, descripcion: "Dulces surtidos entre chocolates, galletas y gomitas, arreglo de flores, peluche a elección, arreglo en base de madera con globos HBD y tarjeta con mensaje." },
    { nombre: "Ancheta Mug Beers", precio: 130000, descripcion: "Sixpack de cervezas, taza personalizada, contenedor con maní, decoración y tarjeta con mensaje." },
    { nombre: "Ancheta Premium", precio: 135000, descripcion: "Botella de vino, torta decorada, yogurt Kumis, maní especial grande limón pimienta, porción con platanitos, Cocosette, M&M, masmelos, decoración con globos y tarjeta con mensaje." },
    { nombre: "Ancheta Romantic", precio: 140000, descripcion: "Oso de peluche, contenedor con chocolates, jugo de naranja, Milo, Chocobreak en empaque decorado, maní especial, sándwich de la casa, porción con fruta, porción con brownies mini, decoración y tarjeta con mensaje." },
    { nombre: "Arreglo Baileys 750ML", precio: 200000, descripcion: "Botella de Baileys 750ML, peluche a elección, frasco con maní, canasta de aluminio con decoración y tarjeta con mensaje." },
    { nombre: "Arreglo Cervezas", precio: 105000, descripcion: "Coronita x3, chocolatina Montblanc, frasco de galletas Oreo, frasco de frutos secos, papas Pringles con empaque personalizado y tarjeta con mensaje." },
    { nombre: "Arreglo Copa Luxury", precio: 120000, descripcion: "Botella de JP personal decorada, arreglito de rosas, copa marcada, contenedor con rollitos de jamón y queso, chocolates Ferreros, decoración y tarjeta con mensaje." },
    { nombre: "Arreglo Encantador", precio: 135000, descripcion: "Té Hatsu, papas Monterojo, barquillos Piazza, arreglo de flores, decoración día de las madres, globo burbuja marcado, globo de corazón y tarjeta con mensaje." },
    { nombre: "Arreglo Girl Elegant", precio: 170000, descripcion: "Botella de Vino Rose, caja de Ferreros, copa marcada, maní especial en frasco decorado, globo marcado con mensaje, tarjeta alusiva a la ocasión y caja cilíndrica con decoración." },
    { nombre: "Baúl Cervecero", precio: 85000, descripcion: "Sixpack de Coronitas decoradas con eucalipto, cilindro decorado y tarjeta dedicatoria con mensaje." },
    { nombre: "Bloom Gift", precio: 235000, descripcion: "Papas Monterojo, chocolates, contenedor con galletas, botella JP Chenet, chocolate Gol, masmelos, ramo de rosas, ancheta con arco de globos y tarjeta con mensaje." },
    { nombre: "Ferreros Ballons", precio: 170000, descripcion: "15 a 18 Ferreros, cilindro marcado decorado, globo burbuja marcado y tarjeta con mensaje." },
    { nombre: "Silver Gift", precio: 150000, descripcion: "Botella de vino tinto 750ML, papas Monterojo, fresas, manzana verde, peras, decoración y tarjeta con mensaje." },
  ];

  for (const anch of productosAnchetasList) {
    await prisma.producto.create({
      data: {
        nombre: anch.nombre,
        precio: anch.precio,
        stock: 999999,
        categoria: "Anchetas",
        etiqueta: "Anchetas",
        descripcion: anch.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosAnchetasList.length} productos de 'Anchetas' cargados exitosamente.`);

  console.log("🎈 Registrando los 8 Productos de 'Arreglos con Globos'...");
  const productosGlobosList = [
    { nombre: "Bouquet Balloons", precio: 45000, descripcion: "Globos brillantes al 100% con buena durabilidad. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquet Deluxe", precio: 160000, descripcion: "Globos brillantes al 100% con durabilidad. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquet Elegant", precio: 85000, descripcion: "Bouquet de 8-9 globos brillantes al 100% con durabilidad de 1 día aprox. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquet Golden", precio: 130000, descripcion: "Bouquet de globos brillantes al 100% con durabilidad. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquet Luxury", precio: 120000, descripcion: "Dos bouquet de 12-13 globos brillantes al 100% con durabilidad de 1 día aproximadamente. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquet Numbers Helio", precio: 140000, descripcion: "Bouquet de brillantes al 100% durabilidad. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquet Shine Luxury", precio: 220000, descripcion: "Bouquet de brillantes al 100% con durabilidad. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
    { nombre: "Bouquets Decoración Deluxe", precio: 280000, descripcion: "3 bouquets de Globos brillantes al 100% con buena durabilidad. Tarjeta con mensaje (opcional). Tonos de globos según elección y disponibilidad." },
  ];

  for (const glo of productosGlobosList) {
    await prisma.producto.create({
      data: {
        nombre: glo.nombre,
        precio: glo.precio,
        stock: 999999,
        categoria: "Arreglos con Globos",
        etiqueta: "Arreglos con Globos",
        descripcion: glo.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosGlobosList.length} productos de 'Arreglos con Globos' cargados exitosamente.`);

  console.log("🔑 Registrando los 13 Productos de 'Llaveros Peluche'...");
  const productosLlaverosList = [
    { nombre: "Capibara Banana", precio: 25000, descripcion: "Hermoso llavero de peluche tierno Capibara Banana de alta calidad." },
    { nombre: "Coneja", precio: 25000, descripcion: "Llavero de peluche tierno de Coneja suave al tacto." },
    { nombre: "Coneja Sombrero", precio: 25000, descripcion: "Llavero de peluche Coneja con Sombrero especial." },
    { nombre: "Elefante", precio: 25000, descripcion: "Llavero de peluche Elefante detalles bordados." },
    { nombre: "Elefante Azul", precio: 25000, descripcion: "Llavero de peluche Elefante Azul tierno." },
    { nombre: "Gorila", precio: 25000, descripcion: "Llavero de peluche Gorila divertido y suave." },
    { nombre: "Gruñonsito", precio: 25000, descripcion: "Llavero de peluche Oso Gruñonsito colección." },
    { nombre: "Koala", precio: 25000, descripcion: "Llavero de peluche Koala tierno y esponjoso." },
    { nombre: "Oveja", precio: 25000, descripcion: "Llavero de peluche Oveja blanca suave." },
    { nombre: "Patito con balaca", precio: 25000, descripcion: "Llavero de peluche Patito con balaca accesorios." },
    { nombre: "Spiderman", precio: 25000, descripcion: "Llavero de peluche Spiderman héroe preferido." },
    { nombre: "Stitch", precio: 25000, descripcion: "Llavero de peluche Stitch personaje clásico." },
    { nombre: "Stitch Ángel", precio: 25000, descripcion: "Llavero de peluche Stitch Ángel rosado." },
  ];

  for (const lla of productosLlaverosList) {
    await prisma.producto.create({
      data: {
        nombre: lla.nombre,
        precio: lla.precio,
        stock: 999999,
        categoria: "Llaveros Peluche",
        etiqueta: "Llaveros Peluche",
        descripcion: lla.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosLlaverosList.length} productos de 'Llaveros Peluche' cargados exitosamente.`);

  console.log("📿 Registrando los 4 Productos de 'Manillas Pareja'...");
  const productosManillasList = [
    { nombre: "Pulsera 3 balines Oro Laminado", precio: 55000, descripcion: "Par X 100.000" },
    { nombre: "Pulsera 5 balines Oro Laminado", precio: 80000, descripcion: "Par X 145.000" },
    { nombre: "Pulsera 5 balines roja Oro Laminado", precio: 80000, descripcion: "Par X 145.000" },
    { nombre: "Pulsera San Benito Oro Laminado", precio: 90000, descripcion: "Par X 170.000" },
  ];

  for (const man of productosManillasList) {
    await prisma.producto.create({
      data: {
        nombre: man.nombre,
        precio: man.precio,
        stock: 999999,
        categoria: "Manillas Pareja",
        etiqueta: "Manillas Pareja",
        descripcion: man.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosManillasList.length} productos de 'Manillas Pareja' cargados exitosamente.`);

  console.log("👑 Registrando los 10 Productos de 'Combos Luxury'...");
  const productosCombosLuxuryList = [
    { nombre: "Baúl Cervezas Cuadro", precio: 130000, descripcion: "Baúl cervecero con cervezas, mecatos y cuadro personalizado." },
    { nombre: "Cuadro + Caja madera", precio: 160000, descripcion: "Caja con cervezas, frasco de maní y dulces. Cuadro personalizado. Tarjeta con mensaje" },
    { nombre: "Girasoles Peluche", precio: 120000, descripcion: "Ramo de girasoles. Peluche 40-45cm aproximadamente (A elección del cliente). Tarjeta con mensaje" },
    { nombre: "Oso Deluxe Balloons", precio: 590000, descripcion: "Peluche 1.50cm aproximadamente (a elección del cliente). 8 Globos de helio calidad cromado (colores a elección del cliente). Tarjeta con mensaje personalizado" },
    { nombre: "Peluche 50 Roses", precio: 440000, descripcion: "Peluche 70-80cm aproximadamente. Ramo de 50 rosas. Tarjeta con mensaje" },
    { nombre: "Peluche Flowers", precio: 385000, descripcion: "Peluche mediano (A elección del cliente). Ramo de 18 rosas. Una caja de Ferreros. Globos con helio. Decoración en tarjeta con mensaje" },
    { nombre: "Peluche Premium", precio: 700000, descripcion: "Peluche grande (A elección del cliente). Ramo de 40 rosas. Caja de Ferreros decorada. 3 globos con helio de corazón. Tarjeta con mensaje" },
    { nombre: "Ramo Rosas Cuadro", precio: 140000, descripcion: "Ramo de una docena de rosas. Cuadro personalizado (A elección del cliente). Tarjeta con mensaje" },
    { nombre: "Rose Luces Peluche", precio: 230000, descripcion: "Peluche 50-60cm a elección del cliente. Rosa encapsulada con luces roja o rosada. Tarjeta con mensaje" },
    { nombre: "Stitch Gigante Flowers", precio: 500000, descripcion: "Ramo de 50 rosas. Peluche Angela de 80cm. Tarjeta con mensaje" },
  ];

  for (const com of productosCombosLuxuryList) {
    await prisma.producto.create({
      data: {
        nombre: com.nombre,
        precio: com.precio,
        stock: 999999,
        categoria: "Combos Luxury",
        etiqueta: "Combos Luxury",
        descripcion: com.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosCombosLuxuryList.length} productos de 'Combos Luxury' cargados exitosamente.`);

  console.log("🌻 Registrando los 7 Productos de 'Catálogo Flores Amarillas'...");
  const productosFloresAmarillasList = [
    { nombre: "Ramo Yellow", precio: 80000, descripcion: "Arreglo Mix con rosas amarillas y un toque de relleno para darle ese efecto especial y sorprendas en este día de las flores amarillas. Incluye envoltura con papel coreano y tarjeta dedicatoria." },
    { nombre: "Flor Encapsulado", precio: 85000, descripcion: "Sorprende este 21 de Septiembre con nuestras flores encapsuladas, es un detalle que perdura en el tiempo. Tenemos disponibilidad de rosa amarilla, girasol en ramillete y girasol individual. Puedes agregarle una tarjeta con mensaje." },
    { nombre: "Bouquet Girasoles", precio: 90000, descripcion: "Arreglo de girasoles y un toque de relleno para darle ese efecto especial y sorprendas en este día de las flores amarillas. Incluye decoración y tarjeta con dedicatoria." },
    { nombre: "Ramo Premium", precio: 100000, descripcion: "Arreglo de rosas amarillas, margaritas, gerberas y un toque de relleno verde para lograr el resultado perfecto. Esta es una buena opción si quieres sorprender un ramo de flores. Incluye empaque y tarjeta con mensaje." },
    { nombre: "Corazón Love Yellow", precio: 130000, descripcion: "Nuestra caja de corazón está decorada con rosas amarillas seleccionadas para darle un toque delicado. Incluye decoración y una presentación especial, con tarjeta con dedicatoria personalizada." },
    { nombre: "Ramo 24 roses", precio: 170000, descripcion: "Arreglo de Margaritas amarillas y blancas y un toque de relleno para darle ese efecto especial y sorprendas en este día de las flores amarillas. Incluye decoración y tarjeta con dedicatoria." },
    { nombre: "Bouquet Girasoles Deluxe", precio: 180000, descripcion: "Nuestro bouquet girasoles deluxe es un arreglo con un cilindro negro decorado, 6 girasoles y relleno verde para que quede la combinación perfecta. Es un detalle luxury creado especialmente para él o ella." },
  ];

  for (const fa of productosFloresAmarillasList) {
    await prisma.producto.create({
      data: {
        nombre: fa.nombre,
        precio: fa.precio,
        stock: 999999,
        categoria: "Catálogo Flores Amarillas",
        etiqueta: "Catálogo Flores Amarillas",
        descripcion: fa.descripcion,
        imagen: null,
      },
    });
  }
  console.log(`✓ ${productosFloresAmarillasList.length} productos de 'Catálogo Flores Amarillas' cargados exitosamente.`);

  console.log("🎁 Registrando los 8 Adicionales Oficiales...");
  const adicionalesPDF = [
    { nombre: "Ferrero X3", precio: 18000, disponible: true },
    { nombre: "Foto Mediana", precio: 7000, disponible: true },
    { nombre: "Globo corazón con helio", precio: 12000, disponible: true },
    { nombre: "Rosa Roja", precio: 6000, disponible: true },
    { nombre: "Llavero felpudo", precio: 15000, disponible: true },
    { nombre: "Peluches", precio: 30000, disponible: true },
    { nombre: "Coronita", precio: 8000, disponible: true },
    { nombre: "Postre Napoleon", precio: 9000, disponible: true },
  ];

  for (const ad of adicionalesPDF) {
    await prisma.adicional.create({ data: ad });
  }
  console.log(`✓ 8 adicionales cargados exitosamente.`);

  console.log("✨ ¡Base de datos sembrada 100% lista con la categoría Peluches Gigantes!");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


