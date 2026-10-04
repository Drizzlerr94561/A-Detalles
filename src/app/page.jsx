import HeroBannerCarrusel from "@/components/HeroBannerCarrusel";
import prisma from "@/lib/prisma";
import { catalogoOficial } from "@/lib/catalogoOficial";
import CarruselProductos from "@/components/CarruselProductos";
import CardGrandeDestacada from "@/components/CardGrandeDestacada";
import SeccionSorprende from "@/components/SeccionSorprende";
import ResenasClientes from "@/components/ResenasClientes";
import FeedInstagram from "@/components/FeedInstagram";
import AnimatedSection from "@/components/AnimatedSection";
import { MessageCircle, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let productos = [];

  try {
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

  const heroBanner = {
    nombre: "COMPRA HOY Y RECIBE HOY",
    imagen: "https://res.cloudinary.com/enwlpozz/image/upload/v1789706767/adetallesbq/banners/amarillo.jpg",
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SLIDER BANNER CON CARRUSEL DE IMÁGENES EN CROSS-FADE */}
      <AnimatedSection>
        <HeroBannerCarrusel heroData={heroBanner} />
      </AnimatedSection>

      {/* 2. CINTA / CARD PEQUEÑA DE PRIMERA COLECCIÓN */}
      <AnimatedSection delay={100}>
        <section className="text-center px-4 pt-2">
          <div className="inline-block px-8 sm:px-12 py-2 sm:py-2.5 rounded-none bg-[#F5CCD6] text-[#614539] font-oliver text-base sm:text-lg md:text-xl tracking-wider shadow-sm border-none uppercase font-bold">
            COLECCION DESTACADA 2026
          </div>
        </section>
      </AnimatedSection>

      {/* 3. CARRUSEL DE PRODUCTOS COLECCIÓN DESTACADA */}
      <AnimatedSection delay={150}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <CarruselProductos productos={productos} />
        </section>
      </AnimatedSection>

      {/* BANNER LLAMADO A LA ACCIÓN (WHATSAPP) */}
      <AnimatedSection delay={180}>
        <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fdf8f9] to-[#f7e6eb]/40 p-8 sm:p-12 text-[#614539] shadow-xl shadow-pink-900/5 border border-[#F5CCD6]/60 text-center flex flex-col items-center justify-center space-y-4">
            
            {/* ELEMENTOS DECORATIVOS ORGÁNICOS DE FONDO */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#F5CCD6]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-[#F5CCD6]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-4 right-8 opacity-20 pointer-events-none hidden sm:block">
              <Sparkles className="w-8 h-8 text-[#614539]" />
            </div>

            {/* CHIP DE ATENCIÓN PERSONALIZADA */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#F5CCD6]/80 text-[#614539] text-[10px] sm:text-xs font-julius tracking-widest uppercase shadow-xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#614539]" />
              <span>ATENCION PERSONALIZADA</span>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto relative z-10">
              <h3 className="font-julius text-2xl sm:text-4xl lg:text-5xl tracking-widest text-[#614539] uppercase leading-tight font-medium">
                ¿DESEAS PERSONALIZAR TU PEDIDO?
              </h3>
              
              <div className="w-16 h-0.5 bg-[#F5CCD6] mx-auto rounded-full my-2" />

              <p className="text-xs sm:text-base font-poppins text-[#614539]/90 font-normal leading-relaxed max-w-lg mx-auto">
                Escríbenos a WhatsApp y te ayudaremos a armar el regalo perfecto adaptado exactamente a tus gustos.
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <a
                href="https://wa.me/573004633576?text=Hola%20A%E2%80%99Detalles,%20quisiera%20personalizar%20un%20desayuno"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#614539] font-julius font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#F5CCD6]/40 border border-white/60 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-[#614539]" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* 4. CARD GRANDE DESTACADA CON 3 EXPERIENCIAS DINÁMICAS */}
      <AnimatedSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <CardGrandeDestacada />
        </section>
      </AnimatedSection>

      {/* 5. CINTA / CARD PEQUEÑA DE SEGUNDA COLECCIÓN (EDICIÓN ESPECIAL) */}
      <AnimatedSection delay={220}>
        <section className="text-center px-4 pt-4">
          <div className="inline-block px-8 sm:px-12 py-2 sm:py-2.5 rounded-none bg-[#F5CCD6] text-[#614539] font-oliver text-base sm:text-lg md:text-xl tracking-wider shadow-sm border-none uppercase font-bold">
            COLECCION EDICION ESPECIAL 2026
          </div>
        </section>
      </AnimatedSection>

      {/* 6. CARRUSEL EDICIÓN ESPECIAL */}
      <AnimatedSection delay={240}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <CarruselProductos productos={productos.length > 0 ? [...productos].reverse() : []} tipoColeccion="edicionEspecial" />
        </section>
      </AnimatedSection>

      {/* 7. NUEVA SECCIÓN "SORPRENDE A LOS QUE MÁS QUIERES" CON TARJETA GRÁFICA DINÁMICA */}
      <AnimatedSection delay={260}>
        <section className="pt-4">
          <SeccionSorprende />
        </section>
      </AnimatedSection>

      {/* 8. NUEVA SECCIÓN DE RESEÑAS DE CLIENTES */}
      <AnimatedSection delay={280}>
        <section className="pt-4">
          <ResenasClientes />
        </section>
      </AnimatedSection>

      {/* 9. NUEVA SECCIÓN FEED INSTAGRAM @PALOROSABREAKFAST */}
      <AnimatedSection delay={300}>
        <section className="pt-4">
          <FeedInstagram />
        </section>
      </AnimatedSection>
    </div>
  );
}
