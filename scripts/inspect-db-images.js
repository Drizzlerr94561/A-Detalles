const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productos = await prisma.producto.findMany({
    orderBy: { id: 'asc' },
  });

  console.log(`Encontrados ${productos.length} productos en DB:\n`);
  productos.forEach((p) => {
    console.log(`[${p.id}] [${p.categoria}] "${p.nombre}" -> ${p.imagen}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
