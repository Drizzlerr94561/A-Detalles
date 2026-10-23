const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { loadEsm } = require('./load-esm.cjs');
const source = fs.readFileSync(path.join(__dirname, '../src/components/CatalogoCliente.jsx'), 'utf8');

// Ejecuta los handlers reales para verificar errores HTTP y envío desde el panel.
function handler(name, endMarker, dependencies) {
  const start = source.indexOf(`const ${name} = async`);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1); assert.notEqual(end, -1);
  return new Function(...Object.keys(dependencies), `${source.slice(start, end)}; return ${name};`)(...Object.values(dependencies));
}

async function panel(file, responder) {
  const helper = await loadEsm('src/lib/imagenesSubida.js');
  const state = { error: '', mensaje: '', subiendo: false, fotos: [], solicitudes: 0, cuerpos: 0 };
  const input = { files: [file], value: 'seleccionada' };
  const temporary = new Map();
  const request = handler('peticionJson', '\n  const cargarAdicionalesAdmin', {
    ERROR_IMAGEN_TAMANO: helper.ERROR_IMAGEN_TAMANO,
    fetch: async (...args) => { state.solicitudes++; return responder(...args); },
  });
  class FormDataSimulado {
    constructor() { state.cuerpos++; this.file = null; }
    append(name, value) { assert.equal(name, 'file'); this.file = value; }
  }
  const upload = handler('handleSubirNuevaImagen', '\n  const handleEliminarImagenGaleria', {
    galeriaDisponible: true, bloqueoOperacion: { current: false }, subiendoImagen: false,
    setSubiendoImagen: value => { state.subiendo = value; },
    setErrorNotif: value => { state.error = value; }, setMensajeNotif: value => { state.mensaje = value; },
    validarImagenSubida: helper.validarImagenSubida, FormData: FormDataSimulado,
    peticionJson: request, uploadsTemporales: { current: temporary },
    obtenerListaImagenes: value => value.imagenes || [],
    setFormData: update => { state.fotos = update({ imagenes: state.fotos }).imagenes; },
  });
  await upload({ target: input });
  return { helper, state, input, temporary };
}

test('panel: una foto excesiva no envía petición ni modifica galería', async () => {
  const { MAX_IMAGEN_BYTES } = await loadEsm('src/lib/imagenesSubida.js');
  const file = { type: 'image/jpeg', size: MAX_IMAGEN_BYTES + 1, arrayBuffer() {} };
  const { state, input, temporary } = await panel(file, () => { throw Error('No debe enviar'); });
  assert.match(state.error, /4 MB/); assert.equal(state.solicitudes, 0); assert.equal(state.cuerpos, 0);
  assert.equal(state.subiendo, false); assert.equal(input.value, '');
  assert.equal(state.fotos.length, 0); assert.equal(temporary.size, 0);
});

test('panel: un archivo no compatible se rechaza antes del POST', async () => {
  const { state } = await panel({ type: 'image/svg+xml', size: 1, arrayBuffer() {} }, () => { throw Error('No debe enviar'); });
  assert.match(state.error, /JPG, PNG/); assert.equal(state.solicitudes, 0); assert.equal(state.cuerpos, 0);
});

for (const body of ['<html><body>FUNCTION_PAYLOAD_TOO_LARGE</body></html>', 'Payload Too Large', JSON.stringify({ error: 'Upstream size limit' })]) {
  test(`panel: 413 con ${body.startsWith('<') ? 'HTML' : body.startsWith('{') ? 'JSON' : 'texto'} da explicación de tamaño y conserva el formulario`, async () => {
    const { helper, state, input, temporary } = await panel({ type: 'image/jpeg', size: 1, arrayBuffer() {} }, () => new Response(body, { status: 413 }));
    assert.equal(state.error, helper.ERROR_IMAGEN_TAMANO); assert.equal(state.solicitudes, 1);
    assert.equal(state.subiendo, false); assert.equal(input.value, '');
    assert.equal(state.fotos.length, 0); assert.equal(temporary.size, 0); assert.equal(state.mensaje, '');
  });
}

test('panel: fallo no JSON del servicio mantiene un error legible', async () => {
  const { state } = await panel({ type: 'image/png', size: 1, arrayBuffer() {} }, () => new Response('<html>Unavailable</html>', { status: 503 }));
  assert.match(state.error, /No se pudo completar la operación/); assert.equal(state.fotos.length, 0);
});

test('panel: una foto de 4 MiB se envía original y registra su asset temporal', async () => {
  const { MAX_IMAGEN_BYTES } = await loadEsm('src/lib/imagenesSubida.js');
  const file = { type: 'image/jpeg', size: MAX_IMAGEN_BYTES, arrayBuffer() {} };
  const url = 'https://ejemplo.test/foto.jpg';
  const { state, temporary } = await panel(file, (_url, options) => {
    assert.equal(options.method, 'POST'); assert.equal(options.body.file, file);
    return Response.json({ url, assetId: 'temporal' });
  });
  assert.equal(state.error, ''); assert.deepEqual(state.fotos, [url]); assert.equal(temporary.get(url), 'temporal');
});
