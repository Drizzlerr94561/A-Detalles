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
    productos = JSON.parse(JSON.stringify(productosDB));
  } catch (error) {
    console.error("Error al consultar productos desde MySQL:", error);
    productos = [];
  }

  if (!productos || productos.length === 0) {
    productos = catalogoOficial;
  }


  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. HERO Y CABECERA DEL CATÁLOGO (OCULTO EN MÓVIL, VISIBLE EN ESCRITORIO) */}
      <AnimatedSection>
        <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 hidden md:block">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#faf2ee] via-[#f8ece8] to-[#f4dcd3] p-6 sm:p-10 text-center border border-[#ebd3cb]/80 shadow-lg space-y-3">
            
            {/* BADGE DE CABECERA EN TIPOGRAFÍA JULIUS */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#8c6b5d] font-julius text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase border border-[#ebd3cb] shadow-xs">
                CATÁLOGO COMPLETO · A’DETALLES
              </span>
            </div>

            <h1 className="font-lemon text-2xl sm:text-4xl lg:text-5xl text-[#5c4a42] tracking-wide uppercase max-w-3xl mx-auto leading-tight drop-shadow-xs">
              Nuestra Colección de Sorpresas
            </h1>

            <p className="text-xs sm:text-sm font-source text-[#786055] font-medium max-w-xl mx-auto leading-relaxed">
              Explora nuestros desayunos sorpresa artesanales, cajas regalo exclusivas y arreglos florales diseñados con amor. Entregas a domicilio en todo Barranquilla.
            </p>

          </div>
        </section>
      </AnimatedSection>

      {/* 2. CATÁLOGO INTERACTIVO DE PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <CatalogoCliente productosIniciales={productos} />
      </section>

    </div>
  );
}
