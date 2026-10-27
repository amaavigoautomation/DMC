import {captureEmail} from './email-automation.mjs';
import codes from './country-codes.json' with {type:'json'};
import {catalog} from './generated.mjs';
export const variants=['Business','Professional','Professional Plus','Enterprise'];
export const statuses=['New','Contacted','Demo Scheduled','Completed','Closed'];
export const solutions=['Mid Office','B2B','B2C','Local Sales','Multi-DMC','Help me choose'];
export const users=['1–5','6–10','11–20','21–50','51–100','100+','Not sure'];
export const timings=['Within 1 month','1–3 months','3–6 months','6–12 months','Just exploring'];
export const roles=['Owner / Director','Management','Sales','Operations','Finance','IT','Other'];
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function text(v,max,required=false){if(typeof v!=='string'||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw Error('Invalid form value.');v=v.trim();if(required&&!v)throw Error('Please complete all required fields.');return v;}
export function validateDemo(b){
 const r={};for(const k of ['name','company','phone','email'])r[k]=text(b[k],k==='email'?254:160,true);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))throw Error('Enter a valid email address.');
 if(!/^\+[\d\s().-]{6,30}$/.test(r.phone))throw Error('Include the international dialling code in your phone number.');
 if(!codes.includes(b.country))throw Error('Select your company country.');r.country=b.country;
 for(const [key,allowed] of [['destinations',codes],['solutions',solutions]]){if(!Array.isArray(b[key])||!b[key].length||b[key].length>249||b[key].some(x=>!allowed.includes(x)))throw Error('Choose your '+key+'.');r[key]=JSON.stringify([...new Set(b[key])]);}
 for(const [key,list] of [['users',users],['timing',timings]]){if(!list.includes(b[key]))throw Error('Select your '+key+'.');r[key]=b[key];}
 r.role=text(b.role,60);if(r.role&&!roles.includes(r.role))throw Error('Select your role.');r.software=text(b.software,200);r.message=text(b.message,3000);
 r.source=text(b.source,200);if(!/^\/(?:[a-z0-9-]+(?:\.html)?)?$/.test(r.source))r.source='/request-demo';
 r.destination=text(b.destination,80);if(r.destination&&!catalog[r.destination])r.destination='';
 r.variant=text(b.variant,60);if(r.variant&&!variants.includes(r.variant))throw Error('Invalid variant.');
 if(b.consent!==true)throw Error('Please agree to be contacted about your request.');
 if(!/^[a-f0-9-]{36}$/.test(b.id||''))throw Error('Please reload the form and retry.');r.id=b.id;
 return r;
}
export async function demoApi(req,env,isAdmin,ctx){
 const u=new URL(req.url),path=u.pathname,admin=path.startsWith('/api/admin/');
 if(admin&&!isAdmin)return json({error:'Please log in.'},401);
 if(req.method==='GET'&&path==='/api/demo-options')return json({codes,variants,statuses,solutions,users,timings,roles,destinations:Object.fromEntries(Object.entries(catalog).map(([k,v])=>[k,v.name]))});
 if(!['GET','POST'].includes(req.method))return json({error:'Method not allowed'},405);
 let b;if(req.method==='POST'){
  if(req.headers.get('Origin')!==u.origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
  const raw=await req.text();if(raw.length>16000)return json({error:'Request too large'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
 }
 if(path==='/api/demo-requests'&&req.method==='POST'){
  let r;try{r=validateDemo(b)}catch(e){return json({error:e.message},400)}
  if(b.website)return json({error:'Request not accepted.'},400);
  const existing=await env.DB.prepare('SELECT id FROM demo_requests WHERE id=?').bind(r.id).first();if(existing)return json({ok:true,id:r.id});
  const recent=await env.DB.prepare('SELECT COUNT(*) n FROM demo_requests WHERE email=? AND created_at>?').bind(r.email.toLowerCase(),new Date(Date.now()-3600000).toISOString()).first();if(recent.n>=5)return json({error:'You have submitted several requests. Please try again later.'},429);
  r.email=r.email.toLowerCase();const now=new Date().toISOString(),keys=Object.keys(r);
  await env.DB.prepareIgnore('INSERT INTO demo_requests ('+keys.join(',')+',created_at,consent_at) VALUES ('+keys.map(()=>'?').join(',')+',?,?)').bind(...Object.values(r),now,now).run();
  await captureEmail(env,{...r,trigger:r.destination?'country':r.source==='/contact'?'enquiry':'demo',solutions:JSON.parse(r.solutions),product:JSON.parse(r.solutions).filter(x=>x!=='Help me choose').join(', ')||'DMC24'},'demo:'+r.id,ctx);return json({ok:true,id:r.id},201);
 }
 if(path==='/api/admin/demo-requests'&&req.method==='GET'){
  const where=[],args=[];for(const key of ['status','variant','destination']){const v=u.searchParams.get(key);if(v){where.push(key+'=?');args.push(v);}}
  const q=u.searchParams.get('q')?.trim().slice(0,150);if(q){where.push('(name LIKE ? OR email LIKE ? OR company LIKE ?)');args.push(...Array(3).fill('%'+q+'%'));}
  const clause=where.length?' WHERE '+where.join(' AND '):'',sort={requested:'created_at',destination:'destination',variant:'variant',company:'company',status:'status'}[u.searchParams.get('sort')]||'created_at',direction=u.searchParams.get('direction')==='asc'?'ASC':'DESC';
  const offset=Math.min(1000000,Math.max(0,parseInt(u.searchParams.get('offset'))||0));
  const total=await env.DB.prepare('SELECT COUNT(*) n FROM demo_requests'+clause).bind(...args).first();
  const rows=await env.DB.prepare('SELECT * FROM demo_requests'+clause+' ORDER BY '+sort+' '+direction+',id ASC LIMIT 50 OFFSET ?').bind(...args,offset).all();return json({rows:rows.results,total:total.n});
 }
 if(path==='/api/admin/demo-requests/status'&&req.method==='POST'){
  if(!statuses.includes(b.status)||!Number.isInteger(b.revision)||typeof b.id!=='string')return json({error:'Invalid status update'},400);
  const r=await env.DB.prepare('UPDATE demo_requests SET status=?,revision=revision+1 WHERE id=? AND revision=?').bind(b.status,b.id,b.revision).run();return r.meta.changes===1?json({ok:true,revision:b.revision+1}):json({error:'This request changed in another session. Refresh before editing.'},409);
 }
 return json({error:'Not found'},404);
}
