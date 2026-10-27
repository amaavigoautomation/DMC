import path from 'node:path';
import {createPool,MySQLStore} from '../runtime/mysql.mjs';
import {schema,skipped,rows,transform,preflight} from './data-transfer.mjs';
const dir=process.argv[2];if(!dir)throw Error('Usage: npm run db:import -- /secure/export [--check-only]');
await preflight(dir);if(process.argv.includes('--check-only')){console.log('All export hashes, counts and values validated. No writes.');process.exit(0);}
if(process.env.CONFIRM_EMPTY_IMPORT!=='yes')throw Error('Set CONFIRM_EMPTY_IMPORT=yes only for a new, empty migration target');
const pool=createPool(),db=new MySQLStore(pool);
try{await db.transaction(async c=>{
 for(const table of Object.keys(schema)){const [[r]]=await c.query('SELECT COUNT(*) AS n FROM `'+table+'`');if(r.n!==0)throw Error('Target table is not empty: '+table);}
 for(const [table,spec] of Object.entries(schema)){
  if(skipped.has(table)){console.log('Excluded transient '+table);continue;}
  const cols=spec.columns.map(c=>c.name),sql='INSERT INTO `'+table+'` ('+cols.map(c=>'`'+c+'`').join(',')+') VALUES ('+cols.map(()=>'?').join(',')+')';let count=0;
  for await(const raw of rows(path.join(dir,table+'.jsonl'))){const row=transform(table,raw);await c.execute(sql,cols.map(col=>row[col]));count++;}
  console.log('Imported '+table+': '+count);
 }
});console.log('Committed all tables. Run db:validate before starting the application.');}finally{await pool.end();}
