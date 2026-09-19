'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
  Eye,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  FolderPlus,
  UploadCloud,
  Loader2,
  X,
  ShieldCheck,
  RefreshCw,
  Tag,
  ShoppingBag,
  Check,
  AlertCircle,
} from "lucide-react";
import { productosDefecto, obtenerImagenProducto } from "@/lib/productosDefecto";
import { catalogoOficial } from "@/lib/catalogoOficial";
import QuickViewModal from "@/components/QuickViewModal";
import { useCart } from "@/context/CartContext";

const formatPrecio = (precio) => {
  if (!precio && precio !== 0) return "";
  const num = Number(precio);
  if (isNaN(num) || num === 0) return "";
  return `$${num.toLocaleString("es-CO")}`;
};

export default function CatalogoCliente({ productosIniciales = [] }) {
  const { agregarProducto, abrirCarrito } = useCart();
  const [mounted, setMounted] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("recientes");
  const initialData = Array.isArray(productosIniciales) && productosIniciales.length > 0 ? productosIniciales : catalogoOficial;
  const [productosState, setProductosState] = useState(initialData);
  const [limiteVisible, setLimiteVisible] = useState(24);


  // Estados para Carga Masiva de Fotos (Multi-Upload Inteligente)
  const [modalCargaMasivaAbierto, setModalCargaMasivaAbierto] = useState(false);
  const [subiendoFotosMasivas, setSubiendoFotosMasivas] = useState(false);
  const [reporteCargaMasiva, setReporteCargaMasiva] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLimiteVisible(24);
  }, [categoriaSel, busqueda, orden]);

  // Verificación de sesión de Administrador (respeta el toggle de vista cliente/admin y valida rol ADMIN estricto)
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async () => {
    const viewMode = typeof window !== "undefined" ? (localStorage.getItem("admin_view_mode") || "admin") : "admin";
    if (viewMode === "cliente") {
      setIsAdmin(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.autenticado && data.usuario?.role === "ADMIN") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdmin();
    window.addEventListener("adminModeChanged", checkAdmin);
    window.addEventListener("storage", checkAdmin);

    return () => {
      window.removeEventListener("adminModeChanged", checkAdmin);
      window.removeEventListener("storage", checkAdmin);
    };
  }, []);

  // Recargar productos desde el servidor
  const cargarProductosServidor = async () => {
    try {
      const res = await fetch("/api/admin/productos");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProductosState(data);
        }
      }
    } catch (e) {
      console.error("Error recargando productos:", e);
    }
  };

  // Estado para las categorías dinámicas
  const [categoriasLista, setCategoriasLista] = useState([
    { id: "TODOS", nombre: "Todas las categorías" },
  ]);

  const [categoriasDB, setCategoriasDB] = useState([]);

  const cargarCategorias = async () => {
    try {
      const res = await fetch("/api/admin/categorias");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setCategoriasDB(data);
          const dinamicas = [
            { id: "TODOS", nombre: "Todas las categorías" },
            ...data.map((c) => ({ id: c.nombre, nombre: c.nombre, dbId: c.id })),
          ];
          setCategoriasLista(dinamicas);
        }
      }
    } catch (e) {
      console.error("Error cargando categorías:", e);
    }
  };

  // Sincronizar productosIniciales provenientes del servidor (SSR / Server Component)
  useEffect(() => {
    if (productosIniciales && Array.isArray(productosIniciales) && productosIniciales.length > 0) {
      setProductosState(productosIniciales);
    }
  }, [productosIniciales]);

  useEffect(() => {
    cargarCategorias();
    cargarProductosServidor();
  }, []);

  // Modales de vista rápida y edición admin
  const [modalProd, setModalProd] = useState(null);
  const [modalImg, setModalImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para modal de Producto (Admin)
  const [modalAdminAbierto, setModalAdminAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mensajeNotif, setMensajeNotif] = useState("");
  const [errorNotif, setErrorNotif] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 10,
    categoria: "Desayunos Sorpresa",
    etiqueta: "Desayunos Sorpresa",
    imagen: "/images/Canastita.png",
  });

  // Estados para modal de Categoría (Admin)
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
  const [editandoCategoriaId, setEditandoCategoriaId] = useState(null);
  const [editandoCategoriaNombre, setEditandoCategoriaNombre] = useState("");
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);

  // Estados para modal de Adicionales (Admin)
  const [modalAdicionalesAbierto, setModalAdicionalesAbierto] = useState(false);
  const [adicionalesAdminList, setAdicionalesAdminList] = useState([]);
  const [nuevoAdicionalNombre, setNuevoAdicionalNombre] = useState("");
  const [nuevoAdicionalPrecio, setNuevoAdicionalPrecio] = useState(0);
  const [editandoAdicionalId, setEditandoAdicionalId] = useState(null);
  const [editandoAdicionalNombre, setEditandoAdicionalNombre] = useState("");
  const [editandoAdicionalPrecio, setEditandoAdicionalPrecio] = useState(0);
  const [guardandoAdicional, setGuardandoAdicional] = useState(false);

  const cargarAdicionalesAdmin = async () => {
    try {
      const res = await fetch("/api/admin/adicionales");
      if (res.ok) {
        const data = await res.json();
        setAdicionalesAdminList(data || []);
      }
    } catch (e) {
      console.error("Error al cargar adicionales:", e);
    }
  };

  useEffect(() => {
    if (modalAdicionalesAbierto) {
      cargarAdicionalesAdmin();
    }
  }, [modalAdicionalesAbierto]);

  const handleGuardarAdicional = async (e) => {
    e.preventDefault();
    if (!nuevoAdicionalNombre.trim()) return;

    setMensajeNotif("");
    setErrorNotif("");
    setGuardandoAdicional(true);

    try {
      const res = await fetch("/api/admin/adicionales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoAdicionalNombre.trim(),
          precio: Number(nuevoAdicionalPrecio) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agregar adicional");

      setMensajeNotif(`¡Adicional "${data.nombre}" agregado con éxito!`);
      setNuevoAdicionalNombre("");
      setNuevoAdicionalPrecio(0);
      await cargarAdicionalesAdmin();
    } catch (err) {
      setErrorNotif(err.message);
    } finally {
      setGuardandoAdicional(false);
    }
  };

  const handleActualizarAdicional = async (id) => {
    if (!editandoAdicionalNombre.trim()) return;

    setMensajeNotif("");
    setErrorNotif("");
    setGuardandoAdicional(true);

    try {
      const res = await fetch("/api/admin/adicionales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          nombre: editandoAdicionalNombre.trim(),
          precio: Number(editandoAdicionalPrecio) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar adicional");

      setMensajeNotif("Adicional actualizado con éxito.");
      setEditandoAdicionalId(null);
      await cargarAdicionalesAdmin();
    } catch (err) {
      setErrorNotif(err.message);
    } finally {
      setGuardandoAdicional(false);
    }
  };

  const handleEliminarAdicional = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar el adicional "${nombre}"?`)) return;

    setMensajeNotif("");
    setErrorNotif("");

    try {
      const res = await fetch(`/api/admin/adicionales?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar adicional");

      setMensajeNotif(`Adicional "${nombre}" eliminado.`);
      await cargarAdicionalesAdmin();
    } catch (err) {
      setErrorNotif(err.message);
    }
  };

  const abrirModalVistaRapida = (prod, idx) => {
    setModalProd(prod);
    setModalImg(obtenerImagenProducto(prod, idx));
    setIsModalOpen(true);
  };

  const abrirModalCrearAdmin = () => {
    setProductoEditando(null);
    const catInicial = categoriasLista.length > 1 ? categoriasLista[1].nombre : "Desayunos Sorpresa";
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      stock: 10,
      categoria: catInicial,
      etiqueta: catInicial,
      imagen: "/images/Canastita.png",
    });
    setModalAdminAbierto(true);
  };

  const abrirModalEditarAdmin = (prod) => {
    setProductoEditando(prod);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || "",
      precio: prod.precio || 0,
      stock: prod.stock || 0,
      categoria: prod.categoria || "Desayunos Sorpresa",
      etiqueta: prod.etiqueta || prod.categoria || "",
      imagen: prod.imagen || "/images/Canastita.png",
    });
    setModalAdminAbierto(true);
  };

  // Subir imagen desde computador local
  const handleSubirImagen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    setErrorNotif("");
    setMensajeNotif("");

    try {
      const bodyFormData = new FormData();
      bodyFormData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: bodyFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir la imagen");

      setFormData((prev) => ({ ...prev, imagen: data.url }));
      setMensajeNotif("¡Imagen subida exitosamente!");
    } catch (err) {
      setErrorNotif(err.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    setMensajeNotif("");
    setErrorNotif("");

    try {
      const url = "/api/admin/productos";
      const method = productoEditando ? "PUT" : "POST";
      const bodyData = productoEditando
        ? { id: productoEditando.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el producto");

      setMensajeNotif(
        productoEditando
          ? "¡Producto actualizado exitosamente!"
          : "¡Producto creado exitosamente en el catálogo!"
      );
      setModalAdminAbierto(false);
      await cargarProductosServidor();
    } catch (err) {
      setErrorNotif(err.message);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto del catálogo?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/productos?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el producto.");

      setMensajeNotif("Producto eliminado del catálogo.");
      await cargarProductosServidor();
    } catch (err) {
      setErrorNotif(err.message);
    }
  };

  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoriaNombre.trim()) return;

    setMensajeNotif("");
    setErrorNotif("");
    setGuardandoCategoria(true);

    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaCategoriaNombre.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agregar categoría");

      setMensajeNotif(`¡Categoría "${data.nombre}" creada con éxito!`);
      setNuevaCategoriaNombre("");
      await cargarCategorias();
      setFormData((prev) => ({ ...prev, categoria: data.nombre }));
    } catch (err) {
      setErrorNotif(err.message);
    } finally {
      setGuardandoCategoria(false);
    }
  };

  const handleActualizarCategoria = async (id) => {
    if (!editandoCategoriaNombre.trim()) return;

    setMensajeNotif("");
    setErrorNotif("");
    setGuardandoCategoria(true);

    try {
      const res = await fetch("/api/admin/categorias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nuevoNombre: editandoCategoriaNombre.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar categoría");

      setMensajeNotif(data.mensaje || "Categoría actualizada con éxito.");
      setEditandoCategoriaId(null);
      setEditandoCategoriaNombre("");
      await cargarCategorias();
      await cargarProductosServidor();
    } catch (err) {
      setErrorNotif(err.message);
    } finally {
      setGuardandoCategoria(false);
    }
  };

  const handleEliminarCategoria = async (id, nombre) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar la categoría "${nombre}"?\n\nLos productos que tengan asignada esta categoría pasarán automáticamente a la categoría "General" para que no se pierdan.`
      )
    ) {
      return;
    }

    setMensajeNotif("");
    setErrorNotif("");

    try {
      const res = await fetch(`/api/admin/categorias?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar categoría");

      setMensajeNotif(data.mensaje || `Categoría "${nombre}" eliminada.`);
      await cargarCategorias();
      await cargarProductosServidor();
    } catch (err) {
      setErrorNotif(err.message);
    }
  };

  // Base de productos a procesar desde la base de datos (con fallback seguro a arreglo vacío)
  const productosBase = Array.isArray(productosState) ? productosState : [];

  // Filtrado y ordenamiento dinámico 100% seguro contra nulls/undefined y tipos numéricos
  const productosProcesados = productosBase
    .filter((p) => {
      if (!p) return false;
      const catProducto = (p.categoria || "").toString().trim().toLowerCase();
      const catSeleccionada = (categoriaSel || "").toString().trim().toLowerCase();

      const coincideCategoria =
        categoriaSel === "TODOS" ||
        catSeleccionada === "todos" ||
        catProducto === catSeleccionada;

      const busquedaLimpia = (busqueda || "").toString().trim().toLowerCase();
      const nombreProducto = (p.nombre || "").toString().toLowerCase();
      const descProducto = (p.descripcion || "").toString().toLowerCase();

      const coincideBusqueda =
        !busquedaLimpia ||
        nombreProducto.includes(busquedaLimpia) ||
        descProducto.includes(busquedaLimpia);

      return coincideCategoria && coincideBusqueda;
    })
    .sort((a, b) => {
      if (orden === "precio-asc") return (Number(a.precio) || 0) - (Number(b.precio) || 0);
      if (orden === "precio-desc") return (Number(b.precio) || 0) - (Number(a.precio) || 0);
      if (orden === "nombre") return (a.nombre || "").toString().localeCompare((b.nombre || "").toString());
      return 0;
    });

  return (
    <div className="space-y-8">
      
      {/* 🛡️ BARRA DE HERRAMIENTAS MODO ADMINISTRADOR (DIRECTA EN EL CATÁLOGO) */}
      {isAdmin && (
        <div className="bg-[#5c4a42] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-[#3a2e28] animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#c29486] text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f8ece8]">MODO EDICIÓN EN VIVO</span>
              <h3 className="font-lemon text-xl text-white">Controles de Administrador</h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalAdicionalesAbierto(true)}
              className="px-5 py-2.5 rounded-full bg-[#f8ece8] hover:bg-white text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              + Adicionales
            </button>

            <button
              onClick={() => setModalCategoriaAbierto(true)}
              className="px-5 py-2.5 rounded-full bg-[#f8ece8] hover:bg-white text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              + Categoría
            </button>

            <button
              onClick={() => setModalCargaMasivaAbierto(true)}
              className="px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-julius font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Carga Masiva de Fotos</span>
            </button>

            <button
              onClick={abrirModalCrearAdmin}
              className="px-6 py-2.5 rounded-full bg-[#c29486] hover:bg-white text-white hover:text-[#5c4a42] font-julius font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              + Agregar Producto
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES ADMIN */}
      {mensajeNotif && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeNotif}</span>
        </div>
      )}

      {errorNotif && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorNotif}</span>
        </div>
      )}

      {/* 1. BARRA DE FILTROS Y BÚSQUEDA REDISEÑADA */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#ebd3cb]/50 shadow-xl shadow-palorosa-500/5 space-y-5">
        
        {/* FILA SUPERIOR: BUSCADOR EXPANDIDO A LA IZQUIERDA Y ORDENAR A LA DERECHA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          
          {/* BUSCADOR (8 COLUMNAS EN ESCRITORIO PARA UN LAYOUT MODERNO Y LIMPIO) */}
          <div className="md:col-span-8 relative">
            <Search className="w-4.5 h-4.5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por regalo, flores, peluches, cuadros..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition-all shadow-xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c29486] hover:text-[#5c4a42] text-xs font-bold p-1 cursor-pointer"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* SELECTOR ORDENAR POR (4 COLUMNAS EN ESCRITORIO) */}
          <div className="md:col-span-4 relative">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-9 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs font-julius font-bold text-[#8c6b5d] uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#c29486] cursor-pointer shadow-xs"
            >
              <option value="recientes" className="bg-white text-[#5c4a42]">Más Recientes</option>
              <option value="precio-asc" className="bg-white text-[#5c4a42]">Precio: Menor a Mayor</option>
              <option value="precio-desc" className="bg-white text-[#5c4a42]">Precio: Mayor a Menor</option>
              <option value="nombre" className="bg-white text-[#5c4a42]">Nombre A-Z</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#8c6b5d] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

        {/* FILA INFERIOR: CHIPS DE CATEGORÍAS */}
        <div className="pt-3 border-t border-[#f4e6e1] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-poppins text-[#8c6b5d]">
            <span className="font-bold uppercase tracking-wider text-[#a88d81]">Filtrar por Colección</span>
            <span className="px-3 py-1 rounded-full bg-[#faf6f4] border border-[#ebd3cb] text-[11px]">
              <strong className="text-[#5c4a42] font-bold">{productosProcesados.length}</strong> regalos disponibles
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth flex-wrap">
            {categoriasLista
              .filter((cat) => {
                if (cat.id === "TODOS" || cat.nombre === "Todas las categorías") return true;
                const catNombreLimpio = (cat.nombre || "").trim().toLowerCase();
                const count = productosBase.filter(
                  (p) => (p.categoria || "").trim().toLowerCase() === catNombreLimpio
                ).length;
                return count > 0;
              })
              .map((cat) => {
              const catNombreLimpio = (cat.nombre || "").trim().toLowerCase();
              const cantidadProdCat = cat.id === "TODOS" || cat.nombre === "Todas las categorías"
                ? productosBase.length
                : productosBase.filter((p) => (p.categoria || "").trim().toLowerCase() === catNombreLimpio).length;

              const isActive =
                (categoriaSel === "TODOS" && (cat.id === "TODOS" || cat.nombre === "Todas las categorías")) ||
                categoriaSel === cat.id ||
                categoriaSel === cat.nombre;

              return (
                <button
                  key={cat.id || cat.nombre}
                  onClick={() => setCategoriaSel(cat.nombre === "Todas las categorías" ? "TODOS" : cat.nombre)}
                  className={`px-4 py-2 rounded-full text-xs font-julius font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all duration-300 border cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-[#8c6b5d] to-[#785b4f] text-white border-[#785b4f] shadow-md scale-105"
                      : "bg-[#faf6f4] text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f8ece8] hover:border-[#c29486]"
                  }`}
                >
                  <span>{cat.nombre === "Todas las categorías" ? "Todos los Productos" : cat.nombre}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? "bg-white/25 text-white" : "bg-[#ebd3cb]/50 text-[#5c4a42]"}`}>
                    {cantidadProdCat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* BADGE DE FILTROS ACTIVOS */}
      {(categoriaSel !== "TODOS" || busqueda !== "") && (
        <div className="flex items-center justify-between bg-[#f8ece8] px-5 py-2.5 rounded-2xl border border-[#ebd3cb] text-xs font-poppins text-[#8c6b5d] animate-fadeIn">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#5c4a42]">Filtros activos:</span>
            {categoriaSel !== "TODOS" && (
              <span className="px-3 py-1 rounded-full bg-white text-[#8c6b5d] font-semibold border border-[#ebd3cb] text-[11px]">
                Categoría: {categoriaSel}
              </span>
            )}
            {busqueda && (
              <span className="px-3 py-1 rounded-full bg-white text-[#8c6b5d] font-semibold border border-[#ebd3cb] text-[11px]">
                Búsqueda: &quot;{busqueda}&quot;
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setCategoriaSel("TODOS");
              setBusqueda("");
            }}
            className="text-[#c29486] hover:text-[#5c4a42] underline font-bold text-xs shrink-0 cursor-pointer ml-4"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* 2. GRID DE PRODUCTOS INTERACTIVOS O TARJETA DE ESTADO VACÍO ELEGANTE */}
      {productosProcesados.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#ebd3cb]/50 shadow-md space-y-4 my-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#faf6f4] border border-[#ebd3cb] flex items-center justify-center mx-auto text-[#c29486]">
            <Search className="w-8 h-8 opacity-70" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-agbalumo text-xl sm:text-2xl text-[#5c4a42]">
              No hay regalos disponibles en esta sección
            </h3>
            <p className="text-xs sm:text-sm text-[#8c6b5d] font-poppins leading-relaxed">
              Pronto añadiremos hermosas opciones en esta colección. Mientras tanto, explora nuestras demás categorías disponibles.
            </p>
          </div>
          <button
            onClick={() => {
              setCategoriaSel("TODOS");
              setBusqueda("");
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Ver Todos los Productos</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {productosProcesados.slice(0, limiteVisible).map((producto, idx) => (
              <div
                key={producto.id || idx}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#ebd3cb]/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div>
                  {/* IMAGEN DEL PRODUCTO (RENDERIZADO COMPLETO 100% SIN RECORTES) */}
                  <div
                    onClick={() => abrirModalVistaRapida(producto, idx)}
                    className="h-48 sm:h-64 md:h-72 relative overflow-hidden bg-gradient-to-b from-[#faf6f4] via-[#f8ece8]/60 to-[#f3e8e3]/80 p-2 sm:p-3.5 flex items-center justify-center cursor-pointer group/img"
                  >
                    {/* Fondo difuminado ambiental suave */}
                    <img
                      src={obtenerImagenProducto(producto, idx)}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-110 pointer-events-none"
                    />
                    
                    {/* Foto principal 100% visible sin ningún recorte */}
                    <img
                      src={obtenerImagenProducto(producto, idx)}
                      alt={producto.nombre}
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

                    {/* BADGE CATEGORÍA / ETIQUETA EN CAPA SUPERIOR (z-20) */}
                    <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#8c6b5d] font-julius font-bold text-[8px] sm:text-[10px] tracking-wider uppercase shadow-md border border-[#ebd3cb] max-w-[85%] truncate pointer-events-none">
                      {producto.etiqueta || producto.categoria}
                    </div>

                  </div>

                  {/* DETALLES DEL PRODUCTO */}
                  <div
                    className="p-2.5 sm:p-5 pt-2 sm:pt-4 space-y-1 sm:space-y-2"
                  >
                    <h3
                      onClick={() => abrirModalVistaRapida(producto, idx)}
                      className="font-lemon text-xs sm:text-base md:text-lg text-[#5c4a42] group-hover:text-[#c29486] transition-colors leading-snug line-clamp-2 cursor-pointer"
                    >
                      {producto.nombre}
                    </h3>
                    <div className="text-[10px] sm:text-xs text-[#786055] font-source line-clamp-2 leading-relaxed">
                      {(() => {
                        if (!producto.descripcion) return null;
                        const partes = producto.descripcion.split(/,|\n|-/).map((s) => s.trim()).filter(Boolean);
                        
                        if (partes.length > 1) {
                          return (
                            <ul className="space-y-0.5">
                              {partes.slice(0, 2).map((pt, pIdx) => (
                                <li key={pIdx} className="truncate flex items-center gap-1">
                                  <span className="text-[#8c6b5d] font-bold">•</span>
                                  <span className="truncate">{pt}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p className="leading-relaxed">{producto.descripcion}</p>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* PIE DE LA CARD CON PRECIO Y BOTÓN PEDIR */}
                <div className="p-2.5 sm:p-5 pt-2 sm:pt-3 border-t border-[#f4e6e1]">
                  {!isAdmin && (
                    <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2">
                      {/* CAJITA DE PRECIO ENCIMA DEL BOTÓN */}
                      {formatPrecio(producto.precio) && (
                        <span className="px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-[#5c4a42] text-white font-poppins text-[10px] sm:text-xs font-extrabold shadow-xs border border-white/20 tracking-tight">
                          {formatPrecio(producto.precio)}
                        </span>
                      )}

                      {/* BOTÓN REAL "PERSONALIZAR Y PEDIR" COMPACTO */}
                      <button
                        type="button"
                        onClick={() => abrirModalVistaRapida(producto, idx)}
                        className="w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-[8px] sm:text-[10px] uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
                        title="Personalizar y encargar este regalo"
                      >
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ebd3cb] shrink-0" />
                        <span className="truncate">Personalizar y Pedir</span>
                      </button>
                    </div>
                  )}

                  {/* CONTROLES DE ADMINISTRADOR EN CADA CARD */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                      <button
                        onClick={() => abrirModalEditarAdmin(producto)}
                        className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-full bg-[#f8ece8] hover:bg-[#c29486] text-[#8c6b5d] hover:text-white font-julius font-bold text-[9px] sm:text-[11px] uppercase tracking-wider transition border border-[#ebd3cb] flex items-center justify-center gap-1 shadow-xs truncate"
                      >
                        <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">Editar</span>
                      </button>
                      <button
                        onClick={() => handleEliminarProducto(producto.id)}
                        className="p-1.5 sm:p-2 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition border border-rose-200 shrink-0"
                        title="Eliminar del catálogo"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* BOTÓN MÁS PRODUCTOS */}
          {productosProcesados.length > limiteVisible && (
            <div className="text-center pt-6 pb-2">
              <button
                onClick={() => setLimiteVisible((prev) => prev + 24)}
                className="px-8 py-3.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#785b4f] inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Cargar más productos (Mostrando {Math.min(limiteVisible, productosProcesados.length)} de {productosProcesados.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE VISTA RÁPIDA */}
      <QuickViewModal
        producto={modalProd}
        imagen={modalImg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* MODAL CREAR / EDITAR PRODUCTO (ADMIN VIVO) */}
      {modalAdminAbierto && mounted && createPortal(
        <div 
          onClick={() => setModalAdminAbierto(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full border border-[#ebd3cb] shadow-2xl p-6 sm:p-8 relative space-y-6 max-h-[85vh] overflow-y-auto my-auto animate-scaleUp cursor-default"
          >
            <button
              onClick={() => setModalAdminAbierto(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f8ece8] text-[#8c6b5d] hover:bg-[#8c6b5d] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8ece8] text-[#8c6b5d] text-[10px] font-bold uppercase tracking-widest border border-[#ebd3cb]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c29486]" />
                <span>EDICIÓN EN VIVO</span>
              </span>
              <h2 className="font-lemon text-2xl text-[#5c4a42] mt-1">
                {productoEditando ? "Editar Producto" : "Nuevo Producto"}
              </h2>
            </div>

            <form onSubmit={handleGuardarProducto} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Desayuno Romántico Premium"
                    className="w-full px-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                    Precio ($ COP)
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 45900"
                    className="w-full px-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                      Categoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setModalCategoriaAbierto(true)}
                      className="text-[11px] font-bold text-[#c29486] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Nueva
                    </button>
                  </div>
                  <select
                    value={formData.categoria}
                    onChange={(e) => {
                      const nuevaCat = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        categoria: nuevaCat,
                        etiqueta: (!prev.etiqueta || prev.etiqueta === prev.categoria) ? nuevaCat : prev.etiqueta,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                  >
                    {categoriasLista.map((cat) => (
                      <option key={cat.id || cat.nombre} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                    Etiqueta (Badge en la foto)
                  </label>
                  <input
                    type="text"
                    value={formData.etiqueta || ""}
                    onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                    placeholder="Ej: Desayunos Sorpresa, Más Vendido..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                  />
                </div>
              </div>

              {/* SUBIR IMAGEN DESDE EQUIPO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                  Imagen del Producto
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]">
                  {formData.imagen ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#c29486] bg-[#f6eeea] shrink-0 relative shadow-md">
                      <img
                        src={formData.imagen}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#ebd3cb] bg-white shrink-0 flex items-center justify-center text-[#c29486]">
                      <UploadCloud className="w-8 h-8 opacity-60" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#f8ece8] hover:bg-[#c29486] text-[#8c6b5d] hover:text-white font-julius font-bold text-xs uppercase tracking-wider cursor-pointer transition border border-[#ebd3cb] w-full text-center shadow-xs">
                      {subiendoImagen ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Subiendo Imagen...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Subir Foto desde Computador</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSubirImagen}
                        disabled={subiendoImagen}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                  Descripción Corta
                </label>
                <textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalla lo que incluye este producto..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAdminAbierto(false)}
                  className="px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-[#5c4a42] text-xs font-julius font-bold uppercase tracking-wider"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={subiendoImagen}
                  className="px-8 py-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white text-xs font-julius font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {productoEditando ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL GESTIÓN COMPLETA DE CATEGORÍAS (CREAR, EDITAR Y ELIMINAR) */}
      {modalCategoriaAbierto && mounted && createPortal(
        <div 
          onClick={() => {
            setModalCategoriaAbierto(false);
            setEditandoCategoriaId(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-[#ebd3cb] shadow-2xl p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto my-auto animate-scaleUp cursor-default"
          >
            <button
              onClick={() => {
                setModalCategoriaAbierto(false);
                setEditandoCategoriaId(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f8ece8] text-[#8c6b5d] hover:bg-[#8c6b5d] hover:text-white transition"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8ece8] text-[#8c6b5d] text-[10px] font-bold uppercase tracking-widest border border-[#ebd3cb]">
                <Tag className="w-3 h-3 text-[#c29486]" />
                <span>ADMINISTRACIÓN</span>
              </span>
              <h2 className="font-lemon text-xl text-[#5c4a42]">
                Gestionar Categorías
              </h2>
              <p className="text-xs text-[#786055] font-source">
                Crea nuevas categorías, cámbiales el nombre o elimínalas del catálogo.
              </p>
            </div>

            {/* FORMULARIO AGREGAR NUEVA CATEGORÍA */}
            <form onSubmit={handleGuardarCategoria} className="space-y-3 bg-[#faf6f4] p-4 rounded-2xl border border-[#ebd3cb]">
              <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                + Crear Nueva Categoría
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={nuevaCategoriaNombre}
                  onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                  placeholder="Ej: Aniversarios & Romance"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                />
                <button
                  type="submit"
                  disabled={guardandoCategoria}
                  className="px-5 py-2.5 rounded-xl bg-[#8c6b5d] hover:bg-[#5c4a42] text-white text-xs font-julius font-bold uppercase tracking-wider shadow-sm transition shrink-0 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{guardandoCategoria ? "Guardando..." : "Crear"}</span>
                </button>
              </div>
            </form>

            {/* LISTADO DE CATEGORÍAS EXISTENTES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                  Categorías en Base de Datos ({categoriasDB.length})
                </label>
                <span className="text-[10px] text-[#8c6b5d] font-poppins">
                  Al borrar, pasan a &quot;General&quot;
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categoriasDB.length === 0 ? (
                  <p className="text-xs text-[#8c6b5d] italic py-2">No hay categorías registradas.</p>
                ) : (
                  categoriasDB.map((cat) => (
                    <div
                      key={cat.id || cat.nombre}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#ebd3cb] hover:border-[#c29486] transition gap-3"
                    >
                      {editandoCategoriaId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editandoCategoriaNombre}
                            onChange={(e) => setEditandoCategoriaNombre(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#faf6f4] border border-[#c29486] text-xs text-[#5c4a42] focus:outline-none focus:ring-1 focus:ring-[#c29486]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleActualizarCategoria(cat.id)}
                            disabled={guardandoCategoria}
                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                            title="Guardar nuevo nombre"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoCategoriaId(null);
                              setEditandoCategoriaNombre("");
                            }}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#5c4a42] transition cursor-pointer"
                            title="Cancelar edición"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-2 h-2 rounded-full bg-[#c29486] shrink-0" />
                            <span className="text-xs font-bold text-[#5c4a42] truncate font-poppins">
                              {cat.nombre}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditandoCategoriaId(cat.id);
                                setEditandoCategoriaNombre(cat.nombre);
                              }}
                              className="p-2 rounded-xl text-[#8c6b5d] hover:text-[#5c4a42] hover:bg-[#f8ece8] transition cursor-pointer"
                              title="Editar nombre"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {cat.nombre !== "General" && (
                              <button
                                type="button"
                                onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                                className="p-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 transition cursor-pointer"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setModalCategoriaAbierto(false);
                  setEditandoCategoriaId(null);
                }}
                className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#5c4a42] text-xs font-julius font-bold uppercase tracking-wider cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🎁 MODAL ADMINISTRAR ADICIONALES DEL TIENDA */}
      {modalAdicionalesAbierto && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            onClick={() => setModalAdicionalesAbierto(false)}
            className="fixed inset-0 bg-[#3a2e28]/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#ebd3cb] shadow-2xl z-20 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#ebd3cb] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f8ece8] text-[#8c6b5d]">
                  <Tag className="w-5 h-5 text-[#c29486]" />
                </div>
                <div>
                  <h3 className="font-lemon text-lg text-[#5c4a42]">Adicionales de la Tienda</h3>
                  <p className="text-[11px] text-[#8c6b5d] font-poppins">
                    Configura peluches, globos, chocolates, etc., que tus clientes pueden agregar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAdicionalesAbierto(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#8c6b5d] hover:text-white transition flex items-center justify-center text-[#5c4a42] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CREAR NUEVO ADICIONAL */}
            <form onSubmit={handleGuardarAdicional} className="space-y-3 bg-[#faf6f4] p-4 rounded-2xl border border-[#ebd3cb]">
              <span className="text-xs font-julius font-bold uppercase tracking-wider text-[#5c4a42] block">
                + Agregar Nuevo Adicional
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre (ej: Globo Metálico)"
                  value={nuevoAdicionalNombre}
                  onChange={(e) => setNuevoAdicionalNombre(e.target.value)}
                  className="sm:col-span-7 px-3.5 py-2.5 rounded-xl bg-white border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Precio ($)"
                  value={nuevoAdicionalPrecio || ""}
                  onChange={(e) => setNuevoAdicionalPrecio(e.target.value)}
                  className="sm:col-span-5 px-3.5 py-2.5 rounded-xl bg-white border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                />
              </div>
              <button
                type="submit"
                disabled={guardandoAdicional || !nuevoAdicionalNombre.trim()}
                className="w-full py-2.5 rounded-xl bg-[#8c6b5d] hover:bg-[#5c4a42] text-white text-xs font-julius font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {guardandoAdicional ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Guardar Adicional</span>
                  </>
                )}
              </button>
            </form>

            {/* LISTA DE ADICIONALES EXISTENTES */}
            <div className="space-y-2">
              <span className="text-xs font-julius font-bold uppercase tracking-wider text-[#5c4a42] block">
                Adicionales Existentes ({adicionalesAdminList.length})
              </span>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {adicionalesAdminList.length === 0 ? (
                  <p className="text-xs text-[#8c6b5d] text-center py-4 bg-gray-50 rounded-xl">
                    No hay adicionales registrados. Usa el formulario superior para crear el primero.
                  </p>
                ) : (
                  adicionalesAdminList.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-3 rounded-2xl bg-white border border-[#ebd3cb] flex items-center justify-between gap-3 shadow-xs"
                    >
                      {editandoAdicionalId === ad.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editandoAdicionalNombre}
                            onChange={(e) => setEditandoAdicionalNombre(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-[#c29486] text-xs text-[#5c4a42]"
                          />
                          <input
                            type="number"
                            value={editandoAdicionalPrecio}
                            onChange={(e) => setEditandoAdicionalPrecio(e.target.value)}
                            className="w-24 px-2 py-1.5 rounded-lg border border-[#c29486] text-xs text-[#5c4a42]"
                          />
                          <button
                            type="button"
                            onClick={() => handleActualizarAdicional(ad.id)}
                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                            title="Guardar cambios"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoAdicionalId(null)}
                            className="p-2 rounded-lg bg-gray-200 text-[#5c4a42] hover:bg-gray-300 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-2 h-2 rounded-full bg-[#c29486] shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-[#5c4a42] block font-poppins">
                                {ad.nombre}
                              </span>
                              <span className="text-[10px] text-[#8c6b5d] font-semibold">
                                {Number(ad.precio) > 0 ? formatPrecio(ad.precio) : "Gratis"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditandoAdicionalId(ad.id);
                                setEditandoAdicionalNombre(ad.nombre);
                                setEditandoAdicionalPrecio(ad.precio);
                              }}
                              className="p-2 rounded-xl text-[#8c6b5d] hover:text-[#5c4a42] hover:bg-[#f8ece8] transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEliminarAdicional(ad.id, ad.nombre)}
                              className="p-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 transition cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalAdicionalesAbierto(false)}
                className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#5c4a42] text-xs font-julius font-bold uppercase tracking-wider cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL CARGA MASIVA DE FOTOS (MULTI-UPLOAD AUTOMÁTICO CON EMPAREJAMIENTO INTELIGENTE) */}
      {modalCargaMasivaAbierto && mounted && createPortal(
        <div 
          onClick={() => setModalCargaMasivaAbierto(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full border border-[#ebd3cb] shadow-2xl p-6 sm:p-8 relative space-y-6 max-h-[85vh] overflow-y-auto my-auto animate-scaleUp cursor-default"
          >
            <button
              onClick={() => setModalCargaMasivaAbierto(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f8ece8] text-[#8c6b5d] hover:bg-[#8c6b5d] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>VINCULACIÓN INTELIGENTE EN LOTE</span>
              </span>
              <h2 className="font-lemon text-2xl text-[#5c4a42] mt-1">
                Carga Masiva de Fotos (300+ imágenes)
              </h2>
              <p className="text-xs text-[#8c6b5d] font-source">
                Selecciona todas las fotos de tu carpeta de una sola vez. El algoritmo inteligente analizará los nombres de las imágenes y las vinculará automáticamente con los 303 productos en MySQL.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#faf6f4] border-2 border-dashed border-[#c29486] text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-white border border-[#ebd3cb] flex items-center justify-center text-[#c29486] shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <label
                  htmlFor="bulk-files-input"
                  className="inline-block px-6 py-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  {subiendoFotosMasivas ? "Procesando imágenes..." : "Seleccionar todas las fotos de tu equipo"}
                </label>
                <input
                  id="bulk-files-input"
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={subiendoFotosMasivas}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;

                    setSubiendoFotosMasivas(true);
                    setMensajeNotif("");
                    setErrorNotif("");
                    setReporteCargaMasiva(null);

                    try {
                      const formDataUpload = new FormData();
                      files.forEach((file) => formDataUpload.append("files", file));

                      const res = await fetch("/api/admin/bulk-upload", {
                        method: "POST",
                        body: formDataUpload,
                      });

                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Error al subir fotos masivas.");

                      setReporteCargaMasiva(data);
                      setMensajeNotif(`¡Carga completada! ${data.vinculadas} de ${data.totalProcesadas} fotos fueron vinculadas automáticamente a los productos.`);
                      await cargarProductosServidor();
                    } catch (err) {
                      setErrorNotif(err.message);
                    } finally {
                      setSubiendoFotosMasivas(false);
                    }
                  }}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-[#a88d81] font-poppins">
                Puedes seleccionar 10, 50, 100 o las 300 fotos al mismo tiempo. Formatos soportados: JPG, PNG, WEBP.
              </p>
            </div>

            {subiendoFotosMasivas && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
                <h4 className="font-bold text-xs text-emerald-900 font-poppins">Procesando y emparejando fotos automáticamente...</h4>
                <p className="text-[11px] text-emerald-700">Por favor no cierres la ventana mientras guardamos las fotos en el servidor.</p>
              </div>
            )}

            {reporteCargaMasiva && (
              <div className="space-y-4 pt-2 border-t border-[#ebd3cb]">
                <div className="flex items-center justify-between bg-[#faf6f4] p-4 rounded-2xl border border-[#ebd3cb]">
                  <div>
                    <span className="text-xs font-bold text-[#5c4a42] font-julius block">RESUMEN DE VINCULACIÓN:</span>
                    <p className="text-xs text-[#8c6b5d] font-poppins">
                      ✓ <strong className="text-emerald-700 font-bold">{reporteCargaMasiva.vinculadas}</strong> productos vinculados exitosamente.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-poppins border border-emerald-300">
                    {Math.round((reporteCargaMasiva.vinculadas / (reporteCargaMasiva.totalProcesadas || 1)) * 100)}% Éxito
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {reporteCargaMasiva.detalles.map((det, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                        det.estado === "VINCULADO"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : "bg-amber-50/70 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-bold block truncate font-poppins">{det.archivo}</span>
                        <span className="text-[10px] text-gray-600">
                          {det.productoNombre ? `➔ Vinculado a: "${det.productoNombre}"` : "Sin coincidencia directa"}
                        </span>
                      </div>
                      {det.coincidenciaScore > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-bold border shrink-0">
                          {det.coincidenciaScore}% Coincidencia
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
