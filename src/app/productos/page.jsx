import prisma from "@/lib/prisma";
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

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. HERO Y CABECERA DEL CATÁLOGO */}
      <AnimatedSection>
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8ece8] via-[#f3dcd3] to-[#faf6f4] p-8 sm:p-14 text-center border border-[#ebd3cb]/60 shadow-xl space-y-4">
            
            {/* CINTA DISTINTIVA EN TIPOGRAFÍA AGBALUMO */}
            <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-white text-[#8c6b5d] font-agbalumo text-sm sm:text-base tracking-wider border border-[#ebd3cb] shadow-xs uppercase">
              CATÁLOGO COMPLETO · A’DETALLES
            </div>

            <h1 className="font-lemon text-5xl sm:text-7xl text-[#5c4a42] tracking-wide max-w-4xl mx-auto leading-tight drop-shadow-xs">
              Nuestra Colección de Sorpresas
            </h1>

            <p className="text-xs sm:text-sm font-poppins text-[#8c6b5d] max-w-2xl mx-auto leading-relaxed font-medium">
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
