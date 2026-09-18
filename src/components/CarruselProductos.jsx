'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Sparkles } from "lucide-react";
import {
  productosDefecto,
  productosEdicionEspecial,
  obtenerImagenProducto,
  obtenerImagenEdicionEspecial,
} from "@/lib/productosDefecto";
import { catalogoOficial } from "@/lib/catalogoOficial";

import QuickViewModal from "@/components/QuickViewModal";

const formatPrecio = (precio) => {
  if (!precio && precio !== 0) return "";
  const num = Number(precio);
  if (isNaN(num) || num === 0) return "";
  return `$${num.toLocaleString("es-CO")}`;
};

// Función para intercalar productos por categorías y garantizar máxima variedad visual en el carrusel
const intercalarPorCategorias = (lista) => {
  if (!lista || lista.length === 0) return [];
  const grupos = {};
  lista.forEach((item) => {
    const cat = item.categoria || "General";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(item);
  });

  const categorias = Object.keys(grupos);
  const resultado = [];
  let maxLen = 0;
  categorias.forEach((c) => {
    if (grupos[c].length > maxLen) maxLen = grupos[c].length;
  });

  for (let i = 0; i < maxLen; i++) {
    for (const cat of categorias) {
      if (grupos[cat][i]) {
        resultado.push(grupos[cat][i]);
      }
    }
  }
  return resultado;
};

export default function CarruselProductos({ productos = [], tipoColeccion = "default" }) {
  const productosFinales = Array.isArray(productos) && productos.length > 0 ? productos : catalogoOficial;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isHovered, setIsHovered] = useState(false);


  // Estado para el modal de vista rápida (Personalizar y Pedir)
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

  // Usar los productos de la DB o el respaldo
  let baseRaw =
    productosFinales && productosFinales.length > 0
      ? [...productosFinales]
      : coleccionFallback;


  // Intercalar por categoría para garantizar variedad en cada posición del carrusel
  let baseProductos = intercalarPorCategorias(baseRaw);

  if (baseProductos.length > 0) {
    while (baseProductos.length < 12) {
      baseProductos = [...baseProductos, ...baseProductos];
    }
  }

  // Lista extendida para permitir bucle infinito continuo
  const extendedProductos = [...baseProductos, ...baseProductos.slice(0, 4)];

  // Detectar breakpoints de forma dinámica (3 en escritorio, 2 en móviles)
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

  // Auto-play continuo
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
          Agrega tus primeros regalos sorpresa desde la sección de productos.
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

  const getTransformStyle = () => {
    if (itemsPerPage === 3) {
      return `translateX(calc(-${currentIndex} * (100% / 3 + 8px)))`;
    } else {
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
            className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#8c6b5d] shadow-xl border border-[#ebd3cb] hover:bg-[#f8ece8] hover:text-[#5c4a42] flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Tarjeta Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={next}
            className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#8c6b5d] shadow-xl border border-[#ebd3cb] hover:bg-[#f8ece8] hover:text-[#5c4a42] flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Siguiente Tarjeta"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* CONTENEDOR MÁSCARA */}
      <div className="overflow-hidden rounded-3xl p-0.5 sm:p-1">
        {/* TRACK DESLIZANTE INFINITO */}
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
              {/* FOTOGRAFÍA CON RENDERIZADO COMPLETO 100% SIN RECORTES */}
              <div
                onClick={() => abrirModal(prod, i)}
                className="h-44 sm:h-72 lg:h-[380px] bg-gradient-to-b from-[#faf6f4] via-[#f8ece8]/60 to-[#f3e8e3]/80 relative rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shrink-0 cursor-pointer p-2 sm:p-3.5 group/img"
              >
                {/* Fondo difuminado ambiental suave */}
                <img
                  src={funcionImagen(prod, i)}
                  alt=""
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-110 pointer-events-none"
                />
                
                {/* Foto principal 100% visible sin ningún recorte */}
                <img
                  src={funcionImagen(prod, i)}
                  alt={prod.nombre}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 max-w-full max-h-full object-contain drop-shadow-md group-hover/img:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/95 text-[#8c6b5d] font-julius font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5 sm:gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-[#ebd3cb]">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c29486]" />
                    <span className="hidden sm:inline">Vista Rápida</span>
                    <span className="sm:hidden">Ver</span>
                  </span>
                </div>
                <span className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[#8c6b5d] text-[8px] sm:text-[10px] font-bold tracking-wider uppercase shadow-md border border-[#ebd3cb] font-poppins max-w-[85%] truncate pointer-events-none">
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

                {/* BOTÓN REAL "PERSONALIZAR Y PEDIR" CON PRECIO */}
                <div className="pt-2 sm:pt-3.5 border-t border-[#ebd3cb]/40 flex justify-center items-center">
                  <button
                    type="button"
                    onClick={() => abrirModal(prod, i)}
                    className="w-full inline-flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white text-[10px] sm:text-xs font-julius font-bold tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-lg border border-[#785b4f] group/btn cursor-pointer"
                    title="Personalizar y encargar este regalo"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ebd3cb] shrink-0" />
                      <span>Personalizar y Pedir</span>
                    </div>
                    {formatPrecio(prod.precio) && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-white font-poppins text-[10px] sm:text-xs font-extrabold border border-white/30 shrink-0 ml-1">
                        {formatPrecio(prod.precio)}
                      </span>
                    )}
                  </button>
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
