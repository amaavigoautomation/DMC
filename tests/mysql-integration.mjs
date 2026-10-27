// REAL MySQL suite: use only an EMPTY, disposable database ending in _test.
import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {createPool,MySQLStore} from '../runtime/mysql.mjs';import {fileBucket,assetService} from '../runtime/storage.mjs';import worker from '../server/worker.mjs';import {catalog} from '../server/generated.mjs';import {siteOrigin} from '../server/site-config.mjs';import {schema} from '../scripts/data-transfer.mjs';
if(!process.env.DB_NAME?.endsWith('_test')||process.env.CONFIRM_TEST_DATABASE!=='yes')throw Error('Requires DB_NAME ending in _test and CONFIRM_TEST_DATABASE=yes');
const pool=createPool(),DB=new MySQLStore(pool),dir=fs.mkdtempSync(path.join(os.tmpdir(),'dmc24-mysql-test-'));
try{
 for(const table of Object.keys(schema)){const [[r]]=await pool.query('SELECT COUNT(*) n FROM `'+table+'`');assert.equal(r.n,0,'Test DB must be empty: '+table);}
 const password=randomBytes(24).toString('hex'),salt=randomBytes(16).toString('hex');
 const env={DB,BUCKET:fileBucket(dir),ASSETS:assetService(path.resolve('website'),path.resolve('private-assets')),ADMIN_CREDENTIAL:JSON.stringify({salt,iterations:100000,hash:pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex')})};
 let cookie='';const request=(url,body,auth=true)=>worker.fetch(new Request(siteOrigin+url,{method:body?'POST':'GET',headers:{...(auth&&cookie?{Cookie:cookie}:{}),...(body?{Origin:siteOrigin,'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}),env,{waitUntil:p=>p.catch(()=>{})});
 async function get(url){const r=await request(url);assert.equal(r.status,200,await r.clone().text());return r.json();}async function post(url,body){const r=await request(url,body);assert.equal(r.status,200,await r.clone().text());return r.json();}
 assert.equal((await request('/api/admin/users')).status,401);
 let r=await request('/api/auth/login',{username:'Admin',password});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];assert((await get('/api/auth/session')).superAdmin);
 assert.equal((await worker.fetch(new Request(siteOrigin+'/api/auth/logout',{method:'POST',headers:{Cookie:cookie,Origin:'https://evil.invalid','Content-Type':'application/json'},body:'{}'}),env)).status,403);
 for(const slug of Object.keys(catalog)){assert.equal((await request('/'+slug)).status,200);assert((await get('/api/pricing/'+slug)).plans);}
 const k=await get('/api/pricing/admin/kenya');k.plans[0].monthly=777;k.setupFees[0].priceVisible=false;
 const saved=await post('/api/pricing/admin/kenya/draft',{plans:k.plans,setupFees:k.setupFees,revision:0});assert.notEqual((await get('/api/pricing/kenya')).plans[0].monthly,777);
 await post('/api/pricing/admin/kenya/publish',{revision:saved.revision});assert.equal((await get('/api/pricing/kenya')).plans[0].monthly,undefined);
 assert.equal((await request('/api/pricing/admin/kenya/draft',{plans:k.plans,setupFees:k.setupFees,revision:0})).status,409);
 await post('/api/pricing/admin/bulk-copy',{source:'kenya',sourceRevision:1,targets:[{slug:'uganda',revision:0},{slug:'rwanda',revision:0}],publish:true,copySetup:true});
 assert.equal((await get('/api/pricing/admin/uganda')).plans[0].monthly,777);
 r=await request('/api/pricing/admin/bulk-copy',{source:'kenya',sourceRevision:1,targets:[{slug:'uganda',revision:0},{slug:'rwanda',revision:1}],publish:true,copySetup:true});assert.equal(r.status,409);assert.equal((await get('/api/pricing/admin/rwanda')).revision,1);
 await post('/api/pricing/admin/uganda/visibility',{visible:false,revision:0});assert.equal((await request('/uganda')).status,404);assert.equal((await request('/api/pricing/uganda')).status,404);
 const user=await post('/api/admin/users',{action:'save',revision:0,name:'Test editor',email:'editor@example.test',status:'active',permissions:{blogs:['view','edit']}});
 await post('/api/auth/setup',{token:user.setupPath.split('=')[1],password:password+'editor'});
 const rootCookie=cookie;r=await request('/api/auth/login',{username:'editor@example.test',password:password+'editor'});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];assert.equal((await request('/api/admin/users')).status,403);assert.equal((await request('/api/pricing/admin/kenya')).status,403);cookie=rootCookie;
 // Login invalidates the previous cookie; sign root in again.
 r=await request('/api/auth/login',{username:'Admin',password});cookie=r.headers.get('set-cookie').split(';')[0];
 const demo={id:crypto.randomUUID(),name:'Test prospect',email:'prospect@example.test',company:'Test DMC',phone:'+254700000000',country:'Kenya',destinations:['Kenya'],solutions:['Mid Office'],users:'6–10',timing:'1–3 months',role:'Management',software:'',message:'Integration test',source:'/kenya',destination:'kenya',variant:'Professional',consent:true};
 await post('/api/demo-requests',demo);assert.equal((await get('/api/admin/demo-requests')).rows[0].variant,'Professional');
 await post('/api/brochure-requests',{brochure:'overview',name:'Test prospect',email:'brochure@example.test',company:'Test DMC',countries:['Kenya'],users:'6–10',timing:'1–3 months',phone:'',source:'/brochures'});
 assert.equal((await get('/api/brochure-leads?sort=destination')).total,1);
 assert.equal((await request('/api/brochures/overview.pdf',undefined,false)).status,302);
 assert.equal((await request('/blogs')).status,200);assert.equal((await request('/sitemap.xml')).status,200);assert.equal((await request('/api/admin/blogs')).status,200);
 assert.equal((await get('/api/admin/email/settings')).config.enabled,false);
 // Exercise ISO/IST date expression, reserved identifiers, GROUP BY and LIMIT bindings.
 await DB.prepare('INSERT INTO analytics_events(id,visitor,session,kind,path,product,target,country,source,device,`returning`,occurred_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),'v','s','pageview','/','Other','','IN','Direct','Desktop',0,new Date().toISOString()).run();
 assert.equal((await get('/api/analytics/admin')).summary.views,1);assert.equal((await get('/api/admin/email/logs')).rows.length,2);
 console.log('PASS: real MySQL auth/permissions, 24 destinations, pricing draft/publish/redaction, stale edits, bulk atomicity, visibility, demo/brochure enquiries, CMS, sitemap, analytics and email-disabled checks. No emails sent.');
}finally{await pool.end();fs.rmSync(dir,{recursive:true,force:true});}
