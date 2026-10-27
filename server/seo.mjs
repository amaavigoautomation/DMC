import {blogRecords,seedSlugs} from './blogs.mjs';
import {siteOrigin,pageUrl} from './site-config.mjs';
import {privatePage,loginPage} from './admin-auth.mjs';
import {visibility,canonicalCountry} from './destinations.mjs';
export const indexable=(slug,html)=>!privatePage('/'+slug)&&!loginPage('/'+slug)&&!/(?:preview|review)/.test(slug)&&slug!=='uae'&&!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export async function seoResponse(req,env,files){
 const robots=new URL(req.url).pathname==='/robots.txt';
 let body;
 if(robots)body='User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: '+siteOrigin+'/sitemap.xml\n';
 else {try{const blogRows=await blogRecords(env);const hidden=await visibility(env);const rows=await env.DB.prepare('SELECT slug,published FROM page_seo WHERE published IS NOT NULL').all();const settings=Object.fromEntries(rows.results.map(r=>[r.slug,JSON.parse(r.published)]));body='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+Object.entries(files).filter(([s,h])=>!seedSlugs.has(s)&&indexable(s,h)&&hidden[canonicalCountry(s)]?.visible!==0&&settings[s]?.index!==false&&settings[s]?.sitemap!==false&&(!settings[s]?.canonical||settings[s].canonical===(s==='index'?'/':'/'+s))).map(([s])=>'<url><loc>'+escape(pageUrl(s))+'</loc></url>').join('')+blogRows.filter(r=>r.published).map(r=>'<url><loc>'+escape(pageUrl(r.slug))+'</loc></url>').join('')+'</urlset>';}catch{return new Response('Sitemap temporarily unavailable',{status:503});}}
 return new Response(req.method==='HEAD'?null:body,{headers:{'Content-Type':robots?'text/plain; charset=utf-8':'application/xml; charset=utf-8','Cache-Control':'no-store'}});
}
