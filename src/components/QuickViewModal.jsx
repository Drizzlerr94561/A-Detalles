'use client';

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingBag, Sparkles, MessageCircle, Plus, Minus, Check, Heart, Gift, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";

const formatPrecio = (precio) => {
  if (!precio && precio !== 0) return "";
  const num = Number(precio);
  if (isNaN(num) || num === 0) return "$0";
  return `$${num.toLocaleString("es-CO")}`;
};

const renderDescripcionFormateada = (desc) => {
  if (!desc) {
    return (
      <p className="text-xs sm:text-sm text-[#614539] leading-relaxed font-poppins font-medium">
        Detalle artesanal único preparado con los mejores ingredientes y presentación de lujo.
      </p>
    );
  }

  // 1. Dividir primero por saltos de línea (\n), viñetas (•, *, -), o la palabra DESCRIPCIÓN
  let lineas = desc
    .split(/(?:\r?\n|•|\*|\bDESCRIPCIÓN\b)/i)
    .map((s) => s.replace(/^[\.\,\-\*\•\s]+/, '').trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== 'descripción');

  // 2. Si es un texto plano en 1 sola línea, intentar separar por comas o por puntos si es una lista
  if (lineas.length <= 1) {
    const partes = desc
      .split(/(?:,|\.(?=\s+[A-Z0-9ÁÉÍÓÚÑ\*\-]))/)
      .map((s) => s.replace(/^[\.\,\-\*\•\s]+/, '').trim())
      .filter((s) => s.length > 0 && s.toLowerCase() !== 'descripción');

    if (partes.length > 1) {
      lineas = partes;
    }
  }

  if (lineas.length <= 1) {
    return (
      <div className="flex items-start gap-2 text-xs sm:text-sm text-[#614539] font-poppins font-medium">
        <span className="text-[#614539] font-bold text-sm shrink-0 leading-none mt-0.5">•</span>
        <span className="leading-relaxed">{desc}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 my-2">
      <span className="text-[11px] font-bold text-[#614539] uppercase tracking-wider block font-julius mb-1">
        📦 Contenido y Detalles:
      </span>
      <ul className="space-y-1.5 text-xs sm:text-sm text-[#614539] font-poppins font-medium max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {lineas.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-[#614539] font-bold text-sm shrink-0 leading-none mt-0.5">•</span>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function QuickViewModal({ producto, imagen, isOpen, onClose }) {
  const { agregarProducto, abrirCarrito } = useCart();
  const modalRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const [cantidad, setCantidad] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [colorRosas, setColorRosas] = useState("Rosas Rojas");
  const [numFotosCuadro, setNumFotosCuadro] = useState(1);
  const [colorFondoSpotify, setColorFondoSpotify] = useState("Fondo Negro");
  const [opcionAlbumFotos, setOpcionAlbumFotos] = useState("15 fotos");
  const [nombreTermoMug, setNombreTermoMug] = useState("");
  const [tamanoPelucheCombo, setTamanoPelucheCombo] = useState("40 cm");
  const [adicionalesLista, setAdicionalesLista] = useState([]);
  const [adicionalesSel, setAdicionalesSel] = useState({});
  const [mensajeTarjeta, setMensajeTarjeta] = useState("");
  const [filtroAdicional, setFiltroAdicional] = useState("TODOS");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar lista de adicionales desde la API
  useEffect(() => {
    if (!isOpen) return;
    setCantidad(1);
    setSelectedImageIndex(0);
    setColorRosas("Rosas Rojas");
    setNumFotosCuadro(1);
    setColorFondoSpotify("Fondo Negro");
    setOpcionAlbumFotos("15 fotos");
    setNombreTermoMug("");
    setTamanoPelucheCombo("40 cm");
    setAdicionalesSel({});
    setMensajeTarjeta("");
    setFiltroAdicional("TODOS");

    const cargarAdicionales = async () => {
      try {
        const res = await fetch("/api/admin/adicionales");
        if (res.ok) {
          const data = await res.json();
          setAdicionalesLista(data || []);
        }
      } catch (e) {
        console.error("Error al cargar adicionales:", e);
      }
    };
    cargarAdicionales();
  }, [isOpen]);

  // Bloquear scroll y escuchar Escape / clic afuera
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !producto || !mounted) return null;

  const listaFotosRaw = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes.filter(Boolean)
    : [imagenMostrar];
  const listaFotos = Array.from(new Set(listaFotosRaw));
  const fotoActual = listaFotos[selectedImageIndex] || listaFotos[0] || imagenMostrar;

  // Detección exhaustiva de tipos de productos especiales
  const catLimpia = (producto.categoria || "").toLowerCase();
  const nomLimpio = (producto.nombre || "").toLowerCase();
  const descLimpia = (producto.descripcion || "").toLowerCase();

  // 🌹 ELECCIÓN DE ROSAS A GUSTO PROPIO (SOLO PRODUCTOS QUE LO INDICAN EN SU DESCRIPCIÓN)
  const permiteEleccionRosas =
    descLimpia.includes("color de rosa a elección") ||
    descLimpia.includes("color de rosa a eleccion") ||
    descLimpia.includes("color a elección del cliente") ||
    descLimpia.includes("color a eleccion del cliente") ||
    descLimpia.includes("colores a elección") ||
    descLimpia.includes("colores a eleccion") ||
    descLimpia.includes("dos o tres colores de rosas") ||
    descLimpia.includes("color de rosa a elección del cliente") ||
    descLimpia.includes("rosas a gusto propio") ||
    descLimpia.includes("color a elección") ||
    descLimpia.includes("color a eleccion");

  // 🖼️ CUADROS Y ÁLBUMES
  const esCuadro1FotoYFrase = nomLimpio.includes("cuadro 1 foto y frase");
  const esSpotifyNegro = nomLimpio.includes("cuadro spotify") || nomLimpio.includes("spotify");
  const esAlbumFotos = nomLimpio.includes("álbum de fotos") || nomLimpio.includes("album de fotos");
  
  // 📸 DETECCIÓN DE PRODUCTOS QUE REQUIEREN FOTOS DEL CLIENTE
  const requiereFotosCliente =
    esAlbumFotos ||
    esCuadro1FotoYFrase ||
    esSpotifyNegro ||
    nomLimpio.includes("cuadro") ||
    nomLimpio.includes("álbum") ||
    nomLimpio.includes("album") ||
    nomLimpio.includes("foto") ||
    descLimpia.includes("foto") ||
    descLimpia.includes("fotos");
  
  // 🧸 PELUCHES CON OPCIÓN DE LONGITUD/TAMAÑO DE 2 OPCIONES
  const esPeluche4045 = descLimpia.includes("40-45cm") || descLimpia.includes("40 - 45cm") || descLimpia.includes("40 a 45cm") || nomLimpio.includes("girasoles peluche");
  const esPeluche5060 = descLimpia.includes("50-60cm") || descLimpia.includes("50 - 60cm") || descLimpia.includes("50 a 60cm");
  const esPeluche7080 = descLimpia.includes("70-80cm") || descLimpia.includes("70 - 80cm") || descLimpia.includes("70 a 80cm");

  const esPelucheRango = esPeluche4045 || esPeluche5060 || esPeluche7080;
  const opcionesPelucheRango = esPeluche4045
    ? ["40 cm", "45 cm"]
    : esPeluche5060
    ? ["50 cm", "60 cm"]
    : esPeluche7080
    ? ["70 cm", "80 cm"]
    : [];

  // ✍️ TERMOS, MUGS Y PERSONALIZACIÓN DE TEXTO
  const esTermoOMug =
    nomLimpio.includes("mug") ||
    nomLimpio.includes("termo") ||
    descLimpia.includes("termo") ||
    descLimpia.includes("taza") ||
    descLimpia.includes("mug");

  const requiereTexto =
    !catLimpia.includes("llavero") &&
    !esTermoOMug &&
    (nomLimpio.includes("cuadro 1 foto") ||
      descLimpia.includes("vaso decorado con frase") ||
      descLimpia.includes("frase que desees") ||
      descLimpia.includes("globo burbuja personalizado marcado"));

  // Cálculo de precios dinámicos
  const precioOriginal = Number(producto.precio) || 0;
  const precioExtraAlbum = esAlbumFotos
    ? opcionAlbumFotos === "20 fotos"
      ? 8000
      : opcionAlbumFotos === "30 fotos"
      ? 35000
      : 0
    : 0;

  // Cálculo de suma de adicionales seleccionados
  const precioAdicionalesSum = adicionalesLista.reduce((acc, ad) => {
    if (adicionalesSel[ad.id]) {
      return acc + (Number(ad.precio) || 0);
    }
    return acc;
  }, 0);

  const numAdicionalesSeleccionados = Object.values(adicionalesSel).filter(Boolean).length;

  const precioUnitarioFinal = precioOriginal + precioExtraAlbum + precioAdicionalesSum;
  const precioTotalFinal = precioUnitarioFinal * cantidad;

  const toggleAdicional = (id) => {
    setAdicionalesSel((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Categorías automáticas para filtrar adicionales
  const categoriasChips = ["TODOS"];
  adicionalesLista.forEach((ad) => {
    const nom = (ad.nombre || "").toLowerCase();
    if (nom.includes("globo") && !categoriasChips.includes("Globos")) categoriasChips.push("Globos");
    if ((nom.includes("choco") || nom.includes("dulce")) && !categoriasChips.includes("Chocolates")) categoriasChips.push("Chocolates");
    if (nom.includes("peluche") && !categoriasChips.includes("Peluches")) categoriasChips.push("Peluches");
    if ((nom.includes("vino") || nom.includes("bebida") || nom.includes("espumoso")) && !categoriasChips.includes("Bebidas")) categoriasChips.push("Bebidas");
    if ((nom.includes("luz") || nom.includes("tarjeta") || nom.includes("decor")) && !categoriasChips.includes("Detalles")) categoriasChips.push("Detalles");
  });

  const adicionalesFiltrados = adicionalesLista.filter((ad) => {
    if (filtroAdicional === "TODOS") return true;
    const nom = (ad.nombre || "").toLowerCase();
    if (filtroAdicional === "Globos") return nom.includes("globo");
    if (filtroAdicional === "Chocolates") return nom.includes("choco") || nom.includes("dulce");
    if (filtroAdicional === "Peluches") return nom.includes("peluche");
    if (filtroAdicional === "Bebidas") return nom.includes("vino") || nom.includes("bebida") || nom.includes("espumoso");
    if (filtroAdicional === "Detalles") return nom.includes("luz") || nom.includes("tarjeta") || nom.includes("decor");
    return true;
  });

  const handleAgregarAlPedido = () => {
    const nombresAdicionales = adicionalesLista
      .filter((ad) => adicionalesSel[ad.id])
      .map((ad) => ad.nombre);

    const productoPersonalizado = {
      id: `${producto.id || producto.nombre}_${colorRosas}_${numFotosCuadro}_${colorFondoSpotify}_${Date.now()}`,
      nombre: producto.nombre,
      precio: precioUnitarioFinal,
      imagen: imagenMostrar,
      categoria: producto.categoria,
      cantidad,
      colorRosas: permiteEleccionRosas ? (colorRosas.trim() || undefined) : undefined,
      numFotosCuadro: esCuadro1FotoYFrase ? numFotosCuadro : undefined,
      colorFondoSpotify: esSpotifyNegro ? colorFondoSpotify : undefined,
      opcionAlbumFotos: esAlbumFotos ? opcionAlbumFotos : undefined,
      nombreTermoMug: (esTermoOMug || requiereTexto) ? (nombreTermoMug.trim() || undefined) : undefined,
      tamanoPelucheCombo: esPelucheRango ? tamanoPelucheCombo : undefined,
      adicionales: nombresAdicionales,
      mensajeTarjeta: mensajeTarjeta.trim() || undefined,
    };

    agregarProducto(productoPersonalizado, cantidad);
    onClose();
    abrirCarrito();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-1 sm:p-2 md:p-3 overflow-y-auto cursor-pointer">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#F5CCD6]/65 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-[1550px] w-[98vw] h-[95vh] max-h-[96vh] border border-zinc-200 shadow-2xl overflow-hidden z-20 my-auto transform transition-all duration-300 animate-scaleUp cursor-default flex flex-col"
      >
        {/* BOTÓN DE CIERRE FLOTANTE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-[#F5CCD6] text-[#614539] hover:text-[#614539] transition-all duration-300 flex items-center justify-center shadow-lg border border-zinc-200 cursor-pointer"
          title="Cerrar vista rápida"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto min-h-0 h-full">
          {/* FOTO DESTACADA CON TIRA DE MINIATURAS (THUMBNAILS) INFERIOR */}
          <div className="lg:col-span-6 relative h-[450px] sm:h-[580px] lg:h-full lg:min-h-[650px] bg-white overflow-hidden flex flex-col items-center justify-between p-3 sm:p-5 md:p-6">
            
            {/* FOTO PRINCIPAL ACTUAL */}
            <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden my-auto min-h-0">
              <img
                src={fotoActual}
                alt={producto.nombre}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full max-h-[640px] object-contain drop-shadow-sm transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* TIRA DE MINIATURAS INFERIOR (SI TIENE MÁS DE 1 FOTO) */}
            {listaFotos.length > 1 && (
              <div className="w-full pt-3 shrink-0 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-1">
                {listaFotos.map((imgUrl, imgIdx) => (
                  <button
                    key={imgIdx}
                    type="button"
                    onClick={() => setSelectedImageIndex(imgIdx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === imgIdx
                        ? "border-[#774354] ring-2 ring-[#F5CCD6] scale-105 shadow-md"
                        : "border-zinc-200 opacity-70 hover:opacity-100 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Vista ${imgIdx + 1}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover object-center"
                    />
                    {/* Indicador de foto activa estilo línea inferior */}
                    {selectedImageIndex === imgIdx && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-[#774354]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETALLES Y OPCIONES DE PERSONALIZACIÓN */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white via-[#fef8fa] to-white overflow-y-auto">
            <div className="space-y-6">
              
              {/* ENCABEZADO Y PRECIO */}
              <div className="space-y-2 border-b border-zinc-200 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-50 text-[#614539] text-[11px] font-bold tracking-widest uppercase border border-zinc-200">
                    <Sparkles className="w-3.5 h-3.5 text-[#614539]" />
                    <span>PERSONALIZA TU REGALO</span>
                  </span>

                  <span className="font-julius text-2xl sm:text-3xl text-[#614539]">
                    {formatPrecio(precioUnitarioFinal)}
                  </span>
                </div>

                <h2 className="font-julius text-2xl sm:text-3xl text-[#614539] leading-tight">
                  {producto.nombre}
                </h2>

                {renderDescripcionFormateada(producto.descripcion)}
              </div>

              {/* 🌹 SELECCIÓN DE COLOR DE ROSAS (SOLO PARA PRODUCTOS QUE PERMITEN ELEGIR ROSAS A GUSTO SEGÚN DESCRIPCIÓN) */}
              {permiteEleccionRosas && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider block flex items-center gap-1.5">
                    <span>🌹</span> Elige el Color de las Rosas a tu gusto:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      "Rosas Rojas",
                      "Rosas Rosadas",
                      "Rosas Blancas",
                      "Rosas Amarillas",
                      "Combinadas (2 Tonalidades)",
                    ].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColorRosas(col)}
                        className={`px-3.5 py-2 rounded-full text-xs font-poppins font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                          colorRosas === col
                            ? "bg-[#F5CCD6] text-[#614539] border-[#774354] shadow-md scale-105"
                            : "bg-white text-[#614539] border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        <span>🌹 {col}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={colorRosas}
                    onChange={(e) => setColorRosas(e.target.value)}
                    placeholder="O especifica la combinación de colores deseada..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-[#614539] placeholder-[#96586c] focus:outline-none focus:ring-2 focus:ring-[#d48c9f] shadow-xs mt-1"
                  />
                </div>
              )}

              {/* 🖼️ SELECTOR DE NÚMERO DE FOTOS (CUADROS) */}
              {esCuadro1FotoYFrase && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🖼️</span> ¿Cuántas fotos deseas incluir? (Hasta 12)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-[#614539] font-poppins text-xs font-bold border border-zinc-200 shadow-xs">
                      {numFotosCuadro} {numFotosCuadro === 1 ? "Foto" : "Fotos"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-4 py-1.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setNumFotosCuadro(Math.max(1, numFotosCuadro - 1))}
                        className="p-1 text-[#614539] hover:text-[#614539] font-bold transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-julius text-base text-[#614539] w-8 text-center font-bold">
                        {numFotosCuadro}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNumFotosCuadro(Math.min(12, numFotosCuadro + 1))}
                        className="p-1 text-[#614539] hover:text-[#614539] font-bold transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-[#614539] font-poppins italic">
                      Puedes incluir desde 1 hasta 12 imágenes.
                    </span>
                  </div>
                </div>
              )}

              {/* 🖤 SELECTOR DE COLOR DE FONDO (CUADRO SPOTIFY) */}
              {esSpotifyNegro && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider block">
                    🎨 Elige el Color de Fondo del Cuadro:
                  </span>
                  <div className="flex items-center gap-3">
                    {["Fondo Negro", "Fondo Blanco"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setColorFondoSpotify(color)}
                        className={`px-4 py-2 rounded-full text-xs font-poppins font-bold border transition cursor-pointer flex items-center gap-2 ${
                          colorFondoSpotify === color
                            ? "bg-[#F5CCD6] text-[#614539] border-[#774354] shadow-md scale-105"
                            : "bg-white text-[#614539] border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        <span>{color === "Fondo Negro" ? "⚫" : "⚪"}</span>
                        <span>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 📖 SELECTOR DE TAMAÑO / FOTOS EN ÁLBUM DE FOTOS */}
              {esAlbumFotos && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider block">
                    📸 Elige la cantidad de fotos para tu álbum:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: "15 Fotos", val: "15 fotos", precioTxt: "$45.000" },
                      { label: "20 Fotos", val: "20 fotos", precioTxt: "$53.000" },
                      { label: "30 Fotos", val: "30 fotos", precioTxt: "$80.000" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setOpcionAlbumFotos(opt.val)}
                        className={`px-4 py-2.5 rounded-full text-xs font-poppins font-bold border transition cursor-pointer flex items-center gap-2 ${
                          opcionAlbumFotos === opt.val
                            ? "bg-[#F5CCD6] text-[#614539] border-[#774354] shadow-md scale-105"
                            : "bg-white text-[#614539] border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        <span>📖 {opt.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px]">
                          {opt.precioTxt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 📲 AVISO DE ENVÍO DE FOTOS AL WHATSAPP (SOLO PRODUCTOS QUE REQUIEREN FOTOS DEL CLIENTE) */}
              {requiereFotosCliente && (
                <div className="p-3.5 rounded-2xl bg-[#fff5f7] border border-[#f3cad5] text-[#614539] shadow-xs">
                  <p className="text-xs sm:text-sm font-poppins text-[#614539] font-bold leading-relaxed">
                    <u><strong>Enviar las fotos correspondientes al WhatsApp</strong></u>
                  </p>
                </div>
              )}

              {/* 🧸 SELECTOR DE TAMAÑO DE PELUCHE (SOLO SI TIENE RANGO EN DESCRIPCIÓN) */}
              {esPelucheRango && opcionesPelucheRango.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider block">
                    🧸 Elige la longitud o tamaño exacto del peluche:
                  </span>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {opcionesPelucheRango.map((tam) => (
                      <button
                        key={tam}
                        type="button"
                        onClick={() => setTamanoPelucheCombo(tam)}
                        className={`px-4 py-2 rounded-full text-xs font-poppins font-bold border transition cursor-pointer flex items-center gap-2 ${
                          tamanoPelucheCombo === tam
                            ? "bg-[#F5CCD6] text-[#614539] border-[#774354] shadow-md scale-105"
                            : "bg-white text-[#614539] border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        <span>🧸 {tam}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ✍️ CAMPO DE NOMBRE PERSONALIZADO PARA TERMOS, MUGS, CUADROS O GLOBOS */}
              {(esTermoOMug || requiereTexto) && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-2 shadow-xs">
                  <label className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider block flex items-center gap-1.5">
                    <span>✍️</span> Nombre, texto o frase personalizada:
                  </label>
                  <input
                    type="text"
                    value={nombreTermoMug}
                    onChange={(e) => setNombreTermoMug(e.target.value)}
                    placeholder="Ej: Sofía, Carlos, Te amo mi vida, Papá Campeón..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-[#614539] placeholder-[#96586c] focus:outline-none focus:ring-2 focus:ring-[#d48c9f] shadow-xs"
                  />
                  <p className="text-[11px] text-[#614539] font-poppins italic">
                    Escribe el nombre, fecha o frase exacta que deseas incluir.
                  </p>
                </div>
              )}

              {/* 🎁 ADICIONALES OPCIONALES */}
              {adicionalesLista.length > 0 && (
                <div className="space-y-3 pt-1 bg-white p-4 rounded-2xl border border-zinc-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4.5 h-4.5 text-[#614539]" />
                      <span className="font-julius font-bold text-xs sm:text-sm text-[#614539] uppercase tracking-wider">
                        Adicionales Opcionales:
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white text-[#614539] font-poppins text-xs font-bold border border-zinc-200 shadow-xs">
                      {numAdicionalesSeleccionados > 0
                        ? `${numAdicionalesSeleccionados} agregados (+${formatPrecio(precioAdicionalesSum)})`
                        : `${adicionalesLista.length} disponibles`}
                    </span>
                  </div>

                  {/* FILTROS RÁPIDOS SI HAY MÁS DE 4 ADICIONALES */}
                  {categoriasChips.length > 2 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
                      {categoriasChips.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFiltroAdicional(cat)}
                          className={`px-3 py-1 rounded-full text-[11px] font-poppins font-semibold transition shrink-0 cursor-pointer ${
                            filtroAdicional === cat
                              ? "bg-[#F5CCD6] text-[#614539] shadow-xs"
                              : "bg-white text-[#614539] border border-zinc-200 hover:bg-zinc-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CONTENEDOR DESLIZANTE CON ALTURA MÁXIMA CONTROLADA */}
                  <div className="max-h-56 sm:max-h-64 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {adicionalesFiltrados.map((ad) => {
                        const selected = Boolean(adicionalesSel[ad.id]);
                        return (
                          <button
                            key={ad.id}
                            type="button"
                            onClick={() => toggleAdicional(ad.id)}
                            className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2.5 cursor-pointer ${
                              selected
                                ? "bg-zinc-50 border-[#d48c9f] text-[#614539] shadow-sm ring-2 ring-[#d48c9f]/30"
                                : "bg-white border-zinc-200 text-[#614539] hover:bg-white hover:border-[#d48c9f]/50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                selected ? "bg-[#F5CCD6] text-[#614539] border-[#96586c] text-[#614539]" : "border-zinc-200 bg-white"
                              }`}>
                                {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-poppins font-semibold text-[#614539] leading-snug break-words">
                                {ad.nombre}
                              </span>
                            </div>

                            {Number(ad.precio) > 0 ? (
                              <span className="text-[11px] font-bold text-[#614539] font-poppins shrink-0 bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-200">
                                +{formatPrecio(ad.precio)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                Gratis
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {adicionalesLista.length > 4 && (
                    <p className="text-[10px] text-center text-[#614539] font-poppins italic">
                      ↕️ Desliza hacia abajo dentro del recuadro para explorar todos los {adicionalesLista.length} adicionales disponibles.
                    </p>
                  )}
                </div>
              )}

              {/* DEDICATORIA OPCIONAL */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <label className="text-xs font-julius font-bold text-[#614539] uppercase tracking-wider block flex items-center gap-2">
                  <span>💌</span> Mensaje o Dedicatoria para la tarjeta (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={mensajeTarjeta}
                  onChange={(e) => setMensajeTarjeta(e.target.value)}
                  placeholder="Escribe tu dedicatoria especial aquí (ej: ¡Feliz cumpleaños mi amor! Te amo)..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-zinc-200 text-xs sm:text-sm text-[#614539] placeholder-[#96586c] focus:outline-none focus:ring-2 focus:ring-[#d48c9f] focus:bg-white transition shadow-xs resize-none"
                />
              </div>

              {/* SELECTOR DE CANTIDAD DEL PRODUCTO */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                <span className="text-xs sm:text-sm font-julius font-bold uppercase tracking-wider text-[#614539]">
                  Cantidad de regalos:
                </span>
                <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-full px-4 py-1.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="p-1 text-[#614539] hover:text-[#614539] transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-julius text-base text-[#614539] w-6 text-center">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad(cantidad + 1)}
                    className="p-1 text-[#614539] hover:text-[#614539] transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* BOTÓN CONTINUAR CON EL PEDIDO */}
            <div className="pt-4 border-t border-zinc-200/70 space-y-2.5">
              <button
                type="button"
                onClick={handleAgregarAlPedido}
                className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#614539] font-julius font-bold text-xs sm:text-sm uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-none"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#614539]" />
                  <span>PERSONALIZAR Y PEDIR</span>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-white text-[#614539] font-poppins text-xs sm:text-sm font-extrabold shrink-0 border border-[#614539]/20 shadow-xs">
                  {formatPrecio(precioTotalFinal)}
                </span>
              </button>

              <a
                href={`https://wa.me/573004633576?text=Hola%20A%E2%80%99Detalles,%20quisiera%20encargar%20el%20producto:%20${encodeURIComponent(producto.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-zinc-50 text-[#614539] font-julius font-bold text-xs uppercase tracking-widest border border-zinc-200 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Pedir directo por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
