import {parse,parseFragment,serialize} from 'parse5';
import {dbStore,effective,effectiveSetup,labels,setupLabels} from './pricing.mjs';
import {siteOrigin} from './site-config.mjs';
const attr=(n,k)=>n?.attrs?.find(a=>a.name===k)?.value;
const has=(n,c)=>(attr(n,'class')||'').split(/\s+/).includes(c);
function all(n,test,out=[]){if(test(n))out.push(n);for(const c of n.childNodes||[])all(c,test,out);return out;}
const first=(n,test)=>all(n,test)[0];
const text=n=>n?.nodeName==='#text'?n.value:(n?.childNodes||[]).map(text).join('');
function setAttr(n,k,v){const a=n.attrs.find(a=>a.name===k);if(a)a.value=String(v);else n.attrs.push({name:k,value:String(v)});}
function content(n,value){if(!n)return;n.childNodes=[{nodeName:'#text',value:String(value),parentNode:n}];}
function append(n,html){const nodes=parseFragment(html).childNodes;for(const x of nodes){x.parentNode=n;n.childNodes.push(x);}}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money=n=>'USD '+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const safeJSON=o=>JSON.stringify(o).replaceAll('<','\\u003c');
function planDetails(p){return p.users+' users included. Maximum '+p.maxUsers+' users. Monthly: '+money(p.effectiveMonthly)+'. Yearly: '+money(p.effectiveYearly)+'. Additional user: '+(typeof p.extra==='number'?money(p.extra)+' / month':'monthly rate on request')+'; '+(typeof p.extraYearly==='number'?money(p.extraYearly)+' / year':'yearly rate on request')+'.'+(p.offerActive?' '+p.discount+'% base-plan discount through '+p.to+' (IST).':'');}
export function pricingOffers(state,slug,base){const offers=[];state.plans.forEach((p,i)=>{if(!p.enabled||p.priceVisible===false)return;const name=labels[i],setup=state.setupFees[i],details=planDetails(p);
  for(const period of ['monthly','yearly']){
   const amount=period==='monthly'?p.effectiveMonthly:p.effectiveYearly;
   offers.push({'@type':'Offer','@id':siteOrigin+'/'+slug+'#'+name.toLowerCase().replaceAll(' ','-')+'-'+period,name:'DMC24 '+base.name+' '+name+' — '+period,url:siteOrigin+'/'+slug+'#subscriptions',price:amount,priceCurrency:'USD',description:details+' One-time setup: '+money(setup.effectiveFee)+'. Setup fee is charged separately.',priceSpecification:{'@type':'UnitPriceSpecification',price:amount,priceCurrency:'USD',billingDuration:period==='monthly'?'P1M':'P1Y',unitText:'plan with '+p.users+' included users'},...(p.offerActive?{validFrom:p.from+'T00:00:00+05:30',validThrough:p.to+'T23:59:59+05:30'}:{})});
  }
});return offers;}
export async function publicPricing(env,slug,base,day){const row=await dbStore(env).read(slug);const state={name:base.name,plans:effective(row?.published?JSON.parse(row.published):base.plans,day),setupFees:effectiveSetup(row?.setup_published?JSON.parse(row.setup_published):base.setupFees,day),revision:row?.published_revision||0};state.planVisibility=state.setupFees.map(p=>p.enabled&&p.visible!==false);state.plans=state.plans.map((p,i)=>{const priceVisible=state.setupFees[i].priceVisible!==false;return priceVisible?{...p,enabled:p.enabled&&state.planVisibility[i]}:{enabled:p.enabled&&state.planVisibility[i],priceVisible:false,users:p.users,maxUsers:p.maxUsers};});state.setupFees=state.setupFees.map((p,i)=>p.priceVisible!==false?{...p,enabled:state.planVisibility[i]}:{enabled:state.planVisibility[i],visible:p.visible,priceVisible:false});return {...state,offers:pricingOffers(state,slug,base)};}
export async function renderPublishedPricing(html,slug,base,env,day){
 const state=await publicPricing(env,slug,base,day),doc=parse(html),offers=state.offers;
 for(const card of all(doc,n=>has(n,'sl-plan'))){
  const name=text(first(card,n=>n.tagName==='h3')).trim(),i=labels.indexOf(name),setup=state.setupFees[setupLabels.indexOf(name)],p=state.plans[i];
  if(!state.planVisibility[setupLabels.indexOf(name)])setAttr(card,'hidden','');
  if(setup?.priceVisible===false){setAttr(card,'class',(attr(card,'class')||'')+' sl-plan--price-hidden');for(const n of all(card,n=>['sl-plan-price','sl-plan-saving','sl-setup-fee','server-pricing-summary','user-cost-breakdown','plan-original-price','plan-additional-user'].some(c=>has(n,c)))){if(has(n,'sl-plan-price')){for(const x of all(n,x=>x.nodeName==='#text'))x.value='';}else content(n,'');n.attrs=n.attrs.filter(a=>!['data-monthly','data-yearly'].includes(a.name));}continue;}
  const fee=first(card,n=>has(n,'sl-setup-fee'));
  if(setup?.enabled){content(fee,'One-time setup fee: '+money(setup.effectiveFee)+(setup.offerActive?' ('+setup.discount+'% off '+money(setup.fee)+' through '+setup.to+', IST)':''));}
  if(!p?.enabled)continue;
  const price=first(card,n=>has(n,'sl-plan-price'));setAttr(price,'data-monthly',money(p.effectiveMonthly));setAttr(price,'data-yearly',money(p.effectiveYearly));content(first(price,n=>n.tagName==='strong'),money(p.effectiveMonthly));content(first(price,n=>n.tagName==='small'),'/ month');
  content(first(card,n=>has(n,'sl-plan-saving')),p.saving>=0?'Save '+money(p.saving)+' with yearly billing':'Yearly total exceeds twelve monthly payments');
  for(const li of all(card,n=>n.tagName==='li'))if(/(?:Up to|Minimum)\s+\d+\s+users|\d+ users included/i.test(text(li)))content(li,text(li).replace(/(?:Up to|Minimum)\s+\d+\s+users|\d+ users included/i,p.users+' users included'));
  const details=planDetails(p);
  append(first(card,n=>has(n,'sl-plan-top')),'<p class="server-pricing-summary">'+esc(details)+'</p>');

 }
 const shown=state.planVisibility.filter(Boolean).length;for(const grid of all(doc,n=>has(n,'sl-plan-grid')))setAttr(grid,'data-visible-plans',shown);
 if(!state.plans.some(p=>p.enabled&&p.priceVisible!==false))for(const control of all(doc,n=>has(n,'user-price-control')||has(n,'sl-billing')))setAttr(control,'hidden','');
 const section=first(doc,n=>attr(n,'id')==='subscriptions');if(section&&!shown)append(first(section,n=>has(n,'sl-plan-grid')).parentNode,'<p class="plan-visibility-empty" role="status">Please contact us to discuss the plans available for your destination.</p>');
 if(state.setupFees.some(p=>p.visible===false)){const lead=first(section,n=>has(n,'lead'));content(lead,'Compare the available DMC24 editions for '+base.name+'. All prices are in USD.');}
 for(const note of all(doc,n=>has(n,'sl-price-footnote')))content(note,'Prices are in USD. Setup fees are charged separately. See each plan for its annual saving and included users. Third-party usage charges may apply where stated.');
 for(const badge of all(doc,n=>n.tagName==='button'&&attr(n,'data-billing')==='yearly')){const span=first(badge,n=>n.tagName==='span');if(span)content(span,'Annual billing');}
 if(!state.setupFees.some(p=>p.enabled&&p.priceVisible!==false)){for(const n of all(doc,n=>has(n,'sl-price-footnote')))setAttr(n,'hidden','');const lead=first(section,n=>has(n,'lead'));content(lead,'Compare the available DMC24 editions for '+base.name+'. Contact us for pricing.');}
 const block=first(doc,n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json');
 if(block){const schema=JSON.parse(text(block)),software=schema['@graph'].find(n=>n['@type']==='SoftwareApplication');if(software){software['@id']=siteOrigin+'/'+slug+'#software';software.name='DMC24 for '+base.name;software.url=siteOrigin+'/'+slug;software.offers=offers;software.featureList=[...new Set(all(doc,n=>has(n,'sl-plan')&&attr(n,'hidden')===undefined).flatMap(n=>all(n,x=>has(x,'sl-plan-includes')).flatMap(n=>all(n,x=>x.tagName==='li').map(text))))];for(const node of schema['@graph'])if(node.about?.['@id']?.endsWith('/#software'))node.about={'@id':software['@id']};content(block,safeJSON(schema));}}
 append(first(doc,n=>n.tagName==='head'),'<script type="application/json" id="published-pricing">'+safeJSON(state)+'</script>');
 return serialize(doc);
}
