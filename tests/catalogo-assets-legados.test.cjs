const assert = require('node:assert/strict');
const {test} = require('node:test');
const {auditarAssetsLegados, publicIdPropio} = require('../scripts/auditar-assets-legados.cjs');
const cloud='test-cloud';
const url=(id)=>`https://res.cloudinary.com/${cloud}/image/upload/f_auto,w_600/v123/adetallesbq/productos/${id}.jpg`;
function cliente(){return {
  $queryRaw:async(parts)=>parts.join('').includes('COLUMNS')?[{COLUMN_NAME:'imagenes'}]:[],
  producto:{findMany:async()=>[{imagen:url('actual')}]},
  pedido:{findMany:async()=>[{items:JSON.stringify([{imagen:url('historica')}])}]},
};}

test('legado: reconoce solo URLs del cloud previsto y mantiene referencias históricas',async()=>{
  assert.equal(publicIdPropio(url('actual'),cloud),'adetallesbq/productos/actual');
  assert.equal(publicIdPropio(url('actual').replace('/test-cloud/','/otro/'),cloud),null);
  assert.equal(publicIdPropio('https://example.com/imagen.jpg',cloud),null);
  const r=await auditarAssetsLegados({cliente:cliente(),cloudName:cloud,oficial:[{imagen:url('oficial')}]});
  assert.deepEqual(r.referencias,{productos:1,pedidos:1,oficial:1,unicas:3,legadasSinRegistro:3});
  assert.equal(r.sinReferenciasLegadas,null);assert.equal(r.proveedorConsultado,false);
});

test('legado: inventario del proveedor solo produce candidatos, sin ninguna llamada de borrado',async()=>{
  let consultas=0;
  const provider={api:{resources:async()=>{consultas++;return {resources:[{public_id:'adetallesbq/productos/actual'},{public_id:'adetallesbq/productos/huerfana'},{public_id:'otra-app/ajena'}]}}}};
  const r=await auditarAssetsLegados({cliente:cliente(),cloudName:cloud,proveedor:provider});
  assert.equal(consultas,1);assert.equal(r.inventarioCompleto,true);
  assert.deepEqual(r.sinReferenciasLegadas,[{publicId:'adetallesbq/productos/huerfana',requiereRevisionYAdopcion:true}]);
});

test('legado: fallo leyendo snapshots interrumpe auditoría antes de consultar proveedor',async()=>{
  let consultas=0;const db=cliente();db.pedido.findMany=async()=>{throw new Error('sin lectura')};
  await assert.rejects(auditarAssetsLegados({cliente:db,cloudName:cloud,proveedor:{api:{resources:async()=>{consultas++;}}}}));
  assert.equal(consultas,0);
});
