const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { loadEsm } = require('./load-esm.cjs');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/components/CatalogoCliente.jsx'), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

// Run the real async handlers with deferred responses, so the regression covers
// applying or clearing UI state when responses arrive in a different order.
function handler(nombre, final, dependencies, archivo = source) {
  const start = archivo.indexOf(`const ${nombre} = async`);
  assert.notEqual(start, -1);
  const end = archivo.indexOf(final, start);
  assert.notEqual(end, -1);
  return new Function(...Object.keys(dependencies), `${archivo.slice(start, end)}; return ${nombre};`)(...Object.values(dependencies));
}

async function setup() {
  const helper = await loadEsm('src/lib/catalogoAdminEstado.js');
  const peticiones = [];
  const state = { productos: [{ id: 7 }], categorias: [{ id: 1, nombre: 'Flores' }], orden: ['Flores'], adicionales: [{ id: 3 }], fuente: 'bd' };
  const encolar = () => { const pending = deferred(); peticiones.push(pending); return pending.promise; };
  const deps = {
    solicitudesCatalogo: { current: helper.crearControlSolicitudesCatalogo() },
    fetch: encolar,
    peticionJson: encolar,
    setProductosState: value => { state.productos = clone(value); },
    setFuenteCatalogo: value => { state.fuente = value; },
    setGaleriaDisponible() {}, setIsModalOpen() {},
    setCategoriasDB: value => { state.categorias = clone(value); },
    setOrdenCategorias: value => { state.orden = clone(value); },
    setAdicionalesAdminList: value => { state.adicionales = clone(value); },
    bloqueoOperacion: { current: false }, setOperacionEnCurso() {}, setMensajeNotif() {}, setErrorNotif() {},
  };
  return {
    state, peticiones, deps,
    productos: handler('cargarProductosServidor', '\n  const [categoriasDB', deps),
    categorias: handler('cargarCategorias', '\n  // Estado del orden', deps),
    adicionales: handler('cargarAdicionalesAdmin', '\n  const refrescarTrasCambio', deps),
    mutar: handler('procesarCambio', '\n  const solicitarLimpiezaTemporal', deps),
  };
}

const response = data => ({ ok: true, json: async () => data, headers: { get: () => null } });

for (const clave of ['productos', 'categorias', 'adicionales']) {
  test(`${clave}: la respuesta antigua no repone un registro eliminado`, async () => {
    const fixture = await setup();
    const anterior = fixture[clave]();
    const reciente = fixture[clave]();
    const nuevaLista = [{ id: 22, nombre: 'Vigente' }];
    fixture.peticiones[1].resolve(clave === 'adicionales' ? nuevaLista : response(nuevaLista));
    await reciente;
    fixture.peticiones[0].resolve(clave === 'adicionales' ? [{ id: 7, nombre: 'Eliminado' }] : response([{ id: 7, nombre: 'Eliminado' }]));
    await anterior;
    assert.deepEqual(fixture.state[clave], nuevaLista);
  });

  test(`${clave}: un fallo antiguo no vacía ni invalida la lista vigente`, async () => {
    const fixture = await setup();
    const anterior = fixture[clave]();
    const reciente = fixture[clave]();
    const nuevaLista = [{ id: 22, nombre: 'Vigente' }];
    fixture.peticiones[1].resolve(clave === 'adicionales' ? nuevaLista : response(nuevaLista));
    await reciente;
    fixture.peticiones[0].reject(new Error('Consulta vieja fallida'));
    await assert.doesNotReject(anterior);
    assert.deepEqual(fixture.state[clave], nuevaLista);
    assert.equal(fixture.state.fuente, 'bd');
  });
}

test('guardar orden invalida también el GET previo aunque no haya otro GET posterior', async () => {
  const fixture = await setup();
  const lectura = fixture.categorias();
  await fixture.mutar('orden', async () => { fixture.state.orden = ['Nuevo orden']; });
  fixture.peticiones[0].resolve(response([{ id: 1, nombre: 'Orden anterior' }]));
  await lectura;
  assert.deepEqual(fixture.state.orden, ['Nuevo orden']);
});

test('las lecturas de productos, categorías y adicionales pueden actualizarse juntas', async () => {
  const fixture = await setup();
  const promesas = [fixture.productos(), fixture.categorias(), fixture.adicionales()];
  fixture.peticiones[0].resolve(response([{ id: 71 }]));
  fixture.peticiones[1].resolve(response([{ id: 11, nombre: 'Vigente' }]));
  fixture.peticiones[2].resolve([{ id: 31 }]);
  await Promise.all(promesas);
  assert.deepEqual(fixture.state.productos, [{ id: 71 }]);
  assert.deepEqual(fixture.state.categorias, [{ id: 11, nombre: 'Vigente' }]);
  assert.deepEqual(fixture.state.adicionales, [{ id: 31 }]);
});

test('el fallo de la consulta vigente conserva el estado de indisponibilidad', async () => {
  const fixture = await setup();
  const lectura = fixture.productos();
  fixture.peticiones[0].reject(new Error('Consulta vigente fallida'));
  await assert.rejects(lectura, /vigente fallida/);
  assert.deepEqual(fixture.state.productos, []);
  assert.equal(fixture.state.fuente, 'unavailable');
});

test('confirmar un pedido conserva regalos y unidades agregados mientras se guardaba', async () => {
  const { retirarItemsConfirmados } = await loadEsm('src/lib/carrito.js');
  const actual = [
    { id: 'enviado', cantidad: 4, mensajeTarjeta: 'Se conserva' },
    { id: 'nuevo', cantidad: 1, mensajeTarjeta: 'Nuevo regalo' },
    { id: 'otro-enviado', cantidad: 1 },
  ];
  const restante = retirarItemsConfirmados(actual, [{ id: 'enviado', cantidad: 2 }, { id: 'otro-enviado', cantidad: 1 }]);
  assert.deepEqual(clone(restante), [
    { id: 'enviado', cantidad: 2, mensajeTarjeta: 'Se conserva' },
    { id: 'nuevo', cantidad: 1, mensajeTarjeta: 'Nuevo regalo' },
  ]);
  assert.equal(actual[0].cantidad, 4);
});

test('una respuesta de pedido confirmada no borra configuraciones nuevas de precio y opciones iguales', async () => {
  const { retirarItemsConfirmados } = await loadEsm('src/lib/carrito.js');
  const actual = [{ id: 'nueva-configuracion', productoId: 7, precio: 45000, cantidad: 1 }];
  assert.deepEqual(clone(retirarItemsConfirmados(actual, [{ id: 'configuracion-enviada', productoId: 7, precio: 45000, cantidad: 1 }])), actual);
});

test('el envío real del drawer retira solo la cotización enviada al recibir éxito tardío', async () => {
  const { retirarItemsConfirmados } = await loadEsm('src/lib/carrito.js');
  const drawer = fs.readFileSync(path.join(root, 'src/components/CarritoDrawer.jsx'), 'utf8');
  const pendiente = deferred();
  const cotizado = [{ id: 'enviado', productoId: 7, precio: 45000, cantidad: 1 }];
  let cart = clone(cotizado);
  const state = { paso: 4, error: '', payload: null };
  const enviar = handler('handleFinalizarPedido', '\n  // Si el usuario agrega', {
    cargando: false, validandoCarrito: false,
    setErrorMsg: value => { state.error = value; },
    setCargando() {},
    validarCarrito: async () => ({ ok: true, items: cotizado }),
    formData: { compradorNombre: 'Cliente Prueba', compradorTelefono: '3000000000', metodoPago: 'Nequi', direccion: 'Calle de prueba', barrio: 'Barrio', destinatario: 'Prueba', telefonoDestinatario: '', fechaEntrega: '', franjaHoraria: '' },
    formatPhoneCO: value => value,
    fetch: (url, options) => { state.payload = JSON.parse(options.body); return pendiente.promise; },
    setPedidoExitoso() {}, setUltimoPedido() {}, registrarConflictos() {},
    setPaso: value => { state.paso = value; },
    retirarProductosConfirmados: items => { cart = retirarItemsConfirmados(cart, items); },
    vaciarCarrito: () => { throw new Error('No debe vaciar el carrito actual'); },
  }, drawer);
  const guardando = enviar();
  await new Promise(setImmediate);
  cart = [{ ...cart[0], cantidad: 3 }, { id: 'nuevo', productoId: 8, precio: 50000, cantidad: 1 }];
  pendiente.resolve({ ok: true, json: async () => ({ ok: true, codigo: 'AD-PRUEBA' }) });
  await guardando;
  assert.deepEqual(state.payload.items, cotizado);
  assert.deepEqual(clone(cart), [{ ...cotizado[0], cantidad: 2 }, { id: 'nuevo', productoId: 8, precio: 50000, cantidad: 1 }]);
  assert.equal(state.paso, 5);
  assert.equal(state.error, '');
});
