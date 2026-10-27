import {seedSlugs} from './blogs.mjs';
import {seoCatalog} from './generated.mjs';
import {siteOrigin,pageUrl} from './site-config.mjs';
import {visibility} from './destinations.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const merge=(slug,data)=>({...seoCatalog[slug].defaults,...data});
export function validateSeo(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Enter valid SEO settings.');
 const out={};
 for(const [key,max]of Object.entries({title:200,description:500,h1:200,keyword:200,breadcrumb:100,canonical:150,ogTitle:200,ogDescription:500,ogImage:2048,ogImageAlt:250})){
  if(typeof input[key]!=='string'||input[key].length>max||/[\u0000-\u001f\u007f]/.test(input[key]))throw Error('Invalid '+key+' field (maximum '+max+' characters).');out[key]=input[key].trim();
 }
 if(!out.title||!out.description)throw Error('Title and description are required.');
 if(out.canonical&&!Object.values(seoCatalog).some(p=>p.path===out.canonical))throw Error('Canonical must be an existing public page selected from the list.');
 if(out.ogImage){let u;try{u=new URL(out.ogImage,siteOrigin);}catch{throw Error('Enter a valid social image URL.');}if(u.protocol!=='https:'||u.username||u.password||(!out.ogImage.startsWith('https://')&&!/^\/(?!\/)/.test(out.ogImage)))throw Error('Social image must use HTTPS or a root-relative path.');}
 for(const key of ['index','follow','sitemap']){if(typeof input[key]!=='boolean')throw Error('Invalid '+key+' option.');out[key]=input[key];}
 return out;
}
export async function publishedSeo(env,slug){
 if(!seoCatalog[slug])return null;
 const row=await env.DB.prepare('SELECT published FROM page_seo WHERE slug=?').bind(slug).first();
 return row?.published?merge(slug,JSON.parse(row.published)):null;
}
export async function seoAdminApi(req,env){
 const url=new URL(req.url),path=url.pathname;
 if(!['GET','POST'].includes(req.method))return json({error:'Method not allowed'},405);
 if(req.method==='POST'&&(req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json')))return json({error:'Request not allowed'},403);
 if(path==='/api/admin/seo/catalog'&&req.method==='GET'){
  const [rows,vis]=await Promise.all([env.DB.prepare('SELECT slug,revision,published_revision,published,updated_at,published_at FROM page_seo').all(),visibility(env)]);
  const records=Object.fromEntries(rows.results.map(r=>[r.slug,r]));
  return json({origin:siteOrigin,pages:Object.entries(seoCatalog).filter(([slug])=>!seedSlugs.has(slug)).map(([slug,p])=>{const row=records[slug],live=row?.published?merge(slug,JSON.parse(row.published)):p.defaults;return {slug,path:p.path,label:p.label,category:p.category,title:live.title,index:live.index,visible:vis[slug]?.visible!==0,revision:row?.revision||0,publishedRevision:row?.published_revision||0,publishedAt:row?.published_at||null};}).sort((a,b)=>a.label.localeCompare(b.label,'en'))});
 }
 const m=path.match(/^\/api\/admin\/seo\/([a-z0-9-]+)(?:\/(draft|publish))?$/);
 if(m&&seedSlugs.has(m[1]))return json({error:'Manage article SEO in Blog Management so it publishes with the article.'},400);
 if(!m||!seoCatalog[m[1]])return json({error:'Public page not found'},404);
 const slug=m[1],base=seoCatalog[slug],db=env.DB;
 const row=await db.prepare('SELECT * FROM page_seo WHERE slug=?').bind(slug).first();
 if(req.method==='GET'&&!m[2])return json({...base,slug,draft:row?merge(slug,JSON.parse(row.draft)):base.defaults,published:row?.published?merge(slug,JSON.parse(row.published)):base.defaults,revision:row?.revision||0,publishedRevision:row?.published_revision||0,publishedAt:row?.published_at||null});
 if(req.method!=='POST'||!m[2])return json({error:'Method not allowed'},405);
 const raw=await req.text();if(raw.length>12000)return json({error:'Settings are too large'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
 if(!Number.isInteger(body.revision)||body.revision<0)return json({error:'Invalid revision'},400);
 const stamp=new Date().toISOString();let result;
 if(m[2]==='draft'){
  let draft;try{draft=validateSeo(body.settings)}catch(e){return json({error:e.message},400)}
  result=body.revision===0
   ?await db.prepareIgnore('INSERT INTO page_seo (slug,draft,revision,updated_by,updated_at) VALUES (?,?,1,?,?)').bind(slug,JSON.stringify(draft),'admin',stamp).run()
   :await db.prepare('UPDATE page_seo SET draft=?,revision=revision+1,updated_by=?,updated_at=? WHERE slug=? AND revision=?').bind(JSON.stringify(draft),'admin',stamp,slug,body.revision).run();
 }else{
  if(!row||row.revision!==body.revision)return json({error:'This page changed. Reload it before publishing.'},409);
  const settings=validateSeo(JSON.parse(row.draft));
  if(settings.canonical){const target=Object.entries(seoCatalog).find(([,p])=>p.path===settings.canonical)?.[0];const vis=await visibility(env);if(vis[target]?.visible===0)return json({error:'The canonical target is a hidden destination. Choose a visible page.'},400);}
  result=await db.prepare('UPDATE page_seo SET published=draft,published_revision=revision,published_at=?,updated_by=? WHERE slug=? AND revision=?').bind(stamp,'admin',slug,body.revision).run();
 }
 if(result.meta.changes!==1)return json({error:'This page changed in another session. Reload before saving or publishing.'},409);
 return json({ok:true,revision:body.revision+(m[2]==='draft'?1:0)});
}
export function applySeo(html,slug,s){
 if(!s||!seoCatalog[slug])return html;
 const canonical=s.canonical?siteOrigin+s.canonical:pageUrl(slug),robots=(s.index?'index':'noindex')+','+(s.follow?'follow':'nofollow');
 // Restrict replacements to the head so page content cannot be interpreted as metadata.
 html=html.replace(/<head>([\s\S]*?)<\/head>/i,(_,head)=>{
  head=head.replace(/<title>[\s\S]*?<\/title>/i,()=>'<title>'+esc(s.title)+'</title>');
  head=head.replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']*)["']|property=["']og:[^"']*["'])[^>]*>/gi,'');
  head=head.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
  head=head.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(whole,raw)=>{
   const data=JSON.parse(raw);for(const node of data['@graph']||[]){
    if(node['@id']?.endsWith('#webpage')){node.name=s.title;node.description=s.description;}
    if(node['@type']==='Article'){node.headline=s.h1||seoCatalog[slug].heading;node.description=s.description;}
    if(node['@type']==='BreadcrumbList'&&s.breadcrumb)node.itemListElement.at(-1).name=s.breadcrumb;
   }return '<script type="application/ld+json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>';
  });
  let tags='<meta name="description" content="'+esc(s.description)+'"><meta name="robots" content="'+robots+'"><link rel="canonical" href="'+esc(canonical)+'">';
  const meta=(attr,key,value)=>'<meta '+attr+'="'+key+'" content="'+esc(value)+'">';
  for(const [key,value]of Object.entries({'og:title':s.ogTitle||s.title,'og:description':s.ogDescription||s.description,'og:url':canonical,'og:type':seoCatalog[slug].schemaTypes.includes('Article')?'article':'website','og:site_name':'DMC24'}))tags+=meta('property',key,value);
  tags+=meta('name','twitter:card',s.ogImage?'summary_large_image':'summary')+meta('name','twitter:title',s.ogTitle||s.title)+meta('name','twitter:description',s.ogDescription||s.description);
  if(s.ogImage){const image=new URL(s.ogImage,siteOrigin).href;tags+=meta('property','og:image',image)+meta('name','twitter:image',image);if(s.ogImageAlt)tags+=meta('property','og:image:alt',s.ogImageAlt)+meta('name','twitter:image:alt',s.ogImageAlt);}
  const overrides=JSON.stringify({h1:s.h1,breadcrumb:s.breadcrumb}).replaceAll('<','\\u003c');
  return '<head>'+head+tags+'<script type="application/json" id="published-page-seo">'+overrides+'</script></head>';
 });
 if(s.h1)html=html.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/i,(_,open)=>open+esc(s.h1)+'</h1>');
 if(s.breadcrumb)html=html.replace(/(<nav class="site-breadcrumbs"[\s\S]*?<span aria-current="page">)[\s\S]*?(<\/span>)/,(_,open,end)=>open+esc(s.breadcrumb)+end);
 return html;
}
