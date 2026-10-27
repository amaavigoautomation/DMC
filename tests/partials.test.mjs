import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
test('shared header/footer partials are in sync with every page that uses them',()=>{
 const r=spawnSync(process.execPath,['scripts/sync-partials.mjs','--check'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr||r.stdout);
});
test('every partial marker names an existing partial and pages keep exactly one master header',()=>{
 const partials=new Set(fs.readdirSync('partials').filter(f=>f.endsWith('.html')).map(f=>f.slice(0,-5)));
 assert.ok(partials.has('header')&&partials.has('footer'));
 let users=0;
 for(const file of fs.readdirSync('website').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync('website/'+file,'utf8');
  for(const [,name] of html.matchAll(/<!-- partial:([a-z0-9-]+) -->/g))assert.ok(partials.has(name),file+' uses unknown partial '+name);
  if(html.includes('<!-- partial:header -->')){users++;assert.equal((html.match(/<header class="dmc-master-header">/g)||[]).length,1,file);}
 }
 assert.ok(users>=70,'expected the shared header on the public pages, found '+users);
});
