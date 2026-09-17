import Link from "next/link";
import { Sparkles, Home, ShoppingBag, ArrowLeft, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf6f4] py-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Elementos orgánicos flotantes de fondo con destellos pastel */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#f4dcd3]/60 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#ebd3cb]/50 blur-3xl -z-10 animate-pulse" />

      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#ebd3cb]/60 shadow-2xl shadow-[#8c6b5d]/10 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden">
        
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#f8ece8] text-[#8c6b5d] border border-[#ebd3cb] text-xs font-julius font-bold uppercase tracking-widest shadow-xs">
          <Sparkles className="w-4 h-4 text-[#c29486]" />
          <span>404 · PÁGINA NO ENCONTRADA</span>
        </div>

        {/* Ilustración / Gráfico 404 de Marca */}
        <div className="relative my-4">
          <h2 className="font-agbalumo text-7xl sm:text-9xl text-[#f3dcd3] tracking-widest select-none drop-shadow-sm">
            404
          </h2>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#8c6b5d] text-white flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-500">
              <Heart className="w-10 h-10 fill-white" />
            </div>
          </div>
        </div>

        {/* Título y Mensaje principal */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="font-agbalumo text-3xl sm:text-4xl text-[#5c4a42] leading-tight">
            ¡Ups! No encontramos lo que buscabas
          </h1>
          <p className="text-xs sm:text-sm text-[#8c6b5d] font-source leading-relaxed">
            La página que estás intentando abrir no se encuentra disponible o cambió de enlace. 
            Te invitamos a continuar navegando por nuestras colecciones y detalles especiales.
          </p>
        </div>

        {/* Botones de Navegación Directos */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-[#785b4f] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <Link
            href="/productos"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#f8ece8] hover:bg-[#f4dcd3] text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-widest border border-[#ebd3cb] shadow-xs hover:shadow-md transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
