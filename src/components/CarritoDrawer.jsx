'use client';

import { useState, useEffect } from "react";
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
} from "lucide-react";

const formatPrecio = (num) => {
  if (!num && num !== 0) return "$0";
  return `$${Number(num).toLocaleString("es-CO")}`;
};

export default function CarritoDrawer() {
  const {
    cart,
    isDrawerOpen,
    cerrarCarrito,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    totalItems,
    totalPrecio,
  } = useCart();

  const [usuario, setUsuario] = useState(null);
  const [direccionesGuardadas, setDireccionesGuardadas] = useState([]);
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState("manual");
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Paso activo del checkout (1: Carrito, 2: Entrega, 3: Comprador & Pago, 4: Resumen, 5: Éxito)
  const [paso, setPaso] = useState(1);
  const [pedidoExitoso, setPedidoExitoso] = useState(null);

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

  // Cargar datos de usuario al abrir el drawer
  useEffect(() => {
    if (!isDrawerOpen) return;

    // Resetear al paso 1 salvo que esté en estado de éxito recién completado
    if (!pedidoExitoso) setPaso(1);

    const cargarDatosUsuario = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.autenticado && data.usuario) {
          setUsuario(data.usuario);
          setFormData((prev) => ({
            ...prev,
            compradorNombre: prev.compradorNombre || data.usuario.nombre || "",
            compradorTelefono: prev.compradorTelefono || data.usuario.telefono || "",
          }));

          const resDir = await fetch("/api/usuario/direcciones");
          if (resDir.ok) {
            const dataDir = await resDir.json();
            const dirs = Array.isArray(dataDir) ? dataDir : (dataDir.direcciones || []);
            setDireccionesGuardadas(dirs);

            const principal = dirs.find((d) => d.esPrincipal) || dirs[0];
            if (principal) {
              setDireccionSeleccionadaId(principal.id.toString());
              setFormData((prev) => ({
                ...prev,
                direccion: principal.direccion,
                barrio: principal.barrio || "",
                destinatario: principal.destinatario || data.usuario.nombre || "",
                telefonoDestinatario: principal.telefonoDestinatario || data.usuario.telefono || "",
              }));
            }
          }
        }
      } catch (e) {
        console.error("Error al cargar datos en carrito:", e);
      }
    };

    cargarDatosUsuario();
  }, [isDrawerOpen]);

  // Selección de direcciones guardadas
  const handleSelectDireccion = (idStr) => {
    setDireccionSeleccionadaId(idStr);
    if (idStr === "manual") {
      setFormData((prev) => ({
        ...prev,
        direccion: "",
        barrio: "",
        destinatario: usuario?.nombre || "",
        telefonoDestinatario: usuario?.telefono || "",
      }));
    } else {
      const dir = direccionesGuardadas.find((d) => d.id.toString() === idStr);
      if (dir) {
        setFormData((prev) => ({
          ...prev,
          direccion: dir.direccion,
          barrio: dir.barrio || "",
          destinatario: dir.destinatario || usuario?.nombre || "",
          telefonoDestinatario: dir.telefonoDestinatario || usuario?.telefono || "",
        }));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validaciones por paso
  const irAPaso2 = () => {
    if (cart.length === 0) return;
    setErrorMsg("");
    setPaso(2);
  };

  const irAPaso3 = () => {
    setErrorMsg("");

    // 1. Validar Destinatario (Persona que recibe)
    const dest = formData.destinatario.trim();
    if (!dest || dest.length < 3 || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(dest)) {
      setErrorMsg("Ingresa un nombre válido para la persona que recibe (mínimo 3 letras).");
      return;
    }

    // 2. Validar Teléfono del Destinatario (Opcional si no se llena, pero si se coloca debe ser un celular de 10 dígitos que empiece por 3)
    const telDestClean = formData.telefonoDestinatario.replace(/\D/g, "");
    if (formData.telefonoDestinatario.trim() !== "") {
      if (telDestClean.length !== 10 || !telDestClean.startsWith("3")) {
        setErrorMsg("El teléfono de quien recibe debe ser un número celular colombiano válido de 10 dígitos (ej: 300 123 4567).");
        return;
      }
    }

    // 3. Validar Dirección exacta de entrega
    const dir = formData.direccion.trim();
    if (!dir || dir.length < 6) {
      setErrorMsg("Ingresa una dirección de entrega completa (ej: Calle 84 # 53-18 Apt 402).");
      return;
    }

    // 4. Validar Barrio
    const barrio = formData.barrio.trim();
    if (!barrio || barrio.length < 3) {
      setErrorMsg("Por favor indica el barrio de entrega en Barranquilla o Soledad.");
      return;
    }

    // 5. Validar Fecha y Hora deseada
    const fecha = formData.fechaEntrega.trim();
    if (!fecha || fecha.length < 3) {
      setErrorMsg("Por favor indica la fecha y hora deseada de entrega (ej: Mañana 8:00 AM).");
      return;
    }

    setPaso(3);
  };

  const irAPaso4 = () => {
    setErrorMsg("");

    // 1. Validar Nombre del Comprador (Quien envía)
    const compNombre = formData.compradorNombre.trim();
    if (!compNombre || compNombre.length < 3 || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(compNombre)) {
      setErrorMsg("Por favor indica tu nombre completo (mínimo 3 letras).");
      return;
    }

    // 2. Validar Teléfono del Comprador (Obligatorio 10 dígitos arrancando por 3)
    const compTelClean = formData.compradorTelefono.replace(/\D/g, "");
    if (!compTelClean || compTelClean.length !== 10 || !compTelClean.startsWith("3")) {
      setErrorMsg("Ingresa tu número celular colombiano de 10 dígitos para confirmarte por WhatsApp (ej: 300 123 4567).");
      return;
    }

    setPaso(4);
  };

  // Registrar pedido final y mostrar modal de éxito
  const handleFinalizarPedido = async () => {
    setErrorMsg("");
    setCargando(true);

    try {
      const payload = {
        clienteNombre: formData.compradorNombre.trim(),
        clienteTelefono: formData.compradorTelefono.trim(),
        clienteEmail: usuario?.email || null,
        compradorNombre: formData.compradorNombre.trim(),
        compradorTelefono: formData.compradorTelefono.trim(),
        metodoPago: formData.metodoPago,
        items: cart,
        total: totalPrecio,
        direccionEntrega: formData.direccion.trim(),
        barrioEntrega: formData.barrio.trim() || null,
        destinatario: formData.destinatario.trim() || null,
        telefonoDestinatario: formData.telefonoDestinatario.trim() || null,
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
      setPaso(5); // Modal ¡Listo!
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

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* FONDO OSCURECIDO */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleCerrarTodo}
      />

      {/* DRAWER DESLIZANTE */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-[460px] bg-white shadow-2xl flex flex-col justify-between border-l border-[#ebd3cb]">
          
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
                    {paso < 5 ? `Paso ${paso} de 4 • ${totalItems} ${totalItems === 1 ? 'regalo' : 'regalos'}` : 'Paso 9 • WhatsApp'}
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

            {/* BARRA DE PROGRESO INTERACTIVA (PASOS 1 A 4) */}
            {paso < 5 && (
              <div className="flex items-center justify-between gap-1 pt-2">
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
                          {(item.numRosas || item.numFotosCuadro || item.colorFondoSpotify || item.opcionAlbumFotos || item.nombreTermoMug || (item.adicionales && item.adicionales.length > 0) || item.mensajeTarjeta) && (
                            <div className="pt-2 border-t border-[#ebd3cb]/50 text-[11px] text-[#786055] space-y-1 bg-white/60 p-2.5 rounded-xl">
                              {item.numRosas && (
                                <p className="flex items-center gap-1 font-semibold text-[#8c6b5d]">
                                  <span>🌹 Rosas:</span> {item.numRosas} Rosas en el ramo
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

            {/* ----------------- PASO 2: DATOS DE ENTREGA (PASO 5 DEL DIAGRAMA) ----------------- */}
            {paso === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3.5 rounded-2xl bg-[#f8ece8] border border-[#ebd3cb] flex items-center gap-2 text-xs text-[#5c4a42]">
                  <MapPin className="w-4 h-4 text-[#c29486] shrink-0" />
                  <span>¿A dónde y a quién entregaremos este regalo especial?</span>
                </div>

                {/* DIRECCIONES GUARDADAS SI ESTÁ AUTENTICADO */}
                {usuario && direccionesGuardadas.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8c6b5d] uppercase tracking-wider block">
                      Seleccionar dirección guardada:
                    </label>
                    <select
                      value={direccionSeleccionadaId}
                      onChange={(e) => handleSelectDireccion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                    >
                      {direccionesGuardadas.map((d) => (
                        <option key={d.id} value={d.id.toString()}>
                          {d.etiqueta} - {d.direccion} ({d.barrio || "Barranquilla"})
                        </option>
                      ))}
                      <option value="manual">+ Ingresar nueva dirección</option>
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                      Nombre de la persona que recibe: *
                    </label>
                    <input
                      type="text"
                      name="destinatario"
                      required
                      value={formData.destinatario}
                      onChange={handleChange}
                      placeholder="Ej: Maria Paula Gómez"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                      Teléfono de contacto de quien recibe:
                    </label>
                    <input
                      type="tel"
                      name="telefonoDestinatario"
                      value={formData.telefonoDestinatario}
                      onChange={handleChange}
                      placeholder="Ej: 301 987 6543"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                      Dirección exacta de entrega (Barranquilla / Soledad): *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      required
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Calle 84 # 53-18 Apt 402"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                        Barrio: *
                      </label>
                      <input
                        type="text"
                        name="barrio"
                        required
                        value={formData.barrio}
                        onChange={handleChange}
                        placeholder="Ej: Alto Prado"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                        Fecha y Hora deseada: *
                      </label>
                      <input
                        type="text"
                        name="fechaEntrega"
                        required
                        value={formData.fechaEntrega}
                        onChange={handleChange}
                        placeholder="Ej: Mañana 8:00 AM"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- PASO 3: COMPRADOR Y PAGO (PASOS 6 Y 7 DEL DIAGRAMA) ----------------- */}
            {paso === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c29486]" />
                    <h4 className="font-julius font-bold text-xs uppercase tracking-wider text-[#5c4a42]">
                      Tus Datos (Quien envía el regalo):
                    </h4>
                  </div>

                  <div>
                    <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                      Tu Nombre Completo: *
                    </label>
                    <input
                      type="text"
                      name="compradorNombre"
                      required
                      value={formData.compradorNombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan Camilo Pérez"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-julius font-bold text-[#5c4a42] uppercase tracking-wider block mb-1">
                      Tu Número de Teléfono (Celular 10 dígitos): *
                    </label>
                    <input
                      type="tel"
                      name="compradorTelefono"
                      required
                      value={formData.compradorTelefono}
                      onChange={handleChange}
                      placeholder="Ej: 300 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf6f4] border border-[#ebd3cb] text-xs text-[#5c4a42] placeholder-[#a88d81] focus:outline-none focus:ring-2 focus:ring-[#c29486]"
                    />
                  </div>
                </div>

                {/* MÉTODO DE PAGO PREFERIDO */}
                <div className="space-y-3 pt-2 border-t border-[#f4e6e1]">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#c29486]" />
                    <h4 className="font-julius font-bold text-xs uppercase tracking-wider text-[#5c4a42]">
                      ¿Cómo prefieres realizar el pago?
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "Nequi", label: "Nequi / Daviplata", icon: "📱" },
                      { id: "Bancolombia", label: "Bancolombia", icon: "🏦" },
                      { id: "Link de Pago / TC", label: "Tarjeta de Crédito", icon: "💳" },
                      { id: "Efectivo / Otro", label: "Efectivo / Otro", icon: "💵" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, metodoPago: m.id })}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          formData.metodoPago === m.id
                            ? "bg-[#f8ece8] border-[#c29486] text-[#5c4a42] shadow-xs"
                            : "bg-white border-[#ebd3cb]/70 text-[#786055] hover:bg-[#faf6f4]"
                        }`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span className="text-[11px] font-poppins font-bold leading-tight">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- PASO 4: RESUMEN Y CONFIRMACIÓN (PASO 8 DEL DIAGRAMA) ----------------- */}
            {paso === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-[#faf6f4] border border-[#ebd3cb] space-y-3 text-xs text-[#5c4a42]">
                  <div className="flex items-center justify-between border-b border-[#ebd3cb] pb-2">
                    <span className="font-julius font-bold uppercase tracking-wider text-[#8c6b5d]">
                      Resumen del Pedido
                    </span>
                    <span className="font-lemon text-sm text-[#8c6b5d]">{formatPrecio(totalPrecio)}</span>
                  </div>

                  {/* PRODUCTOS */}
                  <div className="space-y-1.5">
                    {cart.map((it) => (
                      <div key={it.id} className="flex items-start justify-between text-[11px]">
                        <div>
                          <span className="font-bold">{it.cantidad}x {it.nombre}</span>
                          {it.numRosas && <span className="block text-[10px] text-[#8c6b5d]">🌹 {it.numRosas} Rosas</span>}
                          {it.adicionales && it.adicionales.length > 0 && (
                            <span className="block text-[10px] text-[#8c6b5d]">➕ {it.adicionales.join(", ")}</span>
                          )}
                        </div>
                        <span className="font-semibold text-[#8c6b5d] shrink-0">
                          {formatPrecio(Number(it.precio) * Number(it.cantidad))}
                        </span>
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
              </div>
            )}

            {/* ----------------- PASO 5: SUCCESS MODAL ¡LISTO! (PASO 9 DEL DIAGRAMA) ----------------- */}
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
                    <span>WhatsApp directo a Adetallesbq</span>
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

            {/* ERROR MESSAGE */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
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
                    onClick={() => setPaso(paso - 1)}
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
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#8c6b5d] hover:bg-[#5c4a42] text-white font-julius font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {cargando ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#ebd3cb]" />
                        <span>Confirmar y Enviar Pedido</span>
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
