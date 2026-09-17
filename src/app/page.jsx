import HeroBannerCarrusel from "@/components/HeroBannerCarrusel";
import prisma from "@/lib/prisma";
import CarruselProductos from "@/components/CarruselProductos";
import CardGrandeDestacada from "@/components/CardGrandeDestacada";
import SeccionSorprende from "@/components/SeccionSorprende";
import ResenasClientes from "@/components/ResenasClientes";
import FeedInstagram from "@/components/FeedInstagram";
import AnimatedSection from "@/components/AnimatedSection";
import {
  ShoppingBag,
  Zap,
  Sparkles,
  Heart,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";

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
          <CarruselProductos productos={productos.slice(0, 18)} />
        </section>
      </AnimatedSection>

      {/* BANNER LLAMADO A LA ACCIÓN (WHATSAPP) */}
      <AnimatedSection delay={180}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="relative overflow-hidden rounded-3xl bg-[#f8ece8] p-8 sm:p-12 text-[#5c4a42] shadow-xl border border-[#ebd3cb] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="font-lemon text-4xl sm:text-5xl tracking-wide text-[#5c4a42]">
                ¿Deseas personalizar tu pedido?
              </h3>
              <p className="text-xs sm:text-sm font-poppins text-[#8c6b5d] font-medium leading-relaxed">
                Escríbenos a WhatsApp y te ayudaremos a armar el regalo perfecto adaptado a tus gustos.
              </p>
            </div>

            <a
              href="https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20personalizar%20un%20desayuno"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs tracking-widest uppercase shadow-md hover:shadow-lg transition transform hover:scale-105 border border-[#785b4f] shrink-0"
            >
              <MessageCircle className="w-5 h-5 text-emerald-300 fill-emerald-300/20" />
              <span>Hablar por WhatsApp</span>
            </a>
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
          <CarruselProductos productos={productos.length > 0 ? [...productos].reverse().slice(0, 18) : []} tipoColeccion="edicionEspecial" />
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
