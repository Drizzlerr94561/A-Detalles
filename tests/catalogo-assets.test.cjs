const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const crypto = require('node:crypto');
const { loadEsm } = require('./load-esm.cjs');
const projectRoot = path.resolve(__dirname, '..');
const CLOUD = 'test-cloud';
const ID = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';
const NOW = new Date('2026-10-22T12:00:00Z');
const publicId = `adetallesbq/productos/managed_${ID}`;
const url = `https://res.cloudinary.com/${CLOUD}/image/upload/v123/${publicId}.jpg`;
const plain = (value) => JSON.parse(JSON.stringify(value));
const asset = (overrides = {}) => ({ id: ID, publicId, url, estado: 'PENDIENTE', eliminarDesde: new Date(NOW.getTime() - 1000), intentos: 0, ultimoError: null, ...overrides });

async function helper(official = [], globals = {}) {
  return loadEsm('src/lib/assetsCatalogo.js', { projectRoot,
    globals: { process: { env: { CLOUDINARY_CLOUD_NAME: CLOUD } }, Date, setTimeout, clearTimeout, ...globals },
    mocks: { './catalogoOficial.js': { catalogoOficial: official } },
  });
}

function database({ assets = [asset()], productos = [], pedidos = [], falloLectura = false } = {}) {
  const state = { assets: structuredClone(assets), productos, pedidos };
  const calls = { writes: 0, destroys: [], uploads: [] };
  let mutex = Promise.resolve();
  const match = (a, where) => (!where.id || (where.id.in ? where.id.in.includes(a.id) : a.id === where.id)) &&
    (!where.estado || (where.estado.in ? where.estado.in.includes(a.estado) : a.estado === where.estado)) &&
    (!where.eliminarDesde || (where.eliminarDesde.lte ? a.eliminarDesde && a.eliminarDesde <= where.eliminarDesde.lte : a.eliminarDesde?.getTime() === where.eliminarDesde.getTime()));
  const change = (a, data) => { calls.writes++; for (const [k,v] of Object.entries(data)) a[k] = v && typeof v === 'object' && 'increment' in v ? a[k] + v.increment : v; return structuredClone(a); };
  const db = {
    assetCatalogo: {
      findMany: async ({where,take}) => structuredClone(state.assets.filter(a => match(a,where)).slice(0,take)),
      findUnique: async ({where}) => structuredClone(state.assets.find(a => a.id === where.id) || null),
      update: async ({where,data}) => change(state.assets.find(a => a.id === where.id), data),
      updateMany: async ({where,data}) => { const found=state.assets.filter(a=>match(a,where)); found.forEach(a=>change(a,data)); return {count:found.length}; },
      create: async ({data}) => { calls.writes++; const a = {url:null,intentos:0,...data}; state.assets.push(a);return structuredClone(a); },
    },
    producto: { findMany: async () => { if(falloLectura) throw new Error('BD sin lectura');return state.productos; } },
    pedido: { findMany: async () => state.pedidos },
    async $transaction(callback, options) {
      assert.equal(options.isolationLevel,'Serializable');
      let release;
      const before = mutex;
      mutex = new Promise(resolve=>{release=resolve});
      await before;
      try { return await callback(db); } finally { release(); }
    },
  };
  const provider = { uploader: {
    destroy: async (...args) => { calls.destroys.push(args); return {result:'ok'}; },
    upload: async (...args) => { calls.uploads.push(args);return {public_id:publicId,secure_url:url}; },
  } };
  return { db, state, calls, provider };
}

const run = async (h, d, overrides={}) => h.procesarLimpiezaAssets({cliente:d.db,proveedor:d.provider,cloudName:CLOUD,ahora:NOW,aplicar:true,...overrides});

test('assets: un huérfano registrado se elimina y conserva auditoría persistente', async()=>{
  const h=await helper(),d=database();const result=await run(h,d);
  assert.equal(result.eliminados,1);assert.equal(d.state.assets[0].estado,'ELIMINADO');
  assert.equal(d.state.assets[0].intentos,1);assert.equal(d.calls.destroys[0][0],publicId);
  assert.deepEqual(plain(d.calls.destroys[0][1]),{resource_type:'image',type:'upload',invalidate:true,timeout:10000});
});

for (const [name,refs] of [
  ['producto compartido',{productos:[{imagenes:[url]}]}],
  ['snapshot de pedido',{pedidos:[{items:[{imagen:url}]}]}],
  ['snapshot serializado',{pedidos:[{items:JSON.stringify([{imagen:url}])}]}],
]) test(`assets: protege ${name} y cancela la limpieza`,async()=>{
  const h=await helper(),d=database(refs);const r=await run(h,d);
  assert.equal(r.protegidos,1);assert.equal(d.calls.destroys.length,0);assert.equal(d.state.assets[0].estado,'VINCULADO');
});

test('assets: protege referencia oficial y URL transformada', async()=>{
  const h=await helper([{imagen:url.replace('/v123/','/f_auto,w_600/v123/')}]),d=database();
  assert.equal((await run(h,d)).protegidos,1);assert.equal(d.calls.destroys.length,0);
});

test('assets: --check no modifica registros ni llama al proveedor',async()=>{
  const h=await helper(),d=database();const before=plain(d.state);
  assert.equal((await run(h,d,{aplicar:false})).pendientes,1);
  assert.deepEqual(plain(d.state),before);assert.equal(d.calls.writes,0);assert.equal(d.calls.destroys.length,0);
});

for(const [name,record] of [
  ['URL externa',asset({url:'https://example.com/imagen.jpg'})],
  ['otro cloud',asset({url:url.replace('/test-cloud/','/foreign-cloud/')})],
  ['public_id ajeno',asset({publicId:'adetallesbq/banners/portada'})],
  ['id de registro falsificado',asset({id:ID2})],
])test(`assets: no destruye ${name}`,async()=>{
  const h=await helper(),d=database({assets:[record]});const r=await run(h,d);
  assert.equal(r.bloqueados,1);assert.equal(d.calls.destroys.length,0);assert.equal(d.state.assets[0].estado,'BLOQUEADO');
});

test('assets: error leyendo referencias no permite destrucción',async()=>{
  const h=await helper(),d=database({falloLectura:true});const r=await run(h,d);
  assert.equal(r.errores,1);assert.equal(d.calls.destroys.length,0);assert.equal(d.state.assets[0].estado,'PENDIENTE');
});

test('assets: reintento tras fallo proveedor vuelve a comprobar nuevas referencias',async()=>{
  const h=await helper(),d=database();d.provider.uploader.destroy=async()=>{d.calls.destroys.push(publicId);throw new Error('offline')};
  assert.equal((await run(h,d)).errores,1);assert.equal(d.state.assets[0].estado,'REINTENTO');
  assert.ok(d.state.assets[0].eliminarDesde>NOW);
  assert.equal((await run(h,d)).revisados,0);
  d.state.productos.push({imagen:url});
  assert.equal((await run(h,d,{ahora:new Date(NOW.getTime()+120000)})).protegidos,1);
  assert.equal(d.calls.destroys.length,1);
});

test('assets: dos workers concurrentes no destruyen dos veces la misma imagen',async()=>{
  const h=await helper(),d=database();
  await Promise.all([run(h,d),run(h,d)]);assert.equal(d.calls.destroys.length,1);
});

test('assets: cada imagen adquiere una lease nueva desde su hora real, después de comprobar referencias',async()=>{
  const h=await helper();let elapsed=0;
  const publicId2=`adetallesbq/productos/managed_${ID2}`;
  const d=database({assets:[asset(),asset({id:ID2,publicId:publicId2,url:url.replace(publicId,publicId2)})]});
  const leases=[];
  d.provider.uploader.destroy=async(id)=>{
    const record=d.state.assets.find(a=>a.publicId===id);
    leases.push(record.eliminarDesde.getTime());
    assert.equal(record.eliminarDesde.getTime()-(NOW.getTime()+elapsed),h.LEASE_ASSET_MS);
    elapsed+=5000;
    return {result:'ok'};
  };
  const r=await run(h,d,{ahora:()=>new Date(NOW.getTime()+elapsed)});
  assert.equal(r.eliminados,2);
  assert.equal(leases[1]-leases[0],5000);
});

test('assets: agotar el presupuesto deja los no iniciados intactos y permite continuar en otra ejecución',async()=>{
  const h=await helper();let elapsed=0;
  const assets=[1,2,3,4].map(n=>{
    const id=String(n).repeat(8)+'-'+String(n).repeat(4)+'-4'+String(n).repeat(3)+'-8'+String(n).repeat(3)+'-'+String(n).repeat(12);
    const pid=`adetallesbq/productos/managed_${id}`;
    return asset({id,publicId:pid,url:url.replace(publicId,pid)});
  });
  const d=database({assets});
  d.provider.uploader.destroy=async(...args)=>{d.calls.destroys.push(args);elapsed+=10000;return {result:'ok'};};
  const reloj=()=>new Date(NOW.getTime()+elapsed);
  const r=await run(h,d,{ahora:reloj,presupuestoMs:45000});
  assert.equal(r.eliminados,3);assert.equal(r.pendientes,1);assert.equal(r.diferidosPorTiempo,1);
  assert.deepEqual(plain(d.state.assets[3]),plain(assets[3]));
  assert.equal(d.calls.destroys.length,3);
  assert.equal((await run(h,d,{ahora:reloj,presupuestoMs:45000})).eliminados,1);
  assert.equal(d.calls.destroys.length,4);
});

test('assets: una lectura lenta no adquiere lease ni inicia borrado sin margen para terminar',async()=>{
  const h=await helper(),d=database();let elapsed=0;
  d.db.producto.findMany=async()=>{elapsed+=35000;return [];};
  const r=await run(h,d,{ahora:()=>new Date(NOW.getTime()+elapsed)});
  assert.equal(r.diferidosPorTiempo,1);assert.equal(r.pendientes,1);
  assert.equal(d.state.assets[0].estado,'PENDIENTE');assert.equal(d.calls.writes,0);assert.equal(d.calls.destroys.length,0);
});

test('assets: timeout absoluto registra reintento desde la hora del fallo y limpia el temporizador',async()=>{
  let elapsed=0,temporizadoresCancelados=0;
  const h=await helper([],{
    setTimeout:(callback,ms)=>{queueMicrotask(()=>{elapsed+=ms;callback();});return 1;},
    clearTimeout:()=>{temporizadoresCancelados++;},
  });
  const d=database();
  d.provider.uploader.destroy=(...args)=>{d.calls.destroys.push(args);return new Promise(()=>{});};
  const r=await run(h,d,{ahora:()=>new Date(NOW.getTime()+elapsed)});
  assert.equal(r.errores,1);assert.equal(d.calls.destroys[0][1].timeout,10000);assert.equal(temporizadoresCancelados,1);
  assert.equal(d.state.assets[0].estado,'REINTENTO');
  assert.equal(d.state.assets[0].eliminarDesde.getTime(),NOW.getTime()+10000+60000);
  await assert.rejects(h.sincronizarAssetsProducto(d.db,null,{imagen:url}),{code:'ASSET_NO_DISPONIBLE'});
});

test('assets: si la búsqueda consume el presupuesto, no se toca ningún candidato',async()=>{
  const h=await helper(),d=database();let elapsed=0;
  const buscar=d.db.assetCatalogo.findMany;
  d.db.assetCatalogo.findMany=async(args)=>{const encontrados=await buscar(args);elapsed=45000;return encontrados;};
  const r=await run(h,d,{ahora:()=>new Date(NOW.getTime()+elapsed)});
  assert.equal(r.diferidosPorTiempo,1);assert.equal(r.pendientes,1);assert.equal(d.calls.writes,0);assert.equal(d.calls.destroys.length,0);
});

test('assets: una reserva sin URL recupera subida abandonada o commit fallido',async()=>{
  const h=await helper(),d=database({assets:[asset({url:null,estado:'SUBIENDO'})]});
  assert.equal((await run(h,d)).eliminados,1);assert.equal(d.calls.destroys[0][0],publicId);
});

test('assets: guardar y quitar una galería registra uso y espera 24 horas, sin destroy',async()=>{
  const h=await helper(),d=database({assets:[asset({estado:'TEMPORAL'})]});
  await h.sincronizarAssetsProducto(d.db,null,{imagenes:[url]},{ahora:NOW});
  assert.equal(d.state.assets[0].estado,'VINCULADO');
  await h.sincronizarAssetsProducto(d.db,{imagenes:[url]},null,{ahora:NOW});
  assert.equal(d.state.assets[0].estado,'PENDIENTE');
  assert.equal(d.state.assets[0].eliminarDesde.getTime()-NOW.getTime(),24*60*60*1000);
  assert.equal(d.calls.destroys.length,0);
});

test('assets: no permite guardar una imagen en eliminación ni ID no registrado',async()=>{
  const h=await helper(),d=database({assets:[asset({estado:'ELIMINANDO'})]});
  await assert.rejects(h.sincronizarAssetsProducto(d.db,null,{imagen:url}),{code:'ASSET_NO_DISPONIBLE'});
  await assert.rejects(h.sincronizarAssetsProducto(database({assets:[]}).db,null,{imagen:url}),{code:'ASSET_NO_DISPONIBLE'});
  d.state.assets[0].estado='REINTENTO';
  await assert.rejects(h.sincronizarAssetsProducto(d.db,null,{imagen:url}),{code:'ASSET_NO_DISPONIBLE'});
});

test('assets: cancelar modal solo programa temporales, no imágenes vinculadas',async()=>{
  const h=await helper(),d=database({assets:[asset({estado:'VINCULADO'})]});
  assert.equal((await h.solicitarLimpiezaTemporal(d.db,[ID],{ahora:NOW})).count,0);
  d.state.assets[0].estado='TEMPORAL';
  assert.equal((await h.solicitarLimpiezaTemporal(d.db,[ID],{ahora:NOW})).count,1);
  assert.equal(d.calls.destroys.length,0);
});

async function route(entry,d,{admin=true,env={}}={}){
  return loadEsm(entry,{projectRoot,globals:{Buffer,Date,setTimeout,clearTimeout,process:{env:{CLOUDINARY_CLOUD_NAME:CLOUD,CLOUDINARY_API_KEY:'test-only',CLOUDINARY_API_SECRET:'test-only',...env}}},mocks:{
    'node:crypto':{randomUUID:()=>ID,timingSafeEqual:crypto.timingSafeEqual},
    '@/lib/prisma':{default:d.db},'@/lib/cloudinary':{default:d.provider},
    '@/lib/auth':{verifyIsAdmin:async()=>admin?{id:1}:null},
    'next/server':{NextResponse:{json:(body,init={})=>new Response(JSON.stringify(body),init)}},
  }});
}

test('upload: reserva primero, devuelve assetId y rechaza destino manipulado',async()=>{
  const d=database({assets:[]}),r=await route('src/app/api/admin/upload/route.js',d);
  const file={type:'image/png',size:1,name:'foto.png',arrayBuffer:async()=>new Uint8Array([1]).buffer};
  const req=(folder)=>({formData:async()=>({get:key=>key==='file'?file:folder})});
  assert.equal((await r.POST(req('otra-carpeta'))).status,400);assert.equal(d.calls.uploads.length,0);
  const response=await r.POST(req(null));assert.equal(response.status,200);assert.equal((await response.json()).assetId,ID);
  assert.equal(d.state.assets[0].estado,'TEMPORAL');assert.equal(d.calls.uploads[0][1].public_id,publicId);
});

test('upload: proveedor exitoso y fallo guardando URL deja reserva para retry',async()=>{
  const d=database({assets:[]});d.db.assetCatalogo.update=async()=>{throw new Error('BD offline')};
  const r=await route('src/app/api/admin/upload/route.js',d);
  const file={type:'image/png',size:1,name:'f.png',arrayBuffer:async()=>new Uint8Array([1]).buffer};
  const response=await r.POST({formData:async()=>({get:key=>key==='file'?file:null})});
  assert.equal(response.status,503);assert.equal(d.calls.uploads.length,1);assert.equal(d.state.assets[0].publicId,publicId);
  assert.equal(d.state.assets[0].estado,'PENDIENTE');assert.equal(d.calls.destroys.length,0);
});

test('cleanup: rechaza URL arbitraria y acceso sin administrador',async()=>{
  const d=database();let r=await route('src/app/api/admin/assets/cleanup/route.js',d);
  assert.equal((await r.POST({json:async()=>({assetIds:[url]})})).status,400);
  r=await route('src/app/api/admin/assets/cleanup/route.js',d,{admin:false});
  assert.equal((await r.POST({json:async()=>({assetIds:[ID]})})).status,403);
  assert.equal(d.calls.writes,0);assert.equal(d.calls.destroys.length,0);
});

test('cron: sin secreto o con Bearer incorrecto no toca assets',async()=>{
  const d=database();let r=await route('src/app/api/cron/limpiar-imagenes/route.js',d);
  assert.equal((await r.GET({headers:new Headers()})).status,503);
  r=await route('src/app/api/cron/limpiar-imagenes/route.js',d,{env:{CRON_SECRET:'test-only-cron-key-'.repeat(3)}});
  assert.equal((await r.GET({headers:new Headers({authorization:'Bearer wrong'})})).status,401);
  assert.equal(d.calls.writes,0);assert.equal(d.calls.destroys.length,0);
});

test('cron: ejecución autorizada limita lote y presupuesto bajo los 60 segundos de la función',async()=>{
  const secret='test-only-cron-key-'.repeat(3);let opciones;
  const r=await loadEsm('src/app/api/cron/limpiar-imagenes/route.js',{projectRoot,
    globals:{Buffer,process:{env:{CRON_SECRET:secret,CLOUDINARY_CLOUD_NAME:CLOUD,CLOUDINARY_API_KEY:'test-only',CLOUDINARY_API_SECRET:'test-only'}}},
    mocks:{
      'node:crypto':{timingSafeEqual:crypto.timingSafeEqual},
      '@/lib/prisma':{default:{}},'@/lib/cloudinary':{default:{}},
      '@/lib/assetsCatalogo':{procesarLimpiezaAssets:async(args)=>{opciones=args;return {errores:0,diferidosPorTiempo:2,pendientes:2};}},
      'next/server':{NextResponse:{json:(body,init={})=>new Response(JSON.stringify(body),init)}},
    },
  });
  const response=await r.GET({headers:new Headers({authorization:`Bearer ${secret}`})});
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(opciones.limite,10);assert.equal(opciones.presupuestoMs,45000);assert.equal(r.maxDuration,60);
  assert.equal((await response.json()).diferidosPorTiempo,2);
});
