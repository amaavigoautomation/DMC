import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {createHash} from 'node:crypto';
export const schema=JSON.parse(fs.readFileSync(new URL('../database/schema-manifest.json',import.meta.url)));
export const skipped=new Set(['admin_sessions','admin_login_limits']);
export async function* rows(file){const lines=readline.createInterface({input:fs.createReadStream(file),crlfDelay:Infinity});for await(const line of lines)if(line.trim())yield JSON.parse(line);}
export function transform(table,row){
 const spec=schema[table];if(!spec)throw Error('Unknown table');
 if(Object.keys(row).sort().join('|')!==spec.columns.map(c=>c.name).sort().join('|'))throw Error('Column mismatch in '+table);
 const next={...row};
 if(table==='admin_users'){next.reset_hash=null;next.reset_expires=null;}
 if(table==='email_settings'){const config=JSON.parse(next.value);config.enabled=false;next.value=JSON.stringify(config);next.tested=null;}
 if(table==='email_outbox'&&['queued','sending'].includes(next.status)){next.status='unknown';next.detail='Migrated without sending. Review Microsoft Sent Items before any manual follow-up.';}
 for(const col of spec.columns){const v=next[col.name];if(v===null){if(!col.nullable)throw Error('Required value missing: '+table+'.'+col.name);continue;}if(col.mysqlType==='BIGINT'&&!Number.isSafeInteger(v))throw Error('Invalid integer: '+table+'.'+col.name);const size=col.mysqlType.match(/^VARCHAR\((\d+)\)$/);if(size&&(typeof v!=='string'||[...v].length>Number(size[1])))throw Error('Text length/type mismatch: '+table+'.'+col.name);if(col.mysqlType==='LONGTEXT'&&typeof v!=='string')throw Error('Invalid text: '+table+'.'+col.name);}
 return next;
}
export function stableRow(table,row){return JSON.stringify(schema[table].columns.map(c=>row[c.name]));}
export async function preflight(directory){
 const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json')));if(manifest.format!=='dmc24-jsonl-v1')throw Error('Unrecognised export format');
 if(Object.keys(manifest.tables).sort().join('|')!==Object.keys(schema).sort().join('|'))throw Error('Export must include all 17 tables');
 for(const [table,spec] of Object.entries(manifest.tables)){
  if(spec.file!==table+'.jsonl')throw Error('Invalid table filename');const file=path.join(directory,spec.file),hash=createHash('sha256');for await(const chunk of fs.createReadStream(file))hash.update(chunk);
  if(hash.digest('hex')!==spec.sha256)throw Error('Checksum mismatch: '+table);
  let count=0;for await(const row of rows(file)){transform(table,row);count++;}if(count!==spec.rows)throw Error('Row count mismatch: '+table);
 }
 return manifest;
}
