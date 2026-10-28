import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {expandIncludes,partial,includeNames} from '../scripts/includes.mjs';
test('include references expand to the shared partials and unknown names fail',()=>{
 assert.equal(expandIncludes('<body><!-- include:header --></body>'),'<body>'+partial('header')+'</body>');
 assert.throws(()=>expandIncludes('<!-- include:nope -->'),/Unknown include/);
});
test('pages reference partials instead of holding copies',()=>{
 let users=0;
 for(const file of fs.readdirSync('website').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync('website/'+file,'utf8');
  const names=includeNames(html);
  if(names.includes('header')){users++;assert.equal(names.filter(n=>n==='header').length,1,file);assert.ok(!html.includes('class="dmc-master-header"'),file+' still holds a pasted header');}
  if(names.includes('footer'))assert.ok(!html.includes('class="dmc-master-footer"'),file+' still holds a pasted footer');
  assert.ok(!html.includes('<!-- partial:'),file+' has old partial markers');
 }
 assert.ok(users>=70,'expected the shared header on the public pages, found '+users);
});
