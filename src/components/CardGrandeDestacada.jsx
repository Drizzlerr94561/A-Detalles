'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const destacadas = [
  {
    id: 1,
    tag: "Ambientación & Decoración",
    nombre: "Escenario",
    descripcion:
      "Decoración de cumpleaños y cenas de fin de año personalizadas. Creamos ambientes únicos para celebraciones íntimas o eventos empresariales, cuidando cada detalle para que tu cena sea inolvidable.",
    imagen: "https://res.cloudinary.com/enwlpozz/image/upload/v1789706794/adetallesbq/banners/escenario.jpg",
  },
  {
    id: 2,
    tag: "Desayuno Gourmet Especial",
    nombre: "Desayuno Premium",
    descripcion:
      "Sorprende con un desayuno delicioso, este desayuno contiene un croissant de la casa con un mini pincho de chorizo y butifarra en el airfyer, un parfait con yogurt, granola, fresa y un toque de kiwi, jugo de naranja natural decorado, unas galletas tosh, unos canapés de jamón y queso con dedito horneado y un chocolate Ferrero. Todo presentado en una box que incluye decoración, cubiertos de lujo y tarjeta con mensaje.",
    imagen: "https://res.cloudinary.com/enwlpozz/image/upload/v1789706770/adetallesbq/banners/caja_mas_comida.jpg",
  },
  {
    id: 3,
    tag: "Cuadros & Recuerdos",
    nombre: "Diseño",
    descripcion:
      "Detalle que quede para siempre, sorprende a tu pareja, amigos o familia con un cuadro personalizado lleno de recuerdos y emociones.",
    imagen: "https://res.cloudinary.com/enwlpozz/image/upload/v1789706787/adetallesbq/branding/dise_o.jpg",
  },
];

export default function CardGrandeDestacada() {
  const [activeSlide, setActiveSlide] = useState(0);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? destacadas.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === destacadas.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative rounded-3xl bg-white shadow-xl shadow-xs overflow-hidden border border-zinc-200/40"
    >
      {/* TRACK DESLIZANTE CONTROLADO MANUALMENTE */}
      <div
        className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transform: `translateX(-${activeSlide * 100}%)`,
        }}
      >
        {destacadas.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px] lg:min-h-[370px]"
          >
            {/* LADO IZQUIERDO: Imagen grande con insignia y puntos de navegación integrados */}
            <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[330px] lg:min-h-[370px] bg-zinc-50 overflow-hidden group">
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
              <span className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#482e24] text-[10px] sm:text-[11px] font-bold tracking-widest uppercase shadow-md border border-zinc-200 font-poppins flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F5CCD6] animate-pulse" />
                Experiencia Destacada
              </span>
            </div>

            {/* LADO DERECHO: Descripción amplia con botón 'Ver más' renovado */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-white to-white">
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-[#482e24] tracking-widest uppercase block mb-1 font-poppins">
                    {item.tag}
                  </span>
                  <h2 className="font-julius text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4a2e38] uppercase leading-tight">
                    {item.nombre}
                  </h2>
                </div>

                <p className="text-sm sm:text-base lg:text-lg text-[#482e24] leading-relaxed font-poppins font-medium">
                  {item.descripcion}
                </p>
              </div>

              {/* BOTÓN 'VER MÁS' MEJORADO Y CONTROLES MANUALES */}
              <div className="pt-4 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-white to-zinc-100 hover:bg-[#EFBAC7] text-[#4a2e38] hover:text-white font-julius font-extrabold text-xs sm:text-sm tracking-widest uppercase border border-zinc-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group/btn cursor-pointer"
                >
                  <span className="tracking-wider">VER MÁS</span>
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                </Link>

                {/* SELECTOR MANUAL DE EXPERIENCIAS */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-[#aa9083] border border-zinc-200 flex items-center justify-center transition-all cursor-pointer"
                    title="Experiencia Anterior"
                    aria-label="Experiencia Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5 px-1">
                    {destacadas.map((exp, dotIdx) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => setActiveSlide(dotIdx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeSlide === dotIdx
                            ? "w-6 bg-[#aa9083]"
                            : "w-2 bg-zinc-200 hover:bg-zinc-300"
                        }`}
                        title={exp.nombre}
                        aria-label={`Ver ${exp.nombre}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-[#aa9083] border border-zinc-200 flex items-center justify-center transition-all cursor-pointer"
                    title="Siguiente Experiencia"
                    aria-label="Siguiente Experiencia"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





