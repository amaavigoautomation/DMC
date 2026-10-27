import mysql from 'mysql2/promise';
import fs from 'node:fs';
export function createPool(env=process.env){
 if(!env.DB_NAME||!env.DB_USER)throw Error('DB_NAME and DB_USER are required');
 return mysql.createPool({host:env.DB_HOST||'127.0.0.1',port:Number(env.DB_PORT||3306),user:env.DB_USER,password:env.DB_PASSWORD||'',database:env.DB_NAME,charset:'utf8mb4_bin',timezone:'Z',dateStrings:true,connectionLimit:Number(env.DB_POOL_SIZE||10),waitForConnections:true,queueLimit:100,multipleStatements:false,flags:['-FOUND_ROWS'],ssl:env.DB_SSL_CA?{ca:fs.readFileSync(env.DB_SSL_CA),rejectUnauthorized:true}:undefined});
}
export class MySQLStore{
 constructor(pool){this.pool=pool;}
 prepare(sql){return this.statement(sql,false);}
 // Ignore ONLY duplicate-key errors. Unlike INSERT IGNORE, invalid/truncated data still fails.
 prepareIgnore(sql){return this.statement(sql,true);}
 statement(sql,ignoreDuplicate,args=[]){
  const self=this;
  return {sql,args,ignoreDuplicate,bind(...values){return self.statement(sql,ignoreDuplicate,values);},
   async all(){return self.execute(this);},async run(){return self.execute(this);},async first(column){const row=(await self.execute(this)).results[0]||null;return column?row?.[column]??null:row;}};
 }
 async execute(stmt,connection=this.pool){
  try{
   const [rows]=await connection.execute(stmt.sql,stmt.args);
   return {success:true,results:Array.isArray(rows)?rows:[],meta:{changes:Array.isArray(rows)?0:rows.affectedRows,last_row_id:rows.insertId||0}};
  }catch(e){if(stmt.ignoreDuplicate&&e.code==='ER_DUP_ENTRY')return {success:true,results:[],meta:{changes:0}};throw e;}
 }
 async transaction(fn){
  const connection=await this.pool.getConnection();
  try{await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();const result=await fn(connection);await connection.commit();return result;}
  catch(e){await connection.rollback();throw e;}finally{connection.release();}
 }
 async batch(statements){return this.transaction(async c=>{const results=[];for(const s of statements)results.push(await this.execute(s,c));return results;});}
 async copyPricing({source,sourceRevision,entries,publish,owner,now}){
  try{return await this.transaction(async c=>{
   // Lock in stable order; include missing-key gaps under InnoDB REPEATABLE READ.
   const locked=new Map();
   for(const slug of [source,...entries.map(e=>e.slug)].sort()){
    const [rows]=await c.execute('SELECT * FROM country_pricing WHERE slug=? FOR UPDATE',[slug]);locked.set(slug,rows[0]);
   }
   if(locked.get(source)?.revision!==sourceRevision||entries.some(e=>(locked.get(e.slug)?.revision||0)!==e.expected))return {meta:{changes:0}};
   for(const e of entries){
    const old=locked.get(e.slug),revision=(old?.revision||0)+1;
    if(old){await c.execute('UPDATE country_pricing SET draft=?,setup_draft=?,revision=?,published=?,setup_published=?,published_revision=?,published_at=?,updated_by=?,updated_at=? WHERE slug=?',[e.draft,e.setup,revision,publish?e.draft:old.published,publish?e.setup:old.setup_published,publish?revision:old.published_revision,publish?now:old.published_at,owner,now,e.slug]);}
    else await c.execute('INSERT INTO country_pricing (slug,draft,setup_draft,revision,published,setup_published,published_revision,published_at,updated_by,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',[e.slug,e.draft,e.setup,revision,publish?e.draft:null,publish?e.setup:null,publish?revision:0,publish?now:null,owner,now]);
   }
   return {meta:{changes:entries.length}};
  });}catch(e){if(['ER_LOCK_DEADLOCK','ER_LOCK_WAIT_TIMEOUT','ER_DUP_ENTRY'].includes(e.code))return {meta:{changes:0}};throw e;}
 }
}
