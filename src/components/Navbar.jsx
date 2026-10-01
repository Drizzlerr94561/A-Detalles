'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Sparkles, Globe, ShieldCheck, LogOut, Package, ClipboardList, Menu, X, Home } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, abrirCarrito, vaciarCarrito } = useCart();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState("admin");
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuMovilAbierto(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const updateViewModeState = () => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("admin_view_mode") || "admin";
      setViewMode(mode);
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.autenticado && data.usuario && data.usuario.role === "ADMIN") {
        setCurrentUser(data.usuario);
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_session_active", "true");
          localStorage.setItem("user_role", "ADMIN");
        }
      } else {
        setCurrentUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_session_active");
          localStorage.removeItem("user_role");
        }
      }
    } catch (e) {
      console.error("Error al verificar sesión:", e);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    updateViewModeState();
    checkSession();

    window.addEventListener("adminModeChanged", updateViewModeState);
    window.addEventListener("adminModeChanged", checkSession);
    window.addEventListener("storage", updateViewModeState);
    window.addEventListener("storage", checkSession);

    return () => {
      window.removeEventListener("adminModeChanged", updateViewModeState);
      window.removeEventListener("adminModeChanged", checkSession);
      window.removeEventListener("storage", updateViewModeState);
      window.removeEventListener("storage", checkSession);
    };
  }, [pathname, mounted]);

  const toggleAdminViewMode = (modoDestino) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_view_mode", modoDestino);
      window.dispatchEvent(new Event("adminModeChanged"));
      setViewMode(modoDestino);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
    vaciarCarrito();
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_session_active");
      localStorage.removeItem("admin_view_mode");
      localStorage.removeItem("user_role");
      localStorage.removeItem("adetallesbq_cart");
      window.dispatchEvent(new Event("adminModeChanged"));
      window.dispatchEvent(new Event("userLoggedOut"));
      window.dispatchEvent(new Event("cartReset"));
    }
    setCurrentUser(null);
    window.location.href = "/";
  };

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="w-full bg-white border-b border-[#f7dbe3] sticky top-0 z-40">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-[#fdf0f4] via-[#f5c6d4] to-[#fdf0f4] py-1.5 sm:py-2 px-2 sm:px-4 text-center border-b border-[#f7dbe3]/60 relative overflow-hidden">
        <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 max-w-full sm:max-w-4xl mx-auto px-1">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#b87186] shrink-0 animate-pulse" />
          <p className="text-[9px] sm:text-[11px] font-semibold text-[#774354] uppercase tracking-wider font-poppins leading-tight truncate sm:whitespace-normal">
            ENVÍOS A TODA BARRANQUILLA · CATÁLOGO DISPONIBLE PARA ENVÍOS AL DÍA SIGUIENTE
          </p>
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#b87186] shrink-0 animate-pulse hidden xs:inline-block" />
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* BOTÓN MENÚ HAMBURGUESA (SOLO EN MÓVILES) */}
        <button
          type="button"
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          className="md:hidden p-2 rounded-2xl bg-[#fef8fa] hover:bg-[#fdf0f4] text-[#96586c] border border-[#f7dbe3] transition flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Abrir menú de navegación"
        >
          {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* LOGO ADETALLESBQ */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#fdf0f4]/80 border border-[#f7dbe3] p-1 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shadow-xs shrink-0">
            <img 
              src="/images/logo.png" 
              alt="A’Detalles Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-agbalumo text-xl sm:text-3xl text-[#522d3a] leading-none">
              A’Detalles
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#96586c] font-semibold tracking-widest uppercase mt-0.5">
              BREAKFAST & GIFTS
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN EN ESCRITORIO (MD:FLEX) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-agbalumo text-sm sm:text-base lg:text-lg tracking-wider text-[#96586c]">
          <Link
            href="/"
            className={`hover:text-[#522d3a] transition uppercase border-b-2 pb-1 ${
              pathname === "/" ? "border-[#d48c9f] text-[#522d3a]" : "border-transparent"
            }`}
          >
            INICIO
          </Link>
          <Link
            href="/productos"
            className={`hover:text-[#522d3a] transition uppercase border-b-2 pb-1 ${
              pathname === "/productos" ? "border-[#d48c9f] text-[#522d3a]" : "border-transparent"
            }`}
          >
            CATÁLOGO
          </Link>
          <Link
            href="/nosotros"
            className={`hover:text-[#522d3a] transition uppercase border-b-2 pb-1 ${
              pathname === "/nosotros" ? "border-[#d48c9f] text-[#522d3a]" : "border-transparent"
            }`}
          >
            NOSOTROS
          </Link>
        </nav>

        {/* ACCIONES Y BOTONES (DERECHA) */}
        <div className="flex items-center gap-2 sm:gap-4 text-[#96586c]">
          {/* BOTÓN TOGGLE VISTA CLIENTE / VISTA ADMIN */}
          {mounted && isAdmin && (
            viewMode === "admin" ? (
              <button
                type="button"
                onClick={() => toggleAdminViewMode("cliente")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#fdf0f4] hover:bg-[#96586c] text-[#96586c] hover:text-white font-julius font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition border border-[#f7dbe3] shadow-xs group shrink-0 cursor-pointer"
                title="Cambiar a vista cliente"
              >
                <Globe className="w-3.5 h-3.5 text-[#b87186] group-hover:text-white" />
                <span className="hidden sm:inline">Ver Sitio Web</span>
                <span className="sm:hidden">Sitio</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleAdminViewMode("admin")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-julius font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition border border-emerald-200 shadow-xs group shrink-0 cursor-pointer"
                title="Activar Modo Administrador"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                <span className="hidden sm:inline">Modo Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )
          )}

          {/* MENÚ EXCLUSIVO DE ADMINISTRADOR */}
          {mounted && isAdmin && (
            <div className="relative group py-2">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative hover:text-[#522d3a] transition p-2 flex items-center justify-center rounded-full hover:bg-[#fdf0f4] cursor-pointer"
                title="Administrador Oficial A’Detalles"
              >
                <User className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.8] text-emerald-700" />
                <span 
                  className={`absolute top-0.5 right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white shadow-xs ${
                    viewMode === "admin" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`} 
                />
              </button>

              <div 
                className={`absolute right-0 top-full pt-1 transition-all duration-300 z-50 transform min-w-[210px] sm:min-w-[220px] ${
                  userMenuOpen 
                    ? "opacity-100 pointer-events-auto translate-y-0" 
                    : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto translate-y-1 group-hover:translate-y-0"
                }`}
              >
                <div className="bg-white rounded-2xl p-3 shadow-2xl border border-[#f7dbe3] space-y-2.5">
                  <div className="px-3 py-2 rounded-xl bg-[#fef8fa] border border-[#f7dbe3]/50 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#522d3a] leading-tight font-poppins truncate">
                        Administrador
                      </p>
                      <p className="text-[10px] text-[#96586c] font-poppins truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-[#f7dbe3]/40 space-y-1">
                    <Link
                      href="/admin/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition font-poppins"
                    >
                      <ClipboardList className="w-4 h-4 text-emerald-600" />
                      <span>Pedidos Recibidos</span>
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#522d3a] hover:bg-[#fdf0f4] transition font-poppins"
                    >
                      <Package className="w-4 h-4 text-[#d48c9f]" />
                      <span>Gestionar Catálogo</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleCerrarSesion();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-julius font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN CARRITO */}
          <button
            type="button"
            onClick={abrirCarrito}
            className="relative hover:text-[#522d3a] transition p-2 hover:scale-105 cursor-pointer text-[#96586c]"
            title="Abrir Carrito de Compras"
          >
            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.8]" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d48c9f] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* 📱 MENÚ NAVEGACIÓN MÓVIL (DESLIZANTE PARA CELULARES) */}
      {menuMovilAbierto && (
        <div className="md:hidden bg-[#fef8fa] border-t border-[#f7dbe3] px-5 py-6 shadow-xl space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#b87186] uppercase tracking-widest block font-poppins">
              Navegación
            </span>
            <h4 className="font-lemon text-lg text-[#522d3a]">Explora A’Detalles</h4>
          </div>

          <nav className="flex flex-col gap-2 font-agbalumo text-base text-[#96586c]">
            <Link
              href="/"
              onClick={() => setMenuMovilAbierto(false)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl transition ${
                pathname === "/" 
                  ? "bg-[#96586c] text-white shadow-sm" 
                  : "bg-white text-[#96586c] border border-[#f7dbe3]/50 hover:bg-[#fdf0f4]"
              }`}
            >
              <Home className="w-5 h-5 text-[#b87186]" />
              <span>INICIO</span>
            </Link>

            <Link
              href="/productos"
              onClick={() => setMenuMovilAbierto(false)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl transition ${
                pathname === "/productos" 
                  ? "bg-[#96586c] text-white shadow-sm" 
                  : "bg-white text-[#96586c] border border-[#f7dbe3]/50 hover:bg-[#fdf0f4]"
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-[#b87186]" />
              <span>CATÁLOGO COMPLETO</span>
            </Link>

            <Link
              href="/nosotros"
              onClick={() => setMenuMovilAbierto(false)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl transition ${
                pathname === "/nosotros" 
                  ? "bg-[#96586c] text-white shadow-sm" 
                  : "bg-white text-[#96586c] border border-[#f7dbe3]/50 hover:bg-[#fdf0f4]"
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#b87186]" />
              <span>NOSOTROS</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin/pedidos"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  <span>PEDIDOS RECIBIDOS (ADMIN)</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition bg-[#fdf0f4] text-[#522d3a] border border-[#f7dbe3]"
                >
                  <Package className="w-5 h-5 text-[#d48c9f]" />
                  <span>GESTIONAR CATÁLOGO</span>
                </Link>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-[#f7dbe3]/50 flex items-center justify-between text-xs font-poppins text-[#96586c]">
            <span>Entregas a toda Barranquilla</span>
          </div>
        </div>
      )}
    </header>
  );
}

