'use client';

function WhatsappIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.18-1.238-6.163-3.486-8.414" />
    </svg>
  );
}

export default function BotonWhatsappFlotante() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
      {/* MENSAJITO EMERGENTE ELEGANTE EN FUENTE AGBALUMO */}
      <div className="opacity-0 translate-x-4 scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none">
        <div className="px-6 py-3 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base tracking-wider border border-[#ebd3cb] shadow-xl shadow-[#8c6b5d]/10 whitespace-nowrap flex items-center gap-2">
          <span>Personaliza tu pedido</span>
        </div>
      </div>

      {/* BOTÓN FLOTANTE VERDE WHATSAPP AMPLIADO (MÁS GRANDE) */}
      <a
        href="https://wa.me/?text=Hola%20A%E2%80%99Detalles,%20quisiera%20personalizar%20un%20pedido"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Personaliza tu pedido por WhatsApp"
        className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-110 active:scale-95 relative shrink-0"
      >
        <WhatsappIcon className="w-10 h-10 text-white drop-shadow-sm" />
        
        {/* Anillo de pulso sutil y más lento (3.5 segundos) */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10"
          style={{ animationDuration: '3.5s' }}
        />
      </a>
    </div>
  );
}
