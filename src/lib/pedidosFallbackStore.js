import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "pedidos_store.json");

function ensureFile() {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
    }
  } catch (e) {
    console.error("Error al asegurar archivo de pedidos_store:", e);
  }
}

export function getPedidosFallback() {
  ensureFile();
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) || [];
  } catch (e) {
    console.error("Error al leer pedidos_store.json:", e);
    return [];
  }
}

export function savePedidoFallback(nuevoPedido) {
  ensureFile();
  try {
    const pedidos = getPedidosFallback();
    const existeIdx = pedidos.findIndex((p) => p.codigo === nuevoPedido.codigo);
    if (existeIdx === -1) {
      pedidos.unshift(nuevoPedido);
    } else {
      pedidos[existeIdx] = { ...pedidos[existeIdx], ...nuevoPedido };
    }
    fs.writeFileSync(filePath, JSON.stringify(pedidos, null, 2), "utf-8");
    return nuevoPedido;
  } catch (e) {
    console.error("Error al guardar pedido en pedidos_store.json:", e);
    return nuevoPedido;
  }
}

export function updatePedidoFallback(id, nuevoEstado) {
  ensureFile();
  try {
    const pedidos = getPedidosFallback();
    const idx = pedidos.findIndex((p) => String(p.id) === String(id) || p.codigo === String(id));
    if (idx !== -1) {
      pedidos[idx].estado = nuevoEstado;
      fs.writeFileSync(filePath, JSON.stringify(pedidos, null, 2), "utf-8");
      return pedidos[idx];
    }
  } catch (e) {
    console.error("Error al actualizar estado en pedidos_store.json:", e);
  }
  return null;
}

export function deletePedidoFallback(id) {
  ensureFile();
  try {
    let pedidos = getPedidosFallback();
    pedidos = pedidos.filter((p) => String(p.id) !== String(id) && p.codigo !== String(id));
    fs.writeFileSync(filePath, JSON.stringify(pedidos, null, 2), "utf-8");
  } catch (e) {
    console.error("Error al eliminar pedido de pedidos_store.json:", e);
  }
}
