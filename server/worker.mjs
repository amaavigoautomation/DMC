import {allowedPage,allowedApi,can} from './user-access.mjs';
import {userManagement} from './user-management.mjs';
import {emailAdmin,verifyBrochureToken} from './email-automation.mjs';
import {pricingReview} from './pricing-review.mjs';
import {renderPublishedPricing,publicPricing} from './published-pricing.mjs';
import {readBlogOrder,blogOrderApi} from './blog-ordering.mjs';
import {blogAdmin,uploadBlogImage,blogImage,blogRecords,renderBlog,renderBlogList,renderAuthorArticles,seedSlugs,blogCategories} from './blogs.mjs';
import {demoApi} from './demo-requests.mjs';
import {seoAdminApi,publishedSeo,applySeo} from './seo-management.mjs';
import {seoResponse} from './seo.mjs';
import {adminSession,authApi,privatePage,privateApi,loginPage,registry,protectHeaders} from './admin-auth.mjs';
import {analyticsApi} from './analytics.mjs';
import {brochureApi,brochureFromPath,download} from './brochure-access.mjs';
import {brochures,demoQR} from './brochures-generated.mjs';
import {renderBrochure} from './brochures.mjs';
import {visibility,canonicalCountry,filterHtml,destinationApi} from './destinations.mjs';
import {catalog,htmlFiles} from './generated.mjs';
import {dbStore,validate,effective,withLimits,validateSetup,effectiveSetup} from './pricing.mjs';
const response=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {async fetch(req,env,ctx){
 const url=new URL(req.url),path=url.pathname.replace(/\/$/,'')||'/';
 // Consolidate public page aliases only; preserve private auth flows and API methods.
 if(['GET','HEAD'].includes(req.method)){
  const rawSlug=path.slice(1).replace(/\.html$/,'');
  if(htmlFiles[rawSlug]&&!privatePage(path)&&!loginPage(path)){
   const canonical=rawSlug==='index'?'/':rawSlug==='uae'?'/dubai':'/'+rawSlug;
   if(url.pathname!==canonical)return new Response(null,{status:301,headers:{Location:canonical+url.search,'Cache-Control':'public, max-age=3600'}});
  }
 }
 if(path==='/sitemap.xml'||path==='/robots.txt')return seoResponse(req,env,htmlFiles);
 let adminIdentity=null,session=null;
 const protectedPage=privatePage(path),protectedApi=privateApi(path),isLogin=loginPage(path);
 try{
  if(path.startsWith('/api/auth/'))return await authApi(req,env);
  if(protectedPage||protectedApi||isLogin){session=await adminSession(req,env);adminIdentity=session?.id||null;}
 }catch(e){console.error('Admin authentication unavailable',e.message);return response({error:'Admin login is temporarily unavailable. Please retry.'},503);}
 if((protectedPage||protectedApi)&&!adminIdentity){
  if(protectedApi)return response({error:'Your admin session has expired. Please log in again.'},401);
  return new Response(null,{status:302,headers:{Location:'/admin/login?returnTo='+encodeURIComponent(path),'Cache-Control':'no-store'}});
 }
 if((protectedPage&&!allowedPage(session,path))||(protectedApi&&!await allowedApi(session,req,env)))return new Response(protectedApi?JSON.stringify({error:'You do not have permission for this action.'}):'Access denied. Return to /admin to open your assigned modules.',{status:403,headers:{'Content-Type':protectedApi?'application/json':'text/plain','Cache-Control':'no-store'}});
 if(path==='/api/admin/users')return userManagement(req,env,session);
 // Keep login available for one-time password setup links, including when another account has a session.
 if(path.startsWith('/api/admin/email/')){try{return await emailAdmin(req,env);}catch{console.error('Email admin operation unavailable');return response({error:'Email operation unavailable. Please reload or check the connection settings.'},503);}}
 if(path==='/api/email-brochure'&&['GET','HEAD'].includes(req.method)){const id=await verifyBrochureToken(url.searchParams.get('token'),env);if(!id)return new Response('This brochure link is invalid or expired. Please request a new brochure at /brochures.',{status:410,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});try{return await download(req,env,id,true);}catch{return new Response('Brochure temporarily unavailable. Please retry.',{status:503});}}
 if(/^\/api\/admin\/blogs\/order(?:\/(?:draft|publish))?$/.test(path)){try{return await blogOrderApi(req,env,await blogRecords(env),blogCategories);}catch(e){console.error('Blog ordering failed',e.message);return response({error:'Display order is temporarily unavailable. Please retry.'},503);}}
 if(path==='/api/admin/blog-media'||path.startsWith('/api/admin/blogs')){try{return path==='/api/admin/blog-media'?await uploadBlogImage(req,env):await blogAdmin(req,env);}catch(e){console.error('Blog admin failed',e.message);return response({error:'Blog management is temporarily unavailable. Your edits are still in the editor; please retry.'},503);}}
 if(path.startsWith('/api/blog-media/')){try{return await blogImage(req,env,path.split('/').pop());}catch{return response({error:'Image temporarily unavailable'},503);}}
 if(path.startsWith('/api/admin/seo/')){try{return await seoAdminApi(req,env);}catch(e){console.error('SEO management unavailable',e.message);return response({error:'SEO settings are temporarily unavailable. Please retry.'},503);}}
 if(path.startsWith('/api/demo-')||path.startsWith('/api/admin/demo-')){try{return await demoApi(req,env,!!adminIdentity,ctx);}catch(e){console.error('Demo request failed',e.message);return response({error:'We could not save or load the request. Please retry.'},503);}}
 const adminPage=['/plan-management-review','/plan-management-review.html','/plan-management'].includes(path);
 if(path.startsWith('/api/analytics/')){try{return await analyticsApi(req,env,path==='/api/analytics/events'?!!await adminSession(req,env):!!adminIdentity);}catch(e){console.error('Analytics failed',e.message);return response({error:'Analytics is temporarily unavailable. Please retry.'},503);}}
 if(path.startsWith('/api/brochure-')||path.startsWith('/api/brochures/')||brochureFromPath(path)){
  try{const id=brochureFromPath(path);if(id){if(!['GET','HEAD'].includes(req.method))return response({error:'Method not allowed'},405);return await download(req,env,id);}return await brochureApi(req,env,!!adminIdentity,ctx);}
  catch(e){console.error('Brochure request failed',e.message);return response({error:'We could not prepare your download. Please retry shortly.'},503);}
 }
 if(path.startsWith('/api/pricing')){
  try{
   const admin=path.startsWith('/api/pricing/admin');
   if(admin&&!adminIdentity)return response({error:'Please log in to the admin panel.'},401);
   if(!['GET','POST'].includes(req.method))return response({error:'Method not allowed'},405);
   if(req.method==='POST'&&(!admin||req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json')))return response({error:'Request not allowed'},403);
   if(admin){const extra=await destinationApi(req,path,env,adminIdentity,catalog);if(extra)return extra;}
   const m=path.match(/^\/api\/pricing\/(admin\/)?([a-z-]+)(?:\/(draft|publish))?$/);if(!m||!catalog[m[2]])return response({error:'Country not found'},404);
   const slug=m[2],base=catalog[slug],db=dbStore(env);
   if(!admin&&(await visibility(env))[slug]?.visible===0)return response({error:'Destination unavailable'},404);
   if(req.method==='GET'){
    if(!admin)return response(await publicPricing(env,slug,base));
    const row=await db.read(slug);const published=withLimits(row?.published?JSON.parse(row.published):base.plans);
    const setupFees=row?.setup_draft?JSON.parse(row.setup_draft):base.setupFees,publishedSetupFees=row?.setup_published?JSON.parse(row.setup_published):base.setupFees;
    return response(admin?{setupFees,publishedSetupFees,name:base.name,plans:withLimits(row?JSON.parse(row.draft):base.plans),published,revision:row?.revision||0,publishedRevision:row?.published_revision||0,publishedAt:row?.published_at||null}:{setupFees:effectiveSetup(publishedSetupFees),name:base.name,plans:effective(published),revision:row?.published_revision||0});
   }
   if(!admin||!m[3])return response({error:'Not found'},404);
   const raw=await req.text();if(raw.length>20000)return response({error:'Request too large'},413);
   let body;try{body=JSON.parse(raw)}catch{return response({error:'Invalid JSON'},400)}
   if(!Number.isInteger(body.revision)||body.revision<0)return response({error:'Invalid revision'},400);
   let result;
   if(m[3]==='draft'){
    let plans,setupFees;try{plans=validate(body.plans,base.plans);const row=await db.read(slug);setupFees=validateSetup(body.setupFees??(row?.setup_draft?JSON.parse(row.setup_draft):base.setupFees),base.setupFees,row?.setup_draft?JSON.parse(row.setup_draft):base.setupFees)}catch(e){return response({error:e.message},400)}
    result=body.revision===0?await db.save(slug,plans,body.revision,adminIdentity,setupFees):await db.update(slug,plans,body.revision,adminIdentity,setupFees);
   }else result=await db.publish(slug,body.revision,adminIdentity);
   if(result.meta.changes!==1)return response({error:'This destination changed in another session. Reload it before saving or publishing.'},409);
   return response({ok:true,revision:m[3]==='draft'?body.revision+1:body.revision});
  }catch(e){console.error('Pricing request failed',e.message);return response({error:'Pricing is temporarily unavailable. Your edits have been kept; please retry.'},503)}
 }
 const slug=isLogin?'admin-login':adminPage?'plan-management-review':path==='/'?'index':path.slice(1).replace(/\.html$/,'');
 let cmsRows=null;
 if(!protectedPage&&!isLogin&&!path.startsWith('/api/')&&/^\/[a-z0-9-]+(?:\.html)?$/.test(path)&&['GET','HEAD'].includes(req.method)&&(!htmlFiles[slug]||seedSlugs.has(slug)||slug==='blogs')){
  try{cmsRows=await blogRecords(env);const row=cmsRows.find(r=>r.slug===slug);if(row){if(!row.published)return new Response('Article not found',{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});if(url.pathname!=='/'+slug)return new Response(null,{status:301,headers:{Location:'/'+slug+url.search}});const hidden=Object.entries(await visibility(env)).filter(([,v])=>v.visible===0).map(([s])=>s);const html=filterHtml(renderBlog(row),hidden);return new Response(req.method==='HEAD'?null:html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});}}
  catch(e){console.error('Blog delivery unavailable',e.message);return new Response('Articles are temporarily unavailable. Please retry.',{status:503,headers:{'Cache-Control':'no-store'}});}
 }
 if(htmlFiles[slug]){
  try{const vis=adminPage?{}:await visibility(env);if(vis[canonicalCountry(slug)]?.visible===0)return new Response('This destination is currently unavailable.',{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
   const hidden=Object.keys(vis).filter(s=>vis[s].visible===0);let html=adminPage?htmlFiles[slug]:filterHtml(htmlFiles[slug],hidden);
   if(['pricing','pricing-country-review'].includes(slug))html=await pricingReview(html,url.searchParams.get('country')||'',catalog,htmlFiles,vis,env,'/'+slug);
   if(slug==='vishal-shah')html=renderAuthorArticles(html,await blogRecords(env));
   if(catalog[slug]&&!protectedPage&&!isLogin)html=await renderPublishedPricing(html,slug,catalog[slug],env);
   if(slug==='blogs'&&cmsRows)html=renderBlogList(html,cmsRows,(await readBlogOrder(env)).published);
   if(!protectedPage&&!isLogin)html=applySeo(html,slug,await publishedSeo(env,slug));
   if((protectedPage||isLogin)&&!/<base\b/i.test(html))html=html.replace('<head>','<head><base href="/">');
   if(protectedPage)html=html.replace('</head>','<script type="application/json" id="admin-permissions">'+JSON.stringify({name:session.name,superAdmin:session.superAdmin,permissions:session.permissions}).replace(/</g,'\\u003c')+'</script>'+'<script type="application/json" id="admin-navigation">'+JSON.stringify(registry.filter(r=>allowedPage(session,r.path))).replace(/</g,'\\u003c')+'</script></head>');
   return new Response(req.method==='HEAD'?null:html,{headers:(protectedPage||isLogin)?protectHeaders():{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  }catch(e){console.error('Destination visibility unavailable',e.message);return new Response('The website is temporarily unavailable. Please try again.',{status:503,headers:{'Cache-Control':'no-store'}})}
 }
 if(env.ASSETS)return env.ASSETS.fetch(req);
 return new Response('Not found',{status:404});
}};
