'use client';

import Link from "next/link";
import { Gift, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./HeroBannerCarrusel.module.css";

function CatalogoCta() {
  return (
    <Link href="/productos" aria-label="Ver catálogo de regalos" className={styles.cta}>
      <span className={styles.gift} aria-hidden="true"><Gift size={22} strokeWidth={1.6} /></span>
      <span className={styles.copy}>
        <span className={styles.label}>VER CATÁLOGO</span>
        <span className={styles.hint} aria-hidden="true">Elige tu regalo favorito</span>
      </span>
      <span className={styles.arrow} aria-hidden="true"><ArrowRight size={19} strokeWidth={2} /></span>
    </Link>
  );
}

export default function HeroBannerCarrusel({ heroData }) {
  const imagenCloudinary = "https://res.cloudinary.com/enwlpozz/image/upload/Logochica.png";

  return (
    <section className="relative w-full max-w-6xl mx-auto px-0 sm:px-6 pt-2 sm:pt-5">
      
      {/* VISTA MÓVIL (TARJETA BALANCEADA, SUTILMENTE ELEGANTE Y SIN OVERLAP DE TEXTO) */}
      <div className={`${styles.mobileBanner} md:hidden relative rounded-none sm:rounded-3xl bg-gradient-to-r from-[#fffcfd] via-[#faf5f6] to-[#f7eeef] border-y border-[#f0dce2]/90 shadow-md shadow-[#f5ccd6]/15 overflow-hidden flex items-center p-4 sm:p-5`}>
        
        {/* FOTO EN EL LADO DERECHO DEL BANNER */}
        <div className={`${styles.mobilePhoto} absolute top-0 right-0 w-[52%] overflow-hidden pointer-events-none`}>
          <img
            src={imagenCloudinary}
            alt="Detalles especiales A'Detalles"
            referrerPolicy="no-referrer"
            loading="eager"
            onError={(e) => {
              e.currentTarget.src = "https://res.cloudinary.com/enwlpozz/image/upload/v1789706860/adetallesbq/banners/rosado.jpg";
            }}
            className="w-full h-full object-cover object-center"
          />
          {/* Difuminado suave sutil en el borde izquierdo */}
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#faf5f6] via-[#faf5f6]/50 to-transparent z-10" />
        </div>

        {/* CONTENIDO TEXTO EN EL LADO IZQUIERDO (ACOTADO AL 54% PARA QUE NUNCA SOBREPASE A LA IMAGEN) */}
        <div className="relative z-20 max-w-[54%] space-y-2 sm:space-y-3">
          <h2 className="font-julius text-[17px] xs:text-[19px] sm:text-2xl font-bold text-[#4a2e38] leading-[1.15] uppercase tracking-wide drop-shadow-xs">
            COMPRA HOY<br />Y RECIBE HOY
          </h2>

          <p className="font-poppins text-[10.5px] xs:text-[11.5px] sm:text-xs text-[#54382d] font-semibold leading-snug">
            Detalles especiales para <br className="block sm:hidden" />personas especiales
          </p>

        </div>

        <div className={styles.mobileAction}><CatalogoCta /></div>

      </div>

      {/* VISTA ESCRITORIO (TARJETA ANCHA, ALTA Y SUTILMENTE ELEGANTE) */}
      <div className="hidden md:grid relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fffcfd] via-[#faf5f6] to-[#f7eeef] text-[#4a2e38] shadow-lg border border-[#f0dce2]/90 grid-cols-12 items-stretch min-h-[380px] lg:min-h-[420px]">
        
        {/* LADO IZQUIERDO: FOTOGRAFÍA ESTÁTICA DESTACADA DE CLOUDINARY */}
        <div className="col-span-6 relative h-full min-h-[380px] lg:min-h-[420px] overflow-hidden bg-zinc-50">
          <div className="relative w-full h-full min-h-[380px] lg:min-h-[420px]">
            <img
              src={imagenCloudinary}
              alt="Detalles especiales A'Detalles"
              referrerPolicy="no-referrer"
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = "https://res.cloudinary.com/enwlpozz/image/upload/v1789706860/adetallesbq/banners/rosado.jpg";
              }}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#faf5f6]/30 to-[#faf5f6]" />
          </div>
        </div>

        {/* LADO DERECHO: TEXTO PROMOCIONAL Y BOTÓN AL CATÁLOGO */}
        <div className="col-span-6 p-8 lg:p-10 text-center flex flex-col items-center justify-center space-y-5 relative z-10 bg-[#faf5f6]/80 backdrop-blur-xs">
          <div className="space-y-2">
            <h1 className="font-julius text-4xl lg:text-6xl text-[#4a2e38] tracking-wide uppercase leading-tight drop-shadow-xs font-bold">
              {heroData?.nombre || "COMPRA HOY Y RECIBE HOY"}
            </h1>
            <p className="text-sm font-poppins text-[#54382d] font-semibold leading-relaxed max-w-md mx-auto">
              Detalles especiales para personas especiales
            </p>
          </div>

          <div className="pt-1.5 w-full max-w-xs space-y-3">
            <CatalogoCta />

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#54382d] font-poppins font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Envíos a toda Barranquilla y municipios cercanos</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
