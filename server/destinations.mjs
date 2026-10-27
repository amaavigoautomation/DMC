import {siteOrigin} from './site-config.mjs';
import {validate,withLimits,validateSetup} from './pricing.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function visibility(env){const rows=await env.DB.prepare('SELECT slug,visible,revision FROM destination_visibility').all();return Object.fromEntries(rows.results.map(r=>[r.slug,r]));}
export function canonicalCountry(slug){return slug==='uae'?'dubai':slug==='kenya-users-review'?'kenya':slug;}
export function filterHtml(html,hidden){
 const blocked=new Set(hidden);const hiddenHref=href=>{try{const u=new URL(href,siteOrigin);if(u.origin!==siteOrigin)return false;let s=u.pathname.replace(/^\//,'').replace(/\.html$/,'').replace(/\/$/,'');if(s.startsWith('api/brochures/'))s=s.slice(14).replace(/\.pdf$/,'');if(s==='destinations'&&u.hash)s=u.hash.slice(1);return blocked.has(canonicalCountry(s));}catch{return false}};
 html=html.replace(/<a\b([^>]*\bhref=["']([^"']*)["'][^>]*)>[\s\S]*?<\/a>/gi,(whole,attrs,href)=>hiddenHref(href)?'':whole);
 return html.replace('</head>','<script type="application/json" id="destination-visibility">'+JSON.stringify(hidden).replace(/</g,'\\u003c')+'</script></head>');
}
export async function destinationApi(req,path,env,owner,catalog){
 if(path==='/api/pricing/admin/catalog'&&req.method==='GET'){
  const [vis,rows]=await Promise.all([visibility(env),env.DB.prepare('SELECT slug,revision FROM country_pricing').all()]);const revisions=Object.fromEntries(rows.results.map(r=>[r.slug,r.revision]));
  return json({countries:Object.entries(catalog).map(([slug,c])=>({slug,name:c.name,visible:vis[slug]?.visible!==0,visibilityRevision:vis[slug]?.revision||0,revision:revisions[slug]||0})).sort((a,b)=>a.name.localeCompare(b.name,'en'))});
 }
 const match=path.match(/^\/api\/pricing\/admin\/([a-z-]+)\/visibility$/);
 if(match&&req.method==='POST'){
  const slug=match[1];if(!catalog[slug])return json({error:'Destination not found'},404);
  const body=await req.json();if(typeof body.visible!=='boolean'||!Number.isInteger(body.revision)||body.revision<0)return json({error:'Invalid visibility setting'},400);
  const stamp=new Date().toISOString();let result;
  if(body.revision===0)result=await env.DB.prepareIgnore('INSERT INTO destination_visibility (slug,visible,revision,updated_by,updated_at) VALUES (?,?,1,?,?)').bind(slug,Number(body.visible),owner,stamp).run();
  else result=await env.DB.prepare('UPDATE destination_visibility SET visible=?,revision=revision+1,updated_by=?,updated_at=? WHERE slug=? AND revision=?').bind(Number(body.visible),owner,stamp,slug,body.revision).run();
  if(result.meta.changes!==1)return json({error:'Visibility changed in another session. Reload the manager and try again.'},409);
  return json({ok:true,visible:body.visible,revision:body.revision+1});
 }
 if(path==='/api/pricing/admin/bulk-copy'&&req.method==='POST'){
  const body=await req.json();if(!catalog[body.source]||!Number.isInteger(body.sourceRevision)||body.sourceRevision<1||!Array.isArray(body.targets)||!body.targets.length||body.targets.length>Object.keys(catalog).length||typeof body.publish!=='boolean')return json({error:'Choose a saved source and target destinations.'},400);
  if(body.copySetup!==undefined&&typeof body.copySetup!=='boolean')return json({error:'Invalid setup-fee copy option.'},400);
  const seen=new Set();for(const t of body.targets){if(!catalog[t.slug]||t.slug===body.source||seen.has(t.slug)||!Number.isInteger(t.revision)||t.revision<0)return json({error:'Invalid or duplicate destination selection.'},400);seen.add(t.slug)}
  const source=await env.DB.prepare('SELECT draft,setup_draft,revision FROM country_pricing WHERE slug=?').bind(body.source).first();if(!source||source.revision!==body.sourceRevision)return json({error:'The source draft changed. Reload it before copying.'},409);
  const sourcePlans=withLimits(JSON.parse(source.draft));const rows=await env.DB.prepare('SELECT slug,draft,setup_draft FROM country_pricing').all();const existing=Object.fromEntries(rows.results.map(r=>[r.slug,withLimits(JSON.parse(r.draft))]));
  const sourceSetup=source.setup_draft?JSON.parse(source.setup_draft):catalog[body.source].setupFees;const existingSetup=Object.fromEntries(rows.results.map(r=>[r.slug,r.setup_draft?JSON.parse(r.setup_draft):catalog[r.slug]?.setupFees]));
  const entries=[];try{for(const t of body.targets){const previous=existing[t.slug]||withLimits(catalog[t.slug].plans);const plans=sourcePlans.map((p,i)=>p.enabled&&catalog[t.slug].plans[i].enabled?{...p,enabled:true}:previous[i]);const priorSetup=existingSetup[t.slug]||catalog[t.slug].setupFees;const setup=body.copySetup?sourceSetup.map((p,i)=>p.enabled&&catalog[t.slug].setupFees[i].enabled?{...p,enabled:true,visible:priorSetup[i].visible!==false,priceVisible:priorSetup[i].priceVisible!==false}:priorSetup[i]):priorSetup;entries.push({slug:t.slug,expected:t.revision,draft:JSON.stringify(validate(plans,catalog[t.slug].plans)),setup:JSON.stringify(validateSetup(setup,catalog[t.slug].setupFees))});}}catch(e){return json({error:e.message},400)}
  const result=await env.DB.copyPricing({source:body.source,sourceRevision:body.sourceRevision,entries,publish:body.publish,owner,now:new Date().toISOString()});
  if(result.meta.changes!==entries.length)return json({error:'A source or target draft changed in another session. Nothing was copied. Reload the selection and retry.'},409);
  return json({ok:true,count:entries.length,published:body.publish});
 }
 return null;
}
