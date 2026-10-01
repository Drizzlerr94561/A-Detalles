'use client';

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ShoppingBag } from "lucide-react";

export default function GlobalErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("Error capturado por error.jsx:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Elementos orgánicos flotantes de fondo con destellos pastel */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-zinc-100/60 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-zinc-100/50 blur-3xl -z-10 animate-pulse" />

      <div className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200/60 shadow-2xl shadow-[#96586c]/10 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden">
        
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-julius font-bold uppercase tracking-widest shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>ALERTA DE SISTEMA</span>
        </div>

        {/* Ilustración de Error */}
        <div className="w-20 h-20 mx-auto rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-md my-2">
          <RefreshCw className="w-10 h-10 animate-spin-slow text-zinc-600" />
        </div>

        {/* Título y Mensaje principal */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="font-agbalumo text-3xl sm:text-4xl text-zinc-900 leading-tight">
            Algo no salió como esperábamos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-source leading-relaxed">
            Hemos detectado un problema temporal al procesar la solicitud. 
            Puedes intentar reintentar el proceso nuevamente o navegar hacia el inicio.
          </p>
        </div>

        {/* Botones de Acción Directa */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset && reset()}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#F5CCD6] text-[#ba9e92] hover:bg-[#EFBAC7] text-[#ba9e92] font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all transform hover:scale-105 border-none flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Ahora</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-julius font-bold text-xs uppercase tracking-widest border border-zinc-200 shadow-sm shadow-[#F5CCD6]/40 hover:shadow-md hover:shadow-[#F5CCD6]/40 hover:-translate-y-0.5 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
