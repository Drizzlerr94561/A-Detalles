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
      <p className="text-xs sm:text-sm text-[#786055] leading-relaxed font-source font-medium">
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
      <div className="flex items-start gap-2 text-xs sm:text-sm text-[#786055] font-source font-medium">
        <span className="text-[#8c6b5d] font-bold text-sm shrink-0 leading-none mt-0.5">•</span>
        <span className="leading-relaxed">{desc}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 my-2">
      <span className="text-[11px] font-bold text-[#5c4a42] uppercase tracking-wider block font-julius mb-1">
        📦 Contenido y Detalles:
      </span>
      <ul className="space-y-1.5 text-xs sm:text-sm text-[#786055] font-source font-medium max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {lineas.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-[#8c6b5d] font-bold text-sm shrink-0 leading-none mt-0.5">•</span>
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
  const [numRosas, setNumRosas] = useState(12);
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
    setNumRosas(12);
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

  const imagenMostrar = imagen || producto.imagen || "/images/Desayuno.png";

  // Detección de tipos de productos especiales
  const catLimpia = (producto.categoria || "").toLowerCase();
  const nomLimpio = (producto.nombre || "").toLowerCase();
  const descLimpia = (producto.descripcion || "").toLowerCase();

  const esFlores =
    catLimpia.includes("flor") ||
    catLimpia.includes("rosa") ||
    catLimpia.includes("ramo") ||
    nomLimpio.includes("rosa") ||
    nomLimpio.includes("ramo") ||
    nomLimpio.includes("girasol") ||
    nomLimpio.includes("flor") ||
    nomLimpio.includes("tulipan") ||
    nomLimpio.includes("arreglo");

  const esCuadro1FotoYFrase = nomLimpio.includes("cuadro 1 foto y frase");
  const esSpotifyNegro = nomLimpio.includes("cuadro spotify fondo negro");
  const esAlbumFotos = nomLimpio === "álbum de fotos" || nomLimpio === "album de fotos";
  
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

  const esTermoOMug =
    nomLimpio.includes("mug") ||
    nomLimpio.includes("termo") ||
    descLimpia.includes("termo") ||
    descLimpia.includes("taza") ||
    descLimpia.includes("mug");

  const requiereTexto =
    !catLimpia.includes("llavero") &&
    (nomLimpio.includes("cuadro") ||
      catLimpia.includes("cuadro") ||
      descLimpia.includes("frase") ||
      descLimpia.includes("texto") ||
      descLimpia.includes("canción") ||
      descLimpia.includes("estrofa") ||
      descLimpia.includes("párrafo") ||
      descLimpia.includes("título") ||
      descLimpia.includes("dedicatoria") ||
      descLimpia.includes("nombres") ||
      descLimpia.includes("fecha") ||
      nomLimpio.includes("globo burbuja"));

  // Cálculo de precios dinámicos
  const precioOriginal = Number(producto.precio) || 0;
  const precioExtraRosas = esFlores && numRosas > 12 ? (numRosas - 12) * 3500 : 0;
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

  const precioUnitarioFinal = precioOriginal + precioExtraRosas + precioExtraAlbum + precioAdicionalesSum;
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
      id: `${producto.id || producto.nombre}_${numRosas}_${numFotosCuadro}_${colorFondoSpotify}_${Date.now()}`,
      nombre: producto.nombre,
      precio: precioUnitarioFinal,
      imagen: imagenMostrar,
      categoria: producto.categoria,
      cantidad,
      numRosas: esFlores ? numRosas : undefined,
      numFotosCuadro: esCuadro1FotoYFrase ? numFotosCuadro : undefined,
      colorFondoSpotify: esSpotifyNegro ? colorFondoSpotify : undefined,
      opcionAlbumFotos: esAlbumFotos ? opcionAlbumFotos : undefined,
      nombreTermoMug: esTermoOMug ? nombreTermoMug.trim() || undefined : undefined,
      tamanoPelucheCombo: esPelucheRango ? tamanoPelucheCombo : undefined,
      adicionales: nombresAdicionales,
      mensajeTarjeta: mensajeTarjeta.trim() || undefined,
    };

    agregarProducto(productoPersonalizado, cantidad);
    onClose();
    abrirCarrito();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#3a2e28]/65 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl max-w-4xl sm:max-w-5xl w-full border border-[#ebd3cb] shadow-2xl overflow-hidden z-20 my-auto transform transition-all duration-300 animate-scaleUp cursor-default max-h-[92vh] flex flex-col"
      >
        {/* BOTÓN DE CIERRE FLOTANTE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-[#8c6b5d] text-[#8c6b5d] hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg border border-[#ebd3cb] cursor-pointer"
          title="Cerrar vista rápida"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* FOTO COMPLETA SIN RECORTES CON FONDO DIFUMINADO Y SOMBRA ELEGANTE */}
          <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full lg:min-h-[520px] bg-[#3a2e28] overflow-hidden flex items-center justify-center p-4">
            {/* Imagen de fondo difuminada para llenar los bordes sin dejar huecos vacíos */}
            <img
              src={imagenMostrar}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

            {/* Imagen principal NÍTIDA en object-contain: MUESTRA EL 100% DEL PRODUCTO SIN CORTAR NI UN MILÍMETRO */}
            <img
              src={imagenMostrar}
              alt={producto.nombre}
              className="relative z-10 w-full h-full max-h-[460px] object-contain drop-shadow-2xl rounded-2xl transform hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute bottom-5 left-5 right-5 text-white space-y-1 z-20 pointer-events-none">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/90 block font-poppins">
                {producto.etiqueta || producto.categoria || "EDICIÓN ESPECIAL"}
              </span>
              <h4 className="font-lemon text-xl sm:text-2xl text-white drop-shadow-md leading-tight">
                {producto.nombre}
              </h4>
            </div>
          </div>

          {/* DETALLES Y OPCIONES DE PERSONALIZACIÓN ESPACIOSAS (7 COLUMNAS EN ESCRITORIO) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white via-[#faf6f4] to-white">
            <div className="space-y-6">
              
              {/* ENCABEZADO Y PRECIO */}
              <div className="space-y-2 border-b border-[#f4e6e1] pb-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f8ece8] text-[#8c6b5d] text-[11px] font-bold tracking-widest uppercase border border-[#ebd3cb]">
                    <Sparkles className="w-3.5 h-3.5 text-[#c29486]" />
                    <span>PERSONALIZA TU REGALO</span>
                  </span>

                  <span className="font-lemon text-2xl sm:text-3xl text-[#8c6b5d]">
                    {formatPrecio(precioUnitarioFinal)}
                  </span>
                </div>

                <h2 className="font-lemon text-2xl sm:text-3xl text-[#5c4a42] leading-tight">
                  {producto.nombre}
                </h2>

                {renderDescripcionFormateada(producto.descripcion)}
              </div>



              {/* 🖼️ SELECTOR DE NÚMERO DE FOTOS (CUADRO 1 FOTO Y FRASE) */}
              {esCuadro1FotoYFrase && (
                <div className="p-4 rounded-2xl bg-[#f8ece8]/80 border border-[#ebd3cb] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-julius font-bold text-xs sm:text-sm text-[#5c4a42] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🖼️</span> ¿Cuántas fotos deseas incluir? (Hasta 12)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-[#8c6b5d] font-poppins text-xs font-bold border border-[#ebd3cb] shadow-xs">
                      {numFotosCuadro} {numFotosCuadro === 1 ? "Foto" : "Fotos"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-2 bg-white border border-[#ebd3cb] rounded-full px-4 py-1.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setNumFotosCuadro(Math.max(1, numFotosCuadro - 1))}
                        className="p-1 text-[#8c6b5d] hover:text-[#5c4a42] font-bold transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-lemon text-base text-[#5c4a42] w-8 text-center font-bold">
                        {numFotosCuadro}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNumFotosCuadro(Math.min(12, numFotosCuadro + 1))}
                        className="p-1 text-[#8c6b5d] hover:text-[#5c4a42] font-bold transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-[#8c6b5d] font-poppins italic">
                      Puedes incluir desde 1 hasta 12 imágenes.
                    </span>
                  </div>
                </div>
              )}

              {/* 🖤 SELECTOR DE COLOR DE FONDO (CUADRO SPOTIFY FONDO NEGRO) */}
              {esSpotifyNegro && (
                <div className="p-4 rounded-2xl bg-[#f8ece8]/80 border border-[#ebd3cb] space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#5c4a42] uppercase tracking-wider block">
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
                            ? "bg-[#8c6b5d] text-white border-[#785b4f] shadow-md scale-105"
                            : "bg-white text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f4dcd3]"
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
                <div className="p-4 rounded-2xl bg-[#f8ece8]/80 border border-[#ebd3cb] space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#5c4a42] uppercase tracking-wider block">
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
                            ? "bg-[#8c6b5d] text-white border-[#785b4f] shadow-md scale-105"
                            : "bg-white text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f4dcd3]"
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

              {/* 🧸 SELECTOR DE TAMAÑO DE PELUCHE PARA COMBOS LUXURY */}
              {esPelucheRango && (
                <div className="p-4 rounded-2xl bg-[#f8ece8]/80 border border-[#ebd3cb] space-y-3 shadow-xs">
                  <span className="font-julius font-bold text-xs sm:text-sm text-[#5c4a42] uppercase tracking-wider block">
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
                            ? "bg-[#8c6b5d] text-white border-[#785b4f] shadow-md scale-105"
                            : "bg-white text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f4dcd3]"
                        }`}
                      >
                        <span>🧸 {tam}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ✍️ CAMPO DE NOMBRE PERSONALIZADO PARA TERMOS Y MUGS */}
              {esTermoOMug && (
                <div className="p-4 rounded-2xl bg-[#f8ece8]/80 border border-[#ebd3cb] space-y-2 shadow-xs">
                  <label className="font-julius font-bold text-xs sm:text-sm text-[#5c4a42] uppercase tracking-wider block flex items-center gap-1.5">
                    <span>✍️</span> Nombre o texto para personalizar tu Termo / Taza:
                  </label>
                  <input
                    type="text"
                    value={nombreTermoMug}
                    onChange={(e) => setNombreTermoMug(e.target.value)}
                    placeholder="Ej: Sofía, Carlos, Papá Campeón..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] shadow-xs"
                  />
                  <p className="text-[11px] text-[#8c6b5d] font-poppins italic">
                    Escribe el nombre o palabra exacta que deseas grabado en tu termo o taza.
                  </p>
                </div>
              )}

              {/* 🎁 ADICIONALES OPCIONALES (CON CONTENEDOR DESLIZANTE Y FILTROS POR CATEGORÍA) */}
              {adicionalesLista.length > 0 && (
                <div className="space-y-3 pt-1 bg-[#faf6f4] p-4 rounded-2xl border border-[#ebd3cb]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4.5 h-4.5 text-[#c29486]" />
                      <span className="font-julius font-bold text-xs sm:text-sm text-[#5c4a42] uppercase tracking-wider">
                        Adicionales Opcionales:
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white text-[#8c6b5d] font-poppins text-xs font-bold border border-[#ebd3cb] shadow-xs">
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
                              ? "bg-[#8c6b5d] text-white shadow-xs"
                              : "bg-white text-[#8c6b5d] border border-[#ebd3cb] hover:bg-[#f8ece8]"
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
                                ? "bg-[#f8ece8] border-[#c29486] text-[#5c4a42] shadow-sm ring-2 ring-[#c29486]/30"
                                : "bg-white border-[#ebd3cb] text-[#786055] hover:bg-[#faf6f4] hover:border-[#c29486]/50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                selected ? "bg-[#8c6b5d] border-[#8c6b5d] text-white" : "border-[#ebd3cb] bg-white"
                              }`}>
                                {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-poppins font-semibold text-[#5c4a42] leading-snug break-words">
                                {ad.nombre}
                              </span>
                            </div>

                            {Number(ad.precio) > 0 ? (
                              <span className="text-[11px] font-bold text-[#8c6b5d] font-poppins shrink-0 bg-[#f8ece8] px-2 py-0.5 rounded-full border border-[#ebd3cb]">
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
                    <p className="text-[10px] text-center text-[#a88d81] font-poppins italic">
                      ↕️ Desliza hacia abajo dentro del recuadro para explorar todos los {adicionalesLista.length} adicionales disponibles.
                    </p>
                  )}
                </div>
              )}

              {/* DEDICATORIA OPCIONAL */}
              <div className="space-y-2 pt-2 border-t border-[#f4e6e1]">
                <label className="text-xs font-julius font-bold text-[#5c4a42] uppercase tracking-wider block flex items-center gap-2">
                  <span>💌</span> Mensaje o Dedicatoria para la tarjeta (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={mensajeTarjeta}
                  onChange={(e) => setMensajeTarjeta(e.target.value)}
                  placeholder="Escribe tu dedicatoria especial aquí (ej: ¡Feliz cumpleaños mi amor! Te amo)..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition shadow-xs resize-none"
                />
              </div>

              {/* SELECTOR DE CANTIDAD DEL PRODUCTO */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f4e6e1]">
                <span className="text-xs sm:text-sm font-julius font-bold uppercase tracking-wider text-[#5c4a42]">
                  Cantidad de regalos:
                </span>
                <div className="flex items-center gap-3 bg-[#faf6f4] border border-[#ebd3cb] rounded-full px-4 py-1.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="p-1 text-[#8c6b5d] hover:text-[#5c4a42] transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-lemon text-base text-[#5c4a42] w-6 text-center">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad(cantidad + 1)}
                    className="p-1 text-[#8c6b5d] hover:text-[#5c4a42] transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* BOTÓN CONTINUAR CON EL PEDIDO */}
            <div className="pt-4 border-t border-[#ebd3cb]/70 space-y-2.5">
              <button
                type="button"
                onClick={handleAgregarAlPedido}
                className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#785b4f]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Continuar con el pedido</span>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-white/20 text-white font-poppins text-xs sm:text-sm font-bold shrink-0">
                  {formatPrecio(precioTotalFinal)}
                </span>
              </button>

              <a
                href={`https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20encargar%20el%20producto:%20${encodeURIComponent(producto.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#faf6f4] hover:bg-[#f8ece8] text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-widest border border-[#ebd3cb] transition cursor-pointer"
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
