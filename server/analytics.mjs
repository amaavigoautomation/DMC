import {htmlFiles,catalog} from './generated.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=v=>typeof v==='string'&&/^[a-f0-9-]{36}$/.test(v);
const products=['Mid Office','B2B','B2C','Local Sales','Multi-DMC','Destinations','Other'];
export function publicPage(path){return typeof path==='string'&&path.length<120&&/^\/[a-z0-9-]*$/.test(path)&&!!htmlFiles[path==='/'?'index':path.slice(1)]&&!/admin|management|enquiries|demo-requests|analytics|preview|review|icon-style/.test(path);}
function product(path){const s=path.slice(1);if(catalog[s]||s==='uae'||s==='destinations')return 'Destinations';if(s==='b2b')return 'B2B';if(s==='b2c')return 'B2C';if(s==='local-sales')return 'Local Sales';if(s==='multi-dmc')return 'Multi-DMC';if(['mid-office','sales-crm','contracting-products','costing-quotations','bookings-reservations','operations-logistics','finance-profitability','dashboards-mis'].includes(s))return 'Mid Office';return 'Other';}
function filters(url){
 const today=new Date(Date.now()+19800000).toISOString().slice(0,10),start=url.searchParams.get('from')||new Date(Date.now()-29*86400000+19800000).toISOString().slice(0,10),end=url.searchParams.get('to')||today;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))throw Error('Select valid dates.');
 const a=new Date(start+'T00:00:00+05:30'),b=new Date(end+'T23:59:59.999+05:30');if(!Number.isFinite(+a)||!Number.isFinite(+b)||new Date(start+'T12:00:00Z').toISOString().slice(0,10)!==start||new Date(end+'T12:00:00Z').toISOString().slice(0,10)!==end||a>b||b-a>180*86400000)throw Error('Choose a date range of up to 180 days.');
 const where=['occurred_at>=?','occurred_at<=?'],params=[a.toISOString(),b.toISOString()];
 for(const key of ['country','path','product']){const v=url.searchParams.get(key);if(v){if(key==='country'&&!/^[A-Z]{2}$/.test(v)||key==='path'&&!publicPage(v)||key==='product'&&!products.includes(v))throw Error('Invalid filter.');where.push(key+'=?');params.push(v);}}
 return {where:where.join(' AND '),params,from:start,to:end};
}
export async function analyticsApi(req,env,owner){
 const url=new URL(req.url);
 if(url.pathname==='/api/analytics/events'){
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  if(req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
  if(owner||req.headers.get('DNT')==='1'||req.headers.get('Sec-GPC')==='1'||/bot|crawler|spider|headless/i.test(req.headers.get('User-Agent')||''))return new Response(null,{status:204});
  const raw=await req.text();if(raw.length>2500)return json({error:'Request too large'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
  if(!b||b.consent!==true||!uuid(b.id)||!uuid(b.visitor)||!uuid(b.session)||!['pageview','brochure','demo'].includes(b.kind)||!publicPage(b.path)||!['Desktop','Mobile','Tablet'].includes(b.device)||typeof b.returning!=='boolean')return json({error:'Invalid event'},400);
  const sources=['Direct','Google','Bing','Facebook','Instagram','YouTube','LinkedIn','Email','Other referral','Other campaign'];if(!sources.includes(b.source))return json({error:'Invalid source'},400);
  const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM analytics_events WHERE session=? AND occurred_at>?').bind(b.session,new Date(Date.now()-3600000).toISOString()).first();if(count.n>=300)return new Response(null,{status:204});
  const region=req.cf?.country||req.headers.get('CF-IPCountry')||'ZZ',country=/^[A-Z]{2}$/.test(region)&&!['XX','T1'].includes(region)?region:'ZZ';
  const target=typeof b.target==='string'&&/^[a-z0-9-]{1,64}$/.test(b.target)?b.target:'';
  await env.DB.prepareIgnore('INSERT INTO analytics_events (id,visitor,session,kind,path,product,target,country,source,device,`returning`,occurred_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(b.id,b.visitor,b.session,b.kind,b.path,product(b.path),target,country,b.source,b.device,b.returning?1:0,new Date().toISOString()).run();
  // Bounded housekeeping on a small fraction of incoming events; no raw IPs are stored.
  if(crypto.getRandomValues(new Uint8Array(1))[0]<5)await env.DB.prepare('DELETE FROM analytics_events WHERE occurred_at<? ORDER BY occurred_at LIMIT 500').bind(new Date(Date.now()-180*86400000).toISOString()).run();
  return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
 }
 if(!owner)return json({error:'Only the site owner can view analytics.'},403);
 if(req.method!=='GET')return json({error:'Method not allowed'},405);
 if(url.pathname!=='/api/analytics/admin')return json({error:'Not found'},404);
 let f;try{f=filters(url)}catch(e){return json({error:e.message},400)}
 const all=async(q,params=f.params)=>(await env.DB.prepare(q).bind(...params).all()).results;
 const mode=url.searchParams.get('mode')||'summary';
 if(mode==='journey'){
  const sid=url.searchParams.get('session');if(!uuid(sid))return json({error:'Invalid visit'},400);
  const rows=await all('SELECT occurred_at,kind,path,target,country,source,device FROM analytics_events WHERE '+'occurred_at>=? AND occurred_at<=?'+' AND session=? ORDER BY occurred_at,id LIMIT 300',[...f.params.slice(0,2),sid]);return json({rows});
 }
 if(mode==='events'){
  const offset=Math.max(0,Math.min(1000000,parseInt(url.searchParams.get('offset'))||0));
  const rows=await all('SELECT occurred_at,session,kind,path,product,target,country,source,device,`returning` FROM analytics_events WHERE '+f.where+' ORDER BY occurred_at,id LIMIT 200 OFFSET ?',[...f.params,offset]);return json({rows});
 }
 if(mode!=='summary')return json({error:'Invalid report'},400);
 const aggregate="COUNT(CASE WHEN kind='pageview' THEN 1 END) AS views,COUNT(DISTINCT visitor) AS visitors,COUNT(DISTINCT session) AS visits,COUNT(CASE WHEN kind='brochure' THEN 1 END) AS brochures,COUNT(CASE WHEN kind='demo' THEN 1 END) AS demos";
 const summary=(await all('SELECT '+aggregate+",COUNT(DISTINCT CASE WHEN `returning`=0 THEN session END) AS newVisits,COUNT(DISTINCT CASE WHEN `returning`=1 THEN session END) AS returningVisits,COUNT(DISTINCT CASE WHEN kind='brochure' THEN session END) AS convertedVisits FROM analytics_events WHERE "+f.where))[0];
 const groups=async field=>all('SELECT '+field+' AS label,'+aggregate+' FROM analytics_events WHERE '+f.where+' GROUP BY '+field+' ORDER BY views DESC,visits DESC,label LIMIT 100');
 const [countries,pages,sources,devices,daily,visits,options]=await Promise.all([
  groups('country'),groups('path'),groups('source'),groups('device'),
  all("SELECT DATE(DATE_ADD(STR_TO_DATE(occurred_at, '%Y-%m-%dT%H:%i:%s.%fZ'), INTERVAL 330 MINUTE)) AS day,COUNT(*) AS views FROM analytics_events WHERE "+f.where+" AND kind='pageview' GROUP BY day ORDER BY day"),
  all('SELECT session,MIN(occurred_at) AS started,MAX(occurred_at) AS last,MIN(country) AS country,MIN(source) AS source,MIN(device) AS device,MAX(`returning`) AS `returning`,'+aggregate+' FROM analytics_events WHERE '+f.where+' GROUP BY session ORDER BY last DESC LIMIT 50'),
  all('SELECT DISTINCT country FROM analytics_events ORDER BY country',[])
 ]);
 return json({summary,countries,pages,sources,devices,daily,visits,from:f.from,to:f.to,options:{countries:options.map(r=>r.country),pages:Object.keys(htmlFiles).map(s=>s==='index'?'/':'/'+s).filter(publicPage).sort(),products}});
}
