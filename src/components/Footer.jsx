'use client';

import Link from "next/link";
import { MessageCircle, Heart, MapPin } from "lucide-react";

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
    <footer className="border-t border-[#ebd3cb]/60 bg-[#faf6f4] mt-20 pt-16 pb-12 text-[#8c6b5d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* GRID PRINCIPAL DE 4 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-[#ebd3cb]/40">
          
          {/* COLUMNA 1: BRANDING Y DESCRIPCIÓN */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="A’Detalles Logo" 
                className="w-10 h-10 object-contain rounded-xl bg-[#f5dcd5]/60 border border-[#e8c7bd] p-1"
              />
              <div>
                <h3 className="font-agbalumo text-2xl text-[#8c6b5d] tracking-wide">
                  A’Detalles
                </h3>
                <span className="font-julius font-bold text-[10px] tracking-widest text-[#a88d81] uppercase block">
                  BREAKFAST & GIFTS
                </span>
              </div>
            </div>
            <p className="text-xs text-[#8c6b5d]/90 leading-relaxed font-source">
              Detalles únicos elaborados con amor y dedicación. Especialistas en arreglos florales, regalos sorpresa, peluches, decoraciones de escenarios, cuadros personalizados y desayunos con entrega en Barranquilla.
            </p>
            <div className="pt-2">
              <a
                href="https://www.instagram.com/adetallesbq/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c6b5d] hover:text-[#5c4a42] transition"
              >
                <InstagramIcon className="w-4 h-4 text-[#c29486]" />
                <span>@adetallesbq</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
          <div className="space-y-4">
            <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#5c4a42]">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs font-source">
              <li>
                <Link href="/" className="hover:text-[#5c4a42] transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-[#5c4a42] transition">
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-[#5c4a42] transition">
                  Nosotros
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20pedir%20informacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5c4a42] transition"
                >
                  Atención por WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: ATENCIÓN Y COBERTURA */}
          <div className="space-y-4">
            <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#5c4a42]">
              Cobertura & Horarios
            </h4>
            <ul className="space-y-3 text-xs font-source">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c29486] shrink-0 mt-0.5" />
                <span>Entregas a toda Barranquilla y su área metropolitana.</span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO RÁPIDO */}
          <div className="space-y-4">
            <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#5c4a42]">
              ¿Tienes preguntas?
            </h4>
            <p className="text-xs text-[#8c6b5d]/90 leading-relaxed font-source">
              Escríbenos directamente y te asesoramos para elegir la mejor opción de sorpresa.
            </p>
            <div>
              <a
                href="https://wa.me/573106629289?text=Hola%20A%E2%80%99Detalles,%20quisiera%20asesoria%20para%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f4dcd3] hover:bg-[#c29486] text-[#8c6b5d] hover:text-white font-julius font-bold text-[11px] tracking-wider uppercase border border-[#ebd3cb] shadow-xs transition-colors duration-300"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* BARRA INFERIOR DE COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-[#a88d81]">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span>A’Detalles &copy; {new Date().getFullYear()}</span>
            <span>·</span>
            <span>Todos los derechos reservados</span>
          </div>

          <div className="flex items-center gap-1 justify-center">
            <span>Hecho con</span>
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline mx-0.5" />
            <span>en Barranquilla, Colombia</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
