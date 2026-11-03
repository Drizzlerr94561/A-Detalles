const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm.cjs');

function objetivo() {
  const listeners = new Map();
  return {
    addEventListener(tipo, fn) { if (!listeners.has(tipo)) listeners.set(tipo, new Set()); listeners.get(tipo).add(fn); },
    removeEventListener(tipo, fn) { listeners.get(tipo)?.delete(fn); },
    emitir(tipo, event = {}) { for (const fn of listeners.get(tipo) || []) fn(event); },
    cantidadListeners() { return [...listeners.values()].reduce((n, conjunto) => n + conjunto.size, 0); },
  };
}

async function entorno({ reducido = false, desbordamiento = true, pausado = false } = {}) {
  const tareas = new Map();
  const observadores = [];
  const media = Object.assign(objetivo(), { matches: reducido });
  const contenedor = Object.assign(objetivo(), { contains: () => false, matches: () => false });
  const pista = Object.assign(objetivo(), { scrollWidth: desbordamiento ? 1000 : 300, clientWidth: 300 });
  const doc = Object.assign(objetivo(), { hidden: false, activeElement: {} });
  const win = Object.assign(objetivo(), {
    matchMedia: (query) => query.includes('reduced-motion') ? media : { matches: true },
    setTimeout(fn, ms) { const id = {}; tareas.set(id, { fn, ms }); return id; },
    clearTimeout(id) { tareas.delete(id); },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.desconectado = false; observadores.push(this); }
      observe() {}
      disconnect() { this.desconectado = true; }
    },
  });
  let avances = 0;
  const preferencias = [];
  const api = await loadEsm('src/lib/carruselAutomatico.js', { globals: { window: win, document: doc } });
  const limpiar = api.iniciarAvanceAutomatico({ contenedor, pista, intervalo: 4200, avanzar: () => avances++, pausado, alCambiarMovimientoReducido: (valor) => preferencias.push(valor) });
  return {
    api, win, doc, media, pista, contenedor, preferencias, observadores, limpiar,
    avances: () => avances,
    pendientes: () => tareas.size,
    intervalo: () => [...tareas.values()][0]?.ms,
    visible(valor = true) { observadores[0].callback([{ isIntersecting: valor, intersectionRatio: valor ? 1 : 0 }]); },
    disparar() { const [id, tarea] = [...tareas.entries()][0]; tareas.delete(id); tarea.fn(); },
  };
}

test('cada categoría, incluida una nueva, recibe un intervalo diferente y determinista', async () => {
  const { intervaloCarrusel } = await loadEsm('src/lib/carruselAutomatico.js');
  const intervalos = Array.from({ length: 100 }, (_, indice) => intervaloCarrusel(indice));
  assert.equal(intervalos[0], 4200);
  assert.equal(intervalos[9], 8250);
  assert.equal(new Set(intervalos).size, 100);
  assert.equal(intervaloCarrusel(2), intervaloCarrusel(2));
});

test('solo avanza cuando el carrusel está visible y tiene productos fuera de pantalla', async () => {
  const e = await entorno();
  assert.equal(e.pendientes(), 0);
  e.visible();
  assert.equal(e.intervalo(), 4200);
  e.disparar();
  assert.equal(e.avances(), 1);
  assert.equal(e.pendientes(), 1);
  e.visible(false);
  assert.equal(e.pendientes(), 0);
  const corto = await entorno({ desbordamiento: false });
  corto.visible();
  assert.equal(corto.pendientes(), 0);
  e.limpiar(); corto.limpiar();
});

test('se detiene al pasar el cursor, tocar o usar el teclado; al terminar reinicia la espera', async () => {
  const e = await entorno();
  e.visible();
  e.contenedor.emitir('pointerenter', { pointerType: 'mouse' });
  assert.equal(e.pendientes(), 0);
  e.contenedor.emitir('pointerleave');
  assert.equal(e.pendientes(), 1);
  e.contenedor.emitir('pointerdown');
  assert.equal(e.pendientes(), 0);
  e.win.emitir('pointerup');
  assert.equal(e.pendientes(), 1);
  e.contenedor.emitir('focusin', { target: { matches: () => true, closest: () => null } });
  assert.equal(e.pendientes(), 0);
  e.contenedor.emitir('focusout');
  assert.equal(e.intervalo(), 4200);
  e.disparar();
  assert.equal(e.avances(), 1);
  e.limpiar();
});

test('no avanza en pestañas ocultas, con una ficha abierta o cuando se pide movimiento reducido', async () => {
  const e = await entorno();
  e.visible();
  e.doc.hidden = true; e.doc.emitir('visibilitychange');
  assert.equal(e.pendientes(), 0);
  e.doc.hidden = false; e.doc.emitir('visibilitychange');
  assert.equal(e.pendientes(), 1);
  e.media.matches = true; e.media.emitir('change');
  assert.equal(e.pendientes(), 0);
  assert.equal(e.preferencias.at(-1), true);
  e.media.matches = false; e.media.emitir('change');
  assert.equal(e.pendientes(), 1);
  const pausa = await entorno({ pausado: true }); pausa.visible();
  assert.equal(pausa.pendientes(), 0);
  const reducido = await entorno({ reducido: true }); reducido.visible();
  assert.equal(reducido.pendientes(), 0);
  e.limpiar(); pausa.limpiar(); reducido.limpiar();
});

test('el desmontaje libera todos los temporizadores, observadores y eventos', async () => {
  const e = await entorno(); e.visible();
  assert.equal(e.pendientes(), 1);
  e.limpiar();
  assert.equal(e.pendientes(), 0);
  for (const objetivo of [e.win,e.doc,e.media,e.pista,e.contenedor]) assert.equal(objetivo.cantidadListeners(), 0);
  assert.equal(e.observadores[0].desconectado, true);
});
