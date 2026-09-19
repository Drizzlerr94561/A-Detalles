import HeroBannerCarrusel from "@/components/HeroBannerCarrusel";
import prisma from "@/lib/prisma";
import { catalogoOficial } from "@/lib/catalogoOficial";
import CarruselProductos from "@/components/CarruselProductos";
import CardGrandeDestacada from "@/components/CardGrandeDestacada";
import SeccionSorprende from "@/components/SeccionSorprende";
import ResenasClientes from "@/components/ResenasClientes";
import FeedInstagram from "@/components/FeedInstagram";
import AnimatedSection from "@/components/AnimatedSection";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let productos = [];
  let tarjetas = [];

  try {
    const productosDB = await prisma.producto.findMany({
      orderBy: { createdAt: "desc" },
    });
    const tarjetasDB = await prisma.tarjetaInicio.findMany();
    productos = JSON.parse(JSON.stringify(productosDB));
    tarjetas = JSON.parse(JSON.stringify(tarjetasDB));
  } catch (error) {
    console.error("Error al consultar datos desde MySQL:", error);
    productos = [];
    tarjetas = [];
  }

  if (!productos || productos.length === 0) {
    productos = catalogoOficial;
  }


  const getTarjeta = (clave, defaultNombre, defaultImg) => {
    const t = tarjetas.find((x) => x.clave === clave);
    return {
      nombre: t?.nombre || defaultNombre,
      subtitulo: t?.subtitulo || "",
      descripcion: t?.descripcion || "",
      imagen: t?.imagen || defaultImg,
    };
  };

  const cardDestacada = getTarjeta("card_coleccion_destacada", "COLECCIÓN DESTACADA 2026", "/images/hero_banner_palorosa.jpg");
  const cardEdicionEspecial = getTarjeta("card_edicion_especial", "COLECCIÓN EDICIÓN ESPECIAL 2026", "/images/Desayuno.png");
  const heroBanner = getTarjeta("hero_main_banner", "Recibe Hoy", "/images/Amarillo.png");

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SLIDER BANNER CON CARRUSEL DE IMÁGENES EN CROSS-FADE */}
      <AnimatedSection>
        <HeroBannerCarrusel heroData={heroBanner} />
      </AnimatedSection>

      {/* 2. CINTA / CARD PEQUEÑA DE PRIMERA COLECCIÓN */}
      <AnimatedSection delay={100}>
        <section className="text-center px-4 pt-2">
          <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs uppercase">
            {cardDestacada.nombre}
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#faf2ee] via-[#f8ece8] to-[#f4dcd3] p-6 sm:p-10 text-[#5c4a42] shadow-lg border border-[#ebd3cb]/80 text-center flex flex-col items-center justify-center space-y-3.5">
            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="font-lemon text-2xl sm:text-4xl lg:text-5xl tracking-wide text-[#5c4a42] uppercase leading-tight">
                ¿Deseas personalizar tu pedido?
              </h3>
              <p className="text-xs sm:text-sm font-source text-[#786055] font-medium leading-relaxed max-w-md mx-auto">
                Escríbenos a WhatsApp y te ayudaremos a armar el regalo perfecto adaptado a tus gustos.
              </p>
            </div>

            <div className="pt-1">
              <a
                href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20personalizar%20un%20desayuno"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#785b4f] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md border border-[#5c4a42] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5 text-emerald-300 fill-emerald-300/20" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* 4. CARD GRANDE DESTACADA CON 3 EXPERIENCIAS DINÁMICAS */}
      <AnimatedSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <CardGrandeDestacada tarjetasIniciales={tarjetas} />
        </section>
      </AnimatedSection>

      {/* 5. CINTA / CARD PEQUEÑA DE SEGUNDA COLECCIÓN (EDICIÓN ESPECIAL) */}
      <AnimatedSection delay={220}>
        <section className="text-center px-4 pt-4">
          <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs uppercase">
            {cardEdicionEspecial.nombre}
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
          <SeccionSorprende tarjetasIniciales={tarjetas} />
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
