export function restaurarCarritoGuardado(datos) {
  if (!Array.isArray(datos)) throw new Error("No pudimos leer tu carrito guardado. Vuelve a elegir tus regalos o vacía el carrito para empezar de nuevo.");
  return datos.map((valor, index) => {
    const item = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : { datosAnteriores: valor };
    const compatible = Number.isSafeInteger(item.productoId) && item.productoId > 0 && Array.isArray(item.adicionalesSeleccionados);
    return {
      ...item,
      id: typeof item.id === "string" && item.id ? item.id : `guardado-${index}`,
      nombre: item.nombre || "Regalo guardado",
      precio: Number.isFinite(item.precio) && item.precio >= 0 ? item.precio : 0,
      cantidad: Number.isInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 1,
      ...(!compatible ? { revisionCarrito: { tipo: "RECONFIGURAR", mensaje: "Este regalo pertenece a un carrito anterior. Conservamos tus opciones: quítalo y vuelve a personalizarlo desde el catálogo para confirmar su disponibilidad." } } : {}),
    };
  });
}

export function aplicarConflictosCarrito(cart, conflictos = []) {
  const porId = new Map(conflictos.map((conflicto) => [String(conflicto.itemId), conflicto]));
  return cart.map((item) => {
    const revisionCarrito = porId.get(String(item.id));
    if (revisionCarrito) return { ...item, revisionCarrito };
    const { revisionCarrito: anterior, ...sinConflicto } = item;
    return sinConflicto;
  });
}

export function aceptarCambioCarrito(cart, id) {
  return cart.map((item) => item.id === id && item.revisionCarrito?.actualizado
    ? { ...item.revisionCarrito.actualizado, id: item.id, cantidad: item.cantidad }
    : item);
}

export function retirarItemsConfirmados(cart, confirmados) {
  const cantidades = new Map(confirmados.map(item => [item.id, item.cantidad]));
  return cart.flatMap(item => {
    const cantidadConfirmada = cantidades.get(item.id);
    if (cantidadConfirmada === undefined) return [item];
    const restante = item.cantidad - cantidadConfirmada;
    return restante > 0 ? [{ ...item, cantidad: restante }] : [];
  });
}

export function crearIdConfiguracion(productoId) {
  const identificador = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${productoId}-${identificador}`;
}
