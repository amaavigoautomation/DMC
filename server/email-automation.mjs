import {defaults,tokens} from './email-defaults.mjs';
import {emailCountries} from './email-countries-generated.mjs';
import {siteOrigin} from './site-config.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const bytes=s=>new TextEncoder().encode(s),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',bytes(s)));
const stamp=()=>new Date().toISOString();
const email=s=>typeof s==='string'&&s.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s);
const keyBytes=env=>{if(!/^[a-f0-9]{64}$/.test(env.EMAIL_ENCRYPTION_KEY||''))throw Error('Email encryption key is not configured.');return new Uint8Array(env.EMAIL_ENCRYPTION_KEY.match(/../g).map(n=>parseInt(n,16)));};
async function encrypt(value,env){const iv=crypto.getRandomValues(new Uint8Array(12)),key=await crypto.subtle.importKey('raw',keyBytes(env),'AES-GCM',false,['encrypt']);return hex(iv)+':'+hex(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes(value)));}
async function decrypt(value,env){const [iv,data]=value.split(':').map(s=>new Uint8Array(s.match(/../g).map(n=>parseInt(n,16))));const key=await crypto.subtle.importKey('raw',keyBytes(env),'AES-GCM',false,['decrypt']);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data));}
export async function emailSettings(env){const row=await env.DB.prepare("SELECT * FROM email_settings WHERE id='main'").first();return row?{...row,config:JSON.parse(row.value)}:{revision:0,secret:null,tested:null,config:defaults()};}
async function fingerprint(c,secret){return hash(JSON.stringify([c.tenantId,c.clientId,c.sender,c.replyTo,c.senderName,secret]));}
function validate(c){
 const clean=(v,max)=>{if(typeof v!=='string'||v.length>max||/[\u0000-\u001f]/.test(v.replaceAll('\n','')))throw Error('Invalid or overly long setting.');return v.trim();};
 const next=defaults();next.enabled=c.enabled===true;
 for(const k of ['tenantId','clientId']){next[k]=clean(c[k],36);if(next[k]&&!/^[a-f0-9-]{36}$/i.test(next[k]))throw Error('Enter valid Microsoft tenant and application IDs.');}
 for(const k of ['sender','replyTo']){next[k]=clean(c[k],254).toLowerCase();if(next[k]&&!email(next[k]))throw Error('Enter a valid sender and reply-to email.');}
 next.senderName=clean(c.senderName,100);next.signature=clean(c.signature,700);
 for(const id of Object.keys(next.templates)){const t=c.templates?.[id];if(!t)throw Error('Missing template.');const out={name:next.templates[id].name,enabled:t.enabled===true};for(const [k,max]of [['subject',180],['intro',1600],['closing',1600],['cta',80],['path',160]])out[k]=clean(t[k],max);if(!out.subject||!out.intro||!out.cta||!/^\/[a-z0-9-]*(?:#[a-z0-9-]+)?$/.test(out.path))throw Error('Complete each template and use an internal button path.');if(/\n/.test(out.subject))throw Error('Subjects must be one line.');for(const value of Object.values(out)){if(typeof value==='string')for(const m of value.matchAll(/\{\{(.*?)\}\}/g))if(!tokens.includes(m[1]))throw Error('Unknown personalisation field: '+m[1]);}next.templates[id]=out;}
 const list=v=>{if(!Array.isArray(v)||!v.length||v.length>5)throw Error('Use one to five benefit points.');return v.map(x=>clean(x,300)).filter(Boolean);};
 for(const k of Object.keys(next.products))next.products[k]=list(c.products?.[k]);
 for(const [k,v]of Object.entries(c.countries||{})){if(!emailCountries[k])throw Error('Unknown destination.');next.countries[k]=list(v);}
 return next;
}
export function renderEmail(config,event){
 const t=config.templates[event.trigger]||config.templates.enquiry,country=emailCountries[event.destination];
 const values={first_name:event.name?.trim().split(/\s+/)[0]||'there',full_name:event.name||'there',company:event.company||'your business',destination:country?.name||'your destination',product:event.product||'DMC24',plan:event.variant||'the right edition for your team',team_size:event.users||'your team',implementation:event.timing||'your preferred timeline'};
 const fill=v=>String(v).replace(/\{\{(.*?)\}\}/g,(_,k)=>values[k]||'');
 const selectedProducts=(event.solutions||[]).filter(k=>config.products[k]);
 const productKey=config.products[event.product]?event.product:selectedProducts[0]||'Mid Office';
 const benefits=country?(config.countries[event.destination]||country.benefits):config.products[productKey];
 const subject=fill(t.subject).replace(/[\r\n]/g,' ').slice(0,240);
 const destinationUrl=country?'/'+event.destination:t.path;
 const ctaPath=event.trigger==='country'?destinationUrl:t.path;
 const context=[country?.name,event.variant,event.users&&('Team: '+event.users),event.timing&&('Implementation: '+event.timing)].filter(Boolean).join(' · ');
 const button=(label,url)=>`<a href="${esc(url)}" style="display:inline-block;background:#bc205b;color:#fff;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:bold">${esc(label)}</a>`;
 const paragraph=text=>esc(fill(text)).replaceAll('\n','<br>');
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f1f6;color:#292232;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden"><tr><td style="padding:28px 32px;border-bottom:3px solid #bc205b"><img src="${siteOrigin}/img/dmc24-logo.png" width="150" height="43" alt="DMC24" style="display:block;width:150px;height:auto"><p style="margin:12px 0 0;color:#74667e;font-size:12px">YOUR DESTINATION. OUR SOLUTION.</p></td></tr><tr><td style="padding:30px 32px;font-size:15px;line-height:1.7"><p style="font-size:22px;font-weight:bold;margin:0 0 16px">Hello ${esc(values.first_name)},</p><p>${paragraph(t.intro)}</p>${context?`<p style="background:#f6f2f8;padding:14px;font-size:13px">${esc(context)}</p>`:''}<h2 style="font-size:19px">${country?'Built around your destination workflow':'A more connected DMC business'}</h2><ul style="padding-left:20px">${benefits.map(b=>`<li style="margin:10px 0">${esc(b)}</li>`).join('')}</ul>${country?'<p style="font-size:12px;color:#74667e">Capabilities vary by edition and implementation scope.</p>':''}${event.brochureUrl?`<p>${button('Open your brochure',event.brochureUrl)}</p><p style="font-size:12px;color:#74667e">Your brochure link is valid for seven days. After that, you can request it again on our website.</p>`:''}<p>${paragraph(t.closing)}</p><p>${button(fill(t.cta),siteOrigin+ctaPath)}</p><p style="margin-top:26px">${esc(config.signature).replaceAll('\n','<br>')}</p></td></tr><tr><td style="padding:20px 32px;background:#241b2a;color:#e4dce9;font-size:12px;line-height:1.6">This message acknowledges your DMC24 enquiry or brochure request. You have not been subscribed to a marketing mailing list.</td></tr></table></td></tr></table></body></html>`;
 return {subject,html};
}
export async function brochureLink(env,id){const payload=btoa(JSON.stringify({id,expires:Date.now()+7*86400000})).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');const key=await crypto.subtle.importKey('raw',keyBytes(env),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=hex(await crypto.subtle.sign('HMAC',key,bytes(payload)));return siteOrigin+'/api/email-brochure?token='+payload+'.'+sig;}
export async function verifyBrochureToken(token,env){try{if(typeof token!=='string'||token.length>1000)return null;const [payload,sig]=token.split('.');if(!/^[a-f0-9]{64}$/.test(sig))return null;const key=await crypto.subtle.importKey('raw',keyBytes(env),{name:'HMAC',hash:'SHA-256'},false,['verify']);if(!await crypto.subtle.verify('HMAC',key,new Uint8Array(sig.match(/../g).map(n=>parseInt(n,16))),bytes(payload)))return null;const value=JSON.parse(atob(payload.replaceAll('-','+').replaceAll('_','/')));return /^[a-z-]+$/.test(value.id)&&value.expires>Date.now()&&value.expires<=Date.now()+7*86400000?value.id:null;}catch{return null;}}
async function record(env,event,key,status){const rendered=renderEmail((await emailSettings(env)).config,event),id=crypto.randomUUID(),now=stamp();await env.DB.prepareIgnore('INSERT INTO email_outbox(id,event_key,recipient,`trigger`,destination,subject,html,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,key,event.email.toLowerCase(),event.trigger,event.destination||'',rendered.subject,rendered.html,status,now,now).run();return (await env.DB.prepare('SELECT id FROM email_outbox WHERE event_key=?').bind(key).first()).id;}
export async function captureEmail(env,event,key,ctx){
 try{const s=await emailSettings(env);const enabled=s.config.enabled&&s.config.templates[event.trigger]?.enabled&&s.tested===await fingerprint(s.config,s.secret);if(enabled&&event.brochure)event.brochureUrl=await brochureLink(env,event.brochure);const id=await record(env,event,key,enabled?'queued':'disabled');if(enabled){const task=sendQueued(env,id).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(task);else await task;}}
 catch{console.error('Email acknowledgement could not be queued; enquiry remains saved.');}
}
async function tokenFor(s,env){const secret=await decrypt(s.secret,env);const r=await fetch('https://login.microsoftonline.com/'+s.config.tenantId+'/oauth2/v2.0/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:s.config.clientId,client_secret:secret,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'}),signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Microsoft authentication failed. Check tenant, application ID and secret.');const data=await r.json();if(!data.access_token)throw Error('Microsoft did not return an access token.');return data.access_token;}
export async function sendQueued(env,id,{test=false}={}){
 const s=await emailSettings(env);if(!s.secret||!s.config.sender||(!test&&(!s.config.enabled||s.tested!==await fingerprint(s.config,s.secret))))return;
 const lock=await env.DB.prepare("UPDATE email_outbox SET status='sending',attempts=attempts+1,updated_at=? WHERE id=? AND status='queued'").bind(stamp(),id).run();if(lock.meta.changes!==1)return;
 const row=await env.DB.prepare('SELECT * FROM email_outbox WHERE id=?').bind(id).first();
 let status='failed',detail='',token;
 try{token=await tokenFor(s,env);}catch{detail='Authentication or connection failed before sending. Check Microsoft 365 settings, then retry.';}
 if(token){try{const r=await fetch('https://graph.microsoft.com/v1.0/users/'+encodeURIComponent(s.config.sender)+'/sendMail',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:{subject:row.subject,body:{contentType:'HTML',content:row.html},from:{emailAddress:{address:s.config.sender,name:s.config.senderName}},toRecipients:[{emailAddress:{address:row.recipient}}],replyTo:[{emailAddress:{address:s.config.replyTo||s.config.sender}}],internetMessageHeaders:[{name:'X-DMC24-Reference',value:row.id}]},saveToSentItems:true}),signal:AbortSignal.timeout(12000)});
 if(r.status===202){status='accepted';detail='Accepted by Microsoft 365. Inbox delivery is not confirmed.';}else if(r.status===429){status='failed';detail='Microsoft throttled this request. Wait before retrying (Retry-After: '+String(r.headers.get('Retry-After')||'60').slice(0,20)+' seconds).';}else if(r.status>=500){status='unknown';detail='Microsoft returned a server error. Check Sent Items or Message Trace before taking further action; automatic resend is blocked.';}else{status='failed';detail='Microsoft rejected this request (HTTP '+r.status+'). Check sender mailbox and Mail.Send permissions.';}
 }catch{status='unknown';detail='Connection ended after send started. Delivery may have occurred. Check Microsoft Sent Items / Message Trace. Automatic resend is blocked.';}}
 await env.DB.prepare('UPDATE email_outbox SET status=?,detail=?,updated_at=? WHERE id=?').bind(status,detail,stamp(),id).run();
 if(test&&status==='accepted')await env.DB.prepare("UPDATE email_settings SET tested=? WHERE id='main' AND revision=?").bind(await fingerprint(s.config,s.secret),s.revision).run();
 return {status,detail};
}
export async function emailAdmin(req,env){
 const url=new URL(req.url),action=url.pathname.slice('/api/admin/email/'.length);if(req.method==='GET'&&action==='settings'){const s=await emailSettings(env);return json({config:s.config,revision:s.revision,hasSecret:!!s.secret,keyReady:!!env.EMAIL_ENCRYPTION_KEY,tested:!!s.secret&&s.tested===await fingerprint(s.config,s.secret),countries:emailCountries,tokens});}
 if(req.method==='GET'&&action==='logs'){await env.DB.prepare("UPDATE email_outbox SET status='unknown',detail='Sending was interrupted. Check Microsoft Sent Items before taking further action.',updated_at=? WHERE status='sending' AND updated_at<?").bind(stamp(),new Date(Date.now()-5*60000).toISOString()).run();const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));const r=await env.DB.prepare('SELECT id,recipient,`trigger`,destination,subject,status,attempts,detail,created_at FROM email_outbox ORDER BY created_at DESC LIMIT 50 OFFSET ?').bind(offset).all();return json({rows:r.results});}
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
 const raw=await req.text();if(raw.length>100000)return json({error:'Request too large'},413);let b;try{b=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
 if(action==='settings'){
 let c;try{c=validate(b.config);}catch(e){return json({error:e.message},400);}const s=await emailSettings(env);if(b.revision!==s.revision)return json({error:'Settings changed. Reload before saving.'},409);
 let secret=s.secret;if(b.clearSecret)secret=null;if(b.secret){if(typeof b.secret!=='string'||b.secret.length>2000)return json({error:'Invalid client secret'},400);secret=await encrypt(b.secret,env);}
 const tested=secret&&s.tested===await fingerprint(c,secret);if(c.enabled&&(!tested||!c.sender||!c.tenantId||!c.clientId))return json({error:'Save connection settings and send a successful test email before enabling automatic responses.'},400);
 const values=[JSON.stringify(c),secret,tested?s.tested:null,stamp()];let result;
 if(!s.revision)result=await env.DB.prepareIgnore("INSERT INTO email_settings(id,value,secret,tested,updated_at) VALUES('main',?,?,?,?)").bind(...values).run();else result=await env.DB.prepare("UPDATE email_settings SET value=?,secret=?,tested=?,updated_at=?,revision=revision+1 WHERE id='main' AND revision=?").bind(...values,s.revision).run();
 return result.meta.changes?json({ok:true,revision:s.revision+1}):json({error:'Settings changed. Reload before saving.'},409);
 }
 if(action==='preview'){
 let c;try{c=validate(b.config);}catch(e){return json({error:e.message},400);}const sample=b.sample||{};const event={name:String(sample.name||'Aisha'),company:String(sample.company||'Your DMC'),destination:emailCountries[sample.destination]?sample.destination:'',trigger:Object.hasOwn(c.templates,sample.trigger)?sample.trigger:'demo',product:Object.hasOwn(c.products,sample.product)?sample.product:'Mid Office',variant:String(sample.variant||'Professional'),users:'6–10',timing:'1–3 months'};if(event.trigger==='brochure')event.brochureUrl=siteOrigin+'/brochures';return json(renderEmail(c,event));
 }
 if(action==='test'){
 const s=await emailSettings(env);if(b.revision!==s.revision)return json({error:'Save or reload settings before testing.'},409);if(!email(b.recipient)||!s.secret||!s.config.tenantId||!s.config.clientId||!s.config.sender)return json({error:'Complete and save the connection settings and enter a test recipient.'},400);
 const recent=await env.DB.prepare("SELECT COUNT(*) n FROM email_outbox WHERE `trigger`='test' AND created_at>?").bind(new Date(Date.now()-3600000).toISOString()).first();if(recent.n>=10)return json({error:'Test limit reached. Try again later.'},429);
 const id=await record(env,{email:b.recipient,name:'DMC24 Administrator',company:'your team',trigger:'test',product:'DMC24'},'test:'+crypto.randomUUID(),'queued');return json({id,...await sendQueued(env,id,{test:true})});
 }
 if(action==='retry'){
 const s=await emailSettings(env);if(!s.config.enabled||s.tested!==await fingerprint(s.config,s.secret))return json({error:'Enable a tested connection before retrying.'},400);
 const row=await env.DB.prepare('SELECT * FROM email_outbox WHERE id=?').bind(String(b.id||'')).first();if(!row||!['failed','queued'].includes(row.status)||row.trigger==='test')return json({error:'This message cannot be retried. Accepted, disabled and uncertain messages are never resent.'},400);
 if(Date.now()-new Date(row.created_at).getTime()>7*86400000)return json({error:'This request is older than seven days. Follow up manually.'},400);
 if(row.attempts>=5||Date.now()-new Date(row.updated_at).getTime()<60000)return json({error:'Wait at least one minute between attempts; maximum five attempts.'},429);
 await env.DB.prepare("UPDATE email_outbox SET status='queued' WHERE id=? AND status='failed'").bind(row.id).run();return json(await sendQueued(env,row.id)||{status:'unchanged'});
 }
 return json({error:'Not found'},404);
}
