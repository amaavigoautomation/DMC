import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const file='SEO_SITE_CONFIG.json',config=JSON.parse(fs.readFileSync(file));
if(process.env.APP_ORIGIN){const u=new URL(process.env.APP_ORIGIN);if(!['http:','https:'].includes(u.protocol)||u.pathname!=='/'||u.search||u.hash||u.username||u.password)throw Error('APP_ORIGIN must be an HTTP(S) origin');config.canonical_origin=u.origin;fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');}
execFileSync(process.execPath,['scripts/build-pricing.mjs'],{stdio:'inherit'});
