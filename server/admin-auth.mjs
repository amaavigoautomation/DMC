import {setupPassword,passwordHash,audit} from './user-management.mjs';
import registry from './admin-registry.json' with {type:'json'};
export {registry};
const cookieName='__Host-dmc24_admin';
const baseHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex,nofollow'};
const json=(v,status=200,headers={})=>Response.json(v,{status,headers:{...baseHeaders,...headers}});
const hex=b=>[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');
const unhex=s=>new Uint8Array(s.match(/../g).map(h=>parseInt(h,16)));
const digest=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const normalize=p=>p.replace(/\.html$/,'').replace(/\/$/,'')||'/';
export const loginPage=p=>['/admin/login','/admin-login'].includes(normalize(p));
export const privatePage=p=>{p=normalize(p);return !loginPage(p)&&(p==='/admin'||p.startsWith('/admin/')||p==='/plan-management'||p==='/user-management-review'||registry.some(r=>r.path===p));};
export const privateApi=p=>['/api/admin/','/api/pricing/admin','/api/brochure-leads','/api/analytics/admin'].some(prefix=>p.startsWith(prefix));
export const safeReturn=p=>typeof p==='string'&&privatePage(p)&&!p.includes('?')&&!p.includes('#')&&!p.includes('\\')?p:'/admin';
function configuration(env){try{const c=JSON.parse(env.ADMIN_CREDENTIAL||'');if(c.iterations!==100000||!/^[a-f0-9]{32}$/.test(c.salt)||!/^[a-f0-9]{64}$/.test(c.hash))return null;return c;}catch{return null;}}
function token(req){return req.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-dmc24_admin=([a-f0-9]{64})(?:;|$)/)?.[1]||null;}
export async function adminSession(req,env){
 const t=token(req),config=configuration(env);if(!t||!config)return null;
 const hash=await digest(t),now=Date.now();
 const row=await env.DB.prepare('SELECT actor,expires_at,last_seen,credential_version,user_id FROM admin_sessions WHERE token_hash=?').bind(hash).first();
 if(!row||row.expires_at<=now||row.last_seen<=now-30*60000)return null;
 let account=null;if(row.user_id){account=await env.DB.prepare('SELECT id,name,email,status,permissions,revision FROM admin_users WHERE id=?').bind(row.user_id).first();if(!account||account.status!=='active'||row.credential_version!==String(account.revision))return null;}else if(row.credential_version!==config.hash)return null;
 if(now-row.last_seen>60000)await env.DB.prepare('UPDATE admin_sessions SET last_seen=? WHERE token_hash=?').bind(now,hash).run();
 return {id:account?.id||'admin',name:account?.name||'Admin',superAdmin:!account,permissions:account?JSON.parse(account.permissions):{},expiresAt:row.expires_at,idleExpiresAt:now+30*60000};
}
export async function authApi(req,env){
 const url=new URL(req.url),path=url.pathname;
 if(path==='/api/auth/setup')return setupPassword(req,env);
 if(path==='/api/auth/session'&&req.method==='GET'){const s=await adminSession(req,env);return json(s?{authenticated:true,username:s.name,superAdmin:s.superAdmin,permissions:s.permissions,expiresAt:s.expiresAt,idleMinutes:30}:{authenticated:false});}
 if(!['/api/auth/login','/api/auth/logout'].includes(path))return json({error:'Not found'},404);
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('Origin')!==url.origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
 if(path==='/api/auth/logout'){
  const t=token(req);if(t)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(t)).run();
  return json({ok:true},200,{'Set-Cookie':cookieName+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
 }
 const config=configuration(env);if(!config)return json({error:'Admin login is not configured. Please contact the site administrator.'},503);
 const raw=await req.text();if(raw.length>1500)return json({error:'Request too large'},413);
 let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
 if(!b||typeof b.username!=='string'||typeof b.password!=='string'||b.password.length>256||b.username.length>100)return json({error:'Enter your username and password.'},400);
 const now=Date.now(),bucket=await digest(config.salt+'|'+(req.headers.get('x-dmc24-client-ip')||'unknown'));
 // Atomic reservation stops concurrent guesses from bypassing the limit.
 await env.DB.prepare('INSERT INTO admin_login_limits (bucket,attempts,reset_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END').bind(bucket,now+15*60000,now,now,now+15*60000).run();
 const limit=await env.DB.prepare('SELECT attempts,reset_at FROM admin_login_limits WHERE bucket=?').bind(bucket).first();
 if(limit.attempts>5)return json({error:'Too many login attempts. Please try again in 15 minutes.'},429,{'Retry-After':String(Math.max(1,Math.ceil((limit.reset_at-now)/1000)))});
 const account=b.username==='Admin'?null:await env.DB.prepare('SELECT * FROM admin_users WHERE email=?').bind(b.username.trim().toLowerCase()).first();
 const check=account?.password_hash?{salt:account.salt,hash:account.password_hash,iterations:100000}:config;
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(b.password),'PBKDF2',false,['deriveBits']);
 const result=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(check.salt),iterations:check.iterations},material,256)),expected=unhex(check.hash);
 let diff=0;for(let i=0;i<expected.length;i++)diff|=result[i]^expected[i];
 if(diff!==0||(b.username!=='Admin'&&(!account||account.status!=='active'||!account.password_hash)))return json({error:'Incorrect username or password.'},401);
 await env.DB.prepare('DELETE FROM admin_login_limits WHERE bucket=?').bind(bucket).run();
 const previous=token(req);if(previous)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(previous)).run();
 const next=hex(crypto.getRandomValues(new Uint8Array(32))),expiresAt=now+8*3600000;
 await env.DB.prepare('INSERT INTO admin_sessions (token_hash,actor,expires_at,last_seen,credential_version,user_id) VALUES (?,?,?,?,?,?)').bind(await digest(next),'standalone',expiresAt,now,account?String(account.revision):config.hash,account?.id||null).run();
 await audit(env,account?.id||'admin','Signed in',account?.id||'admin');
 await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now).run();
 await env.DB.prepare('DELETE FROM admin_login_limits WHERE reset_at<?').bind(now).run();
 return json({ok:true,redirect:safeReturn(b.returnTo)},200,{'Set-Cookie':cookieName+'='+next+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'});
}
export function protectHeaders(){return {...baseHeaders,'Content-Type':'text/html; charset=utf-8','X-Frame-Options':'DENY','Content-Security-Policy':"frame-ancestors 'none'"};}
