import fs from 'node:fs/promises';import path from 'node:path';import {createPool} from '../runtime/mysql.mjs';import {fileBucket} from '../runtime/storage.mjs';
const source=process.argv[2];if(!source||!process.env.UPLOAD_DIR)throw Error('Usage: node --env-file=.env scripts/import-media.mjs /secure/r2-export (requires UPLOAD_DIR)');
const pool=createPool(),bucket=fileBucket(path.resolve(process.env.UPLOAD_DIR));
try{const [rows]=await pool.query('SELECT id,mime FROM blog_media');
 // Preflight every object before writing anything.
 for(const r of rows){if(!/^[a-f0-9-]{36}$/.test(r.id)||!['image/png','image/jpeg','image/webp'].includes(r.mime))throw Error('Invalid media metadata');await fs.access(path.join(source,'blog-media',r.id));}
 for(const r of rows){const key='blog-media/'+r.id,data=await fs.readFile(path.join(source,key)),existing=await bucket.get(key);if(existing&&!Buffer.from(existing.body).equals(data))throw Error('Different destination image already exists: '+r.id);await bucket.put(key,data,{httpMetadata:{contentType:r.mime}});}
 console.log('Imported/verified '+rows.length+' blog media objects.');
}finally{await pool.end();}
