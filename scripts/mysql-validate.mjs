import path from 'node:path';
import {createPool} from '../runtime/mysql.mjs';
import {schema,skipped,rows,transform,preflight,stableRow} from './data-transfer.mjs';
const dir=process.argv[2];if(!dir)throw Error('Usage: npm run db:validate -- /secure/export');const manifest=await preflight(dir),pool=createPool();
try{for(const [table,spec] of Object.entries(schema)){
 const [[count]]=await pool.query('SELECT COUNT(*) AS n FROM `'+table+'`'),expected=skipped.has(table)?0:manifest.tables[table].rows;if(count.n!==expected)throw Error('Row count mismatch: '+table);
 if(!skipped.has(table))for await(const original of rows(path.join(dir,table+'.jsonl'))){const row=transform(table,original),pk=spec.columns.find(c=>c.primaryKey).name;const [actual]=await pool.execute('SELECT * FROM `'+table+'` WHERE `'+pk+'`=?',[row[pk]]);if(actual.length!==1||stableRow(table,row)!==stableRow(table,actual[0]))throw Error('Row content mismatch in '+table);}
 console.log('Validated '+table+': '+expected);
}console.log('PASS: all migrated rows match, including intentional security transformations.');}finally{await pool.end();}
