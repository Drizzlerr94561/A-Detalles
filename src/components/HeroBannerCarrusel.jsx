'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";

const heroImagenes = [
  {
    id: 1,
    subtitulo: "DETALLES QUE",
    titulo: "Hacen Sonreír",
    corazon: true,
    descripcion: "Sorprende en cada ocasión especial",
    botonTexto: "Ver colección",
    src: "/images/Rosado.png",
    alt: "Detalles que hacen sonreír Adetallesbq",
  },
  {
    id: 2,
    subtitulo: "ENTREGAS HOY",
    titulo: "Recibe Hoy",
    corazon: false,
    descripcion: "Desayunos sorpresa preparados con amor",
    botonTexto: "Pedir por WhatsApp",
    src: "/images/Amarillo.png",
    alt: "Girasol amarillo especial Adetallesbq",
  },
  {
    id: 3,
    subtitulo: "MOMENTOS ÚNICOS",
    titulo: "Celebra la Vida",
    corazon: true,
    descripcion: "Decoraciones y regalos artesanales",
    botonTexto: "Ver sorpresas",
    src: "/images/fiesta.png",
    alt: "Decoración de fiesta Adetallesbq",
  },
  {
    id: 4,
    subtitulo: "HECHOS A MANO",
    titulo: "Con Mucho Amor",
    corazon: false,
    descripcion: "Regalos exclusivos para Barranquilla y Soledad",
    botonTexto: "Ver catálogo",
    src: "/images/Tazarosa.png",
    alt: "Detalle Taza Rosa Adetallesbq",
  },
];

export default function HeroBannerCarrusel({ heroData }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-play continuo de 6.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImagenes.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  const slideActual = heroImagenes[activeSlide];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
      
      {/* VISTA MÓVIL (TARJETA HORIZONTAL ELEGANTE IDENTICA A LA REFERENCIA EN IMAGEN 2) */}
      <div className="md:hidden relative rounded-3xl bg-gradient-to-r from-[#faf2ee] via-[#f8ece8] to-[#f4dcd3] border border-[#ebd3cb]/80 shadow-lg overflow-hidden min-h-[220px] sm:min-h-[260px] flex items-center p-4 sm:p-6">
        
        {/* FOTOS EN CROSS-FADE EN EL LADO DERECHO DEL BANNER */}
        <div className="absolute top-0 right-0 w-7/12 h-full overflow-hidden pointer-events-none">
          {heroImagenes.map((img, idx) => (
            <div
              key={img.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                activeSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              {/* Degradado de fusión suave palorosa hacia la izquierda */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#faf2ee] via-[#faf2ee]/70 to-transparent z-10" />
            </div>
          ))}
        </div>

        {/* CONTENIDO TEXTO ELEGANTE EN EL LADO IZQUIERDO */}
        <div className="relative z-20 max-w-[65%] space-y-1.5 sm:space-y-2.5">
          <span className="block font-julius text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-[#8c6b5d] uppercase">
            {slideActual.subtitulo}
          </span>

          <h2 className="font-lemon text-xl sm:text-3xl font-bold text-[#5c4a42] leading-tight uppercase tracking-wide flex items-center gap-1.5 drop-shadow-xs">
            <span>{slideActual.titulo}</span>
            {slideActual.corazon && (
              <span className="text-[#e29b8c] font-cursive font-normal text-2xl sm:text-4xl animate-pulse">
                ♡
              </span>
            )}
          </h2>

          <p className="font-source text-[11px] sm:text-xs text-[#786055] font-medium leading-snug line-clamp-2 max-w-[90%]">
            {slideActual.descripcion}
          </p>

          <div className="pt-1">
            <a
              href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20comprar%20un%20regalo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#785b4f] hover:bg-[#5c4a42] text-white font-julius font-bold text-[9px] sm:text-xs tracking-wider uppercase shadow-md border border-[#5c4a42] transition-all transform active:scale-95 cursor-pointer"
            >
              <span>{slideActual.botonTexto}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ebd3cb]" />
            </a>
          </div>
        </div>

        {/* TEXTO CALIGRÁFICO LATERAL DERECHO (ESTILO IMAGEN 2) */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 hidden xs:flex flex-col text-right font-cursive text-sm sm:text-base text-[#8c6b5d]/90 leading-snug pointer-events-none select-none drop-shadow-xs">
          <span>Flores</span>
          <span>Regalos</span>
          <span>Desayunos</span>
          <span className="text-xs">y más...</span>
        </div>

      </div>

      {/* VISTA ESCRITORIO (MD Y SUPERIOR) */}
      <div className="hidden md:grid relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#faf6f4] via-[#f8ece8] to-[#f4dcd3] text-[#5c4a42] shadow-xl border border-[#ebd3cb] grid-cols-12 items-stretch min-h-[460px]">
        {/* LADO IZQUIERDO: CARRUSEL EN CROSS-FADE DE FOTOGRAFÍAS */}
        <div className="col-span-6 relative h-full min-h-[460px] overflow-hidden bg-[#f6eeea]">
          <div className="relative w-full h-full min-h-[460px]">
            {heroImagenes.map((img, idx) => (
              <div
                key={img.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
                  activeSlide === idx
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f8ece8]/40 to-[#f8ece8]" />
              </div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: TEXTO PROMOCIONAL Y BOTÓN DE COMPRA */}
        <div className="col-span-6 p-10 lg:p-12 text-center flex flex-col items-center justify-center space-y-6 relative z-10 bg-[#f8ece8]/70 backdrop-blur-xs">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#8c6b5d] font-julius text-xs font-bold tracking-widest uppercase border border-[#ebd3cb] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c29486]" />
            <span>COMPRA HOY &amp; RECIBE HOY</span>
          </span>

          <div className="space-y-2">
            <h1 className="font-lemon text-5xl lg:text-7xl text-[#5c4a42] tracking-wide uppercase leading-tight drop-shadow-xs">
              {heroData?.nombre || slideActual.titulo}
            </h1>
            <p className="text-sm font-poppins text-[#786055] font-medium leading-relaxed max-w-sm mx-auto">
              Detalles únicos y desayunos sorpresa preparados artesanalmente para entregar el mismo día.
            </p>
          </div>

          <div className="pt-2 w-full max-w-xs space-y-3">
            <a
              href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20comprar%20para%20entrega%20hoy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8c6b5d] to-[#785b4f] hover:from-[#5c4a42] hover:to-[#3a2e28] text-white font-julius font-bold text-sm tracking-widest uppercase shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4.5 h-4.5 text-emerald-300 fill-emerald-300/20" />
              <span>COMPRA AQUÍ</span>
            </a>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#8c6b5d] font-poppins font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Envíos rápidos a Barranquilla y Soledad</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
