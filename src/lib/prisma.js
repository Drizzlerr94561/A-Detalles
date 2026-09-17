import { PrismaClient } from '@prisma/client';

// Patrón Singleton para evitar que Next.js cree múltiples conexiones
// a MySQL en modo de desarrollo con Fast Refresh.
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
