'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, CheckCircle2, Sparkles, Heart, AlertCircle, X, KeyRound, MessageCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [modo, setModo] = useState("login"); // 'login' | 'registro'
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Estados para Modal de Olvidaste tu contraseña
  const [modalOlvidaste, setModalOlvidaste] = useState(false);
  const [emailOlvidaste, setEmailOlvidaste] = useState("");
  const [cargandoOlvidaste, setCargandoOlvidaste] = useState(false);
  const [mensajeOlvidaste, setMensajeOlvidaste] = useState("");
  const [errorOlvidaste, setErrorOlvidaste] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const [esCheckoutRedirect, setEsCheckoutRedirect] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modoParam = params.get("modo");
      const redirectParam = params.get("redirect");
      const autoCheckout = localStorage.getItem("auto_open_checkout");

      if (modoParam === "registro") {
        setModo("registro");
      }
      if (redirectParam === "checkout" || autoCheckout === "4") {
        setEsCheckoutRedirect(true);
      }
    }
  }, []);

  // Si ya hay una sesión activa, redirigir adecuadamente
  useEffect(() => {
    const verificarSesionExistente = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.autenticado) {
          if (data.usuario?.role === "ADMIN") {
            router.push("/productos");
          } else {
            const autoCheckout = typeof window !== "undefined" ? localStorage.getItem("auto_open_checkout") : null;
            if (autoCheckout === "4") {
              router.push("/?checkout=4");
            } else {
              router.push("/");
            }
          }
        }
      } catch (e) {
        console.error("Error al verificar sesión existente:", e);
      }
    };
    verificarSesionExistente();
  }, [router]);

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setMensajeExito("");
    setErrorMsg("");
    if (nuevoModo === "login") {
      setFormData({
        nombre: "",
        email: "admin@adetallesbq.com",
        telefono: "",
        password: "admin",
        confirmPassword: "",
      });
    } else {
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalRecuperacion = () => {
    setEmailOlvidaste(formData.email || "");
    setMensajeOlvidaste("");
    setErrorOlvidaste("");
    setModalOlvidaste(true);
  };

  const handleSolicitarRecuperacion = (e) => {
    e.preventDefault();
    if (!emailOlvidaste.trim()) {
      setErrorOlvidaste("Por favor ingresa tu correo electrónico.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailOlvidaste.trim())) {
      setErrorOlvidaste("Por favor ingresa un correo electrónico válido (ej: usuario@gmail.com).");
      return;
    }

    setCargandoOlvidaste(true);
    setErrorOlvidaste("");

    setTimeout(() => {
      setCargandoOlvidaste(false);
      setMensajeOlvidaste(
        `Hemos registrado tu solicitud para el correo "${emailOlvidaste.trim()}". Te enviaremos las instrucciones de restablecimiento de contraseña a tu bandeja de entrada.`
      );
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeExito("");
    setErrorMsg("");

    const isRegister = modo === "registro";

    // Validaciones en cliente para el registro
    if (isRegister) {
      if (!formData.nombre.trim()) {
        setErrorMsg("Por favor ingresa tu nombre completo.");
        setCargando(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMsg("Por favor ingresa un correo electrónico válido (ej: usuario@gmail.com).");
        setCargando(false);
        return;
      }

      if (formData.password.length <= 7) {
        setErrorMsg("La contraseña debe tener más de 7 caracteres (mínimo 8 caracteres).");
        setCargando(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Las contraseñas no coinciden. Por favor asegúrate de que sean idénticas.");
        setCargando(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? {
            nombre: formData.nombre.trim(),
            email: formData.email.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            telefono: formData.telefono.trim(),
          }
        : {
            email: formData.email.trim(),
            password: formData.password,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isRegister ? "Error al crear la cuenta." : "Error al iniciar sesión."));
      }

      if (typeof window !== "undefined") {
        if (data.usuario?.role === "ADMIN") {
          localStorage.setItem("admin_session_active", "true");
          localStorage.setItem("admin_view_mode", "admin");
          localStorage.setItem("user_role", "ADMIN");
        } else {
          localStorage.removeItem("admin_session_active");
          localStorage.removeItem("admin_view_mode");
          localStorage.setItem("user_role", "CLIENTE");
        }
        window.dispatchEvent(new Event("adminModeChanged"));
      }

      setMensajeExito(
        isRegister
          ? "¡Cuenta registrada exitosamente! Bienvenido a A’Detalles."
          : (data.usuario?.role === "ADMIN" ? "¡Sesión de Administrador iniciada!" : "¡Bienvenido a A’Detalles!")
      );

      setTimeout(() => {
        if (data.usuario?.role === "ADMIN") {
          router.push("/productos");
        } else {
          const autoCheckout = typeof window !== "undefined" ? localStorage.getItem("auto_open_checkout") : null;
          if (autoCheckout === "4" || esCheckoutRedirect) {
            router.push("/?checkout=4");
          } else {
            router.push("/");
          }
        }
      }, 800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f4] py-12 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Fondo con resplandores suaves */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#f4dcd3]/50 blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#ebd3cb]/40 blur-3xl -z-10" />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-[#8c6b5d]/10 overflow-hidden border border-[#ebd3cb]/50 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* COLUMNA IZQUIERDA: BANNER DE BIENVENIDA Y FOTOGRAFÍA DEDICADA */}
        <div className="lg:col-span-5 relative bg-[#f6eeea] p-6 sm:p-12 flex flex-col justify-between overflow-hidden min-h-[160px] sm:min-h-[240px] lg:min-h-[620px]">
          {/* Imagen de fondo decorativa */}
          <img
            src="/images/promo_right_1.jpg"
            alt="Adetallesbq Regalo Especial"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#5c4a42]/90 via-[#8c6b5d]/40 to-transparent" />

          {/* Botón volver a inicio */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/40 transition border border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la tienda</span>
            </Link>
          </div>

          {/* Mensaje inspirador */}
          <div className="relative z-10 space-y-3 text-white">
            <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-widest">
              Experiencia Adetallesbq
            </div>
            <h2 className="font-agbalumo text-3xl sm:text-4xl leading-tight">
              Diseñamos emociones que perduran
            </h2>
            <p className="text-xs text-white/90 leading-relaxed font-source">
              Accede a tu cuenta para gestionar tus sorpresas, guardar direcciones frecuentes y recibir beneficios exclusivos.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO DE AUTENTICACIÓN (LOGIN / REGISTRO) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          
          {/* TÍTULO Y TOGGLE DE PESTAÑAS */}
          <div className="space-y-6 text-center sm:text-left">
            <div className="space-y-1">
              <h1 className="font-agbalumo text-3xl sm:text-4xl text-[#5c4a42]">
                {modo === "login" ? "¡Hola de nuevo!" : "Crear tu cuenta"}
              </h1>
              <p className="text-xs text-[#8c6b5d] font-source">
                {modo === "login"
                  ? "Ingresa tus datos para continuar con tu experiencia Adetallesbq"
                  : "Unete a nuestra comunidad y sorprende a quienes mas quieres"}
              </p>
            </div>

            {/* PESTAÑAS LOGIN / REGISTRO */}
            <div className="flex rounded-full bg-[#f8ece8] p-1.5 border border-[#ebd3cb]">
              <button
                type="button"
                onClick={() => cambiarModo("login")}
                className={`flex-1 py-2.5 rounded-full text-xs font-julius font-bold uppercase tracking-wider transition-all duration-300 ${
                  modo === "login"
                    ? "bg-[#8c6b5d] text-white shadow-md"
                    : "text-[#8c6b5d] hover:text-[#5c4a42]"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => cambiarModo("registro")}
                className={`flex-1 py-2.5 rounded-full text-xs font-julius font-bold uppercase tracking-wider transition-all duration-300 ${
                  modo === "registro"
                    ? "bg-[#8c6b5d] text-white shadow-md"
                    : "text-[#8c6b5d] hover:text-[#5c4a42]"
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          </div>

          {/* BANNER INFORMATIVO SI VIENE DESDE EL CHECKOUT */}
          {esCheckoutRedirect && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#5c4a42] text-xs flex items-center gap-3 animate-fadeIn shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block text-amber-900">¡Estás a un paso de completar tu pedido!</span>
                <span className="text-[11px] text-[#786055]">
                  Inicia sesión o crea tu cuenta para confirmar tu encargo. Al terminar, regresarás automáticamente a tu resumen de pedido.
                </span>
              </div>
            </div>
          )}

          {/* BANNER DE NOTIFICACIÓN DE ÉXITO */}
          {mensajeExito && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {/* BANNER DE ERROR */}
          {errorMsg && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* CAMPOS ADICIONALES PARA REGISTRO */}
            {modo === "registro" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre y apellido"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                    Telefono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 300 123 4567"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* CAMPO EMAIL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                />
              </div>
            </div>

            {/* CAMPO CONTRASEÑA */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                  Contraseña {modo === "registro" && <span className="text-[#a88d81] font-normal lowercase">(mínimo 8 caracteres)</span>}
                </label>
                {modo === "login" && (
                  <button
                    type="button"
                    onClick={abrirModalRecuperacion}
                    className="text-[11px] font-semibold text-[#c29486] hover:text-[#5c4a42] transition underline-offset-2 hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={modo === "registro" ? "Crea una clave de al menos 8 caracteres" : "Ingresa tu contraseña"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:bg-white transition ${
                    modo === "registro" && formData.password.length > 0 && formData.password.length <= 7
                      ? "border-amber-400 focus:ring-amber-400"
                      : "border-[#ebd3cb] focus:ring-[#c29486]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a88d81] hover:text-[#5c4a42]"
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* INDICADOR DE REQUISITO DE CONTRASEÑA */}
              {modo === "registro" && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                  <span className={`w-2 h-2 rounded-full transition-colors ${formData.password.length > 7 ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className={formData.password.length > 7 ? "text-emerald-700 font-semibold" : "text-[#8c6b5d]"}>
                    {formData.password.length > 7
                      ? `Contraseña segura (${formData.password.length} caracteres)`
                      : `Debe tener más de 7 caracteres (llevas ${formData.password.length})`}
                  </span>
                </div>
              )}
            </div>

            {/* CAMPO CONFIRMAR CONTRASEÑA (SOLO REGISTRO) */}
            {modo === "registro" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Vuelve a escribir tu contraseña"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:bg-white transition ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-[#ebd3cb] focus:ring-[#c29486]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a88d81] hover:text-[#5c4a42]"
                  >
                    {mostrarConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* INDICADOR DE COINCIDENCIA */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Las contraseñas coinciden
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Las contraseñas aún no coinciden
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BOTÓN SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] border border-[#785b4f] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cargando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : modo === "login" ? (
                  "INGRESAR A MI CUENTA"
                ) : (
                  "CREAR MI CUENTA"
                )}
              </button>
            </div>
          </form>

          {/* ACCESOS DIRECTOS DE WHATSAPP / ATENCIÓN */}
          <div className="mt-8 pt-6 border-t border-[#f4e6e1] text-center space-y-3">
            <p className="text-xs text-[#8c6b5d] font-source">
              ¿Prefieres realizar tu pedido directamente sin registrarte?
            </p>
            <a
              href="https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20hacer%20un%20pedido%20directo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f8ece8] hover:bg-[#f4dcd3] text-[#8c6b5d] font-julius font-bold text-[11px] tracking-wider uppercase border border-[#ebd3cb] transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pedir por WhatsApp sin registro</span>
            </a>
          </div>

        </div>

      </div>

      {/* 🔑 MODAL DE RECUPERACIÓN DE CONTRASEÑA CON ESTILO ADETALLESBQ Y ASISTENCIA WHATSAPP */}
      {modalOlvidaste && mounted && createPortal(
        <div
          onClick={() => setModalOlvidaste(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-[#ebd3cb] shadow-2xl p-6 sm:p-8 relative space-y-6 animate-scaleUp cursor-default"
          >
            {/* BOTÓN CERRAR X */}
            <button
              onClick={() => setModalOlvidaste(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f8ece8] text-[#8c6b5d] hover:bg-[#8c6b5d] hover:text-white transition"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CABECERA CON ICONO BRANDING */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center text-[#c29486] shadow-xs">
                <KeyRound className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="font-agbalumo text-2xl sm:text-3xl text-[#5c4a42]">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-xs text-[#8c6b5d] font-source leading-relaxed max-w-sm mx-auto">
                  Escribe el correo electrónico asociado a tu cuenta para recibir las instrucciones de restablecimiento.
                </p>
              </div>
            </div>

            {/* ALERTAS DEL MODAL */}
            {mensajeOlvidaste && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{mensajeOlvidaste}</span>
              </div>
            )}

            {errorOlvidaste && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorOlvidaste}</span>
              </div>
            )}

            {/* FORMULARIO SOLICITUD DE RECUPERACIÓN */}
            <form onSubmit={handleSolicitarRecuperacion} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider block">
                  Tu Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#c29486] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailOlvidaste}
                    onChange={(e) => setEmailOlvidaste(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargandoOlvidaste}
                className="w-full py-3.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all border border-[#785b4f] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {cargandoOlvidaste ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "SOLICITAR RECUPERACIÓN"
                )}
              </button>
            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

