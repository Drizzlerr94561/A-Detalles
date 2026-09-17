'use client';

import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const resenas = [
  {
    id: 1,
    nombre: "Valeria Nieves",
    avatar: "/images/promo_right_1.jpg",
    categoria: "Arreglos Florales & Rosas",
    calificacion: 5,
    comentario: "El bouquet de rosas de exportación llegó fresco y con una presentación hermosísima. Cuidan cada detalle de las flores y la cinta satinada.",
  },
  {
    id: 2,
    nombre: "Jey Sastoque",
    avatar: "/images/promo_right_2.jpg",
    categoria: "Peluches & Detalles",
    calificacion: 5,
    comentario: "Pedí un peluche afelpado gigante junto con una caja de bombones. El osito es super suave y la atención por WhatsApp fue rápida y amable.",
  },
  {
    id: 3,
    nombre: "Ashly Navas",
    avatar: "/images/hero_banner_palorosa.jpg",
    categoria: "Cuadros Personalizados",
    calificacion: 5,
    comentario: "Encargué un cuadro personalizado de recuerdos para nuestro aniversario. La calidad del marco y la nitidez de las fotos superó mis expectativas.",
  },
  {
    id: 4,
    nombre: "Camila Rodriguez",
    avatar: "/images/promo_right_1.jpg",
    categoria: "Catálogo de Decoraciones",
    calificacion: 5,
    comentario: "Contraté la ambientación de escenario para un cumpleaños en Barranquilla. Dejaron el espacio como de revista, un servicio impecable.",
  },
  {
    id: 5,
    nombre: "Mariana Gomez",
    avatar: "/images/promo_right_2.jpg",
    categoria: "Regalos Sorpresa y Desayunos",
    calificacion: 5,
    comentario: "El desayuno gourmet mañanero venía muy fresco y delicioso. El empaque artesanal y la tarjeta con mensaje quedaron perfectos.",
  },
  {
    id: 6,
    nombre: "Daniela Perez",
    avatar: "/images/hero_banner_palorosa.jpg",
    categoria: "Catálogo Flores Amarillas",
    calificacion: 5,
    comentario: "Pedí la cajita de flores amarillas y girasoles con guirnalda de luces LED. Quedó espectacular, la persona que lo recibió quedó fascinada.",
  },
];

export default function ResenasClientes() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cambio automatico de resenas cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resenas.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + resenas.length) % resenas.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resenas.length);
  };

  return (
    <section className="w-full space-y-8 pt-4">
      {/* CINTA SEPARADORA CON TIPOGRAFÍA AGBALUMO */}
      <div className="text-center px-4">
        <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs">
          LO QUE DICEN NUESTROS CLIENTES
        </div>
      </div>

      {/* CONTENEDOR DE RESEÑAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* GRID DE CARDS VISIBLES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {[0, 1, 2].map((offset) => {
            const index = (currentIndex + offset) % resenas.length;
            const resena = resenas[index];
            return (
              <div
                key={`${resena.id}-${offset}`}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/50 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* CABECERA DE LA RESEÑA */}
                <div>
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#f4e6e1]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#f4dcd3] bg-[#f8ece8]">
                        <img
                          src={resena.avatar}
                          alt={resena.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-poppins font-bold text-sm text-[#5c4a42]">
                          {resena.nombre}
                        </h4>
                        <div className="flex items-center gap-1 my-0.5">
                          {[...Array(resena.calificacion)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium text-[#a88d81] block">
                          {resena.categoria}
                        </span>
                      </div>
                    </div>

                    {/* COMILLAS DECORATIVAS SIN EMOJIS */}
                    <Quote className="w-7 h-7 text-[#d6bba7]/40 shrink-0 transform rotate-180" />
                  </div>

                  {/* TEXTO DEL COMENTARIO (SIN EMOJIS NI SIGNOS DE EXCLAMACION) */}
                  <p className="pt-4 text-xs sm:text-sm text-[#786055] leading-relaxed font-source">
                    {resena.comentario}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* INDICADORES Y NAVEGACIÓN */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-white text-[#8c6b5d] hover:bg-[#f8ece8] flex items-center justify-center border border-[#ebd3cb] shadow-xs transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {resenas.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-7 bg-[#8c6b5d]" : "w-2.5 bg-[#ebd3cb]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-white text-[#8c6b5d] hover:bg-[#f8ece8] flex items-center justify-center border border-[#ebd3cb] shadow-xs transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
