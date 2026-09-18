'use client';

function InstagramIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const fotosInstagram = [
  {
    id: 1,
    src: "/images/Mama.png",
    alt: "Adetallesbq - Sorpresa Mamá",
    link: "https://www.instagram.com/adetallesbq/",
  },
  {
    id: 2,
    src: "/images/Juan.png",
    alt: "Adetallesbq - Detalle Juan",
    link: "https://www.instagram.com/adetallesbq/",
  },
  {
    id: 3,
    src: "/images/Rosas rojas.png",
    alt: "Adetallesbq - Rosas Rojas",
    link: "https://www.instagram.com/adetallesbq/",
  },
  {
    id: 4,
    src: "/images/Blanco.png",
    alt: "Adetallesbq - Regalo Blanco",
    link: "https://www.instagram.com/adetallesbq/",
  },
];

export default function FeedInstagram() {
  return (
    <section className="w-full space-y-8 pt-4">
      {/* CINTA SEPARADORA SUPERIOR SÍGUENOS @ADETALLESBQ */}
      <div className="text-center px-4">
        <a
          href="https://www.instagram.com/adetallesbq/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs hover:bg-[#f4dcd3] transition-colors duration-300"
        >
          <span>SÍGUENOS @ADETALLESBQ</span>
        </a>
      </div>

      {/* GRID DE 4 FOTOS INSTAGRAM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {fotosInstagram.map((foto) => (
            <a
              key={foto.id}
              href={foto.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl bg-[#f6eeea] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={foto.src}
                alt={foto.alt}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Overlay suave al pasar el mouse con icono de Instagram */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 text-[#8c6b5d] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <InstagramIcon className="w-6 h-6" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
