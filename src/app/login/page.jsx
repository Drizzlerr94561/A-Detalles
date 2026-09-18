'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [formData, setFormData] = useState({
    email: "admin@adetallesbq.com",
    password: "",
  });

  // Si ya hay una sesión activa de administrador, redirigir a productos/admin
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.autenticado && data.usuario?.role === "ADMIN") {
          router.push("/productos");
        }
      } catch (e) {
        console.error("Error al verificar sesión:", e);
      }
    };
    verificarSesion();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg("");
    setMensajeExito("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas.");
      }

      if (data.usuario?.role !== "ADMIN") {
        throw new Error("Acceso restringido únicamente al administrador.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_session_active", "true");
        localStorage.setItem("admin_view_mode", "admin");
        localStorage.setItem("user_role", "ADMIN");
        window.dispatchEvent(new Event("adminModeChanged"));
      }

      setMensajeExito("¡Acceso concedido! Redirigiendo al panel...");

      setTimeout(() => {
        window.location.href = "/productos";
      }, 500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#faf6f4]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#ebd3cb] shadow-xl relative">
        
        {/* ENLACE PARA VOLVER */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c6b5d] hover:text-[#5c4a42] transition font-poppins"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </Link>

        {/* CABECERA */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center text-[#8c6b5d] shadow-sm">
            <ShieldCheck className="w-8 h-8 text-[#c29486]" />
          </div>
          <div>
            <h1 className="font-agbalumo text-3xl text-[#5c4a42]">
              Acceso Administrativo
            </h1>
            <p className="text-xs text-[#8c6b5d] font-poppins mt-1">
              Panel de control exclusivo para el dueño de A’Detalles
            </p>
          </div>
        </div>

        {/* ALERTA DE ERROR */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ALERTA DE ÉXITO */}
        {mensajeExito && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* FORMULARIO DE ACCESO */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-poppins block">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 absolute left-3.5 text-[#a88d81]" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@adetallesbq.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5c4a42] uppercase tracking-wider font-poppins block">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 absolute left-3.5 text-[#a88d81]" />
              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-xs sm:text-sm text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486] transition"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3.5 text-[#a88d81] hover:text-[#5c4a42] transition p-1 cursor-pointer"
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Ingresar al Panel de Control</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#ebd3cb]/50 text-center">
          <p className="text-[11px] text-[#a88d81] font-poppins">
            A’Detalles Barranquilla · Sistema Administrativo
          </p>
        </div>

      </div>
    </div>
  );
}
