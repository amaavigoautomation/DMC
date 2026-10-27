import {promises as fs} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
const mime={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.ico':'image/x-icon','.bin':'application/octet-stream'};
export function assetService(root,privateRoot){return {async fetch(req){
 if(!['GET','HEAD'].includes(req.method))return new Response('Method not allowed',{status:405});
 let name;try{name=decodeURIComponent(new URL(req.url).pathname).slice(1);}catch{return new Response('Not found',{status:404});}
 // Only asset directories are directly accessible; HTML must go through the application.
 if(!/^(css|js|img|fonts|protected-brochures)\/[a-zA-Z0-9_./ -]+$/.test(name)||name.split('/').some(p=>p==='..'||p.startsWith('.')))return new Response('Not found',{status:404});
 const base=name.startsWith('protected-brochures/')?privateRoot:root;
 try{const data=await fs.readFile(path.join(base,name));return new Response(req.method==='HEAD'?null:data,{headers:{'Content-Type':mime[path.extname(name).toLowerCase()]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'public,max-age=3600'}});}catch(e){if(['ENOENT','EISDIR'].includes(e.code))return new Response('Not found',{status:404});throw e;}
}};}
export function fileBucket(root){
 const safe=key=>{if(!/^blog-media\/[a-f0-9-]{36}$/.test(key))throw Error('Invalid object key');return path.join(root,key);};
 return {async put(key,data,options={}){const file=safe(key);await fs.mkdir(path.dirname(file),{recursive:true,mode:0o700});const temp=file+'.'+randomUUID()+'.tmp';await fs.writeFile(temp,new Uint8Array(data),{mode:0o600});await fs.rename(temp,file);await fs.writeFile(file+'.metadata.json',JSON.stringify(options.httpMetadata||{}),{mode:0o600});},
 async get(key){const file=safe(key);try{const body=await fs.readFile(file);let httpMetadata={};try{httpMetadata=JSON.parse(await fs.readFile(file+'.metadata.json','utf8'));}catch{}return {body,httpMetadata};}catch(e){if(e.code==='ENOENT')return null;throw e;}}};
}
