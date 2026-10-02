'use client';

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function HeroBannerCarrusel({ heroData }) {
  const imagenCloudinary = "https://res.cloudinary.com/enwlpozz/image/upload/Logochica.png";

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-5">
      
      {/* VISTA MÓVIL (TARJETA BALANCEADA Y ESPACIOSA) */}
      <div className="md:hidden relative rounded-3xl bg-gradient-to-r from-white via-zinc-50 to-zinc-100 border border-zinc-200/80 shadow-md overflow-hidden min-h-[210px] sm:min-h-[240px] flex items-center p-4 sm:p-6">
        
        {/* FOTO EN EL LADO DERECHO DEL BANNER (NÍTIDA Y SIN DEGRADADO QUE LA OPAGUE) */}
        <div className="absolute top-0 right-0 w-6/12 sm:w-1/2 h-full overflow-hidden pointer-events-none">
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
          {/* Difuminado suave solo en el borde izquierdo para no lavar ni degradar la imagen principal */}
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-white via-white/40 to-transparent z-10" />
        </div>

        {/* CONTENIDO TEXTO EN EL LADO IZQUIERDO */}
        <div className="relative z-20 max-w-[65%] space-y-2 sm:space-y-3">
          <h2 className="font-julius text-2xl sm:text-3xl font-bold text-[#4a2e38] leading-tight uppercase tracking-wide drop-shadow-xs">
            {heroData?.nombre || "COMPRA Y RECIBE HOY"}
          </h2>

          <p className="font-poppins text-xs sm:text-sm text-[#593c33] font-semibold leading-snug line-clamp-2">
            Detalles especiales para personas especiales
          </p>

          <div className="pt-1">
            <Link
              href="/productos"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#4a2e38] font-julius font-bold text-[9px] sm:text-xs tracking-wider uppercase shadow-sm border-none transition-all transform active:scale-95 cursor-pointer"
            >
              <span>VER CATÁLOGO</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4a2e38]" />
            </Link>
          </div>
        </div>

      </div>

      {/* VISTA ESCRITORIO (TARJETA ANCHA, ALTA Y ELEGANTE) */}
      <div className="hidden md:grid relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-[#4a2e38] shadow-lg border border-zinc-200 grid-cols-12 items-stretch min-h-[380px] lg:min-h-[420px]">
        
        {/* LADO IZQUIERDO: FOTOGRAFÍA ESTÁTICA DESTACADA DE CLOUDINARY */}
        <div className="col-span-6 relative h-full min-h-[380px] lg:min-h-[420px] overflow-hidden bg-zinc-50">
          <div className="relative w-full h-full min-h-[380px] lg:min-h-[420px]">
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
        <div className="col-span-6 p-8 lg:p-10 text-center flex flex-col items-center justify-center space-y-5 relative z-10 bg-zinc-50/70 backdrop-blur-xs">
          <div className="space-y-2">
            <h1 className="font-julius text-4xl lg:text-6xl text-[#4a2e38] tracking-wide uppercase leading-tight drop-shadow-xs font-bold">
              {heroData?.nombre || "COMPRA Y RECIBE HOY"}
            </h1>
            <p className="text-sm font-poppins text-[#593c33] font-semibold leading-relaxed max-w-md mx-auto">
              Detalles especiales para personas especiales
            </p>
          </div>

          <div className="pt-1.5 w-full max-w-xs space-y-3">
            <Link
              href="/productos"
              className="w-full inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#4a2e38] font-julius font-bold text-xs sm:text-sm tracking-widest uppercase shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>VER CATÁLOGO</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#4a2e38]" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#593c33] font-poppins font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Envíos a toda Barranquilla y municipios</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
