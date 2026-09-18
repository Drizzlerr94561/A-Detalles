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

export default function SeccionSorprende({ tarjetasIniciales = [] }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const tarjetaGraphic = tarjetasIniciales.find((t) => t.clave === "card_sorprende_graphic");
  const imagenGraphic = tarjetaGraphic?.imagen || "/images/graphic_left.jpg";

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
        <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs">
          SORPRENDE A LOS QUE MÁS QUIERES
        </div>
      </div>

      {/* CAJA UNIFICADA JUNTA (SIN SEPARACIÓN, SIN FLECHAS, SIN EFECTO HOVER DE SALTO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-white shadow-xl shadow-palorosa-500/10 overflow-hidden border border-[#ebd3cb]/40 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* LADO IZQUIERDO: IMAGEN GRÁFICA ORIGINAL Y BOTÓN AGENDAR */}
          <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-between text-center bg-white min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">
            {/* IMAGEN GRÁFICA ORIGINAL */}
            <div className="flex-1 flex items-center justify-center w-full my-auto overflow-hidden rounded-2xl">
              <img
                src={imagenGraphic}
                alt="Haz tu sorpresa aún más especial - Añade un ramo de rosas desde $49.000"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full max-w-lg h-auto object-contain mx-auto"
              />
            </div>

            {/* ÚNICO BOTÓN FUNCIONAL: "AGENDAR" */}
            <div className="pt-4 pb-2 w-full flex justify-center">
              <a
                href="https://wa.me/573106629289?text=Hola%20Adetallesbq,%20quisiera%20agendar%20un%20ramo%20de%20rosas%20en%20mi%20sorpresa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-12 py-4 rounded-full bg-[#f4dcd3] hover:bg-[#c29486] text-[#8c6b5d] hover:text-white font-julius font-bold text-xs tracking-widest uppercase border border-[#ebd3cb] shadow-md transition-colors duration-300"
              >
                AGENDAR
              </a>
            </div>
          </div>

          {/* LADO DERECHO: IMAGEN QUE SE TRANSFORMA/DESVANECES EN OTRA (EFECTO CROSS-FADE SUAVE) */}
          <div className="lg:col-span-6 relative overflow-hidden bg-[#f6eeea] min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">
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

