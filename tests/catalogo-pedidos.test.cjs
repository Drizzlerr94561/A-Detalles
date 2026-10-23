const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const { loadEsm } = require('./load-esm.cjs');
const projectRoot = path.resolve(__dirname, '..');
const clone = (value) => JSON.parse(JSON.stringify(value));
const version = '2026-10-01T00:00:00.000Z';
const product = (values = {}) => ({ id: 7, nombre: 'Álbum de fotos', descripcion: '', categoria: 'Cuadros', precio: 45000, imagen: '/album.jpg', updatedAt: version, ...values });
const addon = (values = {}) => ({ id: 3, nombre: 'Rosa roja', precio: 6000, disponible: true, updatedAt: version, ...values });
const item = (values = {}) => ({ id: 'config-7', productoId: 7, nombre: 'Álbum de fotos', precio: 86000, cantidad: 2, opcionAlbumFotos: '30 fotos', mensajeTarjeta: 'Para ti', versionProducto: version, adicionalesSeleccionados: [{ id: 3, nombre: 'Rosa roja', precio: 6000, version }], ...values });
const request = (body) => ({ json: async () => body });
const failure = (code) => Object.assign(new Error('Synthetic database failure'), { code });

async function setup(options = {}) {
  const calls = { productos: [], adicionales: [], escrituras: [], transacciones: [], admin: [], historico: [] };
  let stored = [];
  const productos = options.productos ?? [product()];
  const adicionales = options.adicionales ?? [addon()];
  const tx = {
    producto: { findMany: async (args) => { calls.productos.push(clone(args)); if (options.readFailure) throw options.readFailure; return productos.filter((p) => args.where.id.in.includes(p.id)); } },
    adicional: { findMany: async (args) => { calls.adicionales.push(clone(args)); return adicionales.filter((ad) => args.where.id.in.includes(ad.id)); } },
    pedido: { create: async ({ data }) => { if (options.createFailure) throw options.createFailure; calls.escrituras.push(clone(data)); return { id: 99, ...data }; } },
  };
  const db = {
    ...tx,
    pedido: {
      ...tx.pedido,
      update: async (args) => { calls.admin.push({ metodo: 'update', args }); if (options.updateFailure) throw options.updateFailure; return { id: args.where.id, ...args.data }; },
      findUnique: async (args) => { calls.admin.push({ metodo: 'findUnique', args }); return options.missingOrder ? null : { id: args.where.id, codigo: 'SYNTHETIC' }; },
      delete: async (args) => { calls.admin.push({ metodo: 'delete', args }); if (options.deleteFailure) throw options.deleteFailure; return { id: args.where.id }; },
      findMany: async (args) => { calls.historico.push(args); return options.historico || []; },
    },
    $transaction: async (callback, config) => {
      calls.transacciones.push(config);
      const result = await callback(tx);
      stored = calls.escrituras.map(clone);
      return result;
    },
    $executeRawUnsafe: () => { throw new Error('Forbidden: runtime schema or raw SQL write'); },
  };
  const mocks = {
    'next/server': { NextResponse: { json: (body, init = {}) => new Response(JSON.stringify(body), { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } }) } },
    '@/lib/prisma': { default: db },
    '@/lib/auth': { verifyIsAdmin: async () => options.admin === false ? null : { id: 1, role: 'ADMIN' }, getAuthenticatedUser: async () => options.usuario || null },
  };
  const globals = { process: { env: {} } };
  const api = await loadEsm('src/app/api/pedidos/route.js', { projectRoot, mocks, globals });
  const quote = await loadEsm('src/app/api/carrito/validar/route.js', { projectRoot, mocks, globals });
  return { api, quote, calls, stored: () => stored };
}

test('pedido: servidor calcula álbum, extras, cantidades y envío; ignora totales manipulados', async () => {
  const { api, calls, stored } = await setup();
  const response = await api.POST(request({ items: [item()], direccionEntrega: 'Calle de prueba', subtotal: 1, costoEnvio: -500, total: 1 }));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.subtotal, 172000);
  assert.equal(result.costoEnvio, 15000);
  assert.equal(result.total, 187000);
  assert.equal(result.pedido.total, 187000);
  assert.match(result.whatsappText, /187\.000/);
  assert.equal(stored()[0].items[0].productoId, 7);
  assert.deepEqual(stored()[0].items[0].adicionalesSeleccionados.map((ad) => ad.id), [3]);
  assert.equal(stored()[0].items[0].mensajeTarjeta, 'Para ti');
  assert.equal(calls.transacciones[0].isolationLevel, 'Serializable');
});

test('precio cambiado: 409 conserva personalización y ofrece actualización para aceptar', async () => {
  const { api, stored } = await setup({ productos: [product({ precio: 50000 })] });
  const response = await api.POST(request({ items: [item()], direccionEntrega: 'Calle' }));
  assert.equal(response.status, 409);
  const result = await response.json();
  assert.equal(result.codigo, 'CARRITO_DESACTUALIZADO');
  assert.equal(result.conflictos[0].actualizado.precio, 91000);
  assert.equal(result.conflictos[0].actualizado.mensajeTarjeta, 'Para ti');
  assert.equal(result.conflictos[0].actualizado.opcionAlbumFotos, '30 fotos');
  assert.equal(stored().length, 0);
});

test('producto retirado: 409 sin crear pedido ni eliminar sus opciones', async () => {
  const { api, stored } = await setup({ productos: [] });
  const response = await api.POST(request({ items: [item()], direccionEntrega: 'Calle' }));
  assert.equal(response.status, 409);
  const result = await response.json();
  assert.equal(result.conflictos[0].tipo, 'PRODUCTO_RETIRADO');
  assert.equal(result.conflictos[0].actualizado, undefined);
  assert.equal(stored().length, 0);
});

for (const [name, adicionales] of [['eliminado', []], ['no disponible', [addon({ disponible: false })]]]) {
  test(`adicional ${name}: 409 y no se crea pedido con sustitución silenciosa`, async () => {
    const { api, stored } = await setup({ adicionales });
    const response = await api.POST(request({ items: [item()], direccionEntrega: 'Calle' }));
    assert.equal(response.status, 409);
    const result = await response.json();
    assert.equal(result.conflictos[0].tipo, 'ADICIONAL_RETIRADO');
    assert.equal(result.conflictos[0].actualizado, undefined);
    assert.equal(stored().length, 0);
  });
}

for (const [name, change] of [
  ['ID de producto malformado', { productoId: '7abc' }],
  ['cantidad cero', { cantidad: 0 }], ['cantidad fraccionaria', { cantidad: 1.5 }],
  ['cantidad excesiva', { cantidad: 100 }], ['extra duplicado', { adicionalesSeleccionados: [{ id: 3 }, { id: 3 }] }],
  ['álbum inválido', { opcionAlbumFotos: '100 fotos' }],
  ['precio cliente manipulado', { precio: 0 }],
  ['carrito anterior sin productoId', { productoId: undefined }],
  ['extras antiguos solo por nombre', { adicionalesSeleccionados: undefined, adicionales: ['Rosa roja'] }],
  ['extras antiguos incompatibles con IDs', { adicionalesSeleccionados: [], adicionales: ['Extra guardado'] }],
]) {
  test(`carrito inválido (${name}): conflicto sin escrituras`, async () => {
    const { api, stored } = await setup();
    const response = await api.POST(request({ items: [item(change)], direccionEntrega: 'Calle' }));
    assert.equal(response.status, 409);
    assert.equal(stored().length, 0);
  });
}

test('cotización: consultas batch deduplicadas y ninguna escritura', async () => {
  const { quote, calls, stored } = await setup();
  const response = await quote.POST(request({ items: [item(), item({ id: 'otra-configuracion' })] }));
  assert.equal(response.status, 200);
  assert.equal(calls.productos.length, 1);
  assert.equal(calls.adicionales.length, 1);
  assert.deepEqual(calls.productos[0].where.id.in, [7]);
  assert.deepEqual(calls.adicionales[0].where.id.in, [3]);
  assert.equal(calls.transacciones.length, 0);
  assert.equal(stored().length, 0);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('configuraciones repetidas no crean líneas ambiguas en pedidos', async () => {
  const { quote, stored } = await setup();
  const response = await quote.POST(request({ items: [item(), item()] }));
  assert.equal(response.status, 409);
  assert.equal(stored().length, 0);
});

test('extra renombrado y producto editado requieren aceptación y preservan IDs y texto', async () => {
  const { quote } = await setup({ adicionales: [addon({ nombre: 'Rosa nueva' })], productos: [product({ updatedAt: '2026-10-02T00:00:00.000Z' })] });
  const response = await quote.POST(request({ items: [item()] }));
  assert.equal(response.status, 409);
  const actualizado = (await response.json()).conflictos[0].actualizado;
  assert.equal(actualizado.adicionalesSeleccionados[0].id, 3);
  assert.equal(actualizado.adicionalesSeleccionados[0].nombre, 'Rosa nueva');
  assert.equal(actualizado.mensajeTarjeta, 'Para ti');
});

test('fallo al leer catálogo: 503 y carrito/pedido no se confirma', async () => {
  const { api, quote, stored } = await setup({ readFailure: failure('P1001') });
  assert.equal((await quote.POST(request({ items: [item()] }))).status, 503);
  assert.equal((await api.POST(request({ items: [item()], direccionEntrega: 'Calle' }))).status, 503);
  assert.equal(stored().length, 0);
});

test('fallo al insertar: no ALTER ni inserción RAW; error503 sin éxito', async () => {
  const { api, stored, calls } = await setup({ createFailure: failure('P2022') });
  const response = await api.POST(request({ items: [item()], direccionEntrega: 'Calle' }));
  assert.equal(response.status, 503);
  assert.equal(stored().length, 0);
  assert.equal(calls.transacciones.length, 1);
});

for (const code of ['P2002', 'P2034']) {
  test(`conflicto transaccional ${code}: reintentos acotados, sin SQL alternativo`, async () => {
    const { api, calls, stored } = await setup({ createFailure: failure(code) });
    const response = await api.POST(request({ items: [item()], direccionEntrega: 'Calle' }));
    assert.equal(response.status, 503);
    assert.equal(calls.transacciones.length, 3);
    assert.equal(stored().length, 0);
  });
}

test('JSON inválido y carrito vacío responden400 sin acceder al catálogo', async () => {
  const { api, quote, calls } = await setup();
  const invalid = { json: async () => { throw new Error('Invalid JSON'); } };
  assert.equal((await api.POST(invalid)).status, 400);
  assert.equal((await quote.POST(invalid)).status, 400);
  assert.equal((await quote.POST(request({ items: [] }))).status, 400);
  assert.equal(calls.productos.length, 0);
});

for (const [code, expected] of [['P2025', 404], ['P1001', 503]]) {
  test(`PATCH fallido (${code}): ${expected}, nunca éxito ficticio`, async () => {
    const { api } = await setup({ updateFailure: failure(code) });
    const response = await api.PATCH(request({ id: 1, estado: 'VENDIDO' }));
    assert.equal(response.status, expected);
    assert.equal((await response.json()).success, undefined);
  });
}

test('DELETE/PATCH: IDs malformados no consultan ni cambian otro pedido', async () => {
  const { api, calls } = await setup();
  for (const id of ['1abc', '2.9', '3e4', '-1', '0', '2147483648']) {
    assert.equal((await api.DELETE({ url: `https://test.invalid/api/pedidos?id=${id}` })).status, 400);
    assert.equal((await api.PATCH(request({ id, estado: 'VENDIDO' }))).status, 400);
  }
  assert.equal(calls.admin.length, 0);
});

test('operaciones admin: autorización, inexistente y estado inválido', async () => {
  const denied = await setup({ admin: false });
  assert.equal((await denied.api.DELETE({ url: 'https://test.invalid/api/pedidos?id=1' })).status, 403);
  assert.equal((await denied.api.PATCH(request({ id: 1, estado: 'VENDIDO' }))).status, 403);
  assert.equal(denied.calls.admin.length, 0);
  const missing = await setup({ missingOrder: true });
  assert.equal((await missing.api.DELETE({ url: 'https://test.invalid/api/pedidos?id=1' })).status, 404);
  assert.equal((await missing.api.PATCH(request({ id: 1, estado: 'desconocido' }))).status, 400);
});

test('GET mantiene instantáneas históricas aun con catálogo vacío', async () => {
  const historico = [{ id: 55, items: [{ id: 'viejo', nombre: 'Producto retirado', precio: 123, adicionales: ['Extra retirado'] }], total: 123 }];
  const { api, calls } = await setup({ productos: [], adicionales: [], historico, usuario: { id: 1 } });
  const response = await api.GET();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).pedidos[0].items, historico[0].items);
  assert.equal(calls.productos.length, 0);
  assert.equal(calls.adicionales.length, 0);
});

test('reglas compartidas: mantiene precios legítimos de álbum, rosas, cuadro, Spotify, termo y peluche', async () => {
  const helper = await loadEsm('src/lib/pedidosValidacion.js', { projectRoot });
  for (const [opcion, extra] of [['15 fotos', 0], ['20 fotos', 8000], ['30 fotos', 35000]]) {
    assert.equal(helper.calcularPrecioConfigurado(product(), { opcionAlbumFotos: opcion }, [addon()]), 51000 + extra);
  }
  for (const [producto, config] of [
    [product({ nombre: 'Ramo', descripcion: 'Color a elección del cliente' }), { colorRosas: 'Combinadas' }],
    [product({ nombre: 'Cuadro 1 foto y frase' }), { numFotosCuadro: 12, nombreTermoMug: 'Nuestra frase' }],
    [product({ nombre: 'Cuadro Spotify' }), { colorFondoSpotify: 'Fondo Blanco' }],
    [product({ nombre: 'Termo personalizado' }), { nombreTermoMug: 'Sofía' }],
    [product({ nombre: 'Peluche', descripcion: 'Tamaño 70-80cm' }), { tamanoPelucheCombo: '80 cm' }],
  ]) {
    const chosen = item({ nombre: producto.nombre, precio: 51000, opcionAlbumFotos: undefined, ...config });
    const { quote } = await setup({ productos: [producto] });
    const response = await quote.POST(request({ items: [chosen] }));
    assert.equal(response.status, 200, producto.nombre);
    const actual = (await response.json()).items[0];
    for (const [campo, valor] of Object.entries(config)) assert.equal(actual[campo], valor);
    assert.equal(actual.precio, 51000);
  }
});

test('restauración legacy conserva opciones y exige revisión sin inferir IDs de texto', async () => {
  const { restaurarCarritoGuardado, aplicarConflictosCarrito, aceptarCambioCarrito } = await loadEsm('src/lib/carrito.js', { projectRoot });
  const original = { id: '7_Rosas Rojas_antes', nombre: 'Álbum', cantidad: 1, precio: 100, colorRosas: 'Rojas', adicionales: ['Extra antiguo'], mensajeTarjeta: 'Texto importante' };
  const restaurado = restaurarCarritoGuardado([original]);
  assert.equal(restaurado[0].productoId, undefined);
  assert.equal(restaurado[0].colorRosas, original.colorRosas);
  assert.equal(restaurado[0].mensajeTarjeta, original.mensajeTarjeta);
  assert.deepEqual(clone(restaurado[0].adicionales), original.adicionales);
  assert.equal(restaurado[0].revisionCarrito.tipo, 'RECONFIGURAR');
  const actualizado = { ...original, productoId: 7, precio: 200, adicionalesSeleccionados: [] };
  const conflicto = aplicarConflictosCarrito(restaurado, [{ itemId: original.id, tipo: 'PRODUCTO_CAMBIADO', actualizado }]);
  assert.equal(conflicto[0].precio, 100, 'El precio no cambia hasta aceptar');
  assert.equal(aceptarCambioCarrito(conflicto, original.id)[0].precio, 200);
  const cantidadModificada = [{ ...conflicto[0], cantidad: 3 }];
  assert.equal(aceptarCambioCarrito(cantidadModificada, original.id)[0].cantidad, 3, 'Aceptar precio no revierte la cantidad recién elegida');
  assert.equal(aplicarConflictosCarrito(conflicto, [])[0].revisionCarrito, undefined, 'Una revisión resuelta deja de mostrarse');
  assert.throws(() => restaurarCarritoGuardado({ corrupto: true }));
});
