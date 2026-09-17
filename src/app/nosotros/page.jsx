'use client';

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { MessageCircle, Heart, Sparkles, Truck, Check } from "lucide-react";

export default function NosotrosPage() {
  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO BANNER EDITORIAL DE NOSOTROS */}
      <AnimatedSection>
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8ece8] via-[#f3dcd3] to-[#faf6f4] p-8 sm:p-16 text-center border border-[#ebd3cb]/60 shadow-xl space-y-6">
            
            {/* BADGE DE CABECERA CON FUENTE AGBALUMO */}
            <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-white text-[#8c6b5d] font-agbalumo text-sm sm:text-base tracking-wider border border-[#ebd3cb] shadow-xs">
              NOSOTROS · ADETALLESBQ
            </div>

            <h1 className="font-lemon text-5xl sm:text-7xl text-[#5c4a42] tracking-wide max-w-4xl mx-auto leading-tight drop-shadow-xs">
              Detrás de cada detalle hay una historia de amor
            </h1>            <p className="text-xs sm:text-sm font-poppins text-[#8c6b5d] max-w-2xl mx-auto leading-relaxed font-medium">
              Somos un taller boutique en Barranquilla dedicado a transformar momentos especiales en recuerdos mágicos a través de arreglos florales, peluches exclusivos, regalos sorpresa, decoraciones y cuadros personalizados.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/productos"
                className="px-8 py-3.5 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md transition transform hover:scale-105 border border-[#785b4f]"
              >
                EXPLORAR COLECCIÓN
              </Link>
              <a
                href="https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20conocer%20mas%20de%20sus%20servicios"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-[#f8ece8] text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-widest shadow-md transition transform hover:scale-105 border border-[#ebd3cb]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>HABLAR CON ASESORA</span>
              </a>
            </div>

          </div>
        </section>
      </AnimatedSection>

      {/* 2. HISTORIA EDITORIAL (2 COLUMNAS CON FOTO REAL Y TEXTO CÁLIDO) */}
      <AnimatedSection delay={100}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl p-8 sm:p-14 border border-[#ebd3cb]/40 shadow-lg">
            
            {/* FOTOGRAFÍA EDITORIAL */}
            <div className="lg:col-span-5 relative min-h-[380px] sm:min-h-[480px] rounded-3xl overflow-hidden shadow-md group">
              <img
                src="/images/Chica.png"
                alt="Detalle especial Adetallesbq Chica"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                <span className="font-agbalumo text-xl sm:text-2xl drop-shadow-md block uppercase">
                  Adetallesbq Barranquilla
                </span>
                <span className="text-xs font-poppins opacity-90 block mt-1">
                  Artesanía y dedicación en cada empaque
                </span>
              </div>
            </div>

            {/* MANIFIESTO Y NARRATIVA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block px-8 py-2.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-xs tracking-wider border border-[#ebd3cb]">
                NUESTRA FILOSOFÍA
              </div>

              <h2 className="font-lemon text-3xl sm:text-4xl text-[#5c4a42] leading-snug">
                Creemos en la magia de los pequeños grandes gestos
              </h2>

              <p className="text-xs sm:text-sm text-[#786055] leading-relaxed font-source">
                En Adetallesbq no trabajamos como una fábrica en serie. Para nosotras, cada detalle, arreglo floral, peluche, cuadro personalizado o decoración es una pieza única que lleva un mensaje de cariño genuino.
              </p>

              <p className="text-xs sm:text-sm text-[#786055] leading-relaxed font-source">
                Diseñamos ramos de rosas de exportación, cuadros cargados de recuerdos, tiernos peluches de lujo, escenarios decorativos para celebraciones especiales y regalos sorpresa preparados con el máximo esmero en Barranquilla.
              </p>

              <div className="pt-2 flex flex-wrap gap-6 text-xs text-[#5c4a42] font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c29486]" />
                  <span>Cajas artesanales rígidas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c29486]" />
                  <span>Flores frescas del día</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c29486]" />
                  <span>Despacho garantizado</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </AnimatedSection>

      {/* 4. GALERÍA EDITORIAL DE EXPERIENCIAS (EN LUGAR DE CUADROS REPETITIVOS DE IA) */}
      <AnimatedSection delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center">
            <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs">
              LO QUE HACE ÚNICA TU EXPERIENCIA
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* TARJETA EDITORIAL 1 CON FOTO */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#ebd3cb]/50 shadow-md flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
              <div className="h-64 relative overflow-hidden bg-[#f6eeea]">
                <img
                  src="/images/Pelucherosado.png"
                  alt="Desayuno artesanal fresco y peluche rosa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#8c6b5d] font-julius font-bold text-xs">
                  01 · FRESCURA
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-agbalumo text-xl text-[#5c4a42]">
                  Ingredientes & Repostería Fina
                </h3>
                <p className="text-xs text-[#786055] leading-relaxed font-source">
                  Cada producto gastronómico es seleccionado bajo estándares de calidad, frescura e higiene para ofrecer un sabor casero excepcional.
                </p>
              </div>
            </div>

            {/* TARJETA EDITORIAL 2 CON FOTO */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#ebd3cb]/50 shadow-md flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
              <div className="h-64 relative overflow-hidden bg-[#f6eeea]">
                <img
                  src="/images/Rosasmastodo.png"
                  alt="Arreglo completo Rosas y Todo Adetallesbq"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#8c6b5d] font-julius font-bold text-xs">
                  02 · PUNTUALIDAD
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-agbalumo text-xl text-[#5c4a42]">
                  Entregas desde Primera Hora
                </h3>
                <p className="text-xs text-[#786055] leading-relaxed font-source">
                  Programamos los recorridos de entrega desde las 6:00 AM para asegurar que la sorpresa llegue justo cuando la persona despierta.
                </p>
              </div>
            </div>

            {/* TARJETA EDITORIAL 3 CON FOTO */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#ebd3cb]/50 shadow-md flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
              <div className="h-64 relative overflow-hidden bg-[#f6eeea]">
                <img
                  src="/images/Ga.png"
                  alt="Presentación exclusiva Adetallesbq Ga"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#8c6b5d] font-julius font-bold text-xs">
                  03 · PRESENTACIÓN
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-agbalumo text-xl text-[#5c4a42]">
                  Cajas Artesanales & Lazos
                </h3>
                <p className="text-xs text-[#786055] leading-relaxed font-source">
                  Acabados en tonos rosa palo y tierra, cintas satinadas y tarjetas impresas con tu mensaje especial para dejar una huella imborrable.
                </p>
              </div>
            </div>

          </div>

        </section>
      </AnimatedSection>

      {/* 5. BANNER LLAMADO A LA ACCIÓN (WHATSAPP) */}
      <AnimatedSection delay={250}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#f8ece8] p-8 sm:p-12 text-[#5c4a42] shadow-xl border border-[#ebd3cb] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="font-lemon text-4xl sm:text-5xl tracking-wide text-[#5c4a42]">
                ¿Quieres enviar una sorpresa hoy?
              </h3>
              <p className="text-xs sm:text-sm font-poppins text-[#8c6b5d] font-medium leading-relaxed">
                Escríbenos a WhatsApp y te ayudaremos a elegir la opción ideal adaptada a tus gustos.
              </p>
            </div>

            <a
              href="https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20asesoria%20para%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs tracking-widest uppercase shadow-md hover:shadow-lg transition transform hover:scale-105 border border-[#785b4f] shrink-0"
            >
              <MessageCircle className="w-5 h-5 text-emerald-300 fill-emerald-300/20" />
              <span>Hablar por WhatsApp</span>
            </a>
          </div>
        </section>
      </AnimatedSection>

    </div>
  );
}
