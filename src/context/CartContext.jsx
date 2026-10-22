'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { aceptarCambioCarrito, aplicarConflictosCarrito, restaurarCarritoGuardado, retirarItemsConfirmados } from "@/lib/carrito";
import { MAX_CANTIDAD_PEDIDO } from "@/lib/pedidosValidacion";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const cartRef = useRef([]);
  const validacionId = useRef(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [persistir, setPersistir] = useState(false);
  const [validandoCarrito, setValidandoCarrito] = useState(false);
  const [avisoCarrito, setAvisoCarrito] = useState("");

  const cambiarCarrito = useCallback((siguiente) => {
    const nuevo = typeof siguiente === "function" ? siguiente(cartRef.current) : siguiente;
    cartRef.current = nuevo;
    validacionId.current++;
    setCart(nuevo);
    setPersistir(true);
    setValidandoCarrito(false);
  }, []);

  const validarCarrito = useCallback(async (items = cartRef.current) => {
    if (!items.length) return { ok: false };
    const peticion = ++validacionId.current;
    const clave = JSON.stringify(items);
    setValidandoCarrito(true);
    try {
      const respuesta = await fetch("/api/carrito/validar", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify({ items }),
      });
      const data = await respuesta.json();
      if (peticion !== validacionId.current || clave !== JSON.stringify(cartRef.current)) return { ok: false };
      if (!respuesta.ok) {
        if (respuesta.status === 409 && Array.isArray(data.conflictos)) cambiarCarrito((actual) => aplicarConflictosCarrito(actual, data.conflictos));
        setAvisoCarrito(data.error || "No pudimos comprobar tu carrito. Intenta nuevamente.");
        return { ok: false };
      }
      if (!Array.isArray(data.items)) throw new Error("Respuesta incompleta");
      cambiarCarrito(data.items);
      setAvisoCarrito("");
      return { ok: true, ...data };
    } catch {
      if (peticion === validacionId.current) setAvisoCarrito("No pudimos comprobar la disponibilidad y el precio de tus regalos. Intenta nuevamente.");
      return { ok: false };
    } finally {
      if (peticion === validacionId.current) setValidandoCarrito(false);
    }
  }, [cambiarCarrito]);

  useEffect(() => {
    let cancelado = false;
    // Read the external storage after hydration; Strict Mode cleanup cancels the
    // first read before it can overwrite a newer cart or launch a stale request.
    queueMicrotask(() => {
      if (cancelado) return;
      try {
        const guardado = localStorage.getItem("adetallesbq_cart");
        const restaurado = guardado ? restaurarCarritoGuardado(JSON.parse(guardado)) : [];
        cambiarCarrito(restaurado);
        if (restaurado.length) void validarCarrito(restaurado);
      } catch {
        setAvisoCarrito("No pudimos leer tu carrito guardado. Puedes vaciarlo para empezar de nuevo o volver a elegir tus regalos.");
      }
      setMounted(true);
    });
    return () => { cancelado = true; };
  }, [cambiarCarrito, validarCarrito]);

  useEffect(() => {
    if (!mounted || !persistir) return;
    try { localStorage.setItem("adetallesbq_cart", JSON.stringify(cart)); } catch { /* Keep the in-memory cart available. */ }
  }, [cart, mounted, persistir]);

  useEffect(() => {
    if (isDrawerOpen && mounted) void validarCarrito();
  }, [isDrawerOpen, mounted, validarCarrito]);

  useEffect(() => {
    const actualizar = () => { if (cartRef.current.length) void validarCarrito(); };
    window.addEventListener("catalogoActualizado", actualizar);
    return () => window.removeEventListener("catalogoActualizado", actualizar);
  }, [validarCarrito]);

  const agregarProducto = (producto, cantidad = 1) => {
    if (!producto || !Number.isSafeInteger(producto.productoId) || !Array.isArray(producto.adicionalesSeleccionados)) {
      setAvisoCarrito("Vuelve a personalizar este regalo desde el catálogo antes de agregarlo.");
      setIsDrawerOpen(true);
      return;
    }
    const nuevo = restaurarCarritoGuardado([{ ...producto, cantidad }])[0];
    const actuales = cartRef.current;
    const existe = actuales.find((item) => item.id === nuevo.id);
    const siguientes = existe ? actuales.map((item) => item.id === nuevo.id ? { ...item, cantidad: Math.min(MAX_CANTIDAD_PEDIDO, item.cantidad + cantidad) } : item) : [...actuales, nuevo];
    cambiarCarrito(siguientes);
    setAvisoCarrito("");
    setIsDrawerOpen(true);
    void validarCarrito(siguientes);
  };

  const eliminarProducto = (id) => {
    cambiarCarrito((prev) => prev.filter((item) => item.id !== id));
    setAvisoCarrito("");
  };
  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) { eliminarProducto(id); return; }
    if (!Number.isInteger(cantidad) || cantidad > MAX_CANTIDAD_PEDIDO) return;
    cambiarCarrito((prev) => prev.map((item) => item.id === id ? { ...item, cantidad } : item));
  };
  const quitarProducto = (id) => {
    const item = cartRef.current.find((actual) => actual.id === id);
    if (item) actualizarCantidad(id, item.cantidad - 1);
  };
  const vaciarCarrito = useCallback(() => {
    cambiarCarrito([]);
    setAvisoCarrito("");
    try { localStorage.removeItem("adetallesbq_cart"); } catch { /* No persistent storage. */ }
  }, [cambiarCarrito]);
  const aceptarActualizacion = (id) => {
    cambiarCarrito((actual) => aceptarCambioCarrito(actual, id));
    setAvisoCarrito("");
  };
  const retirarProductosConfirmados = useCallback((items) => {
    cambiarCarrito(actual => retirarItemsConfirmados(actual, items));
  }, [cambiarCarrito]);
  const registrarConflictos = (data) => {
    cambiarCarrito((actual) => aplicarConflictosCarrito(actual, data.conflictos));
    setAvisoCarrito(data.error || "Revisa los regalos señalados para continuar.");
  };
  const abrirCarrito = useCallback(() => setIsDrawerOpen(true), []);
  const cerrarCarrito = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    window.addEventListener("userLoggedOut", vaciarCarrito);
    window.addEventListener("cartReset", vaciarCarrito);
    return () => {
      window.removeEventListener("userLoggedOut", vaciarCarrito);
      window.removeEventListener("cartReset", vaciarCarrito);
    };
  }, [vaciarCarrito]);

  const totalItems = cart.reduce((suma, item) => suma + item.cantidad, 0);
  const totalPrecio = cart.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  return (
    <CartContext.Provider value={{ cart, isDrawerOpen, agregarProducto, quitarProducto, eliminarProducto,
      actualizarCantidad, vaciarCarrito, abrirCarrito, cerrarCarrito, totalItems, totalPrecio,
      validarCarrito, validandoCarrito, avisoCarrito, aceptarActualizacion, registrarConflictos, retirarProductosConfirmados }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe ser usado dentro de un CartProvider");
  return context;
}
