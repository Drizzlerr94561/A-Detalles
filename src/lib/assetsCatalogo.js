import { catalogoOficial } from "./catalogoOficial.js";
import { obtenerListaImagenes } from "./productosDefecto.js";

export const GRACIA_ASSET_MS = 24 * 60 * 60 * 1000;
export const LEASE_ASSET_MS = 10 * 60 * 1000;
const TIMEOUT_PROVEEDOR_MS = 10 * 1000;
const MARGEN_PERSISTENCIA_MS = 5 * 1000;
const MAX_WAIT_TRANSACCION_MS = 1000;
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const PUBLIC_ID = new RegExp(`^adetallesbq/productos/managed_(${UUID})$`);
const RUTA_GESTIONADA = new RegExp(`/adetallesbq/productos/managed_(${UUID})(?:\\.[a-z0-9]+)?$`, "i");
const ESTADOS_PENDIENTES = ["SUBIENDO", "TEMPORAL", "PENDIENTE", "ELIMINANDO", "REINTENTO"];
const ESTADOS_ENLAZABLES = ["TEMPORAL", "VINCULADO", "PENDIENTE"];

export function publicIdGestionado(id) {
  const publicId = `adetallesbq/productos/managed_${id}`;
  if (!PUBLIC_ID.test(publicId)) throw new Error("Identificador de imagen inválido.");
  return publicId;
}

export function idAssetDesdeUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.username || url.password) return null;
    if (!/^\/[^/]+\/image\/upload\//.test(url.pathname)) return null;
    return decodeURIComponent(url.pathname).match(RUTA_GESTIONADA)?.[1]?.toLowerCase() || null;
  } catch { return null; }
}

export function assetPropioValido(asset, cloudName) {
  if (!asset || typeof cloudName !== "string" || !cloudName || !PUBLIC_ID.test(asset.publicId || "")) return false;
  if (asset.publicId.match(PUBLIC_ID)?.[1] !== asset.id) return false;
  // Una reserva previa a la subida también es limpiable si el proveedor llegó a guardar el archivo.
  if (asset.url === null || asset.url === undefined) return true;
  try {
    const url = new URL(asset.url);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !url.username && !url.password &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`) && idAssetDesdeUrl(asset.url) === asset.id;
  } catch { return false; }
}

function idsDeProducto(producto) {
  return [...new Set(obtenerListaImagenes(producto).map(idAssetDesdeUrl).filter(Boolean))];
}

function errorAsset() {
  return Object.assign(new Error("Una fotografía ya no está disponible. Vuelve a subirla antes de guardar."), {
    code: "ASSET_NO_DISPONIBLE", status: 409,
  });
}

// Se llama dentro de la misma transacción Serializable que modifica el producto.
// Únicamente registra referencias y trabajo pendiente; nunca llama a Cloudinary.
export async function sincronizarAssetsProducto(tx, anterior, siguiente, { ahora = new Date() } = {}) {
  const anteriores = idsDeProducto(anterior);
  const siguientes = idsDeProducto(siguiente);
  if (!anteriores.length && !siguientes.length) return;
  for (const id of siguientes) {
    const asset = await tx.assetCatalogo.findUnique({ where: { id } });
    if (!asset || !ESTADOS_ENLAZABLES.includes(asset.estado)) throw errorAsset();
    const urls = obtenerListaImagenes(siguiente).filter((url) => idAssetDesdeUrl(url) === id);
    if (!assetPropioValido(asset, process.env.CLOUDINARY_CLOUD_NAME) || urls.some((url) => {
      try { return new URL(url).pathname.split("/")[1] !== new URL(asset.url).pathname.split("/")[1]; }
      catch { return true; }
    })) throw errorAsset();
    const actualizado = await tx.assetCatalogo.updateMany({
      where: { id, estado: { in: ESTADOS_ENLAZABLES } },
      data: { estado: "VINCULADO", eliminarDesde: null, ultimoError: null },
    });
    if (actualizado.count !== 1) throw errorAsset();
  }
  const quitados = anteriores.filter((id) => !siguientes.includes(id));
  if (quitados.length) await tx.assetCatalogo.updateMany({
    where: { id: { in: quitados }, estado: { in: ESTADOS_ENLAZABLES } },
    data: { estado: "PENDIENTE", eliminarDesde: new Date(ahora.getTime() + GRACIA_ASSET_MS), ultimoError: null },
  });
}

export async function solicitarLimpiezaTemporal(cliente, assetIds, { ahora = new Date() } = {}) {
  // El cliente no puede encolar imágenes vinculadas ni proporcionar public_id o URL.
  return cliente.assetCatalogo.updateMany({
    where: { id: { in: assetIds }, estado: { in: ["TEMPORAL", "SUBIENDO"] } },
    data: { estado: "PENDIENTE", eliminarDesde: new Date(ahora.getTime() + GRACIA_ASSET_MS) },
  });
}

function contieneReferencia(value, asset) {
  if (typeof value === "string") {
    // También protege snapshots JSON serializados y URLs con transformaciones Cloudinary.
    return value.includes(asset.publicId) || value.includes(encodeURIComponent(asset.publicId)) || idAssetDesdeUrl(value) === asset.id;
  }
  if (Array.isArray(value)) return value.some((item) => contieneReferencia(item, asset));
  if (value && typeof value === "object") return Object.values(value).some((item) => contieneReferencia(item, asset));
  return false;
}

async function tieneReferencias(tx, asset) {
  if (contieneReferencia(catalogoOficial, asset)) return true;
  const productos = await tx.producto.findMany({ select: { imagen: true, imagenes: true } });
  if (contieneReferencia(productos, asset)) return true;
  const pedidos = await tx.pedido.findMany({ select: { items: true } });
  return contieneReferencia(pedidos, asset);
}

async function borrarConTimeout(proveedor, publicId, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      proveedor.uploader.destroy(publicId, { resource_type: "image", type: "upload", invalidate: true, timeout: timeoutMs }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("TIMEOUT_PROVEEDOR")), timeoutMs);
      }),
    ]);
  } finally { clearTimeout(timer); }
}

export async function procesarLimpiezaAssets({ cliente, proveedor, cloudName, ahora = () => new Date(), limite = 10, aplicar = false, presupuestoMs = 45000 }) {
  if (!cloudName || typeof cloudName !== "string") throw new Error("Configura CLOUDINARY_CLOUD_NAME antes de revisar imágenes.");
  // Los tests antiguos pueden proporcionar una fecha; en ejecución real se lee el reloj en cada paso.
  const reloj = typeof ahora === "function" ? ahora : () => ahora;
  const inicio = reloj();
  if (!(inicio instanceof Date) || !Number.isFinite(inicio.getTime()) || !Number.isFinite(presupuestoMs) || presupuestoMs < 1) throw new Error("Reloj o presupuesto de limpieza inválido.");
  const fin = inicio.getTime() + presupuestoMs;
  const restante = () => Math.max(0, fin - reloj().getTime());
  const reservaProveedor = aplicar ? TIMEOUT_PROVEEDOR_MS : 0;
  const batch = Math.max(1, Math.min(Number.isInteger(limite) ? limite : 10, 50));
  const candidatos = await cliente.assetCatalogo.findMany({
    where: { estado: { in: ESTADOS_PENDIENTES }, eliminarDesde: { lte: inicio } },
    orderBy: { eliminarDesde: "asc" }, take: batch,
  });
  const resultado = { revisados: candidatos.length, eliminados: 0, protegidos: 0, pendientes: 0, bloqueados: 0, errores: 0, diferidosPorTiempo: 0 };
  for (const [indice, candidato] of candidatos.entries()) {
    // No iniciar otro trabajo si no quedan tiempo remoto y margen para guardar su resultado.
    const tiempoTransaccion = restante() - reservaProveedor - MARGEN_PERSISTENCIA_MS - MAX_WAIT_TRANSACCION_MS;
    if (tiempoTransaccion < 1) {
      resultado.diferidosPorTiempo += candidatos.length - indice;
      resultado.pendientes += candidatos.length - indice;
      break;
    }
    try {
      const decision = await cliente.$transaction(async (tx) => {
        const asset = await tx.assetCatalogo.findUnique({ where: { id: candidato.id } });
        if (!asset || !ESTADOS_PENDIENTES.includes(asset.estado) || !asset.eliminarDesde || asset.eliminarDesde > reloj()) return { accion: "ocupado" };
        if (!assetPropioValido(asset, cloudName)) {
          if (aplicar) await tx.assetCatalogo.update({ where: { id: asset.id }, data: { estado: "BLOQUEADO", ultimoError: "PROPIEDAD_NO_VERIFICADA", eliminarDesde: null } });
          return { accion: "bloqueado" };
        }
        if (await tieneReferencias(tx, asset)) {
          if (aplicar) await tx.assetCatalogo.update({ where: { id: asset.id }, data: { estado: "VINCULADO", eliminarDesde: null, ultimoError: null } });
          return { accion: "protegido" };
        }
        if (!aplicar) return { accion: "pendiente" };
        if (restante() <= TIMEOUT_PROVEEDOR_MS + MARGEN_PERSISTENCIA_MS) return { accion: "sinTiempo" };
        // Cada imagen obtiene su propia reserva desde el momento de adquisición, no desde el inicio del lote.
        const lease = new Date(reloj().getTime() + LEASE_ASSET_MS);
        await tx.assetCatalogo.update({ where: { id: asset.id }, data: {
          estado: "ELIMINANDO", eliminarDesde: lease, intentos: { increment: 1 }, ultimoError: null,
        } });
        return { accion: "eliminar", asset, lease };
      }, { isolationLevel: "Serializable", timeout: Math.min(10000, tiempoTransaccion), maxWait: MAX_WAIT_TRANSACCION_MS });

      if (decision.accion === "protegido") { resultado.protegidos++; continue; }
      if (decision.accion === "bloqueado") { resultado.bloqueados++; continue; }
      if (decision.accion === "sinTiempo") { resultado.diferidosPorTiempo++; resultado.pendientes++; continue; }
      if (decision.accion !== "eliminar") { resultado.pendientes++; continue; }
      const { asset, lease } = decision;
      try {
        const timeoutMs = Math.min(TIMEOUT_PROVEEDOR_MS, restante() - MARGEN_PERSISTENCIA_MS);
        if (timeoutMs < 1) throw new Error("PRESUPUESTO_AGOTADO");
        const borrado = await borrarConTimeout(proveedor, asset.publicId, timeoutMs);
        if (!["ok", "not found"].includes(borrado?.result)) throw new Error("BORRADO_NO_CONFIRMADO");
        await cliente.assetCatalogo.updateMany({
          where: { id: asset.id, estado: "ELIMINANDO", eliminarDesde: lease },
          data: { estado: "ELIMINADO", eliminarDesde: null, ultimoError: null },
        });
        resultado.eliminados++;
      } catch {
        const espera = Math.min(GRACIA_ASSET_MS, 60 * 1000 * (2 ** Math.min(asset.intentos || 0, 10)));
        await cliente.assetCatalogo.updateMany({
          where: { id: asset.id, estado: "ELIMINANDO", eliminarDesde: lease },
          // Un timeout puede ocurrir después de borrar remotamente: no vuelve a ser enlazable.
          data: { estado: "REINTENTO", eliminarDesde: new Date(reloj().getTime() + espera), ultimoError: "REINTENTAR_PROVEEDOR" },
        });
        resultado.errores++;
      }
    } catch {
      // Ante error de lectura/serialización no se llama al proveedor y se reintentará en el próximo ciclo.
      resultado.errores++;
    }
  }
  return resultado;
}
