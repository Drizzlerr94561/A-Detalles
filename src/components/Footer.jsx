'use client';

import Link from "next/link";
import { MessageCircle, Heart, MapPin, Clock, Truck, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#faf6f4] via-[#f7ede7] to-[#f2ded5] border-t border-[#ebd3cb] mt-24 text-[#8c6b5d] overflow-hidden">
      
      {/* 🌸 DESTELLOS ORGÁNICOS SUAVES DE FONDO */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#f5dcd5]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ebd3cb]/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* 1. CINTA SUPERIOR DE CONFIANZA Y VALOR (4 PILARES DE LA MARCA) */}
        <div className="py-10 border-b border-[#ebd3cb]/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#ebd3cb]/80 shadow-2xs hover:shadow-xs transition">
              <div className="w-11 h-11 rounded-xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center shrink-0 text-[#c29486]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider">Entregas a Domicilio</h4>
                <p className="text-[11px] text-[#8c6b5d]/90 font-poppins mt-0.5">En toda Barranquilla y su AM</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#ebd3cb]/80 shadow-2xs hover:shadow-xs transition">
              <div className="w-11 h-11 rounded-xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center shrink-0 text-[#c29486]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider">Detalles Hechos a Mano</h4>
                <p className="text-[11px] text-[#8c6b5d]/90 font-poppins mt-0.5">Flores frescas y empaques de lujo</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#ebd3cb]/80 shadow-2xs hover:shadow-xs transition">
              <div className="w-11 h-11 rounded-xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center shrink-0 text-emerald-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider">Atención 1 a 1</h4>
                <p className="text-[11px] text-[#8c6b5d]/90 font-poppins mt-0.5">Asesoría directa en WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#ebd3cb]/80 shadow-2xs hover:shadow-xs transition">
              <div className="w-11 h-11 rounded-xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center shrink-0 text-rose-500">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div>
                <h4 className="font-julius font-bold text-xs text-[#5c4a42] uppercase tracking-wider">Amor en Cada Entrega</h4>
                <p className="text-[11px] text-[#8c6b5d]/90 font-poppins mt-0.5">Sorpresas que tocan el corazón</p>
              </div>
            </div>

          </div>
        </div>

        {/* 2. GRID PRINCIPAL DE 4 COLUMNAS */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 border-b border-[#ebd3cb]/60">
          
          {/* COLUMNA 1: IDENTIDAD DE MARCA (4 COLS EN LG) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-13 h-13 rounded-full ring-4 ring-[#f5dcd5]/70 shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <img 
                  src="/images/logo.png" 
                  alt="A’Detalles Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-agbalumo text-3xl text-[#5c4a42] leading-tight group-hover:text-[#c29486] transition-colors">
                  A’Detalles
                </span>
                <span className="font-julius font-bold text-[10px] tracking-[0.25em] text-[#a88d81] uppercase mt-0.5">
                  BREAKFAST & GIFTS
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#786055] leading-relaxed font-source max-w-sm">
              Creamos momentos inolvidables a través de arreglos florales de exportación, desayunos sorpresa artesanales, peluches exclusivos y regalos preparados con todo el amor en Barranquilla.
            </p>

            {/* CHIP DE INSTAGRAM ESTILIZADO */}
            <div className="pt-1">
              <a
                href="https://www.instagram.com/adetallesbq/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#8c6b5d] hover:text-[#5c4a42] border border-[#ebd3cb] shadow-2xs hover:shadow-xs transition transform hover:-translate-y-0.5"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
                <span>@adetallesbq</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-poppins">Síguenos</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN Y COLECCIONES (2 COLS EN LG) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#5c4a42]">
                Explorar
              </h4>
              <span className="h-px w-6 bg-[#c29486]/60 rounded-full" />
            </div>

            <ul className="space-y-2.5 text-xs font-source">
              <li>
                <Link href="/" className="hover:text-[#5c4a42] transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-[#c29486] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Inicio</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-[#5c4a42] transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-[#c29486] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Catálogo Completo</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-[#5c4a42] transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-[#c29486] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Desayunos Sorpresa</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-[#5c4a42] transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-[#c29486] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Arreglos Florales</span>
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-[#5c4a42] transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-[#c29486] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Nuestra Historia</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: COBERTURA & HORARIOS (3 COLS EN LG) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#5c4a42]">
                Cobertura & Horarios
              </h4>
              <span className="h-px w-6 bg-[#c29486]/60 rounded-full" />
            </div>

            <ul className="space-y-3.5 text-xs font-source">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c29486] shrink-0 mt-0.5" />
                <span className="text-[#6b5247] leading-relaxed">Barranquilla, Soledad y Puerto Colombia con entregas a domicilio.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c29486] shrink-0 mt-0.5" />
                <div className="text-[#6b5247] space-y-1">
                  <span className="block font-semibold">Lunes a Sábado: 7:00 AM – 6:00 PM</span>
                  <span className="text-[11px] text-[#8c6b5d] block">Domingos y festivos con reserva previa</span>
                </div>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: ATENCIÓN VIP DIRECTA EN WHATSAPP (3 COLS EN LG) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#5c4a42]">
                ¿Tienes preguntas?
              </h4>
              <span className="h-px w-6 bg-[#c29486]/60 rounded-full" />
            </div>

            <p className="text-xs text-[#786055] leading-relaxed font-source">
              Escríbenos directamente y te asesoramos paso a paso para elegir la sorpresa perfecta.
            </p>

            {/* TARJETA VIP WHATSAPP */}
            <div className="p-4 rounded-2xl bg-white/90 border border-[#ebd3cb] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Asesora en línea
                </span>
                <span className="text-[10px] text-[#a88d81]">Lun - Dom</span>
              </div>

              <a
                href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20asesoria%20para%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-julius font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir por WhatsApp</span>
              </a>

              <p className="text-[10px] text-center text-[#a88d81] font-poppins">
                +57 310 662 9289 · Respuesta rápida
              </p>
            </div>
          </div>

        </div>

        {/* 3. BARRA INFERIOR DE COPYRIGHT Y CRÉDITOS */}
        <div className="py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#8c6b5d]">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="font-medium">A’Detalles &copy; {new Date().getFullYear()}</span>
            <span>·</span>
            <span className="text-[#a88d81]">Todos los derechos reservados</span>
          </div>

          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1 font-source">
              <span>Elaborado con</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
              <span>en Barranquilla, Colombia</span>
            </div>
            <span>·</span>
            <Link 
              href="/admin" 
              className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-[#8c6b5d] hover:text-[#5c4a42] border border-[#ebd3cb]/80 transition inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Acceso administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#c29486]" />
              <span>Admin</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
