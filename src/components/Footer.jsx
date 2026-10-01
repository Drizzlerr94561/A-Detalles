'use client';

import Link from "next/link";
import { MessageCircle, Heart, MapPin, Clock, ShieldCheck, ChevronRight } from "lucide-react";

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
    <footer className="relative bg-white border-t border-zinc-200 mt-24 text-zinc-700 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* GRID PRINCIPAL DE 4 COLUMNAS */}
        <div className="pt-16 pb-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 border-b border-zinc-200">
          
          {/* COLUMNA 1: IDENTIDAD DE MARCA (4 COLS EN LG) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-13 h-13 rounded-full ring-4 ring-zinc-100 shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <img 
                  src="/images/logo.png" 
                  alt="A’Detalles Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-agbalumo text-3xl text-zinc-900 leading-tight group-hover:text-black transition-colors">
                  A’Detalles
                </span>
                <span className="font-julius font-bold text-[10px] tracking-[0.25em] text-zinc-500 uppercase mt-0.5">
                  BREAKFAST & GIFTS
                </span>
              </div>
            </Link>

            <p className="text-xs text-zinc-600 leading-relaxed font-source max-w-sm">
              Creamos momentos inolvidables a través de arreglos florales de exportación, desayunos sorpresa artesanales, peluches exclusivos y regalos preparados con todo el amor en Barranquilla.
            </p>

            {/* CHIP DE INSTAGRAM ESTILIZADO */}
            <div className="pt-1">
              <a
                href="https://www.instagram.com/adetallesbq/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 border border-zinc-200 shadow-2xs hover:shadow-xs transition transform hover:-translate-y-0.5"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
                <span>@adetallesbq</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 font-poppins">Síguenos</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN Y COLECCIONES (2 COLS EN LG) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-zinc-900">
                Explorar
              </h4>
              <span className="h-px w-6 bg-zinc-300 rounded-full" />
            </div>

            <ul className="space-y-2.5 text-xs font-source text-zinc-600">
              <li>
                <Link href="/" className="hover:text-black transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Inicio</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-black transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Catálogo Completo</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-black transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Desayunos Sorpresa</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-black transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Arreglos Florales</span>
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-black transition inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="group-hover:translate-x-1 transition-transform">Nuestra Historia</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: COBERTURA & HORARIOS (3 COLS EN LG) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-zinc-900">
                Cobertura & Horarios
              </h4>
              <span className="h-px w-6 bg-zinc-300 rounded-full" />
            </div>

            <ul className="space-y-3.5 text-xs font-source">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                <span className="text-zinc-600 leading-relaxed">Entrega a todo Barranquilla con entregas a domicilio.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                <div className="text-zinc-600 space-y-1">
                  <span className="block font-semibold text-zinc-900">Lunes a Sábado: 7:00 AM – 6:00 PM</span>
                  <span className="text-[11px] text-zinc-500 block">Domingos y festivos con reserva previa</span>
                </div>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: ATENCIÓN VIP DIRECTA EN WHATSAPP (3 COLS EN LG) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-zinc-900">
                ¿Tienes preguntas?
              </h4>
              <span className="h-px w-6 bg-zinc-300 rounded-full" />
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed font-source">
              Escríbenos directamente y te asesoramos paso a paso para elegir la sorpresa perfecta.
            </p>

            {/* TARJETA VIP WHATSAPP */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Asesora en línea
                </span>
                <span className="text-[10px] text-zinc-500">Lun - Dom</span>
              </div>

              <a
                href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20asesoria%20para%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F39EB5] hover:bg-[#F39EB5] text-white font-julius font-bold text-xs tracking-wider uppercase shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Pedir por WhatsApp</span>
              </a>

              <p className="text-[10px] text-center text-zinc-500 font-poppins">
                +57 310 662 9289 · Respuesta rápida
              </p>
            </div>
          </div>

        </div>

        {/* 3. BARRA INFERIOR DE COPYRIGHT Y CRÉDITOS */}
        <div className="py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="font-medium text-zinc-700">A’Detalles &copy; {new Date().getFullYear()}</span>
            <span>·</span>
            <span>Todos los derechos reservados</span>
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
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Acceso administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
              <span>Admin</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
