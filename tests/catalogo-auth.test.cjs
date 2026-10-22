const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const {test} = require('node:test');
const {loadEsm} = require('./load-esm.cjs');
const projectRoot=path.resolve(__dirname,'..');
const key=crypto.randomBytes(48).toString('base64url');

async function auth(env={},usuario=null,cookie=null){
  let consultas=0;
  const api=await loadEsm('src/lib/auth.js',{projectRoot,globals:{Buffer,process:{env}},mocks:{
    'crypto':{default:crypto},
    'next/headers':{cookies:async()=>({get:()=>cookie?{value:cookie}:null})},
    '@/lib/prisma':{default:{usuario:{findUnique:async()=>{consultas++;return usuario;}}}},
  }});
  return {api,consultas:()=>consultas};
}

test('auth: importar sin secreto funciona, verificar falla cerrado y firmar da error explícito',async()=>{
  const {api,consultas}=await auth();
  assert.equal(api.getAuthSecret(),null);assert.equal(api.verifySessionToken('payload.firma'),null);
  assert.throws(()=>api.signSessionToken({email:'admin@example.com'}),{code:'AUTH_SECRET_NO_CONFIGURADO'});
  assert.equal(await api.getAuthenticatedUser(),null);assert.equal(consultas(),0);
});

test('auth: rechaza secreto corto y firma/token modificados',async()=>{
  assert.equal((await auth({AUTH_SECRET:'corto'})).api.getAuthSecret(),null);
  const {api}=await auth({AUTH_SECRET:key});
  const token=api.signSessionToken({id:1,email:'admin@example.com'});
  assert.equal(api.verifySessionToken(token).id,1);
  assert.equal(api.verifySessionToken(token+'extra'),null);
  assert.equal(api.verifySessionToken(token+'.extra'),null);
  const other=(await auth({AUTH_SECRET:crypto.randomBytes(48).toString('base64url')})).api;
  assert.equal(other.verifySessionToken(token),null);
});

test('auth: payload firmado sin expiración o expirado no es una sesión válida',async()=>{
  const {api}=await auth({AUTH_SECRET:key});
  for(const payload of [{id:1},{id:1,exp:Date.now()-1000},{id:1,exp:'mañana'}]){
    const data=Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature=crypto.createHmac('sha256',key).update(data).digest('base64url');
    assert.equal(api.verifySessionToken(`${data}.${signature}`),null);
  }
});

test('login: una cuenta inexistente no se crea automáticamente',async()=>{
  let writes=0;
  const route=await loadEsm('src/app/api/auth/login/route.js',{projectRoot,mocks:{
    'next/server':{NextResponse:{json:(body,init={})=>new Response(JSON.stringify(body),init)}},
    'bcryptjs':{default:{compare:async()=>false,hash:async()=>{writes++;return 'hash';}}},
    '@/lib/prisma':{default:{usuario:{findUnique:async()=>null,create:async()=>{writes++;return {};}}}},
    '@/lib/auth':{getAuthSecret:()=>key,signSessionToken:()=>{throw new Error('No debe firmar');}},
    '@/lib/rateLimit':{getClientIp:()=>null,verifyRateLimit:()=>({blocked:false}),registerFailedAttempt:()=>{},resetRateLimit:()=>{}},
  }});
  const response=await route.POST({json:async()=>({email:'admin@adetallesbq.com',password:'test-input'})});
  assert.equal(response.status,401);assert.equal(writes,0);
});

test('login: un hash bcrypt filtrado no funciona como contraseña de texto plano',async()=>{
  let firmas=0;
  const hash='$2b$12$'+'a'.repeat(53);
  const route=await loadEsm('src/app/api/auth/login/route.js',{projectRoot,mocks:{
    'next/server':{NextResponse:{json:(body,init={})=>new Response(JSON.stringify(body),init)}},
    'bcryptjs':{default:{compare:async()=>false,hash:async()=>{throw new Error('No debe rehashear un hash');}}},
    '@/lib/prisma':{default:{usuario:{findUnique:async()=>({id:1,email:'admin@example.com',password:hash,role:'ADMIN'})}}},
    '@/lib/auth':{getAuthSecret:()=>key,signSessionToken:()=>{firmas++;return 'token';}},
    '@/lib/rateLimit':{getClientIp:()=>null,verifyRateLimit:()=>({blocked:false}),registerFailedAttempt:()=>{},resetRateLimit:()=>{}},
  }});
  const response=await route.POST({json:async()=>({email:'admin@example.com',password:hash})});
  assert.equal(response.status,401);assert.equal(firmas,0);
});
