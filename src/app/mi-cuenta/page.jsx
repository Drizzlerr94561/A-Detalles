'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  ClipboardList,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  Loader2,
  Sparkles,
  Heart,
  Home,
  Briefcase,
} from "lucide-react";

function MiCuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "datos";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Mensajes de alerta generales
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Tab Datos
  const [perfilForm, setPerfilForm] = useState({ nombre: "", telefono: "" });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Tab Direcciones
  const [direcciones, setDirecciones] = useState([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false);
  const [modalDireccionAbierto, setModalDireccionAbierto] = useState(false);
  const [direccionEditando, setDireccionEditando] = useState(null);
  const [dirForm, setDirForm] = useState({
    etiqueta: "Casa",
    direccion: "",
    barrio: "",
    ciudad: "Barranquilla",
    destinatario: "",
    telefonoDestinatario: "",
    indicaciones: "",
    esPrincipal: false,
  });
  const [guardandoDir, setGuardandoDir] = useState(false);

  // Tab Pedidos
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // Tab Seguridad (Contraseña)
  const [passForm, setPassForm] = useState({
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });
  const [mostrarPassActual, setMostrarPassActual] = useState(false);
  const [mostrarPassNueva, setMostrarPassNueva] = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);

  // Cargar usuario inicial
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.autenticado || !data.usuario) {
          router.push("/login");
          return;
        }
        setUsuario(data.usuario);
        setPerfilForm({
          nombre: data.usuario.nombre || "",
          telefono: data.usuario.telefono || "",
        });
      } catch (e) {
        console.error("Error al cargar usuario:", e);
        router.push("/login");
      } finally {
        setCargando(false);
      }
    };
    cargarUsuario();
  }, [router]);

  // Cargar datos según pestaña activa
  useEffect(() => {
    setMensajeExito("");
    setErrorMsg("");

    if (activeTab === "direcciones" && usuario) {
      cargarDirecciones();
    } else if (activeTab === "pedidos" && usuario) {
      cargarPedidos();
    }
  }, [activeTab, usuario]);

  const cargarDirecciones = async () => {
    setCargandoDirecciones(true);
    try {
      const res = await fetch("/api/usuario/direcciones");
      const data = await res.json();
      if (res.ok) {
        setDirecciones(data.direcciones || []);
      }
    } catch (e) {
      console.error("Error al cargar direcciones:", e);
    } finally {
      setCargandoDirecciones(false);
    }
  };

  const cargarPedidos = async () => {
    setCargandoPedidos(true);
    try {
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      if (res.ok) {
        setPedidos(data.pedidos || []);
      }
    } catch (e) {
      console.error("Error al cargar pedidos:", e);
    } finally {
      setCargandoPedidos(false);
    }
  };

  // Guardar cambios en perfil
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    setMensajeExito("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfilForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el perfil");

      setUsuario((prev) => ({ ...prev, ...data.usuario }));
      setMensajeExito("¡Tus datos han sido actualizados con éxito!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // Guardar dirección (crear o editar)
  const abrirModalNuevaDireccion = () => {
    setDireccionEditando(null);
    setDirForm({
      etiqueta: "Casa",
      direccion: "",
      barrio: "",
      ciudad: "Barranquilla",
      destinatario: usuario?.nombre || "",
      telefonoDestinatario: usuario?.telefono || "",
      indicaciones: "",
      esPrincipal: direcciones.length === 0,
    });
    setModalDireccionAbierto(true);
  };

  const abrirModalEditarDireccion = (dir) => {
    setDireccionEditando(dir);
    setDirForm({
      etiqueta: dir.etiqueta || "Casa",
      direccion: dir.direccion || "",
      barrio: dir.barrio || "",
      ciudad: dir.ciudad || "Barranquilla",
      destinatario: dir.destinatario || "",
      telefonoDestinatario: dir.telefonoDestinatario || "",
      indicaciones: dir.indicaciones || "",
      esPrincipal: dir.esPrincipal || false,
    });
    setModalDireccionAbierto(true);
  };

  const handleGuardarDireccion = async (e) => {
    e.preventDefault();
    setGuardandoDir(true);
    setMensajeExito("");
    setErrorMsg("");

    try {
      const url = "/api/usuario/direcciones";
      const method = direccionEditando ? "PUT" : "POST";
      const body = direccionEditando ? { ...dirForm, id: direccionEditando.id } : dirForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar dirección");

      setModalDireccionAbierto(false);
      await cargarDirecciones();
      setMensajeExito(direccionEditando ? "Dirección actualizada correctamente" : "Nueva dirección guardada con éxito");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGuardandoDir(false);
    }
  };

  const handleEliminarDireccion = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta dirección?")) return;
    try {
      const res = await fetch(`/api/usuario/direcciones?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDirecciones((prev) => prev.filter((d) => d.id !== id));
        setMensajeExito("Dirección eliminada correctamente");
      }
    } catch (e) {
      console.error("Error al eliminar:", e);
    }
  };

  // Cambiar contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setGuardandoPass(true);
    setMensajeExito("");
    setErrorMsg("");

    if (passForm.nuevaPassword.length <= 7) {
      setErrorMsg("La nueva contraseña debe tener más de 7 caracteres.");
      setGuardandoPass(false);
      return;
    }

    if (passForm.nuevaPassword !== passForm.confirmarPassword) {
      setErrorMsg("La confirmación de la nueva contraseña no coincide.");
      setGuardandoPass(false);
      return;
    }

    try {
      const res = await fetch("/api/usuario/cambiar-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordActual: passForm.passwordActual,
          nuevaPassword: passForm.nuevaPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");

      setPassForm({ passwordActual: "", nuevaPassword: "", confirmarPassword: "" });
      setMensajeExito("¡Tu contraseña ha sido actualizada con éxito!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGuardandoPass(false);
    }
  };

  const formatearPrecio = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "$0";
    return `$${num.toLocaleString("es-CO")}`;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#faf6f4] flex flex-col items-center justify-center p-6 text-[#8c6b5d]">
        <Loader2 className="w-10 h-10 animate-spin text-[#c29486] mb-4" />
        <p className="font-julius font-bold text-sm tracking-wider uppercase">Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6f4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ENCABEZADO PERFIL */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center text-[#c29486] shadow-inner shrink-0">
              <User className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-lemon text-2xl sm:text-3xl text-[#5c4a42]">
                  {usuario?.nombre || "Mi Cuenta"}
                </h1>
                <span className="px-3 py-1 rounded-full bg-[#f8ece8] text-[10px] font-bold text-[#8c6b5d] uppercase tracking-wider font-poppins border border-[#ebd3cb]">
                  Cliente Adetallesbq
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8c6b5d] font-source mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c29486]" />
                <span>{usuario?.email}</span>
                {usuario?.telefono && (
                  <>
                    <span className="text-[#ebd3cb]">•</span>
                    <Phone className="w-3.5 h-3.5 text-[#c29486]" />
                    <span>{usuario?.telefono}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo</span>
          </Link>
        </div>

        {/* NOTIFICACIONES */}
        {mensajeExito && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-[#ebd3cb]/60 no-scrollbar">
          <button
            onClick={() => setActiveTab("datos")}
            className={`px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-julius font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              activeTab === "datos"
                ? "bg-[#8c6b5d] text-white shadow-md"
                : "bg-white text-[#8c6b5d] hover:bg-[#f8ece8] border border-[#ebd3cb]/50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mis Datos</span>
          </button>

          <button
            onClick={() => setActiveTab("direcciones")}
            className={`px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-julius font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              activeTab === "direcciones"
                ? "bg-[#8c6b5d] text-white shadow-md"
                : "bg-white text-[#8c6b5d] hover:bg-[#f8ece8] border border-[#ebd3cb]/50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Mis Direcciones</span>
          </button>

          <button
            onClick={() => setActiveTab("pedidos")}
            className={`px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-julius font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              activeTab === "pedidos"
                ? "bg-[#8c6b5d] text-white shadow-md"
                : "bg-white text-[#8c6b5d] hover:bg-[#f8ece8] border border-[#ebd3cb]/50"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Mis Pedidos</span>
          </button>

          <button
            onClick={() => setActiveTab("seguridad")}
            className={`px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-julius font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "seguridad"
                ? "bg-[#8c6b5d] text-white shadow-md"
                : "bg-white text-[#8c6b5d] hover:bg-[#f8ece8] border border-[#ebd3cb]/50"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Seguridad</span>
          </button>
        </div>

        {/* CONTENIDO SEGÚN TAB */}

        {/* 1. MIS DATOS */}
        {activeTab === "datos" && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebd3cb]/60 shadow-lg space-y-6">
            <div>
              <h2 className="font-lemon text-xl text-[#5c4a42]">Información Personal</h2>
              <p className="text-xs text-[#8c6b5d] mt-1 font-source">
                Mantén tus datos actualizados para agilizar tus pedidos de regalos y sorpresas.
              </p>
            </div>

            <form onSubmit={handleGuardarPerfil} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={perfilForm.nombre}
                    onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-sm text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Correo Electrónico (Registrado)
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#a88d81] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={usuario?.email || ""}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#f0eae6] border border-[#ebd3cb] text-sm text-[#8c6b5d] cursor-not-allowed opacity-80"
                  />
                </div>
                <p className="text-[10px] text-[#a88d81] mt-1 font-poppins">El correo electrónico no puede ser modificado.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={perfilForm.telefono}
                    onChange={(e) => setPerfilForm({ ...perfilForm, telefono: e.target.value })}
                    placeholder="Ej: 300 123 4567"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={guardandoPerfil}
                  className="px-8 py-3.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {guardandoPerfil && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. MIS DIRECCIONES */}
        {activeTab === "direcciones" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-lemon text-xl text-[#5c4a42]">Direcciones de Entrega Guardadas</h2>
                <p className="text-xs text-[#8c6b5d] mt-1 font-source">
                  Guarda tus destinos frecuentes en Barranquilla (Casa, Oficina, Dirección de tu pareja) para pedirlos al instante.
                </p>
              </div>

              <button
                onClick={abrirModalNuevaDireccion}
                className="px-6 py-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Dirección</span>
              </button>
            </div>

            {cargandoDirecciones ? (
              <div className="p-12 text-center text-[#8c6b5d] bg-white rounded-3xl border border-[#ebd3cb]/50">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c29486] mb-3" />
                <p className="text-xs font-julius font-bold uppercase tracking-wider">Cargando tus direcciones...</p>
              </div>
            ) : direcciones.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#ebd3cb]/50 shadow-sm space-y-4">
                <MapPin className="w-12 h-12 text-[#c29486] mx-auto opacity-50" />
                <h3 className="font-lemon text-lg text-[#5c4a42]">No tienes direcciones guardadas</h3>
                <p className="text-xs text-[#8c6b5d] max-w-md mx-auto">
                  Agrega una dirección para que al realizar un pedido en tu carrito se autocompleten todos los datos del destinatario y la entrega.
                </p>
                <button
                  onClick={abrirModalNuevaDireccion}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f8ece8] hover:bg-[#c29486] text-[#8c6b5d] hover:text-white font-julius font-bold text-xs uppercase tracking-wider transition border border-[#ebd3cb]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar mi primera dirección</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {direcciones.map((dir) => (
                  <div
                    key={dir.id}
                    className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-md flex flex-col justify-between relative ${
                      dir.esPrincipal ? "border-[#c29486] ring-2 ring-[#c29486]/30" : "border-[#ebd3cb]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8ece8] text-[#8c6b5d] text-[11px] font-bold font-julius uppercase tracking-wider border border-[#ebd3cb]">
                          {dir.etiqueta === "Casa" && <Home className="w-3.5 h-3.5 text-[#c29486]" />}
                          {dir.etiqueta === "Trabajo" && <Briefcase className="w-3.5 h-3.5 text-[#c29486]" />}
                          {dir.etiqueta === "Pareja" && <Heart className="w-3.5 h-3.5 text-[#c29486]" />}
                          {dir.etiqueta !== "Casa" && dir.etiqueta !== "Trabajo" && dir.etiqueta !== "Pareja" && (
                            <MapPin className="w-3.5 h-3.5 text-[#c29486]" />
                          )}
                          <span>{dir.etiqueta}</span>
                        </span>

                        {dir.esPrincipal && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                            Principal
                          </span>
                        )}
                      </div>

                      <h4 className="font-lemon text-base text-[#5c4a42] leading-snug">
                        {dir.destinatario || "Para entregar"}
                      </h4>
                      {dir.telefonoDestinatario && (
                        <p className="text-xs text-[#8c6b5d] font-poppins mt-0.5">
                          📞 {dir.telefonoDestinatario}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-[#f4e6e1] space-y-1 text-xs text-[#786055] font-source">
                        <p className="font-semibold text-[#5c4a42]">{dir.direccion}</p>
                        <p className="text-[11px] text-[#8c6b5d]">
                          Barrio: <strong>{dir.barrio}</strong> • {dir.ciudad}
                        </p>
                        {dir.indicaciones && (
                          <p className="text-[11px] italic text-[#a88d81] pt-1">
                            &quot;{dir.indicaciones}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#f4e6e1] flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditarDireccion(dir)}
                        className="p-2 rounded-xl text-[#8c6b5d] hover:text-[#5c4a42] hover:bg-[#f8ece8] transition cursor-pointer"
                        title="Editar dirección"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarDireccion(dir.id)}
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                        title="Eliminar dirección"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MIS PEDIDOS (SIN ESTADOS COMPLEJOS) */}
        {activeTab === "pedidos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-lg">
              <h2 className="font-lemon text-xl text-[#5c4a42]">Historial de Mis Pedidos</h2>
              <p className="text-xs text-[#8c6b5d] mt-1 font-source">
                Aquí queda registrado cada pedido que has realizado para consultar los regalos pedidos y contactarnos en cualquier momento.
              </p>
            </div>

            {cargandoPedidos ? (
              <div className="p-12 text-center text-[#8c6b5d] bg-white rounded-3xl border border-[#ebd3cb]/50">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c29486] mb-3" />
                <p className="text-xs font-julius font-bold uppercase tracking-wider">Cargando tus pedidos...</p>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#ebd3cb]/50 shadow-sm space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#c29486] mx-auto opacity-50" />
                <h3 className="font-lemon text-lg text-[#5c4a42]">Aún no has realizado pedidos</h3>
                <p className="text-xs text-[#8c6b5d] max-w-md mx-auto">
                  Explora nuestro catálogo de desayunos sorpresa, flores y boxes artesanales para crear tu primer detalle.
                </p>
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ir al Catálogo</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {pedidos.map((pedido) => {
                  let itemsList = [];
                  try {
                    itemsList = typeof pedido.items === "string" ? JSON.parse(pedido.items) : (pedido.items || []);
                  } catch {
                    itemsList = [];
                  }

                  const fechaTexto = new Date(pedido.createdAt).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={pedido.id}
                      className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd3cb]/60 shadow-md hover:shadow-lg transition space-y-5"
                    >
                      {/* BARRA SUPERIOR DEL PEDIDO */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f4e6e1]">
                        <div className="flex items-center gap-3">
                          <span className="px-3.5 py-1 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-lemon text-xs sm:text-sm border border-[#ebd3cb]">
                            {pedido.codigo}
                          </span>
                          <span className="text-xs text-[#8c6b5d] font-poppins flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#c29486]" />
                            {fechaTexto}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#8c6b5d] font-julius font-bold uppercase tracking-wider">
                            Total Pedido:
                          </span>
                          <span className="font-lemon text-lg sm:text-xl text-[#5c4a42]">
                            {formatearPrecio(pedido.total)}
                          </span>
                        </div>
                      </div>

                      {/* LISTA DE REGALOS COMPRADOS */}
                      <div className="space-y-3">
                        <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider">
                          Productos en este pedido ({itemsList.reduce((acc, i) => acc + (i.cantidad || 1), 0)} ítems)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {itemsList.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/40 flex items-center gap-3"
                            >
                              {item.imagen && (
                                <img
                                  src={item.imagen}
                                  alt={item.nombre}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#ebd3cb]"
                                />
                              )}
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-[#5c4a42] font-poppins truncate">
                                  {item.nombre}
                                </p>
                                <p className="text-[11px] text-[#8c6b5d] font-poppins">
                                  Cant: {item.cantidad} • {formatearPrecio(item.precio * item.cantidad)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DETALLES DE ENTREGA */}
                      <div className="p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50 text-xs text-[#786055] font-source space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-[#5c4a42]">
                          <MapPin className="w-4 h-4 text-[#c29486]" />
                          <span>Entrega para: {pedido.destinatario || "Destinatario no especificado"}</span>
                          {pedido.telefonoDestinatario && (
                            <span className="text-[11px] text-[#8c6b5d] font-normal">({pedido.telefonoDestinatario})</span>
                          )}
                        </div>
                        <p className="pl-6 text-[11px]">
                          <strong>Dirección:</strong> {pedido.direccionEntrega || "No especificada"}{" "}
                          {pedido.barrioEntrega && `• Barrio ${pedido.barrioEntrega}`}
                        </p>
                        {pedido.fechaEntrega && (
                          <p className="pl-6 text-[11px]">
                            <strong>Fecha deseada de entrega:</strong> {pedido.fechaEntrega}
                          </p>
                        )}
                        {pedido.mensajeTarjeta && (
                          <p className="pl-6 text-[11px] italic text-[#a88d81]">
                            <strong>Mensaje para la tarjeta:</strong> &quot;{pedido.mensajeTarjeta}&quot;
                          </p>
                        )}
                      </div>

                      {/* CONTACTAR SOBRE EL PEDIDO POR WHATSAPP */}
                      <div className="flex justify-end pt-1">
                        <a
                          href={`https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20consultar%20sobre%20mi%20pedido%20${encodeURIComponent(pedido.codigo)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f8ece8] hover:bg-emerald-600 text-[#8c6b5d] hover:text-white font-julius font-bold text-xs uppercase tracking-wider transition border border-[#ebd3cb] shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Consultar por WhatsApp</span>
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. SEGURIDAD (CAMBIO DE CONTRASEÑA) */}
        {activeTab === "seguridad" && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebd3cb]/60 shadow-lg space-y-6">
            <div>
              <h2 className="font-lemon text-xl text-[#5c4a42]">Seguridad de la Cuenta</h2>
              <p className="text-xs text-[#8c6b5d] mt-1 font-source">
                Actualiza tu contraseña periódicamente para mantener tu cuenta protegida. Recuerda que debe tener más de 7 caracteres.
              </p>
            </div>

            <form onSubmit={handleCambiarPassword} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarPassActual ? "text" : "password"}
                    required
                    value={passForm.passwordActual}
                    onChange={(e) => setPassForm({ ...passForm, passwordActual: e.target.value })}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassActual(!mostrarPassActual)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c6b5d] hover:text-[#5c4a42]"
                  >
                    {mostrarPassActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Nueva Contraseña (mínimo 8 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarPassNueva ? "text" : "password"}
                    required
                    minLength={8}
                    value={passForm.nuevaPassword}
                    onChange={(e) => setPassForm({ ...passForm, nuevaPassword: e.target.value })}
                    placeholder="Al menos 8 caracteres"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassNueva(!mostrarPassNueva)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c6b5d] hover:text-[#5c4a42]"
                  >
                    {mostrarPassNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passForm.confirmarPassword}
                    onChange={(e) => setPassForm({ ...passForm, confirmarPassword: e.target.value })}
                    placeholder="Repite la nueva contraseña"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={guardandoPass}
                  className="px-8 py-3.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {guardandoPass && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* MODAL CREAR / EDITAR DIRECCIÓN */}
      {modalDireccionAbierto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#3a2e28]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#ebd3cb] shadow-2xl space-y-5 animate-scaleUp overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#f4e6e1] pb-3">
              <h3 className="font-lemon text-lg text-[#5c4a42]">
                {direccionEditando ? "Editar Dirección" : "Nueva Dirección de Entrega"}
              </h3>
              <button
                onClick={() => setModalDireccionAbierto(false)}
                className="w-8 h-8 rounded-full bg-[#f8ece8] hover:bg-[#8c6b5d] text-[#8c6b5d] hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarDireccion} className="space-y-4">
              {/* ETIQUETA RÁPIDA */}
              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-2">
                  Tipo de Lugar (Etiqueta)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Casa", "Trabajo", "Pareja", "Otro"].map((et) => (
                    <button
                      key={et}
                      type="button"
                      onClick={() => setDirForm({ ...dirForm, etiqueta: et })}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold font-julius uppercase tracking-wider border transition cursor-pointer ${
                        dirForm.etiqueta === et
                          ? "bg-[#8c6b5d] text-white border-[#785b4f]"
                          : "bg-[#faf6f4] text-[#8c6b5d] border-[#ebd3cb] hover:bg-[#f8ece8]"
                      }`}
                    >
                      {et}
                    </button>
                  ))}
                </div>
              </div>

              {/* DIRECCIÓN */}
              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-1">
                  Dirección Exacta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cra 53 # 82 - 145 Apto 402"
                  value={dirForm.direccion}
                  onChange={(e) => setDirForm({ ...dirForm, direccion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                />
              </div>

              {/* BARRIO Y CIUDAD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-1">
                    Barrio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Alto Prado, Riomar, Boston..."
                    value={dirForm.barrio}
                    onChange={(e) => setDirForm({ ...dirForm, barrio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-1">
                    Ciudad / Municipio
                  </label>
                  <input
                    type="text"
                    value={dirForm.ciudad}
                    onChange={(e) => setDirForm({ ...dirForm, ciudad: e.target.value })}
                    placeholder="Barranquilla / Soledad"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* DESTINATARIO Y TELÉFONO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-1">
                    ¿Quién recibe? (Nombre)
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre de la persona"
                    value={dirForm.destinatario}
                    onChange={(e) => setDirForm({ ...dirForm, destinatario: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-1">
                    Teléfono del que recibe
                  </label>
                  <input
                    type="tel"
                    placeholder="Teléfono para el mensajero"
                    value={dirForm.telefonoDestinatario}
                    onChange={(e) => setDirForm({ ...dirForm, telefonoDestinatario: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* INDICACIONES */}
              <div>
                <label className="block text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-julius mb-1">
                  Indicaciones adicionales para entrega
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Conjunto Torres de Villa, dejar en portería si no responden al timbre."
                  value={dirForm.indicaciones}
                  onChange={(e) => setDirForm({ ...dirForm, indicaciones: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition resize-none"
                />
              </div>

              {/* MARCAR COMO PRINCIPAL */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={dirForm.esPrincipal}
                  onChange={(e) => setDirForm({ ...dirForm, esPrincipal: e.target.checked })}
                  className="rounded border-[#ebd3cb] text-[#8c6b5d] focus:ring-[#c29486] w-4 h-4"
                />
                <span className="text-xs font-poppins text-[#5c4a42]">Marcar como mi dirección principal</span>
              </label>

              {/* BOTONES ACCIÓN */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f4e6e1]">
                <button
                  type="button"
                  onClick={() => setModalDireccionAbierto(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-julius font-bold text-[#8c6b5d] hover:bg-[#faf6f4] transition uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoDir}
                  className="px-6 py-2.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {guardandoDir && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{direccionEditando ? "Guardar Cambios" : "Guardar Dirección"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MiCuentaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf6f4] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c29486]" />
        </div>
      }
    >
      <MiCuentaContent />
    </Suspense>
  );
}
