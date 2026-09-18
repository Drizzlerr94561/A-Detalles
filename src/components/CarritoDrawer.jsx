'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Calendar,
  Heart,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  CreditCard,
  Sparkles,
  Check,
  Send,
  AlertCircle,
  Phone,
  Building,
  Smartphone,
  Banknote,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

import {
  formatPhoneCO,
  getCleanPhone,
  validateColombianPhone,
  getColombianOperator,
  calculatePhoneCursorPosition,
} from "@/lib/phoneUtils";

// Formateador de precios en Pesos Colombianos
const formatPrecio = (num) => {
  if (!num && num !== 0) return "$0";
  return `$${Number(num).toLocaleString("es-CO")}`;
};

// Configuración visual de métodos de pago modernos
const METODOS_PAGO = [
  {
    id: "Nequi",
    nombre: "Nequi / Daviplata",
    badge: "MÁS RÁPIDO",
    subtitulo: "Transferencia directa sin comisión (0% recargo)",
    colorBordeActive: "border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/30",
    colorBadge: "bg-purple-100 text-purple-800 border-purple-200",
    iconContainer: "bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white",
    icono: <Smartphone className="w-5 h-5" />,
    tags: ["Nequi", "Daviplata"],
  },
  {
    id: "Bancolombia",
    nombre: "Bancolombia",
    badge: "CUENTA / QR",
    subtitulo: "Transferencia por App, QR o Corresponsal",
    colorBordeActive: "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/30",
    colorBadge: "bg-amber-100 text-amber-900 border-amber-200",
    iconContainer: "bg-gradient-to-br from-[#002244] to-blue-800 text-amber-400",
    icono: <Building className="w-5 h-5" />,
    tags: ["Ahorros", "QR"],
  },
  {
    id: "Link de Pago / TC",
    nombre: "Tarjeta de Crédito / Débito",
    badge: "LINK SEGURO",
    subtitulo: "Visa, Mastercard, AMEX o PSE (Wompi / MercadoPago)",
    colorBordeActive: "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30",
    colorBadge: "bg-blue-100 text-blue-800 border-blue-200",
    iconContainer: "bg-gradient-to-br from-indigo-600 to-blue-600 text-white",
    icono: <CreditCard className="w-5 h-5" />,
    tags: ["Visa", "Mastercard", "PSE"],
  },
  {
    id: "Efectivo / Otro",
    nombre: "Efectivo / Contra entrega",
    badge: "AL RECIBIR",
    subtitulo: "Pago presencial al recibir o acuerdo en WhatsApp",
    colorBordeActive: "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30",
    colorBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    iconContainer: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white",
    icono: <Banknote className="w-5 h-5" />,
    tags: ["Efectivo", "Chat WhatsApp"],
  },
];

export default function CarritoDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cart,
    isDrawerOpen,
    cerrarCarrito,
    abrirCarrito,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    totalItems,
    totalPrecio,
  } = useCart();

  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Paso activo del checkout (1: Carrito, 2: Entrega, 3: Comprador & Pago, 4: Resumen, 5: Éxito)
  const [paso, setPaso] = useState(1);
  const [pedidoExitoso, setPedidoExitoso] = useState(null);


  // Estado para rastrear interactividad y validación por campo
  const [touched, setTouched] = useState({});

  // Formulario completo de entrega y comprador
  const [formData, setFormData] = useState({
    // Entrega (Quien recibe)
    destinatario: "",
    telefonoDestinatario: "",
    direccion: "",
    barrio: "",
    fechaEntrega: "",
    
    // Comprador (Quien envía)
    compradorNombre: "",
    compradorTelefono: "",
    
    // Pago
    metodoPago: "Nequi",
  });

  // Funciones de comprobación estricta por campo
  const checkDestinatario = () => {
    const val = formData.destinatario.trim();
    if (!val) return { valid: false, msg: "El nombre de quien recibe es obligatorio." };
    if (val.length < 3) return { valid: false, msg: "Ingresa mínimo 3 letras para el nombre." };
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(val)) return { valid: false, msg: "El nombre debe contener letras reales." };
    return { valid: true, msg: "" };
  };

  const checkTelefonoDestinatario = () => {
    return validateColombianPhone(formData.telefonoDestinatario, {
      required: false,
      label: "El celular de quien recibe",
    });
  };

  const checkDireccion = () => {
    const val = formData.direccion.trim();
    if (!val) return { valid: false, msg: "La dirección exacta de entrega es obligatoria." };
    if (val.length < 6) return { valid: false, msg: "Ingresa dirección completa con número (ej: Calle 84 # 53-18 Apt 402)." };
    return { valid: true, msg: "" };
  };

  const checkBarrio = () => {
    const val = formData.barrio.trim();
    if (!val) return { valid: false, msg: "El barrio de entrega es obligatorio." };
    if (val.length < 3) return { valid: false, msg: "Indica un barrio válido (ej: Alto Prado)." };
    return { valid: true, msg: "" };
  };

  const checkFechaEntrega = () => {
    const val = formData.fechaEntrega.trim();
    if (!val) return { valid: false, msg: "La fecha y hora deseada de entrega es obligatoria." };
    if (val.length < 3) return { valid: false, msg: "Ejemplo: Mañana 8:00 AM." };
    return { valid: true, msg: "" };
  };

  const checkCompradorNombre = () => {
    const val = formData.compradorNombre.trim();
    if (!val) return { valid: false, msg: "Tu nombre completo es obligatorio." };
    if (val.length < 5) return { valid: false, msg: "Ingresa tu nombre y apellido (mínimo 5 letras)." };
    const palabras = val.split(/\s+/).filter(Boolean);
    if (palabras.length < 2) return { valid: false, msg: "Por favor escribe tu nombre y apellido completo (ej: Piero Gómez)." };
    if (/\d/.test(val)) return { valid: false, msg: "Tu nombre no debe incluir números." };
    return { valid: true, msg: "" };
  };

  const checkCompradorTelefono = () => {
    return validateColombianPhone(formData.compradorTelefono, {
      required: true,
      label: "Tu número celular",
    });
  };

  // Si el usuario navega a /login, asegurar que el drawer esté cerrado para no tapar la pantalla
  useEffect(() => {
    if (pathname === "/login" && isDrawerOpen) {
      cerrarCarrito();
    }
  }, [pathname, isDrawerOpen, cerrarCarrito]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handlePhoneChange = (e, fieldName) => {
    const input = e.target;
    const rawVal = input.value;
    const cursorBefore = input.selectionStart || 0;

    const clean = getCleanPhone(rawVal).slice(0, 10);
    const formatted = formatPhoneCO(clean);

    const nextCursor = calculatePhoneCursorPosition(rawVal, cursorBefore, formatted);

    setFormData((prev) => ({ ...prev, [fieldName]: formatted }));
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Restaurar cursor exactamente en la posición de edición en el siguiente frame
    requestAnimationFrame(() => {
      if (input && typeof input.setSelectionRange === "function") {
        input.setSelectionRange(nextCursor, nextCursor);
      }
    });
  };

  const handlePhoneKeyDown = (e, fieldName) => {
    // Si el usuario presiona Backspace y el cursor está inmediatamente después de un espacio,
    // borrar el dígito antes del espacio para que no se quede trabado
    if (e.key === "Backspace") {
      const input = e.target;
      if (input.selectionStart === input.selectionEnd && input.selectionStart > 1) {
        const pos = input.selectionStart;
        if (input.value[pos - 1] === " ") {
          e.preventDefault();
          const val = input.value;
          const rawAfterDelete = val.slice(0, pos - 2) + val.slice(pos - 1);
          const clean = getCleanPhone(rawAfterDelete).slice(0, 10);
          const formatted = formatPhoneCO(clean);
          const nextCursor = calculatePhoneCursorPosition(rawAfterDelete, pos - 2, formatted);

          setFormData((prev) => ({ ...prev, [fieldName]: formatted }));
          setTouched((prev) => ({ ...prev, [fieldName]: true }));

          requestAnimationFrame(() => {
            if (input && typeof input.setSelectionRange === "function") {
              input.setSelectionRange(nextCursor, nextCursor);
            }
          });
        }
      }
    }
  };

  // Validaciones por paso
  const irAPaso2 = () => {
    if (cart.length === 0) return;
    setErrorMsg("");
    setPaso(2);
  };

  const irAPaso3 = () => {
    setErrorMsg("");
    setTouched((prev) => ({
      ...prev,
      destinatario: true,
      telefonoDestinatario: true,
      direccion: true,
      barrio: true,
      fechaEntrega: true,
    }));

    const vDest = checkDestinatario();
    if (!vDest.valid) { setErrorMsg(vDest.msg); return; }

    const vTelDest = checkTelefonoDestinatario();
    if (!vTelDest.valid) { setErrorMsg(vTelDest.msg); return; }

    const vDir = checkDireccion();
    if (!vDir.valid) { setErrorMsg(vDir.msg); return; }

    const vBarrio = checkBarrio();
    if (!vBarrio.valid) { setErrorMsg(vBarrio.msg); return; }

    const vFecha = checkFechaEntrega();
    if (!vFecha.valid) { setErrorMsg(vFecha.msg); return; }

    setPaso(3);
  };

  const irAPaso4 = () => {
    setErrorMsg("");
    setTouched((prev) => ({
      ...prev,
      compradorNombre: true,
      compradorTelefono: true,
    }));

    const vNombre = checkCompradorNombre();
    if (!vNombre.valid) { setErrorMsg(vNombre.msg); return; }

    const vTel = checkCompradorTelefono();
    if (!vTel.valid) { setErrorMsg(vTel.msg); return; }

    setPaso(4);
  };

  // Registrar pedido final y mostrar modal de éxito
  const handleFinalizarPedido = async () => {
    setErrorMsg("");
    setCargando(true);

    try {
      const payload = {
        clienteNombre: formData.compradorNombre.trim(),
        clienteTelefono: formatPhoneCO(formData.compradorTelefono.trim()),
        clienteEmail: null,
        compradorNombre: formData.compradorNombre.trim(),
        compradorTelefono: formatPhoneCO(formData.compradorTelefono.trim()),
        metodoPago: formData.metodoPago,
        items: cart,
        total: totalPrecio,
        direccionEntrega: formData.direccion.trim(),
        barrioEntrega: formData.barrio.trim() || null,
        destinatario: formData.destinatario.trim() || null,
        telefonoDestinatario: formData.telefonoDestinatario.trim() ? formatPhoneCO(formData.telefonoDestinatario.trim()) : null,
        fechaEntrega: formData.fechaEntrega.trim() || null,
      };

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar el pedido.");
      }

      setPedidoExitoso(data);
      setPaso(5);
      vaciarCarrito();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarTodo = () => {
    setPedidoExitoso(null);
    setPaso(1);
    cerrarCarrito();
  };

  if (!isDrawerOpen || pathname === "/login") return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* FONDO OSCURECIDO */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleCerrarTodo}
      />

      {/* DRAWER DESLIZANTE */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-[480px] bg-white shadow-2xl flex flex-col justify-between border-l border-[#ebd3cb]">
          
          {/* CABECERA DEL WIZARD */}
          <div className="p-5 sm:p-6 bg-[#faf6f4] border-b border-[#ebd3cb] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#ebd3cb] flex items-center justify-center text-[#8c6b5d] shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-lemon text-lg sm:text-xl text-[#5c4a42]">
                    {paso === 1 && "Tu Carrito"}
                    {paso === 2 && "Datos de Entrega"}
                    {paso === 3 && "Comprador y Pago"}
                    {paso === 4 && "Resumen del Pedido"}
                    {paso === 5 && "¡Pedido Preparado!"}
                  </h3>
                  <p className="text-[11px] text-[#8c6b5d] font-poppins font-medium">
                    {paso < 5 ? `Paso ${paso} de 4 • ${totalItems} ${totalItems === 1 ? 'regalo' : 'regalos'}` : 'Paso 4 de 4 • WhatsApp'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCerrarTodo}
                className="w-9 h-9 rounded-full bg-white border border-[#ebd3cb] text-[#8c6b5d] hover:bg-[#8c6b5d] hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BARRA DE PROGRESO INTERACTIVA */}
            {paso < 5 && (
              <div className="flex items-center justify-between gap-1.5 pt-2">
                {[
                  { num: 1, label: "Carrito" },
                  { num: 2, label: "Entrega" },
                  { num: 3, label: "Pago" },
                  { num: 4, label: "Confirmar" },
                ].map((p) => (
                  <div key={p.num} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-1.5 rounded-full transition-all ${
                        paso >= p.num ? "bg-[#8c6b5d]" : "bg-[#ebd3cb]/50"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-julius font-bold uppercase tracking-wider ${
                        paso >= p.num ? "text-[#5c4a42]" : "text-[#a88d81]"
                      }`}
                    >
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONTENIDO PRINCIPAL SEGÚN EL PASO */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* ----------------- PASO 1: CARRITO Y PRODUCTOS ----------------- */}
            {paso === 1 && (
              <>
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#f8ece8] border border-[#ebd3cb] flex items-center justify-center text-[#c29486]">
                      <ShoppingBag className="w-10 h-10 opacity-70" />
                    </div>
                    <h4 className="font-agbalumo text-xl text-[#5c4a42]">Tu carrito está vacío</h4>
                    <p className="text-xs text-[#8c6b5d] max-w-xs mx-auto">
                      Explora nuestros arreglos florales, rosas, desayunos y peluches para continuar.
                    </p>
                    <button
                      type="button"
                      onClick={handleCerrarTodo}
                      className="mt-2 inline-block px-8 py-3 rounded-full bg-[#8c6b5d] text-white font-julius font-bold text-xs uppercase tracking-wider hover:bg-[#5c4a42] transition shadow-xs cursor-pointer"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb]/70 shadow-xs space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imagen}
                              alt={item.nombre}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                              className="w-16 h-16 rounded-xl object-cover border border-[#ebd3cb] shrink-0 bg-white"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-[#5c4a42] truncate font-poppins">
                                {item.nombre}
                              </h5>
                              <p className="text-[11px] text-[#8c6b5d] font-semibold mt-0.5">
                                {formatPrecio(item.precio)}
                              </p>

                              {/* CONTROLES CANTIDAD */}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                  className="w-6 h-6 rounded-full bg-white border border-[#ebd3cb] flex items-center justify-center text-[#5c4a42] hover:bg-[#8c6b5d] hover:text-white transition cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-[#5c4a42] min-w-[20px] text-center">
                                  {item.cantidad}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                  className="w-6 h-6 rounded-full bg-white border border-[#ebd3cb] flex items-center justify-center text-[#5c4a42] hover:bg-[#8c6b5d] hover:text-white transition cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => eliminarProducto(item.id)}
                              className="text-[#c29486] hover:text-rose-600 p-1.5 transition cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* MOSTRAR OPCIONES PERSONALIZADAS DEL ITEM */}
                          {(item.colorRosas || item.numRosas || item.numFotosCuadro || item.colorFondoSpotify || item.opcionAlbumFotos || item.nombreTermoMug || item.tamanoPelucheCombo || (item.adicionales && item.adicionales.length > 0) || item.mensajeTarjeta) && (
                            <div className="pt-2 border-t border-[#ebd3cb]/50 text-[11px] text-[#786055] space-y-1 bg-white/60 p-2.5 rounded-xl">
                              {item.colorRosas && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>🌹 Color de Rosas:</span> {item.colorRosas}
                                </p>
                              )}
                              {item.numFotosCuadro && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>🖼️ Fotos a incluir:</span> {item.numFotosCuadro} {item.numFotosCuadro === 1 ? "foto" : "fotos"}
                                </p>
                              )}
                              {item.colorFondoSpotify && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>🎨 Fondo:</span> {item.colorFondoSpotify}
                                </p>
                              )}
                              {item.opcionAlbumFotos && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>📖 Álbum:</span> {item.opcionAlbumFotos}
                                </p>
                              )}
                              {item.nombreTermoMug && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>✍️ Nombre grabado:</span> "{item.nombreTermoMug}"
                                </p>
                              )}
                              {item.tamanoPelucheCombo && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>🧸 Tamaño peluche:</span> {item.tamanoPelucheCombo}
                                </p>
                              )}
                              {item.adicionales && item.adicionales.length > 0 && (
                                <p>
                                  <span className="font-semibold text-[#8c6b5d]">➕ Adicionales:</span> {item.adicionales.join(", ")}
                                </p>
                              )}
                              {item.mensajeTarjeta && (
                                <p className="italic truncate">
                                  <span className="font-semibold text-[#8c6b5d]">💌 Dedicatoria:</span> "{item.mensajeTarjeta}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ----------------- PASO 2: DATOS DE ENTREGA ----------------- */}
            {paso === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3.5 rounded-2xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center gap-2 text-xs text-[#5c4a42]">
                  <MapPin className="w-4 h-4 text-[#c29486] shrink-0" />
                  <span>¿A dónde y a quién entregaremos este regalo especial?</span>
                </div>

                <div className="space-y-3.5">
                  {/* DESTINATARIO */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                        Nombre de la persona que recibe: *
                      </label>
                      {formData.destinatario && (
                        <span className="text-[10px] font-bold font-poppins">
                          {checkDestinatario().valid ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Válido ✓
                            </span>
                          ) : (
                            <span className="text-rose-600">Mínimo 3 letras</span>
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      name="destinatario"
                      required
                      value={formData.destinatario}
                      onChange={handleChange}
                      placeholder="Ej: Maria Paula Gómez"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                        touched.destinatario
                          ? checkDestinatario().valid
                            ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                            : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                          : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                      }`}
                    />
                    {touched.destinatario && !checkDestinatario().valid && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{checkDestinatario().msg}</span>
                      </p>
                    )}
                  </div>

                  {/* TELÉFONO DESTINATARIO */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                        Teléfono de contacto de quien recibe (Opcional):
                      </label>
                      {formData.telefonoDestinatario && (
                        <div className="flex items-center gap-1.5">
                          {checkTelefonoDestinatario().operator && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${checkTelefonoDestinatario().operator.badge}`}>
                              {checkTelefonoDestinatario().operator.name}
                            </span>
                          )}
                          <span className="text-[10px] font-bold font-poppins">
                            {checkTelefonoDestinatario().valid ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Válido ✓
                              </span>
                            ) : (
                              <span className="text-rose-600">
                                {getCleanPhone(formData.telefonoDestinatario).length}/10 dígitos
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="tel"
                      name="telefonoDestinatario"
                      value={formData.telefonoDestinatario}
                      onChange={(e) => handlePhoneChange(e, "telefonoDestinatario")}
                      onKeyDown={(e) => handlePhoneKeyDown(e, "telefonoDestinatario")}
                      placeholder="Ej: 301 987 6543"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                        touched.telefonoDestinatario && formData.telefonoDestinatario
                          ? checkTelefonoDestinatario().valid
                            ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                            : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                          : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                      }`}
                    />
                    {touched.telefonoDestinatario && !checkTelefonoDestinatario().valid && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{checkTelefonoDestinatario().msg}</span>
                      </p>
                    )}
                  </div>

                  {/* DIRECCIÓN */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                        Dirección exacta de entrega (Barranquilla / Soledad): *
                      </label>
                      {formData.direccion && (
                        <span className="text-[10px] font-bold font-poppins">
                          {checkDireccion().valid ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Válida ✓
                            </span>
                          ) : (
                            <span className="text-rose-600">Falta dirección completa</span>
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      name="direccion"
                      required
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Calle 84 # 53-18 Apt 402"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                        touched.direccion
                          ? checkDireccion().valid
                            ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                            : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                          : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                      }`}
                    />
                    {touched.direccion && !checkDireccion().valid && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{checkDireccion().msg}</span>
                      </p>
                    )}
                  </div>

                  {/* BARRIO Y FECHA */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                          Barrio: *
                        </label>
                      </div>
                      <input
                        type="text"
                        name="barrio"
                        required
                        value={formData.barrio}
                        onChange={handleChange}
                        placeholder="Ej: Alto Prado"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                          touched.barrio
                            ? checkBarrio().valid
                              ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                              : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                            : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                        }`}
                      />
                      {touched.barrio && !checkBarrio().valid && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{checkBarrio().msg}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                          Fecha/Hora: *
                        </label>
                      </div>
                      <input
                        type="text"
                        name="fechaEntrega"
                        required
                        value={formData.fechaEntrega}
                        onChange={handleChange}
                        placeholder="Ej: Mañana 8:00 AM"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                          touched.fechaEntrega
                            ? checkFechaEntrega().valid
                              ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                              : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                            : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                        }`}
                      />
                      {touched.fechaEntrega && !checkFechaEntrega().valid && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{checkFechaEntrega().msg}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- PASO 3: COMPRADOR Y PAGO ----------------- */}
            {paso === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-[#ebd3cb]/60 pb-2">
                    <User className="w-4 h-4 text-[#c29486]" />
                    <h4 className="font-julius font-bold text-xs uppercase tracking-wider text-[#5c4a42]">
                      Tus Datos (Quien envía el regalo):
                    </h4>
                  </div>

                  {/* NOMBRE COMPRADOR */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                        Tu Nombre Completo: *
                      </label>
                      {formData.compradorNombre && (
                        <span className="text-[10px] font-bold font-poppins">
                          {checkCompradorNombre().valid ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Nombre completo ✓
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-1">
                              Mínimo 2 palabras
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="compradorNombre"
                        required
                        value={formData.compradorNombre}
                        onChange={(e) => {
                          setFormData({ ...formData, compradorNombre: e.target.value });
                          setTouched((prev) => ({ ...prev, compradorNombre: true }));
                        }}
                        placeholder="Ej: Piero Gómez"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                          touched.compradorNombre
                            ? checkCompradorNombre().valid
                              ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                              : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                            : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                        }`}
                      />
                    </div>
                    {touched.compradorNombre && !checkCompradorNombre().valid && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{checkCompradorNombre().msg}</span>
                      </p>
                    )}
                  </div>

                  {/* TELÉFONO COMPRADOR */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block">
                        Tu Número Celular (10 dígitos): *
                      </label>
                      <div className="flex items-center gap-1.5">
                        {checkCompradorTelefono().operator && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${checkCompradorTelefono().operator.badge}`}>
                            {checkCompradorTelefono().operator.name}
                          </span>
                        )}
                        <span className="text-[10px] font-bold font-poppins">
                          {getCleanPhone(formData.compradorTelefono).length > 0 && (
                            checkCompradorTelefono().valid ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Válido ✓
                              </span>
                            ) : (
                              <span className="text-rose-600">
                                {getCleanPhone(formData.compradorTelefono).length}/10 dígitos
                              </span>
                            )
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        name="compradorTelefono"
                        required
                        value={formData.compradorTelefono}
                        onChange={(e) => handlePhoneChange(e, "compradorTelefono")}
                        onKeyDown={(e) => handlePhoneKeyDown(e, "compradorTelefono")}
                        placeholder="Ej: 300 123 4567"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none transition ${
                          touched.compradorTelefono
                            ? checkCompradorTelefono().valid
                              ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-400"
                              : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400"
                            : "border-[#ebd3cb] focus:ring-2 focus:ring-[#c29486]"
                        }`}
                      />
                    </div>
                    {touched.compradorTelefono && !checkCompradorTelefono().valid && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-poppins font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{checkCompradorTelefono().msg}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* MÉTODO DE PAGO PREFERIDO REDISEÑADO */}
                <div className="space-y-3 pt-3 border-t border-[#f4e6e1]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#c29486]" />
                      <h4 className="font-julius font-bold text-xs uppercase tracking-wider text-[#5c4a42]">
                        ¿Cómo prefieres realizar el pago?
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#8c6b5d] font-poppins font-bold bg-[#f8ece8] px-2.5 py-0.5 rounded-full border border-[#ebd3cb]">
                      Elige 1 opción
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {METODOS_PAGO.map((m) => {
                      const isSelected = formData.metodoPago === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, metodoPago: m.id })}
                          className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 group ${
                            isSelected
                              ? m.colorBordeActive + " shadow-md scale-[1.01]"
                              : "bg-white border-[#ebd3cb]/80 text-[#786055] hover:border-[#8c6b5d]/50 hover:bg-[#faf6f4] hover:shadow-xs"
                          }`}
                        >
                          {/* Header de la tarjeta */}
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 shadow-xs ${m.iconContainer}`}>
                                {m.icono}
                              </div>
                              <div>
                                <span className={`text-[9px] font-bold font-poppins uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.colorBadge}`}>
                                  {m.badge}
                                </span>
                                <h5 className="font-poppins font-bold text-xs text-[#5c4a42] mt-1 leading-tight">
                                  {m.nombre}
                                </h5>
                              </div>
                            </div>

                            {/* Checkmark de selección activo */}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected ? "bg-[#8c6b5d] text-white scale-100 shadow-xs" : "border border-[#ebd3cb] bg-white scale-90 opacity-30"
                            }`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>

                          {/* Subtítulo descriptivo */}
                          <p className="text-[11px] text-[#786055] leading-snug font-source font-medium">
                            {m.subtitulo}
                          </p>

                          {/* Tags de marca */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-black/5">
                            {m.tags.map((tag) => (
                              <span key={tag} className="text-[9px] font-bold text-[#8c6b5d] bg-white/90 px-2 py-0.5 rounded-md border border-[#ebd3cb]/60 font-julius">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- PASO 4: RESUMEN Y CONFIRMACIÓN ----------------- */}
            {paso === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] space-y-3 text-xs text-[#5c4a42]">
                  <div className="flex items-center justify-between border-b border-[#ebd3cb] pb-2">
                    <span className="font-julius font-bold uppercase tracking-wider text-[#8c6b5d]">
                      Resumen del Pedido
                    </span>
                    <span className="font-lemon text-sm text-[#8c6b5d]">{formatPrecio(totalPrecio)}</span>
                  </div>

                  {/* PRODUCTOS Y SUS PERSONALIZACIONES */}
                  <div className="space-y-2">
                    {cart.map((it) => (
                      <div key={it.id} className="border-b border-[#ebd3cb]/50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between text-[11px]">
                          <span className="font-bold text-[#5c4a42]">{it.cantidad}x {it.nombre}</span>
                          <span className="font-bold text-[#8c6b5d] shrink-0 ml-2">
                            {formatPrecio(Number(it.precio) * Number(it.cantidad))}
                          </span>
                        </div>
                        <div className="pl-2 space-y-0.5 mt-1 text-[10px] text-[#786055]">
                          {it.colorRosas && <p className="text-[#8c6b5d]">🌹 Color de Rosas: {it.colorRosas}</p>}
                          {it.numRosas && <p className="text-[#8c6b5d]">🌹 Rosas: {it.numRosas} Rosas en el ramo</p>}
                          {it.tamanoPelucheCombo && <p className="text-[#8c6b5d]">🧸 Tamaño peluche: {it.tamanoPelucheCombo}</p>}
                          {it.nombreTermoMug && <p className="text-[#8c6b5d]">✍️ Personalización / Nombre: "{it.nombreTermoMug}"</p>}
                          {it.numFotosCuadro && <p className="text-[#8c6b5d]">🖼️ Fotos a incluir: {it.numFotosCuadro} {it.numFotosCuadro === 1 ? "foto" : "fotos"}</p>}
                          {it.colorFondoSpotify && <p className="text-[#8c6b5d]">🎨 Color de Fondo: {it.colorFondoSpotify}</p>}
                          {it.opcionAlbumFotos && <p className="text-[#8c6b5d]">📖 Álbum: {it.opcionAlbumFotos}</p>}
                          {it.adicionales && it.adicionales.length > 0 && (
                            <p className="text-[#8c6b5d]">➕ Adicionales: {it.adicionales.join(", ")}</p>
                          )}
                          {it.mensajeTarjeta && (
                            <p className="italic text-[#8c6b5d]">💌 Dedicatoria: "{it.mensajeTarjeta}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#ebd3cb] pt-2 space-y-1 text-[11px]">
                    <p><strong>Recibe:</strong> {formData.destinatario} {formData.telefonoDestinatario ? `(${formData.telefonoDestinatario})` : ""}</p>
                    <p><strong>Dirección:</strong> {formData.direccion} {formData.barrio ? `(${formData.barrio})` : ""}</p>
                    <p><strong>Envía:</strong> {formData.compradorNombre} ({formData.compradorTelefono || "Sin teléfono"})</p>
                    <p><strong>Método Pago:</strong> {formData.metodoPago}</p>
                  </div>
                </div>

                {/* AVISO DE CONFIRMACIÓN DIRECTA */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-[#5c4a42] space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>¡Todo listo para coordinar tu entrega!</span>
                  </div>
                  <p className="text-[11px] text-[#786055] leading-relaxed font-source">
                    Al hacer clic en <strong>Enviar Pedido a WhatsApp</strong>, tu encargo se registrará de inmediato en nuestro sistema con su código oficial y se abrirá WhatsApp con el resumen completo para acordar la entrega y el pago.
                  </p>
                </div>
              </div>
            )}

            {/* ----------------- PASO 5: SUCCESS MODAL ¡LISTO! ----------------- */}
            {paso === 5 && pedidoExitoso && (
              <div className="text-center py-8 space-y-5 animate-scaleUp">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-[#f8ece8] text-[#8c6b5d] text-[10px] font-bold tracking-widest uppercase border border-[#ebd3cb]">
                    CÓDIGO DE PEDIDO #{pedidoExitoso.codigo}
                  </span>
                  <h3 className="font-lemon text-2xl text-[#5c4a42] mt-2">¡Tu pedido está listo!</h3>
                  <p className="text-xs text-[#786055] max-w-xs mx-auto mt-1 leading-relaxed">
                    Hemos registrado tu encargo en nuestro sistema. Haz clic abajo para enviarlo directamente a nuestro WhatsApp oficial y confirmarlo en segundos.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] text-left text-xs space-y-2 text-[#5c4a42]">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Send className="w-4 h-4" />
                    <span>WhatsApp directo a A’Detalles</span>
                  </div>
                  <p className="text-[11px] text-[#8c6b5d]">
                    Tu pedido ya tiene todo el desglose listo: productos, rosas, dedicatoria, dirección y método de pago.
                  </p>
                </div>

                <a
                  href={pedidoExitoso.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-julius font-bold text-xs uppercase tracking-widest shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer block"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>ENVIAR PEDIDO</span>
                </a>
              </div>
            )}

            {/* ERROR MESSAGE GLOBAL */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* PIE CON ACCIONES SEGÚN PASO */}
          {cart.length > 0 && paso < 5 && (
            <div className="p-5 sm:p-6 bg-[#faf6f4] border-t border-[#ebd3cb] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8c6b5d] uppercase tracking-wider font-poppins">
                  Total del Pedido:
                </span>
                <span className="font-lemon text-xl sm:text-2xl text-[#5c4a42]">
                  {formatPrecio(totalPrecio)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {paso > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setPaso(paso - 1);
                    }}
                    className="p-3.5 rounded-full bg-white border border-[#ebd3cb] text-[#8c6b5d] hover:bg-[#8c6b5d] hover:text-white transition cursor-pointer"
                    title="Paso anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {paso === 1 && (
                  <button
                    type="button"
                    onClick={irAPaso2}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continuar a Datos de Entrega</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {paso === 2 && (
                  <button
                    type="button"
                    onClick={irAPaso3}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continuar a Pago y Comprador</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {paso === 3 && (
                  <button
                    type="button"
                    onClick={irAPaso4}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Revisar Resumen del Pedido</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {paso === 4 && (
                  <button
                    type="button"
                    disabled={cargando}
                    onClick={handleFinalizarPedido}
                    className="flex-1 py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-julius font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cargando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registrando Pedido...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Enviar Pedido a WhatsApp</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
