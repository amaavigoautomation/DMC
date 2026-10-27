import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createPool} from '../runtime/mysql.mjs';
const pool=createPool(),c=await pool.getConnection();
try{
 const [[lock]]=await c.query("SELECT GET_LOCK('dmc24_schema_migration',30) AS acquired");if(lock.acquired!==1)throw Error('Migration already running');
 await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(191) PRIMARY KEY, sha256 CHAR(64) NOT NULL, applied_at VARCHAR(32) NOT NULL) ENGINE=InnoDB');
 for(const file of fs.readdirSync('database').filter(f=>/^\d+.*\.sql$/.test(f)).sort()){
  const sql=fs.readFileSync('database/'+file,'utf8'),hash=createHash('sha256').update(sql).digest('hex');
  const [rows]=await c.execute('SELECT sha256 FROM schema_migrations WHERE name=?',[file]);
  if(rows.length){if(rows[0].sha256!==hash)throw Error('Applied migration was modified: '+file);continue;}
  // Controlled schema-only files; no routines or semicolons in string literals.
  for(const statement of sql.replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await c.query(statement);
  await c.execute('INSERT INTO schema_migrations VALUES (?,?,?)',[file,hash,new Date().toISOString()]);console.log('Applied '+file);
 }
}finally{await c.query("SELECT RELEASE_LOCK('dmc24_schema_migration')").catch(()=>{});c.release();await pool.end();}
