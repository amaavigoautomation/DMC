// Central deny-by-default application permissions. Hosting access remains separate.
export const permissionModules=[
 ['analytics','Website Analytics','/website-analytics',['view','export']],
 ['brochures','Brochure Enquiries','/brochure-enquiries',['view','export']],
 ['plans','Plan Management','/plan-management-review',['view','edit','publish']],
 ['seo','SEO Management','/seo-management',['view','edit','publish']],
 ['demos','Demo Requests','/demo-requests',['view','edit','export']],
 ['blogs','Blog Management','/blog-management',['view','edit','publish']],
 ['email','Email Automation','/email-automation',['view','edit','send']]
].map(([id,title,path,actions])=>({id,title,path,actions}));
export const can=(s,m,a='view')=>!!s&&(s.superAdmin||!!s.permissions?.[m]?.includes(a));
export function cleanPermissions(p){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Choose valid permissions.');const out={};for(const [k,v] of Object.entries(p)){const m=permissionModules.find(m=>m.id===k);if(!m||!Array.isArray(v)||v.some(a=>!m.actions.includes(a)))throw Error('Unknown module or permission.');out[k]=[...new Set(v)];if(v.length&&!v.includes('view'))out[k].unshift('view');}return out;}
export function allowedPage(s,path){path=path.replace(/\.html$/,'').replace(/\/$/,'');if(s?.superAdmin)return true;if(path==='/admin')return !!s;if(path==='/plan-management')path='/plan-management-review';const m=permissionModules.find(m=>m.path===path);return !!m&&can(s,m.id);}
export async function allowedApi(s,req,env){
 if(s?.superAdmin)return true;const u=new URL(req.url),p=u.pathname,read=['GET','HEAD'].includes(req.method);let m=null,a=read?'view':'edit';
 if(p.startsWith('/api/pricing/admin')){m='plans';if(/\/(publish|visibility)$/.test(p))a='publish';if(p.endsWith('/bulk-copy')){try{const b=await req.clone().json();if(b.publish)a='publish';}catch{return false;}}}
 else if(p.startsWith('/api/admin/seo/')){m='seo';if(p.endsWith('/publish'))a='publish';}
 else if(p.startsWith('/api/admin/blogs')||p==='/api/admin/blog-media'){m='blogs';if(/\/(publish|unpublish|archive)$/.test(p))a='publish';}
 else if(p.startsWith('/api/admin/demo-'))m='demos';
 else if(p.startsWith('/api/brochure-leads'))m='brochures';
 else if(p==='/api/analytics/admin')m='analytics';
 else if(p.startsWith('/api/admin/email/')){
  m='email';if(p.endsWith('/test'))return false;if(p.endsWith('/retry'))a='send';
  if(p.endsWith('/preview'))a='view';
  if(p.endsWith('/settings')&&!read){try{const b=await req.clone().json(),r=await env.DB.prepare("SELECT value FROM email_settings WHERE id='main'").first();if(!r||b.secret||b.clearSecret)return false;const old=JSON.parse(r.value);for(const k of ['enabled','tenantId','clientId','sender','replyTo','senderName'])if(b.config?.[k]!==old[k])return false;}catch{return false;}}
 }
 if(u.searchParams.get('format')==='csv'||p.endsWith('/export'))a='export';
 return !!m&&can(s,m,a);
}
