'use client';

import Link from "next/link";
import { MessageCircle, Heart, MapPin, Clock, ShieldCheck, ChevronRight, Target, FileText } from "lucide-react";

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
    <footer className="relative bg-white border-t border-zinc-200 mt-24 text-[#614539] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* BLOQUE PRINCIPAL DE 3 COLUMNAS: OCUPACIÓN | MISIÓN & VISIÓN | POLÍTICAS Y CONDICIONES */}
        <div className="pt-16 pb-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 border-b border-zinc-200">
          
          {/* COLUMNA 1: IDENTIDAD DE MARCA & ¿CUÁL ES NUESTRA OCUPACIÓN? (4 COLS EN LG) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <img 
                src="https://res.cloudinary.com/enwlpozz/image/upload/Nuevo_logo.png" 
                alt="A’Detalles Logo" 
                className="h-16 sm:h-20 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <div className="space-y-2">
              <h4 className="font-julius font-bold text-xs uppercase tracking-wider text-[#614539]">
                ¿Cuál es nuestra ocupación?
              </h4>
              <p className="text-xs text-[#614539] leading-relaxed font-poppins">
                En A’Detalles nos dedicamos a diseñar, crear y ofrecer productos exclusivos que se adaptan a las necesidades y gustos de cada cliente. Nuestro enfoque principal es personalizar detalles para eventos y celebraciones especiales como cumpleaños, bodas, aniversarios, fiestas corporativas, entre otros.
              </p>
            </div>

            {/* CHIP DE INSTAGRAM ESTILIZADO */}
            <div className="pt-2">
              <a
                href="https://www.instagram.com/adetallesbq/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-[#614539] border border-zinc-200 shadow-2xs hover:shadow-xs transition transform hover:-translate-y-0.5"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
                <span>@adetallesbq</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 text-[#614539] font-poppins">Síguenos</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: MISIÓN & VISIÓN (4 COLS EN LG) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#614539] shrink-0" />
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#614539]">
                Misión &amp; Visión
              </h4>
              <span className="h-px w-6 bg-zinc-300 rounded-full" />
            </div>

            <div className="space-y-3.5 text-xs font-poppins text-[#614539]">
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70">
                <span className="font-julius font-bold text-xs uppercase tracking-wider text-[#614539] block">
                  MISIÓN
                </span>
                <p className="leading-relaxed">
                  En A’Detalles nos especializamos en el diseño y elaboración de regalos personalizados y decoraciones exclusivas orientados a realzar momentos significativos de nuestros clientes. Nos enfocamos en ofrecer una experiencia de calidad, combinando diseño, compromiso y un alto estándar en cada detalle, con el objetivo de enriquecer celebraciones y fortalecer vínculos personales y corporativos.
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70">
                <span className="font-julius font-bold text-xs uppercase tracking-wider text-[#614539] block">
                  VISIÓN
                </span>
                <p className="leading-relaxed">
                  Destacarnos como una empresa innovadora y de confianza en el sector de los regalos personalizados y la decoración. Aspiramos a generar un impacto positivo en cada ocasión especial, ofreciendo productos que transmitan autenticidad, creatividad y emociones que perduren.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: POLÍTICAS Y CONDICIONES (4 COLS EN LG) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#614539] shrink-0" />
              <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#614539]">
                Políticas &amp; Condiciones
              </h4>
              <span className="h-px w-6 bg-zinc-300 rounded-full" />
            </div>

            <ul className="space-y-2.5 text-xs font-poppins text-[#614539] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#614539] font-bold shrink-0 mt-0.5">•</span>
                <span>Los tiempos de elaboración varían según el tipo de producto y la cantidad solicitada. Estos tiempos serán informados al momento de tomar el pedido.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#614539] font-bold shrink-0 mt-0.5">•</span>
                <span>El pago de los pedidos se realiza únicamente por transferencia. Una vez pagado, no es reembolsable. Si desea cancelar con anticipación le queda en caja para una futura compra.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#614539] font-bold shrink-0 mt-0.5">•</span>
                <span>Es responsabilidad del cliente garantizar que haya una persona disponible para recibir el pedido en el destino. En caso de direcciones incorrectas, incompletas o ausencia del destinatario, puede haber un costo adicional que deberá ser asumido.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#614539] font-bold shrink-0 mt-0.5">•</span>
                <span>En caso de presentarse algún inconveniente derivado de nuestro proceso, deberá ser informado el mismo día de la entrega para poder brindarte una solución oportuna.</span>
              </li>
            </ul>

            <p className="text-[11px] font-medium italic text-[#614539] pt-1 leading-normal">
              Gracias por confiar en A’Detalles, donde cada producto se crea con amor y dedicación.
            </p>
          </div>

        </div>

        {/* BLOQUE SECUNDARIO: NAVEGACIÓN, COBERTURA Y ATENCIÓN VIP WHATSAPP */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-zinc-200/80 items-center">
          
          {/* NAVEGACIÓN */}
          <div className="space-y-3">
            <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#614539]">
              Navegación Rápida
            </h4>
            <ul className="space-y-2 text-xs font-poppins text-[#614539] flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/" className="hover:text-black transition inline-flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Inicio</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-black transition inline-flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Catálogo</span>
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-black transition inline-flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Nosotros</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COBERTURA & HORARIOS */}
          <div className="space-y-2 text-xs font-poppins text-[#614539]">
            <h4 className="font-julius font-bold text-xs uppercase tracking-widest text-[#614539]">
              Cobertura &amp; Horarios
            </h4>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#614539] shrink-0" />
              <span>Envíos a toda Barranquilla y municipios.</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#614539] shrink-0" />
              <span>Lunes a Domingo: 7:00 AM – 6:00 PM</span>
            </div>
          </div>

          {/* ATENCIÓN WHATSAPP */}
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
                Atención por WhatsApp
              </span>
              <p className="text-[11px] text-[#614539] font-poppins font-medium">
                +57 300 463 3576
              </p>
            </div>
            <a
              href="https://wa.me/573004633576?text=Hola%20A%E2%80%99Detalles,%20quisiera%20asesoria%20para%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5CCD6] hover:bg-[#EFBAC7] text-[#614539] font-julius font-bold text-xs uppercase tracking-wider shadow-xs transition transform active:scale-95 cursor-pointer shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#614539]" />
              <span>Contactar</span>
            </a>
          </div>

        </div>

        {/* BARRA INFERIOR DE COPYRIGHT Y CRÉDITOS */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#614539]">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="font-medium text-[#614539]">A’Detalles &copy; {new Date().getFullYear()}</span>
            <span>·</span>
            <span>Todos los derechos reservados</span>
          </div>

          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1 font-poppins">
              <span>Elaborado con</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
              <span>en Barranquilla, Colombia</span>
            </div>
            <span>·</span>
            <Link 
              href="/admin" 
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#614539] border border-zinc-200 transition inline-flex items-center gap-1 text-[11px] font-semibold"
              title="Acceso administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#614539]" />
              <span>Admin</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

