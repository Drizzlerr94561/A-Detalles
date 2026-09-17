'use client';

import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { MapPin, Clock, Phone, Navigation, Truck, CheckCircle2, ChevronDown, MessageCircle, Sparkles, Building2, Car } from "lucide-react";

export default function UbicanosPage() {
  const [faqsAbiertas, setFaqsAbiertas] = useState({});

  const toggleFaq = (id) => {
    setFaqsAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const zonasCobertura = [
    {
      titulo: "Zona Norte (Despacho Exprés)",
      barrios: "Alto Prado, Riomar, El Golf, Villa Country, Villa Santos, Caujaral.",
      tiempo: "Envíos en 45 a 90 minutos según disponibilidad.",
      destacado: true,
    },
    {
      titulo: "Zona Centro & Prado",
      barrios: "El Prado, Bellavista, Boston, Recreo, Ciudad Jardín.",
      tiempo: "Envíos en 60 a 120 minutos.",
      destacado: false,
    },
    {
      titulo: "Zona Occidente & Sur",
      barrios: "Buenavista, Miramar, Villa Carolina, San José, Chiquinquirá.",
      tiempo: "Repartos programados desde primera hora de la mañana.",
      destacado: false,
    },
    {
      titulo: "Municipios Aledaños",
      barrios: "Soledad, Puerto Colombia, Galapa, Malambo.",
      tiempo: "Entregas programadas con reserva previa.",
      destacado: false,
    },
  ];

  const faqs = [
    {
      id: 1,
      pregunta: "¿Puedo recoger mi regalo en el taller personalmente?",
      respuesta: "¡Claro que sí! Contamos con atención presencial y parqueadero gratuito en nuestro taller boutique ubicado en Calle 84 # 53-18 (Alto Prado / Riomar, Barranquilla). Puedes programar la hora de recogida al realizar tu pedido.",
    },
    {
      id: 2,
      pregunta: "¿Hasta qué hora puedo pedir para entrega al día siguiente?",
      respuesta: "Aceptamos pedidos para entrega matutina (desde las 6:00 AM) hasta las 11:30 PM del día anterior. Si necesitas un pedido express el mismo día, escríbenos directamente a WhatsApp para verificar disponibilidad.",
    },
    {
      id: 3,
      pregunta: "¿Cómo funciona la garantía de entrega puntual?",
      respuesta: "Nuestros repartidores siguen rutas optimizadas en Barranquilla. En el momento exacto en que entregamos tu sorpresa, te enviamos una notificación y fotografía por WhatsApp para que confirmes que el regalo fue recibido con éxito.",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO Y CABECERA DE UBÍCANOS */}
      <AnimatedSection>
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8ece8] via-[#f3dcd3] to-[#faf6f4] p-8 sm:p-14 text-center border border-[#ebd3cb]/60 shadow-xl space-y-4">
            
            {/* CINTA DISTINTIVA EN AGBALUMO */}
            <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-white text-[#8c6b5d] font-agbalumo text-sm sm:text-base tracking-wider border border-[#ebd3cb] shadow-xs">
              UBÍCANOS · ADETALLESBQ
            </div>

            <h1 className="font-lemon text-5xl sm:text-7xl text-[#5c4a42] tracking-wide max-w-4xl mx-auto leading-tight drop-shadow-xs">
              Taller Principal & Cobertura en Barranquilla
            </h1>

            <p className="text-xs sm:text-sm font-poppins text-[#8c6b5d] max-w-2xl mx-auto leading-relaxed font-medium">
              Visítanos en nuestro taller boutique de Alto Prado para recoger tus sorpresas o consulta nuestras rutas de domicilio con despachos matutinos en toda la ciudad.
            </p>

          </div>
        </section>
      </AnimatedSection>

      {/* 2. TARJETA DE TALLER PRINCIPAL + MAPA INTERACTIVO DE BOGOTÁ */}
      <AnimatedSection delay={100}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch bg-white rounded-3xl p-6 sm:p-10 border border-[#ebd3cb]/40 shadow-xl">
            
            {/* COLUMNA DETALLES DE UBICACIÓN */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block px-6 py-2 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-xs tracking-wider border border-[#ebd3cb]">
                  PUNTO FÍSICO & ATENCIÓN
                </div>

                <h2 className="font-lemon text-3xl sm:text-4xl text-[#5c4a42] leading-snug">
                  Taller Boutique Adetallesbq
                </h2>

                <p className="text-xs text-[#786055] leading-relaxed font-source">
                  Un espacio diseñado para preparar tus sorpresas con los mejores estándares de higiene, frescura y acabado artesanal.
                </p>

                {/* LISTA DE DATOS DE UBICACIÓN */}
                <div className="space-y-4 pt-2">
                  
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50">
                    <MapPin className="w-5 h-5 text-[#c29486] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#5c4a42] uppercase tracking-wider font-poppins">Dirección</h4>
                      <p className="text-xs text-[#8c6b5d] font-source">Calle 84 # 53 - 18, Alto Prado / Riomar, Barranquilla, Colombia</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50">
                    <Clock className="w-5 h-5 text-[#c29486] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#5c4a42] uppercase tracking-wider font-poppins">Horario de Atención</h4>
                      <p className="text-xs text-[#8c6b5d] font-source">Lunes a Sábado: 6:00 AM – 7:00 PM</p>
                      <p className="text-xs text-[#8c6b5d] font-source">Domingos y Festivos: 6:00 AM – 2:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/50">
                    <Car className="w-5 h-5 text-[#c29486] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#5c4a42] uppercase tracking-wider font-poppins">Servicio de Parqueadero</h4>
                      <p className="text-xs text-[#8c6b5d] font-source">Parqueadero gratuito para clientes que recogen su pedido presencialmente.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* BOTONES DE NAVEGACIÓN GPS */}
              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Calle+84+53-18+Barranquilla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-wider text-center shadow-md transition border border-[#785b4f] flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Google Maps</span>
                </a>

                <a
                  href="https://waze.com/ul?q=Calle+84+53-18+Barranquilla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#f8ece8] hover:bg-[#f4dcd3] text-[#8c6b5d] font-julius font-bold text-xs uppercase tracking-wider text-center shadow-sm transition border border-[#ebd3cb] flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Waze</span>
                </a>
              </div>

            </div>

            {/* COLUMNA MAPA GOOGLE EMBED STYLIZED */}
            <div className="lg:col-span-7 relative min-h-[420px] rounded-2xl overflow-hidden border border-[#ebd3cb]/60 shadow-md">
              <iframe
                title="Mapa Adetallesbq Alto Prado Barranquilla"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.6341235123!2d-74.814321!3d11.004123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d2a456789%3A0x12345678!2sCl.%2084%20%2353-18%2C%20Alto%20Prado%2C%20Barranquilla!5e0!3m2!1ses!2sco!4v1710000000000!5m2!1ses!2sco"
                className="w-full h-full min-h-[420px] border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </section>
      </AnimatedSection>

      {/* 3. COBERTURA DE ENTREGAS POR ZONAS EN BOGOTÁ */}
      <AnimatedSection delay={150}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center">
            <div className="inline-block px-12 sm:px-20 py-3.5 rounded-full bg-[#f8ece8] text-[#8c6b5d] font-agbalumo text-sm sm:text-base md:text-lg tracking-wider border border-[#ebd3cb] shadow-xs">
              COBERTURA Y RUTAS DE DOMICILIO
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zonasCobertura.map((zona, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-md flex flex-col justify-between transition-all duration-300 ${
                  zona.destacado
                    ? "border-[#c29486] ring-2 ring-[#c29486]/20 shadow-lg"
                    : "border-[#ebd3cb]/50 hover:shadow-xl"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f8ece8] text-[#8c6b5d] flex items-center justify-center border border-[#ebd3cb]">
                    <Truck className="w-6 h-6" />
                  </div>

                  <h3 className="font-agbalumo text-lg text-[#5c4a42]">
                    {zona.titulo}
                  </h3>

                  <p className="text-xs text-[#786055] leading-relaxed font-source">
                    {zona.barrios}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#f4e6e1] mt-4">
                  <span className="text-[11px] font-semibold text-[#8c6b5d] block">
                    {zona.tiempo}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </section>
      </AnimatedSection>

      {/* 4. PREGUNTAS FRECUENTES DE DOMICILIOS */}
      <AnimatedSection delay={200}>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          
          <div className="text-center">
            <h2 className="font-agbalumo text-3xl text-[#5c4a42]">
              Preguntas Frecuentes de Entregas
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#ebd3cb]/50 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left font-poppins font-bold text-xs sm:text-sm text-[#5c4a42] flex items-center justify-between gap-4 hover:bg-[#faf6f4] transition"
                >
                  <span>{faq.pregunta}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8c6b5d] transition-transform duration-300 ${
                      faqsAbiertas[faq.id] ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {faqsAbiertas[faq.id] && (
                  <div className="px-6 pb-6 text-xs text-[#786055] leading-relaxed font-source border-t border-[#f4e6e1] pt-4 animate-fadeIn">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>
      </AnimatedSection>

      {/* 5. BANNER LLAMADO A LA ACCIÓN (WHATSAPP) */}
      <AnimatedSection delay={250}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[#f8ece8] p-8 sm:p-12 text-[#5c4a42] shadow-xl border border-[#ebd3cb] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="font-lemon text-4xl sm:text-5xl tracking-wide text-[#5c4a42]">
                ¿Quieres consultar tu tarifa de envío?
              </h3>
              <p className="text-xs sm:text-sm font-poppins text-[#8c6b5d] font-medium leading-relaxed">
                Escríbenos a WhatsApp con tu dirección o barrio en Barranquilla y te confirmamos la tarifa exacta inmediatamente.
              </p>
            </div>

            <a
              href="https://wa.me/?text=Hola%20Adetallesbq,%20quisiera%20consultar%20la%20tarifa%20de%20envio%20a%20mi%20direccion"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs tracking-widest uppercase shadow-md hover:shadow-lg transition transform hover:scale-105 border border-[#785b4f] shrink-0"
            >
              <MessageCircle className="w-5 h-5 text-emerald-300 fill-emerald-300/20" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </section>
      </AnimatedSection>

    </div>
  );
}
