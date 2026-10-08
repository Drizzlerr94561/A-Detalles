import prisma from "@/lib/prisma";
import { catalogoOficial } from "@/lib/catalogoOficial";
import CatalogoCliente from "@/components/CatalogoCliente";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  let productos = [];

  try {
    // Consulta a la base de datos MySQL
    const productosDB = await prisma.producto.findMany({
      orderBy: { createdAt: "desc" },
    });
    const dbProds = JSON.parse(JSON.stringify(productosDB || []));
    const dbIds = new Set(dbProds.map((p) => p.id));
    const dbNombres = new Set(dbProds.map((p) => (p.nombre || "").trim().toLowerCase()));

    const oficialesFiltrados = catalogoOficial.filter(
      (c) => !dbIds.has(c.id) && !dbNombres.has((c.nombre || "").trim().toLowerCase())
    );

    productos = [...dbProds, ...oficialesFiltrados];
  } catch (error) {
    console.error("Error al consultar productos desde MySQL:", error);
    productos = catalogoOficial;
  }


  return (
    <div className="space-y-6 sm:space-y-12 pb-20">
      
      {/* 1. CATÁLOGO INTERACTIVO DE PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <CatalogoCliente productosIniciales={productos} />
      </section>

    </div>
  );
}
