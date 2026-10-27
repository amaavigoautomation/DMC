import {permissionModules,cleanPermissions} from './user-access.mjs';
export const hex=b=>[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');
export const hash=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
export async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Uint8Array.from(salt.match(/../g),h=>parseInt(h,16)),iterations:100000},key,256));}
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
export const audit=(env,actor,event,target)=>env.DB.prepare('INSERT INTO admin_audit(id,actor,event,target,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),actor,event,target,new Date().toISOString()).run();
export async function userManagement(req,env,session){
 if(!session?.superAdmin)return json({error:'Super Admin access required.'},403);
 if(req.method==='GET'){const rows=await env.DB.prepare('SELECT id,name,email,status,permissions,revision,created_at FROM admin_users ORDER BY name COLLATE utf8mb4_unicode_ci').all(),logs=await env.DB.prepare('SELECT actor,event,target,created_at FROM admin_audit ORDER BY created_at DESC LIMIT 100').all();return json({users:rows.results.map(r=>({...r,permissions:JSON.parse(r.permissions)})),modules:permissionModules,logs:logs.results});}
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('Origin')!==new URL(req.url).origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
 const raw=await req.text();if(raw.length>15000)return json({error:'Request too large'},413);let b;try{b=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
 const id=b.id||crypto.randomUUID(),row=await env.DB.prepare('SELECT * FROM admin_users WHERE id=?').bind(id).first();
 if((row?.revision||0)!==b.revision)return json({error:'User changed. Reload before saving.'},409);
 if(b.action==='reset'){
  if(!row||row.status==='inactive')return json({error:'Activate this user before issuing a setup link.'},400);
  const token=hex(crypto.getRandomValues(new Uint8Array(32)));
  const r=await env.DB.prepare("UPDATE admin_users SET reset_hash=?,reset_expires=?,status='invited',password_hash=NULL,revision=revision+1 WHERE id=? AND revision=?").bind(await hash(token),Date.now()+24*3600000,id,b.revision).run();
  if(!r.meta.changes)return json({error:'User changed. Reload.'},409);await audit(env,session.id,'Password setup issued',id);
  return json({ok:true,setupPath:'/admin/login#setup='+token});
 }
 if(b.action!=='save')return json({error:'Unknown action'},400);
 const name=String(b.name||'').trim(),email=String(b.email||'').trim().toLowerCase();let permissions;
 try{permissions=cleanPermissions(b.permissions);}catch(e){return json({error:e.message},400);}
 if(!name||name.length>100||email.length>100||!/^\S+@\S+\.\S+$/.test(email)||!['active','inactive'].includes(b.status))return json({error:'Enter a name, valid email and status.'},400);
 if(await env.DB.prepare('SELECT id FROM admin_users WHERE email=? AND id<>?').bind(email,id).first())return json({error:'This email already has an account.'},409);
 // An email change requires new password setup; every change revokes existing sessions.
 const needsSetup=!row||email!==row.email||!row.password_hash,status=b.status==='inactive'?'inactive':needsSetup?'invited':'active',token=needsSetup&&status!=='inactive'?hex(crypto.getRandomValues(new Uint8Array(32))):null;
 try{
 let r;if(row)r=await env.DB.prepare('UPDATE admin_users SET name=?,email=?,status=?,permissions=?,revision=revision+1,password_hash=?,reset_hash=?,reset_expires=? WHERE id=? AND revision=?').bind(name,email,status,JSON.stringify(permissions),needsSetup?null:row.password_hash,token?await hash(token):null,token?Date.now()+24*3600000:null,id,b.revision).run();
 else r=await env.DB.prepare('INSERT INTO admin_users(id,name,email,status,permissions,revision,password_hash,reset_hash,reset_expires,created_at) VALUES(?,?,?,?,?,1,NULL,?,?,?)').bind(id,name,email,status,JSON.stringify(permissions),token?await hash(token):null,token?Date.now()+24*3600000:null,new Date().toISOString()).run();
 if(!r.meta.changes)return json({error:'User changed. Reload.'},409);
 }catch(e){if(e.code==='ER_DUP_ENTRY'||/UNIQUE/.test(e.message))return json({error:'This email already has an account.'},409);throw e;}
 await audit(env,session.id,row?'User updated':'User created',id);return json({ok:true,...(token?{setupPath:'/admin/login#setup='+token}:{})});
}
export async function setupPassword(req,env){
 if(req.method!=='POST'||req.headers.get('Origin')!==new URL(req.url).origin||!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Request not allowed'},403);
 const raw=await req.text();if(raw.length>2000)return json({error:'Request too large'},413);let b;try{b=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
 if(!/^[a-f0-9]{64}$/.test(b.token||'')||typeof b.password!=='string'||b.password.length<12||b.password.length>128)return json({error:'Use a valid setup link and a password of 12–128 characters.'},400);
 const tokenHash=await hash(b.token),row=await env.DB.prepare("SELECT id,revision FROM admin_users WHERE reset_hash=? AND reset_expires>? AND status='invited'").bind(tokenHash,Date.now()).first();
 if(!row)return json({error:'This setup link is invalid or expired. Ask your Super Admin for a new link.'},400);
 const salt=hex(crypto.getRandomValues(new Uint8Array(16))),password=await passwordHash(b.password,salt);
 const r=await env.DB.prepare("UPDATE admin_users SET salt=?,password_hash=?,status='active',reset_hash=NULL,reset_expires=NULL,revision=revision+1 WHERE id=? AND revision=? AND reset_hash=? AND reset_expires>?").bind(salt,password,row.id,row.revision,tokenHash,Date.now()).run();
 if(!r.meta.changes)return json({error:'This setup link has expired or already been used.'},409);await audit(env,row.id,'Password set',row.id);return json({ok:true});
}
