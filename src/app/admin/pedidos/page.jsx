'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Loader2,
  RefreshCw,
  Package,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Heart,
  MessageCircle,
  Filter,
  Clock,
  X,
  CalendarDays,
  Trash2,
} from "lucide-react";

export default function AdminPedidosPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Estados de filtrado por fecha
  const [filtroFechaTipo, setFiltroFechaTipo] = useState("todos"); // 'todos' | 'hoy' | 'ayer' | 'especifica'
  const [fechaEspecifica, setFechaEspecifica] = useState(""); // formato 'YYYY-MM-DD'

  // Verificar rol de admin
  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.autenticado || data.usuario?.role !== "ADMIN") {
          router.push("/login");
          return;
        }
        setIsAdmin(true);
        await cargarPedidos();
      } catch (e) {
        console.error("Error al verificar admin:", e);
        router.push("/login");
      } finally {
        setCargando(false);
      }
    };
    verificarAdmin();
  }, [router]);

  const cargarPedidos = async () => {
    setActualizando(true);
    try {
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      if (res.ok) {
        setPedidos(data.pedidos || []);
      }
    } catch (e) {
      console.error("Error al cargar pedidos:", e);
    } finally {
      setActualizando(false);
    }
  };

  const handleEliminarPedido = async (id, codigo) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el pedido #${codigo}?\n\nEsta acción es permanente y se utiliza para depurar pedidos de prueba o pedidos cancelados.`
      )
    ) {
      return;
    }

    setEliminandoId(id);
    try {
      const res = await fetch(`/api/pedidos?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar el pedido.");
      }

      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert(error.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const formatearPrecio = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "$0";
    return `$${num.toLocaleString("es-CO")}`;
  };

  // Función para obtener la fecha local en formato 'YYYY-MM-DD' (Corte estricto a las 12:00 a. m.)
  const getLocalDateStr = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formato legible en español para la fecha (ej: 16 de septiembre de 2026)
  const formatearFechaLegible = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  };

  // Cálculo de fechas relativas en hora local (a partir de las 12:00 a. m.)
  const now = new Date();
  const hoyStr = getLocalDateStr(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const ayerStr = getLocalDateStr(yesterday);

  // Conteo exacto de pedidos de hoy (desde las 12:00 a. m.) y de ayer
  const pedidosHoy = pedidos.filter((p) => getLocalDateStr(p.createdAt) === hoyStr);
  const pedidosAyer = pedidos.filter((p) => getLocalDateStr(p.createdAt) === ayerStr);

  // Filtrado combinado por Fecha y Búsqueda de Texto
  const pedidosFiltrados = pedidos.filter((p) => {
    // 1. Filtro de fecha con corte a las 12:00 a. m.
    const pFecha = getLocalDateStr(p.createdAt);
    if (filtroFechaTipo === "hoy") {
      if (pFecha !== hoyStr) return false;
    } else if (filtroFechaTipo === "ayer") {
      if (pFecha !== ayerStr) return false;
    } else if (filtroFechaTipo === "especifica" && fechaEspecifica) {
      if (pFecha !== fechaEspecifica) return false;
    }

    // 2. Filtro de texto (código, nombre, teléfono, barrio, destinatario)
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.codigo && p.codigo.toLowerCase().includes(q)) ||
      (p.clienteNombre && p.clienteNombre.toLowerCase().includes(q)) ||
      (p.clienteTelefono && p.clienteTelefono.toLowerCase().includes(q)) ||
      (p.destinatario && p.destinatario.toLowerCase().includes(q)) ||
      (p.barrioEntrega && p.barrioEntrega.toLowerCase().includes(q))
    );
  });

  // Métricas
  const totalMontoGeneral = pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  const totalMontoFiltrado = pedidosFiltrados.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#faf6f4] flex flex-col items-center justify-center p-6 text-[#8c6b5d]">
        <Loader2 className="w-10 h-10 animate-spin text-[#c29486] mb-4" />
        <p className="font-julius font-bold text-sm tracking-wider uppercase">Verificando acceso administrador...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#faf6f4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BARRA SUPERIOR DE NAVEGACIÓN Y TÍTULO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f8ece8] hover:bg-[#8c6b5d] text-[#8c6b5d] hover:text-white font-julius font-bold text-[11px] uppercase tracking-wider transition border border-[#ebd3cb]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Catálogo</span>
              </Link>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Panel Administrador
              </span>
            </div>
            
            <h1 className="font-lemon text-2xl sm:text-3xl text-[#5c4a42] mt-3">
              Registro de Pedidos Recibidos
            </h1>
            <p className="text-xs sm:text-sm text-[#8c6b5d] font-source mt-1">
              Visualiza en tiempo real los pedidos de clientes registrados por WhatsApp y base de datos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarPedidos}
              disabled={actualizando}
              className="px-5 py-3 rounded-full bg-[#faf6f4] hover:bg-[#f8ece8] text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-wider border border-[#ebd3cb] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Actualizar listado"
            >
              <RefreshCw className={`w-4 h-4 ${actualizando ? "animate-spin" : ""}`} />
              <span>Refrescar</span>
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Gestionar Catálogo</span>
            </Link>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS DINÁMICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#ebd3cb]/60 shadow-md flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f8ece8] text-[#c29486] flex items-center justify-center shrink-0">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8c6b5d] uppercase tracking-wider font-julius">
                {filtroFechaTipo !== "todos" ? "Pedidos en Fecha" : "Total Histórico"}
              </p>
              <h3 className="font-lemon text-2xl text-[#5c4a42] mt-1">{pedidosFiltrados.length}</h3>
              <p className="text-[10px] text-[#a88d81] font-poppins mt-0.5">
                {filtroFechaTipo === "todos" ? "Total histórico recibido" : `Filtrando ${pedidosFiltrados.length} de ${pedidos.length}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFiltroFechaTipo("hoy");
              setFechaEspecifica(hoyStr);
            }}
            className="bg-white rounded-3xl p-6 border border-[#ebd3cb]/60 shadow-md hover:shadow-lg transition flex items-center gap-4 text-left cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8c6b5d] uppercase tracking-wider font-julius flex items-center gap-1.5">
                <span>Pedidos Hoy</span>
                {filtroFechaTipo === "hoy" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </p>
              <h3 className="font-lemon text-2xl text-[#5c4a42] mt-1">{pedidosHoy.length}</h3>
              <p className="text-[10px] text-emerald-700 font-poppins mt-0.5">
                Desde las 12:00 a. m. de hoy
              </p>
            </div>
          </button>

          <div className="bg-white rounded-3xl p-6 border border-[#ebd3cb]/60 shadow-md flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8c6b5d] uppercase tracking-wider font-julius">
                {filtroFechaTipo !== "todos" ? "Monto en Fecha" : "Total Acumulado"}
              </p>
              <h3 className="font-lemon text-2xl text-[#5c4a42] mt-1">
                {formatearPrecio(filtroFechaTipo !== "todos" ? totalMontoFiltrado : totalMontoGeneral)}
              </h3>
              <p className="text-[10px] text-[#a88d81] font-poppins mt-0.5">
                {filtroFechaTipo !== "todos" ? "Monto a cobrar en esta fecha" : "Monto total de todos los pedidos"}
              </p>
            </div>
          </div>
        </div>

        {/* PANEL DE FILTROS: FECHA (CORTE ESTRICTO A LAS 12:00 A. M.) Y BUSCADOR */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-md space-y-6">
          
          {/* FILTRO DE FECHAS (HISTORIAL, HOY, AYER Y SELECTOR DE CUALQUIER DÍA) */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#f4e6e1]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#f8ece8] text-[#c29486]">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-julius font-bold text-xs uppercase tracking-wider text-[#5c4a42]">
                  Filtro por Fecha de Pedido
                </h4>
                <p className="text-[11px] text-[#8c6b5d] font-poppins">
                  Corte diario automático a las 12:00 a. m. (medianoche)
                </p>
              </div>
            </div>

            {/* BOTONES DE FECHA RÁPIDA Y SELECTOR DE FECHA */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => {
                  setFiltroFechaTipo("todos");
                  setFechaEspecifica("");
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-julius font-bold uppercase tracking-wider transition border cursor-pointer ${
                  filtroFechaTipo === "todos"
                    ? "bg-[#8c6b5d] text-white border-[#785b4f] shadow-xs"
                    : "bg-[#faf6f4] text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f8ece8]"
                }`}
              >
                Todos ({pedidos.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltroFechaTipo("hoy");
                  setFechaEspecifica(hoyStr);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-julius font-bold uppercase tracking-wider transition border flex items-center gap-1.5 cursor-pointer ${
                  filtroFechaTipo === "hoy"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
                title="Pedidos realizados hoy después de las 12:00 a. m."
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Hoy ({pedidosHoy.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltroFechaTipo("ayer");
                  setFechaEspecifica(ayerStr);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-julius font-bold uppercase tracking-wider transition border cursor-pointer ${
                  filtroFechaTipo === "ayer"
                    ? "bg-[#8c6b5d] text-white border-[#785b4f] shadow-xs"
                    : "bg-[#faf6f4] text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f8ece8]"
                }`}
                title="Pedidos del día anterior completo"
              >
                Ayer ({pedidosAyer.length})
              </button>

              {/* SELECTOR DE FECHA ESPECÍFICA (CUALQUIER FECHA ATRÁS) */}
              <div className="flex items-center gap-2 bg-[#faf6f4] border border-[#ebd3cb] px-3.5 py-2 rounded-full shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#c29486]" />
                <span className="text-[11px] font-bold text-[#8c6b5d] uppercase tracking-wider font-julius">
                  Elegir día:
                </span>
                <input
                  type="date"
                  value={fechaEspecifica}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFechaEspecifica(val);
                    if (val) {
                      if (val === hoyStr) setFiltroFechaTipo("hoy");
                      else if (val === ayerStr) setFiltroFechaTipo("ayer");
                      else setFiltroFechaTipo("especifica");
                    } else {
                      setFiltroFechaTipo("todos");
                    }
                  }}
                  className="bg-transparent text-xs text-[#5c4a42] font-semibold focus:outline-none cursor-pointer"
                />
                {fechaEspecifica && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroFechaTipo("todos");
                      setFechaEspecifica("");
                    }}
                    className="p-1 hover:bg-[#ebd3cb] rounded-full text-[#8c6b5d] transition cursor-pointer"
                    title="Quitar filtro de fecha y mostrar todos"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* BUSCADOR DE TEXTO + INDICADOR DE FILTRO ACTIVO */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código, cliente, barrio..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs text-[#8c6b5d] font-poppins">
                Mostrando <strong>{pedidosFiltrados.length}</strong> de {pedidos.length} pedidos
              </p>

              {filtroFechaTipo !== "todos" && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f8ece8] border border-[#ebd3cb] text-xs text-[#8c6b5d] font-poppins">
                  <span className="font-semibold text-[#5c4a42]">
                    {filtroFechaTipo === "hoy" && "📅 Fecha: Hoy (desde 12:00 a. m.)"}
                    {filtroFechaTipo === "ayer" && "📅 Fecha: Ayer"}
                    {filtroFechaTipo === "especifica" && `📅 Fecha: ${formatearFechaLegible(fechaEspecifica) || fechaEspecifica}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroFechaTipo("todos");
                      setFechaEspecifica("");
                    }}
                    className="text-[#c29486] hover:text-[#5c4a42] font-bold ml-1 text-xs cursor-pointer underline"
                  >
                    Ver todos
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* LISTADO DE PEDIDOS */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#ebd3cb]/50 shadow-md space-y-3">
            <ClipboardList className="w-12 h-12 text-[#c29486] mx-auto opacity-50" />
            <h3 className="font-lemon text-xl text-[#5c4a42]">No se encontraron pedidos</h3>
            <p className="text-xs text-[#8c6b5d]">
              {pedidos.length === 0
                ? "Aún no se ha registrado ningún pedido desde la tienda."
                : "No hay pedidos que coincidan con los términos de búsqueda."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidosFiltrados.map((pedido) => {
              let itemsList = [];
              try {
                itemsList = typeof pedido.items === "string" ? JSON.parse(pedido.items) : (pedido.items || []);
              } catch {
                itemsList = [];
              }

              const fechaTexto = new Date(pedido.createdAt).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Limpieza del teléfono para link de WhatsApp
              const telLimpio = (pedido.clienteTelefono || "").replace(/\D/g, "");
              const waLink = telLimpio
                ? `https://wa.me/57${telLimpio.startsWith("57") ? telLimpio.slice(2) : telLimpio}?text=Hola%20${encodeURIComponent(pedido.clienteNombre || "Cliente")},%20te%20escribimos%20de%20Adetallesbq%20respecto%20a%20tu%20pedido%20${encodeURIComponent(pedido.codigo)}`
                : null;

              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-md hover:shadow-xl transition-all duration-300 space-y-6"
                >
                  {/* CABECERA DEL PEDIDO */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f4e6e1]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-4 py-1.5 rounded-2xl bg-[#5c4a42] text-white font-lemon text-sm sm:text-base shadow-xs">
                        {pedido.codigo}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const fechaCard = getLocalDateStr(pedido.createdAt);
                          setFechaEspecifica(fechaCard);
                          if (fechaCard === hoyStr) setFiltroFechaTipo("hoy");
                          else if (fechaCard === ayerStr) setFiltroFechaTipo("ayer");
                          else setFiltroFechaTipo("especifica");
                        }}
                        className="text-xs text-[#8c6b5d] hover:text-[#5c4a42] font-poppins flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#faf6f4] hover:bg-[#f8ece8] transition cursor-pointer border border-[#ebd3cb]/60 shadow-2xs group/date"
                        title="Haz clic para ver todos los pedidos de este día"
                      >
                        <Calendar className="w-4 h-4 text-[#c29486] group-hover/date:scale-110 transition-transform" />
                        <span>{fechaTexto}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8c6b5d] font-julius font-bold uppercase tracking-wider">
                          Total a cobrar:
                        </span>
                        <span className="font-lemon text-xl sm:text-2xl text-[#5c4a42]">
                          {formatearPrecio(pedido.total)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEliminarPedido(pedido.id, pedido.codigo)}
                        disabled={eliminandoId === pedido.id}
                        className="p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition shadow-2xs cursor-pointer disabled:opacity-50 ml-2"
                        title="Eliminar este pedido (pruebas o cancelados)"
                      >
                        {eliminandoId === pedido.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3 COLUMNAS: CLIENTE | ENTREGA | PRODUCTOS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* COLUMNA 1: DATOS DEL CLIENTE */}
                    <div className="p-5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50 space-y-3">
                      <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-[#c29486]" />
                        <span>Datos del Cliente</span>
                      </h4>
                      <div className="text-xs text-[#786055] font-source space-y-1">
                        <p className="font-semibold text-sm text-[#5c4a42]">{pedido.clienteNombre}</p>
                        {pedido.clienteEmail && (
                          <p className="flex items-center gap-1.5 text-[#8c6b5d] truncate">
                            <Mail className="w-3.5 h-3.5 text-[#c29486] shrink-0" />
                            <span>{pedido.clienteEmail}</span>
                          </p>
                        )}
                        {pedido.clienteTelefono && (
                          <p className="flex items-center gap-1.5 text-[#8c6b5d]">
                            <Phone className="w-3.5 h-3.5 text-[#c29486] shrink-0" />
                            <span>{pedido.clienteTelefono}</span>
                          </p>
                        )}
                      </div>

                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-julius font-bold text-[11px] uppercase tracking-wider transition shadow-xs mt-2"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Contactar al Cliente</span>
                        </a>
                      )}
                    </div>

                    {/* COLUMNA 2: DETALLES DE ENTREGA */}
                    <div className="p-5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50 space-y-3">
                      <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#c29486]" />
                        <span>Destino de Entrega</span>
                      </h4>
                      <div className="text-xs text-[#786055] font-source space-y-1">
                        <p className="font-semibold text-[#5c4a42]">
                          Recibe: {pedido.destinatario || "No especificado"}
                        </p>
                        {pedido.telefonoDestinatario && (
                          <p className="text-[#8c6b5d]">
                            Tel. receptor: {pedido.telefonoDestinatario}
                          </p>
                        )}
                        <p>
                          <strong>Dirección:</strong> {pedido.direccionEntrega || "No especificada"}
                        </p>
                        {pedido.barrioEntrega && (
                          <p>
                            <strong>Barrio:</strong> {pedido.barrioEntrega}
                          </p>
                        )}
                        {pedido.fechaEntrega && (
                          <p className="text-[#8c6b5d]">
                            <strong>Fecha deseada:</strong> {pedido.fechaEntrega}
                          </p>
                        )}
                        {pedido.mensajeTarjeta && (
                          <div className="mt-2 pt-2 border-t border-[#ebd3cb]/40">
                            <span className="text-[10px] font-bold text-[#8c6b5d] uppercase block">
                              💌 Mensaje para la Tarjeta:
                            </span>
                            <p className="italic text-[#5c4a42] text-[11px] mt-0.5">
                              &quot;{pedido.mensajeTarjeta}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA 3: PRODUCTOS DEL PEDIDO */}
                    <div className="p-5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50 space-y-3">
                      <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#c29486]" />
                        <span>Productos ({itemsList.reduce((acc, i) => acc + (i.cantidad || 1), 0)})</span>
                      </h4>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                        {itemsList.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-[#ebd3cb]/40 flex items-center gap-2.5 shadow-2xs"
                          >
                            {item.imagen && (
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#ebd3cb]"
                              />
                            )}
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-bold text-[#5c4a42] font-poppins truncate">
                                {item.nombre}
                              </p>
                              <p className="text-[10px] text-[#8c6b5d] font-poppins">
                                {item.cantidad} x {formatearPrecio(item.precio)} = {formatearPrecio((item.precio || 0) * (item.cantidad || 1))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
