import {captureEmail} from './email-automation.mjs';
import codes from './country-codes.json' with {type:'json'};
import {brochures,demoQR} from './brochures-generated.mjs';
import {renderBrochure} from './brochures.mjs';
import {visibility,canonicalCountry} from './destinations.mjs';
import {securedPdfs} from './secured-pdfs-generated.mjs';
export const userRanges=['1–5','6–10','11–20','21–50','51–100','100+','Not sure yet'];
export const timings=['Within 1 month','1–3 months','3–6 months','6–12 months','Just exploring'];
const countrySet=new Set(codes);
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(v,status=200,extra={})=>Response.json(v,{status,headers:{...headers,...extra}});
const safeText=(v,max)=>typeof v==='string'?v.trim().replace(/[\u0000-\u001f]/g,'').slice(0,max):'';
const hex=b=>[...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
const digest=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
export async function session(req,env){
 const token=req.headers.get('Cookie')?.match(/(?:^|;\s*)dmc24_brochure=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(!token)return null;
 return env.DB.prepare('SELECT id FROM brochure_leads WHERE session_hash=? AND expires_at>?').bind(await digest(token),new Date().toISOString()).first();
}
export function brochureInfo(id){
 if(securedPdfs[id])return {id,title:securedPdfs[id].title,destination:'',file:securedPdfs[id].file};
 const slug=canonicalCountry(id);
 if(brochures[slug])return {id:slug,title:'DMC24 for '+brochures[slug].name,destination:brochures[slug].name,file:'DMC24-'+slug+'-Brochure.pdf'};
 return null;
}
async function available(id,env){const info=brochureInfo(id);if(!info)return null;if(info.destination&&(await visibility(env))[info.id]?.visible===0)return null;return info;}
export function brochureFromPath(path){
 const match=path.match(/^\/api\/brochures\/([a-z-]+)\.pdf$/);if(match)return canonicalCountry(match[1]);
 return Object.keys(securedPdfs).find(id=>path==='/downloads/'+securedPdfs[id].file)||null;
}
export async function download(req,env,id,authorisedEmail=false){
 const info=await available(id,env);if(!info)return new Response('Brochure unavailable',{status:404,headers});
 if(!authorisedEmail&&!await session(req,env))return Response.redirect(new URL('/brochures?download='+encodeURIComponent(info.id),req.url).href,302);
 const h={...headers,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+info.file+'"','X-Robots-Tag':'noindex'};
 if(req.method==='HEAD')return new Response(null,{headers:h});
 let bytes;
 if(securedPdfs[info.id]){
  const item=securedPdfs[info.id],res=await env.ASSETS.fetch(new Request(new URL(item.asset,req.url)));
  if(!res.ok)throw Error('PDF asset unavailable');
  const encrypted=new Uint8Array(await res.arrayBuffer());
  const key=await crypto.subtle.importKey('raw',new Uint8Array(item.key),'AES-GCM',false,['decrypt']);
  bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:encrypted.slice(0,12)},key,encrypted.slice(12));
 }else bytes=await renderBrochure(brochures[info.id],demoQR,async asset=>{const res=await env.ASSETS.fetch(new Request(new URL('/'+asset,req.url)));if(!res.ok)throw Error('Image unavailable');return new Uint8Array(await res.arrayBuffer())});
 return new Response(bytes,{headers:h});
}
export async function brochureApi(req,env,isOwner,ctx){
 const url=new URL(req.url),path=url.pathname;
 if(path==='/api/brochure-access'&&req.method==='GET')return json({registered:!!await session(req,env)});
 if(path==='/api/brochure-download'&&['GET','HEAD'].includes(req.method))return download(req,env,url.searchParams.get('id'));
 if(path.startsWith('/api/brochure-leads')){
  if(!isOwner)return json({error:'Sign in with the site owner account to view enquiries.'},403);
  if(req.method!=='GET')return json({error:'Method not allowed'},405);
  if(!['/api/brochure-leads','/api/brochure-leads/export'].includes(path))return json({error:'Not found'},404);
  const offset=Math.max(0,Math.min(1000000,parseInt(url.searchParams.get('offset'))||0));
  const sort=url.searchParams.get('sort')||'requested',direction=url.searchParams.get('direction')||'desc';
  if(!['requested','destination'].includes(sort)||!['asc','desc'].includes(direction))return json({error:'Invalid sort option'},400);
  const order=sort==='destination'?"(d.destination='') ASC,d.destination COLLATE utf8mb4_unicode_ci "+direction.toUpperCase()+',d.created_at DESC,d.id DESC':'d.created_at '+direction.toUpperCase()+',d.id '+direction.toUpperCase();
  const rows=(await env.DB.prepare('SELECT d.id,d.created_at,l.name,l.email,l.company,l.countries,l.users,l.timing,l.phone,l.demo,d.title,d.destination,d.source FROM brochure_downloads d JOIN brochure_leads l ON l.id=d.lead_id ORDER BY '+order+' LIMIT 100 OFFSET ?').bind(offset).all()).results;
  const count=await env.DB.prepare('SELECT COUNT(*) AS total FROM brochure_downloads').first();
  return json({rows,total:count.total,offset});
 }
 if(path!=='/api/brochure-requests')return json({error:'Not found'},404);
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
 const raw=await req.text();if(raw.length>10000)return json({error:'Request too large'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
 if(!body||typeof body!=='object'||body.website)return json({error:'Please try again.'},400);
 const info=await available(body.brochure,env);if(!info)return json({error:'This brochure is currently unavailable.'},404);
 let lead=await session(req,env),cookie=null;
 if(!lead){
  const name=safeText(body.name,120),email=safeText(body.email,254).toLowerCase(),company=safeText(body.company,160),phone=safeText(body.phone,40);
  if(name.length<2||company.length<2||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter your full name, a valid work email and company name.'},400);
  if(!Array.isArray(body.countries)||!body.countries.length||body.countries.length>249||body.countries.some(c=>!countrySet.has(c)))return json({error:'Select at least one country of operation.'},400);
  if(!userRanges.includes(body.users)||!timings.includes(body.timing))return json({error:'Select expected users and implementation timing.'},400);
  if(phone&&!/^\+[0-9][0-9 ()-]{5,37}$/.test(phone))return json({error:'Include the country code in your phone number, for example +91.'},400);
  if(body.demo!==undefined&&typeof body.demo!=='boolean')return json({error:'Invalid demo preference'},400);
  const recent=await env.DB.prepare('SELECT COUNT(*) AS total FROM brochure_leads WHERE email=? AND created_at>?').bind(email,new Date(Date.now()-3600000).toISOString()).first();
  if(recent.total>=10)return json({error:'Too many requests. Please try again later.'},429);
  const token=hex(crypto.getRandomValues(new Uint8Array(32))),id=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO brochure_leads (id,name,email,company,countries,users,timing,phone,demo,created_at,session_hash,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,email,company,JSON.stringify([...new Set(body.countries)]),body.users,body.timing,phone,body.demo?1:0,new Date().toISOString(),await digest(token),new Date(Date.now()+90*86400000).toISOString()).run();
  lead={id};cookie='dmc24_brochure='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7776000';
 }
 const source=safeText(body.source,250).split('?')[0].split('#')[0];
 await env.DB.prepare('INSERT INTO brochure_downloads (id,lead_id,brochure,title,destination,source,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),lead.id,info.id,info.title,info.destination,source.startsWith('/')?source:'',new Date().toISOString()).run();
 const contact=await env.DB.prepare('SELECT name,email,company,users,timing FROM brochure_leads WHERE id=?').bind(lead.id).first();
 const mailKey='brochure:'+await digest(contact.email.toLowerCase()+'|'+info.id+'|'+new Date().toISOString().slice(0,10));
 const product={'overview':'DMC24','mid-office':'Mid Office','b2b':'B2B','b2c':'B2C','local-sales':'Local Sales','multi-dmc':'Multi-DMC'}[info.id]||info.title;
 await captureEmail(env,{...contact,trigger:'brochure',destination:info.destination?info.id:'',product,brochure:info.id},mailKey,ctx);
 return json({ok:true,url:'/api/brochure-download?id='+encodeURIComponent(info.id),filename:info.file},200,cookie?{'Set-Cookie':cookie}:{});
}
