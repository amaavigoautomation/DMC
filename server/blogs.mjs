import {can} from './user-access.mjs';
import dates from '../ARTICLE_DATES.json' with {type:'json'};
import profile from '../AUTHOR_PROFILE.json' with {type:'json'};
import editorialUpdate from './blog-editorial-update.json' with {type:'json'};
import {orderedBlogs} from './blog-ordering.mjs';
import {parseFragment} from 'parse5';
import seeds from './blog-seeds.json' with {type:'json'};
import {htmlFiles} from './generated.mjs';
import {siteOrigin} from './site-config.mjs';
import {adminSession} from './admin-auth.mjs';
export const blogCategories=['DMC24 Updates','Streamline Operations','Increase Revenue','AI & DMC24','Integrations'];
export const seedSlugs=new Set(seeds.map(p=>p.slug));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function cleanHtml(raw){
 const allowed=new Set(['p','h2','h3','strong','b','em','i','u','ul','ol','li','a','br','blockquote']);
 function walk(n){if(n.nodeName==='#text')return esc(n.value);if(['script','style','iframe','object','svg','math','template'].includes(n.tagName))return '';const inside=(n.childNodes||[]).map(walk).join('');if(n.tagName==='div')return '<p>'+inside+'</p>';if(!allowed.has(n.tagName))return inside;let attrs='';const get=k=>n.attrs?.find(a=>a.name===k)?.value;const id=get('id');if(id&&/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/.test(id))attrs+=' id="'+esc(id)+'"';if(n.tagName==='a'){const href=get('href')||'';if(/^(https:\/\/|mailto:|\/(?!\/)|[a-z0-9-]+\.html(?:#|$)|#[a-z0-9-]+)/i.test(href))attrs+=' href="'+esc(href)+'"';}return '<'+n.tagName+attrs+'>'+inside+(n.tagName==='br'?'':'</'+n.tagName+'>');}
 return parseFragment(raw).childNodes.map(walk).join('');
}
// One-time, revision-guarded content upgrade, separate from schema migrations.
export function updateExistingArticle(p){
 const patch=editorialUpdate.patches[p.slug];let body=p.bodyHtml;
 if(patch&&body.startsWith(patch.oldIntro))body=patch.newIntro+body.slice(patch.oldIntro.length);
 body=body.replace(/(<h[23][^>]*>[^<]*\?<\/h[23]>\s*)<p>([^]*?)<\/p>/g,(all,heading,answer)=>{
  const plain=answer.replace(/<[^>]*>/g,'').trim();
  return !/<(?:strong|b)\b/i.test(answer)&&plain.split(/\s+/).length<50?heading+'<p><strong>'+answer+'</strong></p>':all;
 });
 return {...p,...editorialUpdate.profile,bodyHtml:body,_authorEditorialVersion:1};
}
async function initAuthorBlogs(env){
 if(!await env.DB.prepare("SELECT id FROM blog_state WHERE id='seed-v1'").first()){
  const now=new Date().toISOString();await env.DB.batch([...seeds.map(p=>env.DB.prepareIgnore("INSERT INTO blog_posts(id,slug,draft,published,revision,published_revision,state,updated_at,published_at) VALUES(?,?,?,?,1,1,'published',?,?)").bind(p.id,p.slug,JSON.stringify(p),JSON.stringify(p),now,now)),env.DB.prepareIgnore("INSERT INTO blog_state(id) VALUES('seed-v1')")]);
 }
 if(await env.DB.prepare("SELECT id FROM blog_state WHERE id='author-editorial-v1'").first())return;
 const rows=(await env.DB.prepare('SELECT * FROM blog_posts').all()).results;
 const pending=rows.filter(r=>!JSON.parse(r.draft)._authorEditorialVersion);
 if(pending.length){
  const now=new Date().toISOString();
  const results=await env.DB.batch(pending.map(r=>env.DB.prepare('UPDATE blog_posts SET draft=?,published=?,revision=revision+1,published_revision=published_revision+?,updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify(updateExistingArticle(JSON.parse(r.draft))),r.published?JSON.stringify({...updateExistingArticle(JSON.parse(r.published)),modifiedAt:now}):null,r.published?1:0,now,r.id,r.revision)));
  // Another request may have upgraded a row first. Retry on the next request.
  if(results.some(r=>r.meta.changes!==1))return;
 }
 await env.DB.prepareIgnore("INSERT INTO blog_state(id) VALUES('author-editorial-v1')").run();
}
export async function initBlogs(env){
 await initAuthorBlogs(env);
 if(await env.DB.prepare("SELECT id FROM blog_state WHERE id='publication-dates-v1'").first())return;
 const rows=(await env.DB.prepare('SELECT * FROM blog_posts').all()).results;
 const pending=rows.filter(r=>dates[r.slug]&&(!JSON.parse(r.draft).publishedDate||(r.published&&!JSON.parse(r.published).publishedDate)));
 const fill=(raw,slug)=>{const p=JSON.parse(raw);return JSON.stringify({...p,publishedDate:p.publishedDate||dates[slug].publishedDate});};
 if(pending.length){const results=await env.DB.batch(pending.map(r=>env.DB.prepare('UPDATE blog_posts SET draft=?,published=?,revision=revision+1,published_revision=published_revision+? WHERE id=? AND revision=?').bind(fill(r.draft,r.slug),r.published?fill(r.published,r.slug):null,r.published?1:0,r.id,r.revision)));if(results.some(r=>r.meta.changes!==1))return;}
 await env.DB.prepareIgnore("INSERT INTO blog_state(id) VALUES('publication-dates-v1')").run();
}
function isVishal(p){return p.author===profile.author&&p.authorUrl?.replace(/\/$/,'')===profile.authorUrl.replace(/\/$/,'');}
function authorSchema(p){return {'@type':p.author==='DMC24 Editorial Team'?'Organization':'Person',...(isVishal(p)?{'@id':siteOrigin+'/vishal-shah#person',url:siteOrigin+'/vishal-shah'}:{}),name:p.author,...(p.authorBio?{description:p.authorBio}:{}),...(p.authorUrl&&safeAuthorUrl(p.authorUrl)?{...(isVishal(p)?{}:{url:p.authorUrl}),sameAs:[p.authorUrl]}:{})};}
export function renderAuthorArticles(html,rows){const list=rows.filter(r=>r.published&&isVishal(JSON.parse(r.published))).map(r=>{const p=JSON.parse(r.published);return '<li><a href="/'+esc(r.slug)+'">'+esc(p.title)+'</a></li>';}).join('');return html.replace(/<div id="author-articles">[^]*?<\/div>/,()=>'<div id="author-articles"><ul>'+list+'</ul></div>');}
export async function blogRecords(env){await initBlogs(env);return (await env.DB.prepare('SELECT * FROM blog_posts ORDER BY updated_at DESC,slug').all()).results;}
function view(row){return {id:row.id,slug:row.slug,draft:JSON.parse(row.draft),revision:row.revision,publishedRevision:row.published_revision,state:row.state,updated:row.updated_at,publishedAt:row.published_at,hasPublished:!!row.published};}
function safeAuthorUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
function authorBlock(p){return '<div class="author-bio" aria-label="About the author"><p class="author-bio-name">By '+(isVishal(p)?'<a href="/vishal-shah">'+esc(p.author)+'</a>':esc(p.author))+(p.publishedDate?' · <time datetime="'+esc(p.publishedDate)+'">'+esc(p.publishedDate)+'</time>':'')+'</p>'+(p.modifiedAt?'<p>Updated <time datetime="'+esc(p.modifiedAt)+'">'+esc(p.modifiedAt.slice(0,10))+'</time></p>':'')+(p.authorBio?'<p>'+esc(p.authorBio)+'</p>':'')+(p.authorUrl&&safeAuthorUrl(p.authorUrl)?'<a href="'+esc(p.authorUrl)+'" target="_blank" rel="noopener noreferrer">Author profile<span class="sr-only">: '+esc(p.author)+'</span></a>':'')+'</div>';}
function validate(p,publish=false){if(!p||typeof p!=='object')throw Error('Enter valid article content.');const out={};for(const [k,max]of Object.entries({title:160,slug:100,category:50,author:100,excerpt:400,bodyHtml:100000,seoTitle:100,description:240,image:200,alt:250,related:2000,publishedDate:10,ogTitle:100,ogDescription:240})){if(typeof p[k]!=='string'||p[k].length>max)throw Error('Invalid '+k+' (maximum '+max+' characters).');out[k]=p[k].trim();}for(const [k,max] of Object.entries({authorBio:600,authorUrl:500})){const value=p[k]??'';if(typeof value!=='string'||value.length>max)throw Error('Invalid '+k+' (maximum '+max+' characters).');out[k]=value.trim();}if(out.authorUrl&&!safeAuthorUrl(out.authorUrl))throw Error('Author profile must be a valid HTTPS URL without embedded credentials.');if(!out.title||!out.bodyHtml)throw Error('Title and article content are required.');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug)||/^(api|admin|assets|img|css|js|sitemap|robots)$/.test(out.slug))throw Error('Choose a valid article URL slug.');if(!blogCategories.includes(out.category))throw Error('Choose a blog category.');out.bodyHtml=cleanHtml(out.bodyHtml);if(!out.bodyHtml.replace(/<[^>]*>/g,'').trim())throw Error('Add article text.');if(out.image&&!/^\/api\/blog-media\/[a-f0-9-]{36}$/.test(out.image))throw Error('Upload an image through the editor.');if(out.related.split('\n').some(p=>p&&!/^\/[a-z0-9/-]+(?:#[a-z0-9-]+)?$/.test(p)))throw Error('Related links must be internal paths.');if(out.publishedDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(out.publishedDate)||Number.isNaN(Date.parse(out.publishedDate))||out.publishedDate>new Date().toISOString().slice(0,10)))throw Error('Publication date must be a valid date today or earlier. Scheduling is not enabled.');if(publish&&(!out.seoTitle||out.seoTitle.length>60||!out.description||out.description.length>160||out.image&&!out.alt||!out.author))throw Error('Publishing needs an author, SEO title up to 60 characters, description up to 160 and image alt text.');return out;}
export async function blogAdmin(req,env){
 const url=new URL(req.url);if(!['GET','POST'].includes(req.method))return json({error:'Method not allowed'},405);
 if(req.method==='POST'&&(req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json')))return json({error:'Request not allowed'},403);
 await initBlogs(env);
 if(url.pathname==='/api/admin/blogs'&&req.method==='GET')return json({articles:(await blogRecords(env)).map(view),categories:blogCategories});
 const m=url.pathname.match(/^\/api\/admin\/blogs\/([a-z0-9-]+)\/(save|publish|unpublish|archive)$/);if(!m||req.method!=='POST')return json({error:'Not found'},404);
 const raw=await req.text();if(raw.length>120000)return json({error:'Article is too large'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}if(!Number.isInteger(b.revision)||b.revision<0)return json({error:'Invalid revision'},400);
 const id=m[1],action=m[2],db=env.DB,row=await db.prepare('SELECT * FROM blog_posts WHERE id=?').bind(id).first();if((row?.revision||0)!==b.revision)return json({error:'This article changed in another session. Reload the library before saving.'},409);
 const now=new Date().toISOString();let result;
 if(action==='save'){
  let p;try{p=validate(b.article);}catch(e){return json({error:e.message},400)}
  if(row&&row.slug!==p.slug)return json({error:'The URL is locked after the first save to preserve links.'},400);
  if(htmlFiles[p.slug]&&!(row&&seedSlugs.has(row.slug)))return json({error:'This URL belongs to an existing website page.'},409);
  const duplicate=await db.prepare('SELECT id FROM blog_posts WHERE slug=? AND id<>?').bind(p.slug,id).first();if(duplicate)return json({error:'This URL is already used by another article.'},409);
  if(p.image&&!await db.prepare('SELECT id FROM blog_media WHERE id=?').bind(p.image.split('/').pop()).first())return json({error:'Upload the image again before saving.'},400);
  try{result=row?await db.prepare("UPDATE blog_posts SET draft=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?").bind(JSON.stringify(p),now,id,b.revision).run():await db.prepareIgnore("INSERT INTO blog_posts(id,slug,draft,revision,state,updated_at) VALUES(?,?,?,1,'draft',?)").bind(id,p.slug,JSON.stringify(p),now).run();}catch{return json({error:'Could not save. The URL may have been taken; reload and retry.'},409)}
 }else{
  if(!row)return json({error:'Save your article before publishing.'},400);
  if(action==='publish'){let p;try{p=validate(JSON.parse(row.draft),true);}catch(e){return json({error:e.message},400)}if(!p.publishedDate)p.publishedDate=now.slice(0,10);p.modifiedAt=now;result=await db.prepare("UPDATE blog_posts SET draft=?,published=?,published_revision=revision+1,revision=revision+1,state='published',published_at=COALESCE(published_at,?),updated_at=? WHERE id=? AND revision=?").bind(JSON.stringify(p),JSON.stringify(p),now,now,id,b.revision).run();}
  else result=await db.prepare('UPDATE blog_posts SET published=NULL,revision=revision+1,state=?,updated_at=? WHERE id=? AND revision=?').bind(action==='archive'?'archived':'draft',now,id,b.revision).run();
 }
 if(result.meta.changes!==1)return json({error:'This article changed. Reload before continuing.'},409);return json({article:view(await db.prepare('SELECT * FROM blog_posts WHERE id=?').bind(id).first())});
}
export async function uploadBlogImage(req,env){if(req.method!=='POST')return json({error:'Method not allowed'},405);if(req.headers.get('Origin')!==new URL(req.url).origin)return json({error:'Request not allowed'},403);const mime=req.headers.get('Content-Type');if(!['image/png','image/jpeg','image/webp'].includes(mime))return json({error:'Use a JPG, PNG or WebP image.'},400);if(Number(req.headers.get('Content-Length'))>2*1024*1024)return json({error:'Maximum image size is 2 MB.'},413);const data=await req.arrayBuffer();if(!data.byteLength||data.byteLength>2*1024*1024)return json({error:'Maximum image size is 2 MB.'},413);const a=new Uint8Array(data),str=(i,n)=>String.fromCharCode(...a.slice(i,i+n));if(!(mime==='image/png'&&a[0]===137&&str(1,3)==='PNG'||mime==='image/jpeg'&&a[0]===255&&a[1]===216&&a[2]===255||mime==='image/webp'&&str(0,4)==='RIFF'&&str(8,4)==='WEBP'))return json({error:'The file does not match its image type.'},400);const id=crypto.randomUUID();await env.BUCKET.put('blog-media/'+id,data,{httpMetadata:{contentType:mime}});await env.DB.prepare('INSERT INTO blog_media(id,mime,created_at) VALUES(?,?,?)').bind(id,mime,new Date().toISOString()).run();return json({url:'/api/blog-media/'+id});}
export async function blogImage(req,env,id){if(!['GET','HEAD'].includes(req.method)||!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});const pub=await env.DB.prepare("SELECT id FROM blog_posts WHERE published IS NOT NULL AND JSON_UNQUOTE(JSON_EXTRACT(published,'$.image'))=? LIMIT 1").bind('/api/blog-media/'+id).first();if(!pub&&!can(await adminSession(req,env),'blogs'))return new Response('Not found',{status:404});const obj=await env.BUCKET.get('blog-media/'+id);if(!obj)return new Response('Not found',{status:404});return new Response(req.method==='HEAD'?null:obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
function metadata(html,p,row){const canonical=siteOrigin+'/'+row.slug;const schema={'@context':'https://schema.org','@graph':[{'@type':'BlogPosting','headline':p.title,'description':p.description,'url':canonical,'mainEntityOfPage':canonical,'author':authorSchema(p),'publisher':{'@type':'Organization','@id':siteOrigin+'/#organization','name':'Puratech','url':siteOrigin+'/about-puratech'},...(p.publishedDate?{datePublished:p.publishedDate}:{}),...(p.modifiedAt?{dateModified:p.modifiedAt}:{}),...(p.image?{image:siteOrigin+p.image}:{})},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteOrigin+'/'},{'@type':'ListItem',position:2,name:'Blogs & Insights',item:siteOrigin+'/blogs'},{'@type':'ListItem',position:3,name:p.title,item:canonical}]}]};return html.replace(/<head>([\s\S]*?)<\/head>/,(_,head)=>'<head>'+head.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]*)"|property="og:[^"]*")[^>]*>/gi,'').replace(/<link[^>]*rel="canonical"[^>]*>/g,'').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'')+'<title>'+esc(p.seoTitle)+'</title><meta name="description" content="'+esc(p.description)+'"><link rel="canonical" href="'+canonical+'"><meta property="og:type" content="article"><meta property="og:title" content="'+esc(p.ogTitle||p.seoTitle)+'"><meta property="og:description" content="'+esc(p.ogDescription||p.description)+'"><meta property="og:url" content="'+canonical+'">'+(p.image?'<meta property="og:image" content="'+siteOrigin+p.image+'"><meta property="og:image:alt" content="'+esc(p.alt)+'">':'')+'<script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script></head>');}
export function renderBlog(row){const p=JSON.parse(row.published),template=htmlFiles[row.slug]||htmlFiles['international-market-control'];let html=template.replace(/data-page="[^"]*"/g,'data-page="cms-article"');html=html.replace(/<nav class="site-breadcrumbs"[\s\S]*?<\/nav>/g,'');const crumbs='<nav class="site-breadcrumbs" aria-label="Breadcrumb"><div class="container"><ol><li><a href="/">Home</a></li><li><a href="/blogs">Blogs &amp; Insights</a></li><li><span aria-current="page">'+esc(p.title)+'</span></li></ol></div></nav>';
 const related=(p.related||'').split('\n').filter(Boolean).map(path=>'<p><a href="'+esc(path)+'">'+esc(path.slice(1).replaceAll('-',' '))+'</a></p>').join('');
 const main='<main><article><header class="journal-hero"><div class="container"><div class="kicker">'+esc(p.category)+' · DMC24 Insights</div><h1>'+esc(p.title)+'</h1><p class="lead">'+esc(p.excerpt)+'</p>'+authorBlock(p)+'</div></header><div class="container editorial-layout"><div class="editorial-copy">'+(p.image?'<img class="cms-cover" src="'+esc(p.image)+'" alt="'+esc(p.alt)+'" decoding="async">':'')+cleanHtml(p.bodyHtml)+'</div><aside class="editorial-aside"><a class="editorial-back" href="/blogs">All DMC24 insights</a>'+(related?'<h2>Related pages</h2>'+related:'')+'<p><a href="/request-demo">Request a personalised demo</a></p></aside></div></article></main>';
 html=html.replace(/<main\b[\s\S]*?<\/main>/,()=>crumbs+main);return metadata(html,p,row);}
export function renderBlogList(html,rows,settings={overall:[],categories:{},featured:''}){
 const overall=orderedBlogs(rows,settings),categoryRanks={};for(const c of blogCategories)orderedBlogs(rows,settings,c).forEach((r,i)=>categoryRanks[r.id]=i);
 const feature=overall.find(r=>r.id===settings.featured),display=feature?[feature,...overall.filter(r=>r.id!==feature.id)]:overall;
 const cards=display.map(r=>{const p=JSON.parse(r.published),featured=r.id===feature?.id;return '<article class="journal-card'+(featured?' journal-card--featured':'')+'" data-journal-id="'+esc(r.id)+'" data-journal-overall="'+overall.findIndex(x=>x.id===r.id)+'" data-journal-rank="'+categoryRanks[r.id]+'" data-journal-featured="'+featured+'" data-journal-category="'+esc(p.category)+'">'+(featured?'<span class="journal-featured-label">Featured insight</span>':'')+(p.image?'<a href="/'+r.slug+'"><img class="cms-card-image" src="'+esc(p.image)+'" alt="'+esc(p.alt)+'" loading="lazy"></a>':'')+'<div class="journal-card-top"><span>'+esc(p.category)+'</span><span>Article</span></div><h3><a href="/'+r.slug+'">'+esc(p.title)+'</a></h3><p>'+esc(p.excerpt)+'</p><div class="journal-card-footer"><a href="/'+r.slug+'">Read article</a></div></article>';}).join('');
 html=html.replace(/(<p id="journal-count"[^>]*>).*?(<\/p>)/,(_,a,b)=>a+overall.length+' insights'+b);
 return html.replace(/<div class="journal-grid">[\s\S]*?<\/div>\s*<div class="journal-empty"/,()=>'<div class="journal-grid">'+cards+'</div><div class="journal-empty"');
}
