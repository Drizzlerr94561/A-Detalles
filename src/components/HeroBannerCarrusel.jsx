'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";

const heroImagenes = [
  {
    id: 1,
    src: "/images/Amarillo.png",
    alt: "Girasol amarillo especial Adetallesbq",
  },
  {
    id: 2,
    src: "/images/fiesta.png",
    alt: "Decoración de fiesta Adetallesbq",
  },
  {
    id: 3,
    src: "/images/Cumple.png",
    alt: "Celebración de cumpleaños Adetallesbq",
  },
  {
    id: 4,
    src: "/images/Tazarosa.png",
    alt: "Detalle Taza Rosa Adetallesbq",
  },
];

export default function HeroBannerCarrusel({ heroData }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-play continuo de 7.5 segundos con transición de desvanecimiento suave lenta (cross-fade)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImagenes.length);
    }, 7500);
    return () => clearInterval(interval);
  }, []);

  const bannerTitulo = heroData?.nombre || "Recibe Hoy";

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#faf6f4] via-[#f8ece8] to-[#f4dcd3] text-[#5c4a42] shadow-xl border border-[#ebd3cb] grid grid-cols-1 md:grid-cols-12 items-stretch">
        
        {/* LADO IZQUIERDO: CARRUSEL EN CROSS-FADE DE FOTOGRAFÍAS (AMARILLO, FIESTA, CUMPLE, TAZAROSA) */}
        <div className="md:col-span-6 relative h-64 sm:h-80 md:h-full md:min-h-[500px] overflow-hidden bg-[#f6eeea]">
          <div className="relative w-full h-full min-h-[250px] sm:min-h-[320px] md:min-h-[500px]">
            {heroImagenes.map((img, idx) => (
              <div
                key={img.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-[2500ms] ease-in-out ${
                  activeSlide === idx
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover object-top sm:object-center transform hover:scale-105 transition-transform duration-1000"
                />
                {/* Gradiente de fusión suave rosa pastel */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#f8ece8]/40 to-[#f8ece8]" />
              </div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: TEXTO PROMOCIONAL Y BOTÓN DE COMPRA CON COLORES SUAVES PALOROSA */}
        <div className="md:col-span-6 p-6 sm:p-10 md:p-12 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-6 relative z-10 bg-[#f8ece8]/70 backdrop-blur-xs">
          
          {/* BADGE ELEGANTE PALOROSA SUAVE */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#8c6b5d] font-julius text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-[#ebd3cb] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c29486]" />
            <span>COMPRA HOY &amp; RECIBE HOY</span>
          </span>

          {/* TÍTULO PRINCIPAL EN CHOCOLATE CÁLIDO */}
          <div className="space-y-1.5">
            <h1 className="font-lemon text-4xl sm:text-6xl md:text-7xl text-[#5c4a42] tracking-wide uppercase leading-tight drop-shadow-xs">
              {bannerTitulo}
            </h1>
            <p className="text-xs sm:text-sm font-poppins text-[#786055] font-medium leading-relaxed max-w-sm mx-auto">
              Detalles únicos y desayunos sorpresa preparados artesanalmente para entregar el mismo día.
            </p>
          </div>

          {/* BOTÓN DE ACCIÓN WHATSAPP EN TONO PALOROSA ELEGANTE */}
          <div className="pt-2 w-full max-w-xs space-y-3">
            <a
              href="https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20comprar%20para%20entrega%20hoy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8c6b5d] to-[#785b4f] hover:from-[#5c4a42] hover:to-[#3a2e28] text-white font-julius font-bold text-xs sm:text-sm tracking-widest uppercase shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4.5 h-4.5 text-emerald-300 fill-emerald-300/20" />
              <span>COMPRA AQUÍ</span>
            </a>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8c6b5d] font-poppins font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Envíos rápidos a Barranquilla y Soledad</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}


