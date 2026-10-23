// Shared by the product configurator and checkout. Prices always start from the
// current database product; only album size and selected extras add a surcharge.
export const COSTO_ENVIO_BARRANQUILLA = 15000;
export const MAX_CANTIDAD_PEDIDO = 99;
export const OPCIONES_ALBUM = { "15 fotos": 0, "20 fotos": 8000, "30 fotos": 35000 };

export class ErrorPedido extends Error {
  constructor(message, status = 400, conflictos = []) {
    super(message);
    this.status = status;
    this.conflictos = conflictos;
  }
}

export function validarIdPositivo(valor) {
  const numero = typeof valor === "number" ? valor : typeof valor === "string" && /^\d+$/.test(valor) ? Number(valor) : NaN;
  if (!Number.isSafeInteger(numero) || numero < 1 || numero > 2147483647) throw new ErrorPedido("El ID debe ser un entero positivo válido.");
  return numero;
}

export function obtenerOpcionesProducto(producto) {
  const nombre = (producto.nombre || "").toLowerCase();
  const descripcion = (producto.descripcion || "").toLowerCase();
  const categoria = (producto.categoria || "").toLowerCase();
  const permiteEleccionRosas = ["color de rosa a elección", "color de rosa a eleccion", "color a elección del cliente", "color a eleccion del cliente", "colores a elección", "colores a eleccion", "dos o tres colores de rosas", "rosas a gusto propio", "color a elección", "color a eleccion"].some((texto) => descripcion.includes(texto));
  const esCuadro1FotoYFrase = nombre.includes("cuadro 1 foto y frase");
  const esSpotifyNegro = nombre.includes("spotify");
  const esAlbumFotos = nombre.includes("álbum de fotos") || nombre.includes("album de fotos");
  const requiereFotosCliente = esAlbumFotos || esCuadro1FotoYFrase || esSpotifyNegro || ["cuadro", "álbum", "album", "foto"].some((texto) => nombre.includes(texto)) || descripcion.includes("foto");
  const rango = (textos) => textos.some((texto) => descripcion.includes(texto));
  const opcionesPelucheRango = rango(["40-45cm", "40 - 45cm", "40 a 45cm"]) || nombre.includes("girasoles peluche") ? ["40 cm", "45 cm"]
    : rango(["50-60cm", "50 - 60cm", "50 a 60cm"]) ? ["50 cm", "60 cm"]
      : rango(["70-80cm", "70 - 80cm", "70 a 80cm"]) ? ["70 cm", "80 cm"] : [];
  const esTermoOMug = ["mug", "termo"].some((texto) => nombre.includes(texto)) || ["termo", "taza", "mug"].some((texto) => descripcion.includes(texto));
  const requiereTexto = !categoria.includes("llavero") && !esTermoOMug && (nombre.includes("cuadro 1 foto") || ["vaso decorado con frase", "frase que desees", "globo burbuja personalizado marcado"].some((texto) => descripcion.includes(texto)));
  return { permiteEleccionRosas, esCuadro1FotoYFrase, esSpotifyNegro, esAlbumFotos, requiereFotosCliente, esPelucheRango: opcionesPelucheRango.length > 0, opcionesPelucheRango, esTermoOMug, requiereTexto };
}

const monto = (valor) => {
  const numero = Number(valor);
  if (valor === null || valor === "" || !Number.isFinite(numero) || numero < 0 || numero > 1e12) throw new ErrorPedido("No se pudo comprobar el precio del catálogo. Intenta nuevamente.", 503);
  return Math.round(numero * 100) / 100;
};

export function calcularPrecioConfigurado(producto, configuracion = {}, adicionales = []) {
  const opciones = obtenerOpcionesProducto(producto);
  const recargo = opciones.esAlbumFotos ? OPCIONES_ALBUM[configuracion.opcionAlbumFotos || "15 fotos"] : 0;
  if (recargo === undefined) throw new ErrorPedido("Elige una opción válida para el álbum.");
  return monto(monto(producto.precio) + recargo + adicionales.reduce((suma, adicional) => suma + monto(adicional.precio), 0));
}

function texto(valor, campo, maximo) {
  if (typeof valor !== "string" || valor.length > maximo) throw new ErrorPedido(`Revisa ${campo} de este regalo.`);
  return valor.trim();
}

function configuracionActual(item, producto) {
  const opciones = obtenerOpcionesProducto(producto);
  const configuracion = {};
  const personalizarTexto = (campo, permitido, maximo, predeterminado) => {
    if (item[campo] !== undefined && item[campo] !== null && item[campo] !== "") {
      if (!permitido) throw new ErrorPedido("La personalización de este regalo cambió. Vuelve a elegir sus opciones.");
      configuracion[campo] = texto(item[campo], campo, maximo);
    } else if (permitido && predeterminado !== undefined) configuracion[campo] = predeterminado;
  };
  personalizarTexto("colorRosas", opciones.permiteEleccionRosas, 120, "Rosas Rojas");
  personalizarTexto("nombreTermoMug", opciones.esTermoOMug || opciones.requiereTexto, 255);
  personalizarTexto("mensajeTarjeta", true, 2000);
  if (opciones.esCuadro1FotoYFrase) {
    const cantidad = item.numFotosCuadro ?? 1;
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 12) throw new ErrorPedido("El cuadro admite entre 1 y 12 fotos.");
    configuracion.numFotosCuadro = cantidad;
  } else if (item.numFotosCuadro !== undefined && item.numFotosCuadro !== null) throw new ErrorPedido("Este regalo ya no admite la opción de fotos elegida.");
  for (const [campo, permitido, valores] of [
    ["colorFondoSpotify", opciones.esSpotifyNegro, ["Fondo Negro", "Fondo Blanco"]],
    ["opcionAlbumFotos", opciones.esAlbumFotos, Object.keys(OPCIONES_ALBUM)],
    ["tamanoPelucheCombo", opciones.esPelucheRango, opciones.opcionesPelucheRango],
  ]) {
    if (permitido) {
      const valor = item[campo] ?? valores[0];
      if (!valores.includes(valor)) throw new ErrorPedido("Las opciones de este regalo cambiaron. Vuelve a personalizarlo.");
      configuracion[campo] = valor;
    } else if (item[campo] !== undefined && item[campo] !== null && item[campo] !== "") throw new ErrorPedido("Este regalo ya no admite una de las opciones elegidas.");
  }
  if (item.numRosas !== undefined && item.numRosas !== null) throw new ErrorPedido("Vuelve a confirmar la cantidad de rosas desde el catálogo.");
  return configuracion;
}

// No Prisma singleton here: callers supply a database client or transaction.
export async function validarPedidoCatalogo(items, cliente) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new ErrorPedido("El carrito debe contener entre 1 y 50 regalos.");
  const conflictos = [];
  const preparados = [];
  const configuraciones = new Set();
  const conflicto = (item, tipo, mensaje, actualizado) => conflictos.push({ itemId: item?.id, productoId: item?.productoId, tipo, mensaje, ...(actualizado ? { actualizado } : {}) });
  for (const item of items) {
    try {
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new ErrorPedido("Revisa este regalo guardado y vuelve a agregarlo desde el catálogo.");
      const productoId = validarIdPositivo(item.productoId);
      if (typeof item.id !== "string" || !item.id || item.id.length > 500 || !Number.isInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > MAX_CANTIDAD_PEDIDO) throw new ErrorPedido(`Revisa la cantidad de este regalo (1 a ${MAX_CANTIDAD_PEDIDO}).`);
      if (configuraciones.has(item.id)) throw new ErrorPedido("Revisa las configuraciones repetidas de tu carrito.");
      configuraciones.add(item.id);
      if (!Array.isArray(item.adicionalesSeleccionados) || item.adicionalesSeleccionados.length > 100) throw new ErrorPedido("Este regalo pertenece a un carrito anterior. Vuelve a personalizarlo para confirmar sus adicionales.");
      const ids = item.adicionalesSeleccionados.map((ad) => validarIdPositivo(ad?.id));
      if (new Set(ids).size !== ids.length) throw new ErrorPedido("Un adicional no puede repetirse en el mismo regalo.");
      if (item.adicionales !== undefined && (!Array.isArray(item.adicionales) || item.adicionales.length !== ids.length)) throw new ErrorPedido("Conservamos tus adicionales anteriores. Vuelve a personalizar este regalo para confirmarlos.");
      preparados.push({ item, productoId, ids });
    } catch (error) {
      if (!(error instanceof ErrorPedido)) throw error;
      conflicto(item, "RECONFIGURAR", error.message);
    }
  }
  const productoIds = [...new Set(preparados.map((p) => p.productoId))];
  const adicionalIds = [...new Set(preparados.flatMap((p) => p.ids))];
  // Explicit select works on the older schema without productos.imagenes, too.
  const [productos, adicionales] = await Promise.all([
    productoIds.length ? cliente.producto.findMany({ where: { id: { in: productoIds } }, select: { id: true, nombre: true, descripcion: true, precio: true, categoria: true, imagen: true, updatedAt: true } }) : [],
    adicionalIds.length ? cliente.adicional.findMany({ where: { id: { in: adicionalIds } }, select: { id: true, nombre: true, precio: true, disponible: true, updatedAt: true } }) : [],
  ]);
  const productosPorId = new Map(productos.map((p) => [p.id, p]));
  const adicionalesPorId = new Map(adicionales.map((ad) => [ad.id, ad]));
  const actualizados = [];
  for (const { item, productoId, ids } of preparados) {
    const producto = productosPorId.get(productoId);
    if (!producto) { conflicto(item, "PRODUCTO_RETIRADO", `«${item.nombre || "Este regalo"}» fue retirado del catálogo. Quítalo del carrito para continuar.`); continue; }
    const extras = ids.map((id) => adicionalesPorId.get(id));
    if (extras.some((ad) => !ad || ad.disponible !== true)) { conflicto(item, "ADICIONAL_RETIRADO", `Un adicional de «${producto.nombre}» ya no está disponible. Conservamos tus opciones: quita este regalo y vuelve a personalizarlo.`); continue; }
    try {
      const configuracion = configuracionActual(item, producto);
      const precio = calcularPrecioConfigurado(producto, configuracion, extras);
      const versionProducto = producto.updatedAt ? new Date(producto.updatedAt).toISOString() : null;
      const actualizado = {
        id: item.id, productoId, nombre: producto.nombre, precio, categoria: producto.categoria,
        imagen: producto.imagen || null, cantidad: item.cantidad, versionProducto,
        ...configuracion,
        adicionalesSeleccionados: extras.map((ad) => ({ id: ad.id, nombre: ad.nombre, precio: monto(ad.precio), version: ad.updatedAt ? new Date(ad.updatedAt).toISOString() : null })),
        adicionales: extras.map((ad) => ad.nombre),
      };
      actualizados.push(actualizado);
      const extraCambio = item.adicionalesSeleccionados.some((anterior, i) => (anterior.nombre !== undefined && anterior.nombre !== extras[i].nombre) || (anterior.version && anterior.version !== actualizado.adicionalesSeleccionados[i].version)) || (Array.isArray(item.adicionales) && item.adicionales.some((nombre, i) => nombre !== extras[i].nombre));
      if (typeof item.precio !== "number" || !Number.isFinite(item.precio) || Math.abs(item.precio - precio) > 0.001 || item.nombre !== producto.nombre || (item.versionProducto && item.versionProducto !== versionProducto) || extraCambio) {
        conflicto(item, "PRODUCTO_CAMBIADO", `Actualizamos el precio o los detalles de «${producto.nombre}». Revisa el cambio y acéptalo antes de continuar.`, actualizado);
      }
    } catch (error) {
      if (!(error instanceof ErrorPedido) || error.status === 503) throw error;
      conflicto(item, "RECONFIGURAR", error.message);
    }
  }
  if (conflictos.length) throw new ErrorPedido("Tu carrito necesita una revisión. Conservamos tus regalos y opciones para que decidas cómo continuar.", 409, conflictos);
  const subtotal = monto(actualizados.reduce((suma, item) => suma + item.precio * item.cantidad, 0));
  return { items: actualizados, subtotal, costoEnvio: COSTO_ENVIO_BARRANQUILLA, total: monto(subtotal + COSTO_ENVIO_BARRANQUILLA) };
}

export function respuestaErrorPedido(error) {
  if (error instanceof ErrorPedido) return { status: error.status, body: { error: error.message, ...(error.status === 409 ? { codigo: "CARRITO_DESACTUALIZADO", conflictos: error.conflictos } : {}) } };
  if (error?.code === "P2025") return { status: 404, body: { error: "El pedido no existe o ya fue eliminado." } };
  return { status: 503, body: { error: "No se pudo verificar o guardar el pedido. Intenta nuevamente; no confirmamos ningún cambio." } };
}
