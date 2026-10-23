import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";
import { cargarCatalogo, esColumnaImagenesAusente, productoLegacySelect } from "@/lib/cargarCatalogo";
import { normalizarUrlImagen, obtenerListaImagenes } from "@/lib/productosDefecto";
import { ErrorCatalogo, transaccionCatalogo, exigirCategoria, datosErrorCatalogo } from "@/lib/integridadCatalogo";
import { sincronizarAssetsProducto } from "@/lib/assetsCatalogo";

const tieneCampo = (body, campo) => Object.prototype.hasOwnProperty.call(body, campo);
const mensajeGaleriaNoDisponible = "La base de datos aún no tiene la columna de galería imagenes. Aplica la migración antes de guardar fotografías; no se guardó ningún cambio.";

class DatosInvalidos extends Error {}

async function leerBody(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new DatosInvalidos("El cuerpo de la solicitud debe contener JSON válido.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new DatosInvalidos("Los datos del producto deben ser un objeto.");
  }
  return body;
}

function validarId(valor) {
  const id = typeof valor === "number" ? valor : typeof valor === "string" && /^\d+$/.test(valor) ? Number(valor) : NaN;
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) throw new DatosInvalidos("El ID del producto debe ser un entero entre 1 y 2147483647.");
  return id;
}

function validarTexto(valor, campo, maximo, obligatorio = false) {
  if (valor === null && !obligatorio) return null;
  if (typeof valor !== "string") throw new DatosInvalidos(`El campo ${campo} debe ser texto.`);
  const texto = valor.trim();
  if (obligatorio && !texto) throw new DatosInvalidos(`El campo ${campo} es obligatorio.`);
  if (maximo && texto.length > maximo) throw new DatosInvalidos(`El campo ${campo} admite hasta ${maximo} caracteres.`);
  return texto;
}

function validarPrecio(valor) {
  if ((typeof valor !== "number" && typeof valor !== "string") || (typeof valor === "string" && !valor.trim())) {
    throw new DatosInvalidos("El precio debe ser un número mayor o igual a cero.");
  }
  const precio = Number(valor);
  if (!Number.isFinite(precio) || precio < 0) throw new DatosInvalidos("El precio debe ser un número mayor o igual a cero.");
  return precio;
}

function validarImagen(valor) {
  if (typeof valor !== "string" || !valor.trim()) throw new DatosInvalidos("Cada imagen debe contener una URL válida.");
  const url = normalizarUrlImagen(valor);
  if (!url || /^(?:blob:|data:)/i.test(url) || url.length > 500) throw new DatosInvalidos("Cada imagen debe contener una URL permanente válida de hasta 500 caracteres.");
  return url;
}

function validarGaleria(valor) {
  let lista = valor;
  if (typeof lista === "string") {
    try {
      lista = JSON.parse(lista);
    } catch {
      lista = valor;
    }
    if (typeof lista === "string") lista = [lista];
  }
  if (!Array.isArray(lista)) throw new DatosInvalidos("La galería debe ser una lista de URLs de imágenes.");
  const urls = lista.map(validarImagen);
  return obtenerListaImagenes({ imagenes: urls });
}

function camposProducto(body, crear = false) {
  const data = {};
  for (const [campo, maximo, obligatorio] of [
    ["nombre", 255, true],
    ["categoria", 100, true],
    ["descripcion", null, false],
    ["etiqueta", 100, false],
  ]) {
    if (tieneCampo(body, campo) || (crear && obligatorio)) {
      data[campo] = validarTexto(body[campo], campo, maximo, obligatorio);
    }
  }
  if (tieneCampo(body, "precio") || crear) data.precio = validarPrecio(body.precio);
  if (tieneCampo(body, "stock")) {
    if (!Number.isSafeInteger(body.stock) || body.stock < 0 || body.stock > 2147483647) {
      throw new DatosInvalidos("El stock debe ser un entero entre 0 y 2147483647.");
    }
    data.stock = body.stock;
  }
  return data;
}

function camposImagenes(body, actual = {}) {
  if (tieneCampo(body, "imagenes")) {
    const imagenes = validarGaleria(body.imagenes);
    if (tieneCampo(body, "imagen") && body.imagen !== null && body.imagen !== "") validarImagen(body.imagen);
    return { imagenes, imagen: imagenes[0] || null };
  }
  if (tieneCampo(body, "imagen")) {
    if (body.imagen === null || body.imagen === "") return { imagen: null, imagenes: [] };
    const portada = validarImagen(body.imagen);
    const imagenes = obtenerListaImagenes({ imagenes: [portada, ...obtenerListaImagenes(actual)] });
    return { imagen: portada, imagenes };
  }
  return {};
}

async function obtenerProductoActual(id, cliente = prisma) {
  try {
    return { producto: await cliente.producto.findUnique({ where: { id } }), canWriteImages: true };
  } catch (error) {
    if (!esColumnaImagenesAusente(error)) throw error;
    return {
      producto: await cliente.producto.findUnique({ where: { id }, select: productoLegacySelect }),
      canWriteImages: false,
    };
  }
}

async function galeriaDisponible(cliente = prisma) {
  try {
    await cliente.producto.findFirst({ select: { imagenes: true } });
    return true;
  } catch (error) {
    if (esColumnaImagenesAusente(error)) return false;
    throw error;
  }
}

function respuestaError(error, mensaje) {
  if (error?.code === "ASSET_NO_DISPONIBLE") return NextResponse.json({ error: error.message, codigo: error.code }, { status: 409 });
  if (error instanceof DatosInvalidos) return NextResponse.json({ error: error.message }, { status: 400 });
  if (esColumnaImagenesAusente(error)) return NextResponse.json({ error: mensajeGaleriaNoDisponible }, { status: 503 });
  const catalogoError = datosErrorCatalogo(error, mensaje);
  if (error instanceof ErrorCatalogo || catalogoError.status !== 503) return NextResponse.json(catalogoError.body, { status: catalogoError.status });
  console.error(mensaje, error?.code || "ERROR_BD");
  return NextResponse.json({ error: mensaje }, { status: 503 });
}

// La BD es la fuente autoritativa, incluso cuando el catálogo está vacío.
export async function GET() {
  const catalogo = await cargarCatalogo();
  if (catalogo.available === false) {
    return NextResponse.json({ error: "No se pudo consultar el catálogo guardado. Intenta nuevamente.", codigo: "CATALOGO_NO_DISPONIBLE", source: "unavailable", available: false }, { status: 503, headers: { "Cache-Control": "no-store", "X-Catalogo-Fuente": "unavailable", "X-Catalogo-Imagenes-Disponibles": "false" } });
  }
  return NextResponse.json(catalogo.productos, {
    headers: {
      "X-Catalogo-Fuente": catalogo.source,
      "X-Catalogo-Imagenes-Disponibles": String(catalogo.canWriteImages),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  try {
    if (!(await verifyIsAdmin())) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede crear productos." }, { status: 403 });
    }
    const body = await leerBody(request);
    const data = camposProducto(body, true);
    const fotos = camposImagenes(body);
    const nuevoProducto = await transaccionCatalogo(prisma, async (tx) => {
      data.categoria = await exigirCategoria(tx, data.categoria);
      const canWriteImages = await galeriaDisponible(tx);
      if (!canWriteImages && (tieneCampo(body, "imagenes") || tieneCampo(body, "imagen"))) throw new ErrorCatalogo(mensajeGaleriaNoDisponible, 503);
      const producto = await tx.producto.create({
        data: { descripcion: "", stock: 999999, ...data, ...fotos, ...(canWriteImages && !tieneCampo(fotos, "imagenes") ? { imagenes: [] } : {}) },
        ...(!canWriteImages ? { select: productoLegacySelect } : {}),
      });
      await sincronizarAssetsProducto(tx, null, producto);
      return producto;
    });
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    return respuestaError(error, "No se pudo crear el producto en la base de datos.");
  }
}

export async function PUT(request) {
  try {
    if (!(await verifyIsAdmin())) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede modificar productos." }, { status: 403 });
    }
    const body = await leerBody(request);
    const id = validarId(body.id);
    const data = camposProducto(body);
    const productoActualizado = await transaccionCatalogo(prisma, async (tx) => {
      const actual = await obtenerProductoActual(id, tx);
      if (!actual.producto) throw new ErrorCatalogo("El producto no existe o ya fue eliminado.", 404);
      const fotos = camposImagenes(body, actual.producto);
      if (!actual.canWriteImages && (tieneCampo(body, "imagenes") || tieneCampo(body, "imagen"))) throw new ErrorCatalogo(mensajeGaleriaNoDisponible, 503);
      const cambios = { ...data, ...fotos };
      if (!Object.keys(cambios).length) throw new DatosInvalidos("No se enviaron campos del producto para actualizar.");
      const categoriaValida = await exigirCategoria(tx, cambios.categoria ?? actual.producto.categoria);
      if (tieneCampo(cambios, "categoria")) cambios.categoria = categoriaValida;
      const producto = await tx.producto.update({ where: { id }, data: cambios, ...(!actual.canWriteImages ? { select: productoLegacySelect } : {}) });
      await sincronizarAssetsProducto(tx, actual.producto, producto);
      return producto;
    });
    return NextResponse.json(productoActualizado);
  } catch (error) {
    return respuestaError(error, "No se pudo actualizar el producto en la base de datos.");
  }
}

export async function DELETE(request) {
  try {
    if (!(await verifyIsAdmin())) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede eliminar productos." }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = validarId(searchParams.get("id"));
    await transaccionCatalogo(prisma, async (tx) => {
      const actual = await obtenerProductoActual(id, tx);
      if (!actual.producto) throw new ErrorCatalogo("El producto no existe o ya fue eliminado.", 404);
      await tx.producto.delete({ where: { id }, select: { id: true } });
      await sincronizarAssetsProducto(tx, actual.producto, null);
    });
    return NextResponse.json({ ok: true, mensaje: "Producto eliminado correctamente." });
  } catch (error) {
    return respuestaError(error, "No se pudo eliminar el producto en la base de datos.");
  }
}
