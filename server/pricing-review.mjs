import {parse,serializeOuter} from 'parse5';
import {renderPublishedPricing} from './published-pricing.mjs';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function find(node,predicate){if(predicate(node))return node;for(const c of node.childNodes||[]){const found=find(c,predicate);if(found)return found;}}
const id=(node,value)=>node.attrs?.some(a=>a.name==='id'&&a.value===value);
export async function pricingReview(html,selected,catalog,files,vis,env,source='/pricing-country-review'){
 const countries=Object.entries(catalog).filter(([s])=>vis[s]?.visible!==0).sort((a,b)=>a[1].name.localeCompare(b[1].name,'en'));
 html=html.replace('<!--country-options-->',countries.map(([slug,c])=>`<option value="${escape(slug)}"${selected===slug?' selected':''}>${escape(c.name)}</option>`).join(''));
 if(!selected)return html.replace('<!--country-pricing-->','<section class="country-price-empty"><h2>Your destination. Your plans.</h2><p>Select a country above to see its available editions and full feature comparison.</p></section>');
 if(!countries.some(([slug])=>slug===selected))return html.replace('<!--country-pricing-->','<section class="country-price-empty" role="status"><h2>This destination is unavailable.</h2><p>Please select one of the available countries above.</p></section>');
 const destination=await renderPublishedPricing(files[selected],selected,catalog[selected],env);
 const doc=parse(destination),section=find(doc,n=>id(n,'subscriptions')),snapshot=find(doc,n=>id(n,'published-pricing'));
 if(!section||!snapshot)throw Error('Country pricing section unavailable');
 section.attrs.push({name:'data-pricing-country',value:selected},{name:'data-country',value:selected});
 const updateDemo=node=>{if(node.tagName==='a'){const href=node.attrs.find(a=>a.name==='href');if(href){const u=new URL(href.value,'https://example.com');if(u.pathname.replace(/\.html$/,'')==='/request-demo'){u.searchParams.set('source',source);u.searchParams.set('destination',selected);href.value=u.pathname+u.search;}}}for(const child of node.childNodes||[])updateDemo(child);};updateDemo(section);

 return html.replace('<!--country-pricing-->',serializeOuter(section)+serializeOuter(snapshot));
}
