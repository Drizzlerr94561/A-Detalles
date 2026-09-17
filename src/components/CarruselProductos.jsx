'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import {
  productosDefecto,
  productosEdicionEspecial,
  obtenerImagenProducto,
  obtenerImagenEdicionEspecial,
} from "@/lib/productosDefecto";

import QuickViewModal from "@/components/QuickViewModal";
import { Eye, Sparkles } from "lucide-react";

const formatPrecio = (precio) => {
  if (!precio && precio !== 0) return "";
  const num = Number(precio);
  if (isNaN(num) || num === 0) return "";
  return `$${num.toLocaleString("es-CO")}`;
};

export default function CarruselProductos({ productos, tipoColeccion = "default" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isHovered, setIsHovered] = useState(false);

  // Estado para el modal de vista rápida
  const [modalProd, setModalProd] = useState(null);
  const [modalImg, setModalImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const abrirModal = (prod, i) => {
    setModalProd(prod);
    setModalImg(funcionImagen(prod, i));
    setIsModalOpen(true);
  };

  // Seleccionar la colección y función de imagen según el prop tipoColeccion
  const esEspecial = tipoColeccion === "edicionEspecial";
  const coleccionFallback = esEspecial ? productosEdicionEspecial : productosDefecto;
  const funcionImagen = esEspecial ? obtenerImagenEdicionEspecial : obtenerImagenProducto;

  // Usar los productos pasados por props (de la DB) o la colección de respaldo
  let baseProductos =
    productos && productos.length > 0
      ? [...productos]
      : coleccionFallback;

  if (baseProductos.length > 0) {
    while (baseProductos.length < 12) {
      baseProductos = [...baseProductos, ...baseProductos];
    }
  }

  // Lista extendida con clones al final para permitir bucle infinito continuo sin rebobinar
  const extendedProductos = [...baseProductos, ...baseProductos.slice(0, 4)];

  // Detectar breakpoints de forma dinámica (3 en escritorio, 2 en dispositivos móviles y tablets)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play exacto de 7.0 segundos continuo de 1 en 1 sin jamás rebobinar
  useEffect(() => {
    if (baseProductos.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, [baseProductos.length, isHovered]);

  const handleTransitionEnd = () => {
    if (currentIndex >= baseProductos.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex % baseProductos.length);
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

  if (!baseProductos || baseProductos.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-[#faf6f4] border border-dashed border-[#e8c7bd]">
        <ShoppingBag className="w-10 h-10 mx-auto text-[#c29486] mb-3 animate-bounce" />
        <h3 className="font-semibold text-base text-[#5c4a42]">
          Tu catálogo de productos está listo
        </h3>
        <p className="text-xs text-[#8c6b5d] max-w-sm mx-auto mt-1 mb-4 font-source">
          Agrega tus primeros desayunos sorpresa desde la sección de productos.
        </p>
      </div>
    );
  }

  const prev = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(baseProductos.length);
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(baseProductos.length - 1);
      }, 50);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const next = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  // Cálculo matemático exacto para desplazamiento item por item (1 tarjeta a la vez)
  const getTransformStyle = () => {
    if (itemsPerPage === 3) {
      // 3 tarjetas visibles, gap-6 (24px): 1 desplazamiento = 33.3333% + 8px
      return `translateX(calc(-${currentIndex} * (100% / 3 + 8px)))`;
    } else {
      // 2 tarjetas visibles (móvil y tablet), gap-3 (12px): 1 desplazamiento = 50% + 6px
      return `translateX(calc(-${currentIndex} * (50% + 6px)))`;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group/carousel px-1 sm:px-2 py-2"
    >
      {/* Botones de navegación manual */}
      {baseProductos.length > itemsPerPage && (
        <>
          <button
            onClick={prev}
            className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#8c6b5d] shadow-xl border border-[#ebd3cb] hover:bg-[#f8ece8] hover:text-[#5c4a42] flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
            title="Tarjeta Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={next}
            className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#8c6b5d] shadow-xl border border-[#ebd3cb] hover:bg-[#f8ece8] hover:text-[#5c4a42] flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
            title="Siguiente Tarjeta"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* CONTENEDOR MÁSCARA */}
      <div className="overflow-hidden rounded-3xl p-0.5 sm:p-1">
        {/* TRACK DESLIZANTE INFINITO CONTINUO ITEM POR ITEM */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex gap-3 md:gap-5 lg:gap-6 w-full ${
            isTransitioning
              ? "transition-transform duration-[2500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
              : "transition-none"
          }`}
          style={{
            transform: getTransformStyle(),
          }}
        >
          {extendedProductos.map((prod, i) => (
            <div
              key={`${prod.id}-${i}`}
              className="w-[calc((100%-12px)/2)] md:w-[calc((100%-20px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 group rounded-2xl sm:rounded-3xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden border border-[#ebd3cb]/40 transform hover:-translate-y-2 p-2.5 sm:p-5 lg:p-6 min-h-[340px] sm:min-h-[520px] lg:min-h-[640px]"
            >
              {/* FOTOGRAFÍA CON MARGEN INTERNO Y BOTÓN VISTA RÁPIDA */}
              <div
                onClick={() => abrirModal(prod, i)}
                className="h-36 sm:h-72 lg:h-[380px] bg-[#f6eeea] relative rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shrink-0 cursor-pointer"
              >
                <img
                  src={funcionImagen(prod, i)}
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/95 text-[#8c6b5d] font-julius font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5 sm:gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-[#ebd3cb]">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c29486]" />
                    <span className="hidden sm:inline">Vista Rápida</span>
                    <span className="sm:hidden">Ver</span>
                  </span>
                </div>
                <span className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 text-[#8c6b5d] text-[8px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs border border-[#ebd3cb]/60 font-poppins max-w-[90%] truncate">
                  {prod.etiqueta || prod.categoria}
                </span>
              </div>

              {/* DETALLE DEL PRODUCTO */}
              <div className="pt-3 sm:pt-5 pb-1 sm:pb-2 px-0.5 sm:px-1 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                <div onClick={() => abrirModal(prod, i)} className="cursor-pointer space-y-1 sm:space-y-2">
                  <h3 className="font-lemon text-xs sm:text-lg lg:text-xl text-[#5c4a42] group-hover:text-[#c29486] transition-colors duration-300 leading-snug line-clamp-2">
                    {prod.nombre}
                  </h3>
                  {prod.descripcion && (
                    <p className="text-[10px] sm:text-xs text-[#786055] leading-relaxed font-source line-clamp-2">
                      {prod.descripcion}
                    </p>
                  )}
                </div>

                {/* BOTÓN PEDIR CON PRECIO INCLUIDO */}
                <div className="pt-2 sm:pt-3.5 border-t border-[#ebd3cb]/40 flex justify-center items-center">
                  <Link
                    href="/productos"
                    className="w-full inline-flex items-center justify-between px-2.5 sm:px-6 py-2 sm:py-3.5 rounded-full bg-[#f8ece8] hover:bg-[#c29486] text-[#8c6b5d] hover:text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-xs hover:shadow-lg border border-[#ebd3cb] group/btn"
                    title="Ver en el Catálogo"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 shrink-0" />
                      <span>Pedir</span>
                    </div>
                    {formatPrecio(prod.precio) && (
                      <span className="px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#8c6b5d]/15 group-hover/btn:bg-white/25 text-[#8c6b5d] group-hover/btn:text-white font-poppins text-[10px] sm:text-xs font-extrabold tracking-wide transition-colors border border-[#8c6b5d]/20 group-hover/btn:border-white/30 shrink-0">
                        {formatPrecio(prod.precio)}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EMERGENTE DE VISTA RÁPIDA (QUICK VIEW) */}
      <QuickViewModal
        producto={modalProd}
        imagen={modalImg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}









