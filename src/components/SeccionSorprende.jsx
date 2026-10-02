'use client';

import { useState, useEffect } from "react";

const fotos = [
  {
    id: 1,
    src: "/images/Rosado.png",
    alt: "Sorpresa especial Adetallesbq Rosado",
  },
  {
    id: 2,
    src: "/images/Mujer.png",
    alt: "Modelo sosteniendo regalo Adetallesbq",
  },
];

export default function SeccionSorprende() {
  const [activeSlide, setActiveSlide] = useState(0);
  const imagenGraphic = "https://res.cloudinary.com/enwlpozz/image/upload/Elegante.png";

  // Auto-play de 6 segundos en bucle con desvanecimiento suave (fade transition)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % fotos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* CINTA SEPARADORA SUPERIOR: "SORPRENDE A LOS QUE MÁS QUIERES" */}
      <div className="text-center px-4">
        <div className="inline-block px-10 sm:px-14 py-1.5 sm:py-2 rounded-none bg-[#F5CCD6] text-[#614539] font-julius text-sm sm:text-base tracking-wider shadow-sm border-none uppercase font-bold">
          SORPRENDE A LOS QUE MÁS QUIERES
        </div>
      </div>

      {/* CAJA UNIFICADA JUNTA (SIN SEPARACIÓN, SIN FLECHAS, SIN EFECTO HOVER DE SALTO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-white shadow-xl shadow-xs overflow-hidden border border-zinc-200/40 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* LADO IZQUIERDO: IMAGEN GRÁFICA ELEGANTE QUE LLEGA DE BORDE A BORDE (MISMO TAMAÑO QUE LA DERECHA) */}
          <div className="lg:col-span-6 relative overflow-hidden bg-zinc-50 min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] group">
            <img
              src={imagenGraphic}
              alt="El regalo perfecto está a solo un clic - Descubre nuestros ramos de rosas desde $85.000"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            {/* ÚNICO BOTÓN FUNCIONAL: "AGENDAR" SUPERPUESTO */}
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center px-4">
              <a
                href="https://wa.me/573004633576?text=Hola%20Adetallesbq,%20quisiera%20agendar%20un%20ramo%20de%20rosas%20en%20mi%20sorpresa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-3.5 sm:px-12 sm:py-4 rounded-full bg-white/95 hover:bg-[#F5CCD6] text-[#614539] hover:text-[#614539] font-julius font-bold text-xs tracking-widest uppercase border border-zinc-200 shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                AGENDAR
              </a>
            </div>
          </div>

          {/* LADO DERECHO: IMAGEN QUE SE TRANSFORMA/DESVANECES EN OTRA (EFECTO CROSS-FADE SUAVE) */}
          <div className="lg:col-span-6 relative overflow-hidden bg-zinc-50 min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">
            {/* CONTENEDOR DE IMÁGENES SUPERPUESTAS EN CROSS-FADE */}
            <div className="relative w-full h-full min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">
              {fotos.map((foto, idx) => (
                <div
                  key={foto.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-[1800ms] ease-in-out ${
                    activeSlide === idx
                      ? "opacity-100 z-10 pointer-events-auto"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={foto.src}
                    alt={foto.alt}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

