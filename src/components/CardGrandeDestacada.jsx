'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const destacadas = [
  {
    id: 1,
    tag: "Ambientación & Decoración",
    nombre: "Escenario",
    descripcion:
      "Decoración de cumpleaños y cenas de fin de año personalizadas. Creamos ambientes únicos para celebraciones íntimas o eventos empresariales, cuidando cada detalle para que tu cena sea inolvidable.",
    imagen: "/images/Escenario.png",
  },
  {
    id: 2,
    tag: "Desayuno Gourmet Especial",
    nombre: "Caja más comida",
    descripcion:
      "Sorprende con un desayuno delicioso, este desayuno contiene un croissant de la casa con un mini pincho de chorizo y butifarra en el airfyer, un parfait con yogurt, granola, fresa y un toque de kiwi, jugo de naranja natural decorado, unas galletas tosh, unos canapés de jamón y queso con dedito horneado y un chocolate Ferrero. Todo presentado en una box que incluye decoración, cubiertos de lujo y tarjeta con mensaje.",
    imagen: "/images/Caja mas comida.png",
  },
  {
    id: 3,
    tag: "Cuadros & Recuerdos",
    nombre: "Diseño",
    descripcion:
      "Detalle que quede para siempre, sorprende a tu pareja, amigos o familia con un cuadro personalizado lleno de recuerdos y emociones.",
    imagen: "/images/Diseño.png",
  },
];

export default function CardGrandeDestacada() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicamos el listado para el bucle infinito continuo sin rebobinado
  const extendedDestacadas = [...destacadas, ...destacadas];


  // Auto-play continuo cada 9.0 segundos
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => prev + 1);
    }, 9000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleTransitionEnd = () => {
    if (activeSlide >= destacadas.length) {
      setIsTransitioning(false);
      setActiveSlide(activeSlide % destacadas.length);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);


  const realActiveIndex = activeSlide % destacadas.length;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-3xl bg-white shadow-xl shadow-palorosa-500/10 overflow-hidden border border-[#ebd3cb]/40"
    >
      {/* TRACK DESLIZANTE INFINITO Y CONTINUO */}
      <div
        onTransitionEnd={handleTransitionEnd}
        className={`flex w-full ${
          isTransitioning
            ? "transition-transform duration-[2500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            : "transition-none"
        }`}
        style={{
          transform: `translateX(-${activeSlide * 100}%)`,
        }}
      >
        {extendedDestacadas.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px] lg:min-h-[370px]"
          >
            {/* LADO IZQUIERDO: Imagen grande con insignia y puntos de navegación integrados */}
            <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[330px] lg:min-h-[370px] bg-[#f6eeea] overflow-hidden group">
              <img
                src={item.imagen}
                alt={item.nombre}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* Insignia 'Experiencia Destacada' */}
              <span className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#8c6b5d] text-[10px] sm:text-[11px] font-bold tracking-widest uppercase shadow-md border border-[#ebd3cb] font-poppins flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c29486] animate-pulse" />
                Experiencia Destacada
              </span>
            </div>

            {/* LADO DERECHO: Descripción amplia con botón 'Ver más' renovado */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 bg-gradient-to-br from-[#faf6f4] via-white to-white">
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-[#c29486] tracking-widest uppercase block mb-1 font-poppins">
                    {item.tag}
                  </span>
                  <h2 className="font-lemon text-2xl sm:text-3xl lg:text-4xl text-[#5c4a42] uppercase leading-tight">
                    {item.nombre}
                  </h2>
                </div>

                <p className="text-sm sm:text-base lg:text-lg text-[#786055] leading-relaxed font-source font-medium">
                  {item.descripcion}
                </p>
              </div>

              {/* BOTÓN 'VER MÁS' MEJORADO */}
              <div className="pt-4 border-t border-[#ebd3cb]/80 flex items-center justify-start">
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-[#f8ece8] to-[#f4dcd3] hover:from-[#c29486] hover:to-[#8c6b5d] text-[#8c6b5d] hover:text-white font-julius font-extrabold text-xs sm:text-sm tracking-widest uppercase border border-[#ebd3cb] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group/btn cursor-pointer"
                >
                  <span className="tracking-wider">VER MÁS</span>
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





