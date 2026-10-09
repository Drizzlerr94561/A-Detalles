'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Sparkles } from "lucide-react";
import {
  obtenerImagenProducto,
  obtenerImagenEdicionEspecial,
} from "@/lib/productosDefecto";
import QuickViewModal from "@/components/QuickViewModal";

const formatPrecio = (precio) => {
  if (!precio && precio !== 0) return "";
  const num = Number(precio);
  if (isNaN(num) || num === 0) return "";
  return `$${num.toLocaleString("es-CO")}`;
};

// Función para intercalar productos por categorías de forma defensiva
const intercalarPorCategorias = (lista) => {
  if (!Array.isArray(lista) || lista.length === 0) return [];
  const grupos = {};
  lista.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const cat = item.categoria || "General";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(item);
  });

  const categorias = Object.keys(grupos);
  const resultado = [];
  let maxLen = 0;
  categorias.forEach((c) => {
    if (grupos[c] && grupos[c].length > maxLen) maxLen = grupos[c].length;
  });

  for (let i = 0; i < maxLen; i++) {
    for (const cat of categorias) {
      if (grupos[cat] && grupos[cat][i]) {
        resultado.push(grupos[cat][i]);
      }
    }
  }
  return resultado;
};

export default function CarruselProductos({ productos = [], tipoColeccion = "default" }) {
  const scrollRef = useRef(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  // Estado para el modal de vista rápida
  const [modalProd, setModalProd] = useState(null);
  const [modalImg, setModalImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Seleccionar la colección y función de imagen según el prop tipoColeccion
  const esEspecial = tipoColeccion === "edicionEspecial";
  const funcionImagen = esEspecial ? obtenerImagenEdicionEspecial : obtenerImagenProducto;

  // Memorizar la lista intercalada
  const baseProductos = useMemo(() => {
    try {
      const baseRaw = Array.isArray(productos) ? productos : [];
      return intercalarPorCategorias(baseRaw);
    } catch (e) {
      console.error("Error al procesar baseProductos:", e);
      return [];
    }
  }, [productos]);

  // Función para desplazar hacia un índice específico
  const scrollToIndex = (index) => {
    const container = scrollRef.current;
    if (!container || !baseProductos || baseProductos.length === 0) return;

    const firstCard = container.querySelector('div');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 300;
    const gap = 20;
    const targetScroll = index * (cardWidth + gap);

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const prev = () => {
    pausarInteraccionTemporal();
    const prevIdx = currentIndex === 0 ? baseProductos.length - 1 : currentIndex - 1;
    scrollToIndex(prevIdx);
  };

  const next = () => {
    pausarInteraccionTemporal();
    const nextIdx = (currentIndex + 1) % baseProductos.length;
    scrollToIndex(nextIdx);
  };

  const pausarInteraccionTemporal = () => {
    setIsUserInteracting(true);
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 4000);
  };

  // Navegación manual por el usuario (sin temporizador de auto-scroll o reinicio al inicio para evitar saltos indeseados)

  const abrirModal = (prod, i) => {
    setModalProd(prod);
    setModalImg(funcionImagen(prod, i));
    setIsModalOpen(true);
  };

  if (!baseProductos || baseProductos.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-white border border-zinc-200">
        <ShoppingBag className="w-10 h-10 mx-auto text-[#614539] mb-3 animate-bounce" />
        <h3 className="font-semibold text-base text-[#614539]">
          Tu catálogo de productos está listo
        </h3>
        <p className="text-xs text-[#614539] max-w-sm mx-auto mt-1 mb-4 font-poppins">
          Agrega tus primeros regalos sorpresa desde la sección de productos.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group/carousel px-1 sm:px-2 py-2">
      {/* CONTENEDOR DESLIZANTE CON SCROLL SNAP NATIVO (120FPS GPU ACCELERATED) */}
      <div
        ref={scrollRef}
        onTouchStart={pausarInteraccionTemporal}
        onMouseDown={pausarInteraccionTemporal}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-1 -mx-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {baseProductos.map((prod, i) => {
          if (!prod) return null;
          return (
            <div
              key={`${prod.id || 'prod'}-${i}`}
              className="w-[82%] sm:w-[46%] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start group rounded-2xl sm:rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-zinc-200/60 p-3.5 sm:p-5 lg:p-6 min-h-[460px] sm:min-h-[550px] lg:min-h-[620px]"
            >
              {/* FOTOGRAFÍA A TAMAÑO COMPLETO SIN DEGRADADOS */}
              <div
                onClick={() => abrirModal(prod, i)}
                className="h-64 sm:h-[310px] lg:h-[390px] bg-white relative rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group/img"
              >
                {/* Foto principal nítida a tamaño completo */}
                <img
                  src={funcionImagen(prod, i)}
                  alt={prod.nombre || "Producto"}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-[#F5CCD6]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20">
                  <span className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-white/95 text-[#614539] font-julius font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg flex items-center gap-1.5 sm:gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-zinc-200">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#614539]" />
                    <span className="hidden sm:inline">Vista Rápida</span>
                    <span className="sm:hidden">Ver</span>
                  </span>
                </div>

                {/* ETIQUETA / CATEGORÍA (TOP LEFT) */}
                <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 px-2.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[#482e24] text-[8px] sm:text-[9px] font-bold tracking-wider uppercase shadow-xs border border-zinc-200 font-poppins max-w-[85%] truncate pointer-events-none">
                  {prod.etiqueta || prod.categoria || "Detalle"}
                </span>
              </div>

              {/* DETALLE DEL PRODUCTO */}
              <div className="pt-2 sm:pt-3 pb-1 px-0.5 sm:px-1 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5">
                <div onClick={() => abrirModal(prod, i)} className="cursor-pointer space-y-1">
                  <h3 className="font-julius text-xs sm:text-base lg:text-lg font-bold text-[#4a2e38] transition-colors duration-300 leading-snug line-clamp-2">
                    {prod.nombre}
                  </h3>
                  {prod.descripcion && (
                    <p className="text-xs text-[#482e24] font-medium leading-relaxed font-poppins line-clamp-2">
                      {prod.descripcion}
                    </p>
                  )}
                </div>

                {/* PRECIO Y BOTÓN "PERSONALIZAR Y PEDIR" */}
                <div className="pt-2 sm:pt-2.5 border-t border-zinc-200/40 flex flex-col items-center gap-1.5 sm:gap-2">
                  {formatPrecio(prod.precio) && (
                    <span className="px-3.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#F5CCD6] text-[#4a2e38] font-poppins text-xs font-extrabold shadow-xs border border-white/20 tracking-tight">
                      {formatPrecio(prod.precio)}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => abrirModal(prod, i)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#F5CCD6] text-[#4a2e38] hover:bg-[#EFBAC7] text-[9px] sm:text-[11px] font-julius font-bold tracking-wider uppercase transition-all duration-300 shadow-xs border-none group/btn cursor-pointer"
                    title="Personalizar y encargar este regalo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#4a2e38] shrink-0" />
                    <span className="truncate">Personalizar y Pedir</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTONES DE NAVEGACIÓN MANUAL (DEBAJO DE LAS CARDS) */}
      {baseProductos.length > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 pb-1">
          <button
            type="button"
            onClick={prev}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#614539] shadow-md border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Tarjeta Anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#614539] shadow-md border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Siguiente Tarjeta"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* MODAL EMERGENTE DE VISTA RÁPIDA */}
      <QuickViewModal
        producto={modalProd}
        imagen={modalImg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
