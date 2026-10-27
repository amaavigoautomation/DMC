import http from 'node:http';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {once} from 'node:events';
import {createPool,MySQLStore} from './mysql.mjs';
import {assetService,fileBucket} from './storage.mjs';
import worker from '../server/worker.mjs';
import {siteOrigin} from '../server/site-config.mjs';
export function createApplication({env,handler=worker,origin=siteOrigin,trustProxy=false}){
 const pending=new Set();
 const server=http.createServer(async(incoming,outgoing)=>{
  try{
   // Ignore client-supplied identity, host, protocol and geolocation claims.
   const headers=new Headers();for(const [k,v] of Object.entries(incoming.headers))if(v!==undefined&&!/^(oai-|cf-|x-dmc24-|x-forwarded-|forwarded$|host$)/i.test(k))headers.set(k,Array.isArray(v)?v.join(','):v);
   const localPeer=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(incoming.socket.remoteAddress);
   const proxy=trustProxy&&localPeer;
   headers.set('x-dmc24-client-ip',proxy?String(incoming.headers['x-real-ip']||incoming.socket.remoteAddress):incoming.socket.remoteAddress||'unknown');
   headers.delete('x-real-ip');
   // Optional country value must be overwritten by the trusted local reverse proxy.
   if(proxy&&/^[A-Z]{2}$/.test(String(incoming.headers['x-verified-country']||'')))headers.set('CF-IPCountry',incoming.headers['x-verified-country']);
   headers.delete('x-verified-country');
   const parts=[];let size=0;for await(const b of incoming){size+=b.length;if(size>3*1024*1024){outgoing.writeHead(413);outgoing.end('Request too large');return;}parts.push(b);}
   const method=incoming.method,url=new URL(incoming.url,origin);if(url.origin!==origin){outgoing.writeHead(400);outgoing.end('Invalid request URL');return;}
   // Encrypted brochure assets are internal-only; the gate calls ASSETS directly.
   if(url.pathname.startsWith('/protected-brochures/')){outgoing.writeHead(404);outgoing.end('Not found');return;}
   const req=new Request(url,{method,headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(parts)});
   const result=await handler.fetch(req,env,{waitUntil(p){const task=Promise.resolve(p).catch(()=>console.error('Background operation failed')).finally(()=>pending.delete(task));pending.add(task);}});
   outgoing.statusCode=result.status;for(const [k,v] of result.headers)if(k!=='set-cookie')outgoing.setHeader(k,v);
   const cookies=result.headers.getSetCookie();if(cookies.length)outgoing.setHeader('set-cookie',cookies);
   outgoing.setHeader('X-Content-Type-Options','nosniff');
   if(method!=='HEAD'&&result.body)for await(const chunk of result.body){if(!outgoing.write(chunk))await once(outgoing,'drain');}
   outgoing.end();
  }catch{console.error('Request failed');if(!outgoing.headersSent)outgoing.writeHead(503,{'Content-Type':'text/plain','Cache-Control':'no-store'});outgoing.end('Temporarily unavailable. Please retry.');}
 });
 server.requestTimeout=30000;server.headersTimeout=15000;
 return {server,async drain(){await Promise.allSettled([...pending]);}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(!process.env.ADMIN_CREDENTIAL)throw Error('Set ADMIN_CREDENTIAL using npm run admin:credential');
 if(process.env.APP_ORIGIN!==siteOrigin)throw Error('APP_ORIGIN must match SEO_SITE_CONFIG.json. Set APP_ORIGIN and run npm run build.');
 const pool=createPool();await pool.query('SELECT 1');
 const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
 const env={DB:new MySQLStore(pool),BUCKET:fileBucket(path.resolve(process.env.UPLOAD_DIR||path.join(root,'var/uploads'))),ASSETS:assetService(path.join(root,'website'),path.join(root,'private-assets')),ADMIN_CREDENTIAL:process.env.ADMIN_CREDENTIAL,EMAIL_ENCRYPTION_KEY:process.env.EMAIL_ENCRYPTION_KEY};
 const app=createApplication({env,trustProxy:process.env.TRUST_LOCAL_PROXY==='true'});
 app.server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('DMC24 listening'));
 let stopping=false;async function stop(){if(stopping)return;stopping=true;await new Promise(resolve=>app.server.close(resolve));await app.drain();await pool.end();process.exit(0);}
 process.on('SIGTERM',stop);process.on('SIGINT',stop);
}
