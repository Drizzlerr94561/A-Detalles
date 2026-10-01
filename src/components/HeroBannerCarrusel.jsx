'use client';

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function HeroBannerCarrusel({ heroData }) {
  const imagenCloudinary = "https://res.cloudinary.com/enwlpozz/image/upload/Logochica.png";

  return (
    <section className="relative w-full max-w-3xl sm:max-w-4xl mx-auto px-3 sm:px-4 pt-1 sm:pt-3">
      
      {/* VISTA MÓVIL (TARJETA MUY COMPACTA Y DELICADA) */}
      <div className="md:hidden relative rounded-2xl bg-gradient-to-r from-white via-zinc-50 to-zinc-100 border border-zinc-200/80 shadow-xs overflow-hidden min-h-[160px] sm:min-h-[190px] flex items-center p-3 sm:p-4">
        
        {/* FOTO EN EL LADO DERECHO DEL BANNER */}
        <div className="absolute top-0 right-0 w-5/12 h-full overflow-hidden pointer-events-none">
          <img
            src={imagenCloudinary}
            alt="Detalles especiales A'Detalles"
            referrerPolicy="no-referrer"
            loading="eager"
            onError={(e) => {
              e.currentTarget.src = "/images/Rosado.png";
            }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-[#faf7f5]/80 to-transparent z-10" />
        </div>

        {/* CONTENIDO TEXTO COMPACTO EN EL LADO IZQUIERDO */}
        <div className="relative z-20 max-w-[70%] space-y-1 sm:space-y-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#aa9083] font-julius text-[8px] font-bold tracking-wider uppercase border border-zinc-200 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#aa9083]" />
            <span>COMPRA HOY &amp; RECIBE HOY</span>
          </span>

          <h2 className="font-julius text-lg sm:text-xl font-bold text-[#aa9083] leading-tight uppercase tracking-wide drop-shadow-xs">
            {heroData?.nombre || "RECIBE HOY"}
          </h2>

          <p className="font-poppins text-[10px] text-[#aa9083] font-medium leading-snug line-clamp-2">
            Detalles especiales para personas especiales
          </p>

          <div className="pt-0.5">
            <Link
              href="/#catalogo"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#aa9083] font-julius font-bold text-[8px] sm:text-[9px] tracking-wider uppercase shadow-xs border-none transition-all transform active:scale-95 cursor-pointer"
            >
              <span>VER CATÁLOGO</span>
              <ArrowRight className="w-2.5 h-2.5 text-[#aa9083]" />
            </Link>
          </div>
        </div>

      </div>

      {/* VISTA ESCRITORIO (TARJETA COMPACTA, SÚPER EQUILIBRADA Y ESTILIZADA) */}
      <div className="hidden md:grid relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-[#aa9083] shadow-xs border border-zinc-200 grid-cols-12 items-stretch min-h-[280px]">
        
        {/* LADO IZQUIERDO: FOTOGRAFÍA ESTÁTICA DESTACADA DE CLOUDINARY */}
        <div className="col-span-5 relative h-full min-h-[280px] overflow-hidden bg-zinc-50">
          <div className="relative w-full h-full min-h-[280px]">
            <img
              src={imagenCloudinary}
              alt="Detalles especiales A'Detalles"
              referrerPolicy="no-referrer"
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = "/images/Rosado.png";
              }}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-50/30 to-white" />
          </div>
        </div>

        {/* LADO DERECHO: TEXTO PROMOCIONAL Y BOTÓN AL CATÁLOGO */}
        <div className="col-span-7 p-5 lg:p-6 text-center flex flex-col items-center justify-center space-y-3 relative z-10 bg-zinc-50/70 backdrop-blur-xs">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#aa9083] font-julius text-[10px] font-bold tracking-wider uppercase border border-zinc-200 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#aa9083]" />
            <span>COMPRA HOY &amp; RECIBE HOY</span>
          </span>

          <div className="space-y-1">
            <h1 className="font-julius text-2xl lg:text-4xl text-[#aa9083] tracking-wide uppercase leading-tight drop-shadow-xs font-bold">
              {heroData?.nombre || "RECIBE HOY"}
            </h1>
            <p className="text-xs font-poppins text-[#aa9083] font-medium leading-relaxed max-w-xs mx-auto">
              Detalles especiales para personas especiales
            </p>
          </div>

          <div className="pt-0.5 w-full max-w-xs space-y-2">
            <Link
              href="/#catalogo"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#aa9083] font-julius font-bold text-[11px] tracking-widest uppercase shadow-xs hover:shadow-sm transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>VER CATÁLOGO</span>
              <ArrowRight className="w-3 h-3 text-[#aa9083]" />
            </Link>

            <div className="flex items-center justify-center gap-1 text-[10px] text-[#aa9083] font-poppins font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Envíos a toda Barranquilla y municipios</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
