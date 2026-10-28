import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/minify-assets.cjs'],{stdio:'inherit'});
import {siteOrigin} from '../server/site-config.mjs';
try{execFileSync('python3',['scripts/generate-seo-structure.py'],{stdio:'inherit'});}catch(error){
 if(error.code!=='ENOENT')throw error;
 const manifest=JSON.parse(fs.readFileSync('SEO_SCHEMA_MANIFEST.json','utf8'));
 if(Object.values(manifest).some(p=>new URL(p.canonical).origin!==siteOrigin))throw Error('Regenerate SEO with Python before changing the production origin.');
 console.log('Using committed SEO output (Python unavailable); canonical origin validated.');
}
import {securePdfs} from './secure-brochure-assets.mjs';
import {expandIncludes} from './includes.mjs';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import QRCode from 'qrcode';
import {brochureContent} from './brochure-content.mjs';
const js=fs.readFileSync('website/js/main.js','utf8');
const routes=Object.entries(JSON.parse(js.match(/const pageModules=(\{.*\});/)[1])).filter(([,v])=>v.includes('common-destination-pricing')).map(([s])=>s);
const trails=JSON.parse(fs.readFileSync('BREADCRUMBS.json','utf8'));
const catalog={};const brochures={};
for(const slug of routes){if(slug==='uae'||slug.endsWith('-review'))continue;const dom=new JSDOM(expandIncludes(fs.readFileSync('website/'+slug+'.html','utf8')),{runScripts:'outside-only',url:'https://example.com/'+slug});Object.defineProperty(dom.window.document,'currentScript',{value:dom.window.document.querySelector('script[src]')});dom.window.fetch=async()=>({ok:false});dom.window.eval(js.replaceAll(',"live-destination-pricing"','').replaceAll(',"user-slider-review"',''));const doc=dom.window.document;const cards=[...doc.querySelectorAll('main .sl-plan')];catalog[slug]={name:trails[slug]?.at(-1)?.name||slug,plans:['Business','Professional','Professional Plus'].map((name,i)=>{const card=cards.find(c=>c.querySelector('h3').textContent.trim()===name);return {enabled:!!card,users:card?Number(card.textContent.match(/(?:Up to|Minimum)\s+(\d+)\s+users/i)?.[1]||[5,10,20][i]):[5,10,20][i],monthly:[350,550,950][i],yearly:[3600,6000,10800][i],extra:'',extraYearly:'',discount:0,from:'',to:''};})};catalog[slug].setupFees=['Business','Professional','Professional Plus','Enterprise'].map(name=>{const card=cards.find(c=>c.querySelector('h3').textContent.trim()===name);const text=card?.querySelector('.sl-setup-fee')?.textContent||'';const amount=text.match(/USD\s*([\d,]+(?:\.\d+)?)/i);if(card&&!amount&&!/none|no setup/i.test(text))throw Error('Missing setup fee for '+slug+' '+name);return {enabled:!!card,fee:amount?Number(amount[1].replaceAll(',','')):0,discount:0,from:'',to:''};});brochures[slug]=brochureContent(doc,slug,catalog[slug].name);dom.window.close();}
for(const c of Object.values(catalog))c.plans.forEach((p,i)=>p.maxUsers=Math.max(p.users,[5,20,50][i]));
const demoQR=QRCode.create(siteOrigin+'/request-demo',{errorCorrectionLevel:'M'});
fs.writeFileSync('server/brochures-generated.mjs','export const brochures='+JSON.stringify(brochures)+';\nexport const demoQR='+JSON.stringify({size:demoQR.modules.size,data:[...demoQR.modules.data]})+';');
const htmlFiles={};for(const file of fs.readdirSync('website').filter(f=>f.endsWith('.html')))htmlFiles[file.slice(0,-5)]=expandIncludes(fs.readFileSync('website/'+file,'utf8'));
// Materialize existing JS-authored content for crawlers without changing its design.
for(const slug of ['how-to-adopt-dmc24','seychelles','saudi-arabia','about-puratech']){
 const dom=new JSDOM(htmlFiles[slug],{runScripts:'outside-only',url:siteOrigin+'/'+slug});
 Object.defineProperty(dom.window.document,'currentScript',{value:dom.window.document.querySelector('script[src]')});
 dom.window.fetch=async()=>({ok:false});dom.window.eval(js);
 htmlFiles[slug]=dom.serialize();dom.window.close();
}
// Keep editorial content identical in initial HTML and hydrated country/product pages.
for(const slug of [...Object.keys(catalog),'features','benefits','pricing','resources']){
 const dom=new JSDOM(htmlFiles[slug],{runScripts:'outside-only',url:siteOrigin+'/'+slug});
 Object.defineProperty(dom.window.document,'currentScript',{value:dom.window.document.querySelector('script[src]')});
 dom.window.fetch=async()=>({ok:false});
 dom.window.eval(js.replaceAll(',"user-slider-review"',''));
 const main=dom.window.document.querySelector('main');
 htmlFiles[slug]=htmlFiles[slug].replace(/<main\b[^]*?<\/main>/,()=>main.outerHTML);
 dom.window.close();
}
const emailCountries={};
for(const [slug,c] of Object.entries(catalog)){
 const doc=new JSDOM(htmlFiles[slug]).window.document;
 const rows=[...doc.querySelectorAll('.sl-plan-includes li, .sl-plan li, .price-card li')].map(n=>n.textContent.trim());
 const preferred=rows.filter(t=>/imprest|park fee|nationality|sic transfer|sic services|offer management|allotment|resort|seaplane|mileage|entrance fee/i.test(t));
 const fallback=rows.filter(t=>/contract|quotation|transportation|logistics|receivable|profit|booking management/i.test(t));
 emailCountries[slug]={name:c.name,benefits:[...new Set([...preferred,...fallback])].slice(0,3)};
 if(!emailCountries[slug].benefits.length)emailCountries[slug].benefits=['Connected quotations and bookings','Supplier reservations and operations','Operational finance and reporting'];
}
fs.writeFileSync('server/email-countries-generated.mjs','export const emailCountries='+JSON.stringify(emailCountries)+';\n');
const brochureCards=Object.values(brochures).sort((a,b)=>a.name.localeCompare(b.name,'en')).map(c=>`<a class="brochure-card" href="/api/brochures/${c.slug}.pdf" download="DMC24-${c.slug}-Brochure.pdf"><h3>${c.name}</h3><p>Destination features, product workflow and plan comparison.</p><span>Download brochure · PDF · 6 pages</span></a>`).join('');
htmlFiles.brochures=htmlFiles.brochures.replace('<!--destination-brochures-->',brochureCards);
// Pre-render the shared menu-derived footer for crawlability and no-JS visitors.
const countryData=JSON.stringify(Object.entries(catalog).map(([slug,c])=>({slug,name:c.name}))).replace(/</g,'\\u003c');
const footerDom=new JSDOM(htmlFiles.index.replace('</head>','<script type="application/json" id="footer-countries">'+countryData+'</script></head>'),{runScripts:'outside-only',url:'https://example.com/'});
Object.defineProperty(footerDom.window.document,'currentScript',{value:footerDom.window.document.querySelector('script[src]')});footerDom.window.fetch=async()=>({ok:false});footerDom.window.eval(js);
const sharedFooter=footerDom.window.document.querySelector('.site-footer').outerHTML;footerDom.window.close();
const privateSlugs=JSON.parse(fs.readFileSync('server/admin-registry.json','utf8')).map(p=>p.path.slice(1));
for(const key of Object.keys(htmlFiles)){
 if(privateSlugs.includes(key)||['admin','admin-login'].includes(key))continue;
 htmlFiles[key]=htmlFiles[key].replace('</head>','<script type="application/json" id="footer-countries">'+countryData+'</script></head>');
 if(/<footer\b/.test(htmlFiles[key]))htmlFiles[key]=htmlFiles[key].replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g,sharedFooter);
}

// Mark up only visible, explicit answers; exclude navigation cards and controls.
for(const slug of [...Object.keys(catalog),'how-to-adopt-dmc24','pricing']){
 const dom=new JSDOM(htmlFiles[slug]),doc=dom.window.document;
 const pairs=[...doc.querySelectorAll('main .editorial-answer')].filter(p=>p.previousElementSibling?.matches('h2,h3')&&!p.closest('a')).map(p=>({'@type':'Question',name:p.previousElementSibling.textContent.trim(),acceptedAnswer:{'@type':'Answer',text:p.textContent.trim()}}));
 if(pairs.length){const block=doc.querySelector('script[type="application/ld+json"]'),data=JSON.parse(block.textContent);data['@graph']=data['@graph'].filter(n=>n['@id']!==siteOrigin+'/'+slug+'#faq');data['@graph'].push({'@type':'FAQPage','@id':siteOrigin+'/'+slug+'#faq',url:siteOrigin+'/'+slug,mainEntity:pairs});block.textContent=JSON.stringify(data).replaceAll('<','\\u003c');htmlFiles[slug]=dom.serialize();}
 dom.window.close();
}
const seoCatalog={};
for(const [slug,html] of Object.entries(htmlFiles)){
 if(privateSlugs.includes(slug)||['admin','admin-login','uae'].includes(slug)||/preview|review/.test(slug))continue;
 const dom=new JSDOM(html),doc=dom.window.document;if(doc.querySelector('meta[name="robots"]')?.content.includes('noindex')){dom.window.close();continue;}
 const graphs=[...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(el=>JSON.parse(el.textContent)['@graph']||[]);
 seoCatalog[slug]={path:slug==='index'?'/':'/'+slug,label:trails[slug]?.at(-1)?.name||slug,heading:doc.querySelector('h1')?.textContent.trim()||'',schemaTypes:[...new Set(graphs.map(n=>n['@type']))],category:catalog[slug]?'Destinations':graphs.some(n=>n['@type']==='Article')?'Articles':'Website',defaults:{title:doc.title,description:doc.querySelector('meta[name="description"]')?.content||'',h1:'',keyword:'',breadcrumb:'',canonical:'',index:true,follow:true,sitemap:true,ogTitle:'',ogDescription:'',ogImage:'',ogImageAlt:''}};
 dom.window.close();
}
fs.writeFileSync('server/generated.mjs','export const catalog='+JSON.stringify(catalog)+';\nexport const htmlFiles='+JSON.stringify(htmlFiles)+';\nexport const seoCatalog='+JSON.stringify(seoCatalog)+';');
securePdfs();
fs.mkdirSync('private-assets',{recursive:true});
fs.cpSync('website/protected-brochures','private-assets/protected-brochures',{recursive:true});
fs.rmSync('website/protected-brochures',{recursive:true,force:true});
console.log('Built '+Object.keys(htmlFiles).length+' HTML pages; '+Object.keys(catalog).length+' destinations.');
