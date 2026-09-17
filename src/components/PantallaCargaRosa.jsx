'use client';

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function PantallaCargaRosa() {
  const [progreso, setProgreso] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    // Escuchar la carga real del documento o animar en 1.2 segundos
    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          clearInterval(intervalo);
          setCompletado(true);
          setTimeout(() => setOculto(true), 600); // Dar tiempo al fadeOut suave
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    const handleLoad = () => {
      // Si la página se carga antes, acelerar el progreso a 100
      setProgreso(100);
      setCompletado(true);
      setTimeout(() => setOculto(true), 600);
    };

    if (document.readyState === "complete") {
      // Si ya cargó el DOM
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (oculto) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#faf6f4] transition-all duration-700 ease-in-out ${
        completado ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Fondos orgánicos resplandecientes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f5dcd5]/50 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ebd3cb]/40 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative flex flex-col items-center text-center space-y-6 max-w-sm mx-auto px-6">
        
        {/* SVG ANIMADO DE LA ROSA CONSTRUYÉNDOSE */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md overflow-visible"
          >
            <defs>
              <linearGradient id="roseGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#8c6b5d" />
                <stop offset="50%" stopColor="#c29486" />
                <stop offset="100%" stopColor="#e09f8e" />
              </linearGradient>

              <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#786055" />
                <stop offset="100%" stopColor="#a88d81" />
              </linearGradient>

              <radialGradient id="glowGradiet" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f5dcd5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#faf6f4" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Resplandor central cuando se completa */}
            <circle
              cx="50"
              cy="40"
              r="30"
              fill="url(#glowGradiet)"
              className={`transition-opacity duration-700 ${progreso > 70 ? "opacity-100" : "opacity-0"}`}
            />

            {/* 1. TALLO QUE SE DIBUJA (DASH OFFSET) */}
            <path
              d="M50,92 C50,75 48,60 50,42"
              fill="none"
              stroke="url(#leafGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset={60 - (Math.min(progreso, 30) / 30) * 60}
              className="transition-all duration-300 ease-out"
            />

            {/* 2. HOJA IZQUIERDA */}
            <path
              d="M49,68 C40,62 30,65 34,74 C42,78 48,71 49,68 Z"
              fill="url(#leafGradient)"
              opacity={Math.max(0, (progreso - 15) / 25)}
              transform={`scale(${Math.min(1, Math.max(0, (progreso - 15) / 25))})`}
              style={{ transformOrigin: "49px 68px" }}
              className="transition-transform duration-300"
            />

            {/* 3. HOJA DERECHA */}
            <path
              d="M51,58 C60,52 70,55 66,64 C58,68 52,61 51,58 Z"
              fill="url(#leafGradient)"
              opacity={Math.max(0, (progreso - 25) / 25)}
              transform={`scale(${Math.min(1, Math.max(0, (progreso - 25) / 25))})`}
              style={{ transformOrigin: "51px 58px" }}
              className="transition-transform duration-300"
            />

            {/* 4. BASE DEL CÁLIZ */}
            <path
              d="M44,45 C44,52 56,52 56,45 C58,40 42,40 44,45 Z"
              fill="#786055"
              opacity={Math.max(0, (progreso - 35) / 20)}
            />

            {/* 5. PÉTALOS EXTERIORES (CAPA 1) */}
            <path
              d="M32,36 C28,18 45,15 50,26 C55,15 72,18 68,36 C62,50 38,50 32,36 Z"
              fill="url(#roseGradient)"
              opacity={Math.max(0, (progreso - 40) / 30)}
              transform={`scale(${Math.min(1, Math.max(0, (progreso - 40) / 30))})`}
              style={{ transformOrigin: "50px 35px" }}
              className="transition-all duration-300"
            />

            {/* 6. PÉTALOS INTERMEDIOS (CAPA 2) */}
            <path
              d="M38,32 C34,20 47,18 50,26 C53,18 66,20 62,32 C58,42 42,42 38,32 Z"
              fill="#c29486"
              opacity={Math.max(0, (progreso - 55) / 30)}
              transform={`scale(${Math.min(1, Math.max(0, (progreso - 55) / 30))})`}
              style={{ transformOrigin: "50px 32px" }}
              className="transition-all duration-300"
            />

            {/* 7. CAPULLO Y PÉTALOS INTERNOS (CAPA 3) */}
            <path
              d="M43,30 C41,22 48,20 50,25 C52,20 59,22 57,30 C54,36 46,36 43,30 Z"
              fill="#ebd3cb"
              opacity={Math.max(0, (progreso - 70) / 30)}
              transform={`scale(${Math.min(1, Math.max(0, (progreso - 70) / 30))})`}
              style={{ transformOrigin: "50px 28px" }}
              className="transition-all duration-300"
            />

            {/* ESPÍRITU / NÚCLEO CENTRAL */}
            <circle
              cx="50"
              cy="27"
              r="4"
              fill="#ffffff"
              opacity={Math.max(0, (progreso - 85) / 15)}
              className="animate-ping"
            />
          </svg>
        </div>

        {/* NOMBRE DE LA MARCA & TEXTO DE PROGRESO */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[#8c6b5d]">
            <Sparkles className="w-4 h-4 text-[#c29486] animate-spin-slow" />
            <h2 className="font-lemon text-2xl text-[#5c4a42] tracking-wide">
              A’Detalles
            </h2>
            <Sparkles className="w-4 h-4 text-[#c29486] animate-spin-slow" />
          </div>

          <p className="text-xs font-julius font-bold text-[#8c6b5d] uppercase tracking-widest">
            {completado ? "¡Sorpresa Lista!" : "Construyendo tu sorpresa..."}
          </p>
        </div>

        {/* BARRA DE PROGRESO DE MARCA */}
        <div className="w-48 h-1.5 bg-[#ebd3cb]/50 rounded-full overflow-hidden p-0.5 border border-[#ebd3cb]">
          <div
            className="h-full bg-gradient-to-r from-[#8c6b5d] via-[#c29486] to-[#e09f8e] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>

      </div>
    </div>
  );
}
