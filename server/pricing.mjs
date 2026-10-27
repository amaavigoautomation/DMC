export const labels=['Business','Professional','Professional Plus'];
export const indiaDate=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
const dateOK=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
export function withLimits(plans){return plans.map((p,i)=>({...p,maxUsers:p.maxUsers??Math.max(p.users,[5,20,50][i])}));}
export function validate(plans,baseline){
 if(!Array.isArray(plans)||plans.length!==3)throw Error('Three plan records are required.');
 return plans.map((p,i)=>{
  if(typeof p!=='object'||!p)throw Error('Invalid plan.');
  const b=baseline[i];
  const money=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=10000000&&Math.abs(x*100-Math.round(x*100))<0.00001;
  if(p.enabled!==b.enabled)throw Error('Plan availability follows the destination feature matrix.');
  if(p.enabled&&(!Number.isInteger(p.users)||p.users<1||p.users>100000))throw Error('Included users must be a positive whole number.');
  if(!Number.isInteger(p.maxUsers)||p.maxUsers<p.users||p.maxUsers>100000)throw Error('Maximum users must be a whole number at least equal to included users.');
  if(!money(p.monthly)||!money(p.yearly))throw Error('Enter valid monthly and yearly prices with at most two decimals.');
  if(![p.extra,p.extraYearly].every(x=>x===''||money(x)))throw Error('Additional-user prices must be blank or a positive amount.');
  if(typeof p.discount!=='number'||!Number.isFinite(p.discount)||p.discount<0||p.discount>100)throw Error('Discount must be between 0 and 100%.');
  if(p.discount>0&&(!dateOK(p.from)||!dateOK(p.to)||p.from>p.to))throw Error('Offer dates must be valid and the end must follow the start.');
  return {enabled:b.enabled,users:p.users,maxUsers:p.maxUsers,monthly:p.monthly,yearly:p.yearly,extra:p.extra,extraYearly:p.extraYearly,discount:p.discount,from:p.from||'',to:p.to||''};
 });
}
export function effective(plans,day=indiaDate()){
 return withLimits(plans).map(p=>{const active=p.enabled&&p.discount>0&&p.from<=day&&day<=p.to;const round=n=>Math.round((n+Number.EPSILON)*100)/100;const monthly=round(p.monthly*(active?1-p.discount/100:1)),yearly=round(p.yearly*(active?1-p.discount/100:1));return {...p,effectiveMonthly:monthly,effectiveYearly:yearly,offerActive:active,saving:round(monthly*12-yearly)};});
}
export const setupLabels=[...labels,'Enterprise'];
export function validateSetup(fees,baseline,previous=baseline){
 if(!Array.isArray(fees)||fees.length!==4)throw Error('Setup fees are required for all four plan slots.');
 return fees.map((p,i)=>{
  if(!p||typeof p!=='object'||p.enabled!==baseline[i].enabled)throw Error('Setup-fee availability follows the destination feature matrix.');
  if(typeof p.fee!=='number'||!Number.isFinite(p.fee)||p.fee<0||p.fee>10000000||Math.abs(p.fee*100-Math.round(p.fee*100))>0.00001)throw Error('Setup fee must be a non-negative USD amount with at most two decimals.');
  if(typeof p.discount!=='number'||!Number.isFinite(p.discount)||p.discount<0||p.discount>100)throw Error('Setup discount must be between 0 and 100%.');
  if(typeof p.from!=='string'||typeof p.to!=='string'||(p.from&&!dateOK(p.from))||(p.to&&!dateOK(p.to))||p.discount>0&&(!dateOK(p.from)||!dateOK(p.to)||p.from>p.to))throw Error('Enter valid setup-offer start and end dates.');
  const visible=p.visible===undefined?previous[i]?.visible:p.visible;if(visible!==undefined&&typeof visible!=='boolean')throw Error('Plan visibility must be true or false.');
  const priceVisible=p.priceVisible===undefined?previous[i]?.priceVisible:p.priceVisible;if(priceVisible!==undefined&&typeof priceVisible!=='boolean')throw Error('Show pricing must be true or false.');
  return {enabled:baseline[i].enabled,fee:p.fee,discount:p.discount,from:p.from,to:p.to,...(visible!==undefined?{visible}:{}),...(priceVisible!==undefined?{priceVisible}:{})};
 });
}
export function effectiveSetup(fees,day=indiaDate()){
 return fees.map(p=>{const offerActive=p.enabled&&p.discount>0&&p.from<=day&&day<=p.to,effectiveFee=Math.round((p.fee*(offerActive?1-p.discount/100:1)+Number.EPSILON)*100)/100;return {...p,effectiveFee,offerActive,saving:Math.round((p.fee-effectiveFee)*100)/100};});
}
export function dbStore(env){
 if(!env.DB)throw Error('Pricing storage unavailable');
 return {
  read:slug=>env.DB.prepare('SELECT * FROM country_pricing WHERE slug = ?').bind(slug).first(),
  save:(slug,plans,revision,user,setupFees)=>env.DB.prepareIgnore('INSERT INTO country_pricing (slug,draft,setup_draft,revision,updated_by,updated_at) VALUES (?,?,?,1,?,?)').bind(slug,JSON.stringify(plans),JSON.stringify(setupFees),user,new Date().toISOString()).run(),
  update:(slug,plans,revision,user,setupFees)=>env.DB.prepare('UPDATE country_pricing SET draft=?,setup_draft=?,revision=revision+1,updated_by=?,updated_at=? WHERE slug=? AND revision=?').bind(JSON.stringify(plans),JSON.stringify(setupFees),user,new Date().toISOString(),slug,revision).run(),
  publish:(slug,revision,user)=>env.DB.prepare('UPDATE country_pricing SET published=draft,setup_published=setup_draft,published_revision=revision,published_at=?,updated_by=? WHERE slug=? AND revision=?').bind(new Date().toISOString(),user,slug,revision).run()
 };
}
