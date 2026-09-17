'use client';

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("adetallesbq_cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error al cargar carrito:", e);
    }
  }, []);

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("adetallesbq_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error al guardar carrito:", e);
    }
  }, [cart, mounted]);

  const agregarProducto = (producto, cantidad = 1) => {
    if (!producto) return;
    const targetId = producto.id ?? producto.nombre;
    if (targetId === undefined || targetId === null || targetId === "") return;

    setCart((prev) => {
      const existe = prev.find((item) => item.id === targetId);
      if (existe) {
        return prev.map((item) =>
          item.id === targetId
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [
        ...prev,
        {
          id: targetId,
          nombre: producto.nombre || "Regalo Adetallesbq",
          precio: Number(producto.precio) || 0,
          imagen: producto.imagen || "/images/Canastita.png",
          categoria: producto.categoria || "General",
          cantidad: cantidad,
        },
      ];
    });
    setIsDrawerOpen(true);
  };

  const quitarProducto = (id) => {
    setCart((prev) => {
      const existe = prev.find((item) => item.id === id);
      if (existe && existe.cantidad > 1) {
        return prev.map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const eliminarProducto = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      eliminarProducto(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item))
    );
  };

  const vaciarCarrito = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("adetallesbq_cart");
      } catch (e) {
        console.error("Error al vaciar carrito:", e);
      }
    }
  };

  const abrirCarrito = () => setIsDrawerOpen(true);
  const cerrarCarrito = () => setIsDrawerOpen(false);

  useEffect(() => {
    const handleReset = () => {
      setCart([]);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("adetallesbq_cart");
        } catch (e) {
          console.error("Error:", e);
        }
      }
    };

    window.addEventListener("userLoggedOut", handleReset);
    window.addEventListener("cartReset", handleReset);
    return () => {
      window.removeEventListener("userLoggedOut", handleReset);
      window.removeEventListener("cartReset", handleReset);
    };
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const totalPrecio = cart.reduce(
    (acc, item) => acc + (item.precio || 0) * (item.cantidad || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isDrawerOpen,
        agregarProducto,
        quitarProducto,
        eliminarProducto,
        actualizarCantidad,
        vaciarCarrito,
        abrirCarrito,
        cerrarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
