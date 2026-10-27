// Password is read from stdin, never an argument or a committed file.
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import fs from 'node:fs';
const password=fs.readFileSync(0,'utf8').replace(/\r?\n$/,'');
if(password.length<12||password.length>128)throw Error('Use a password of 12–128 characters');
const salt=randomBytes(16).toString('hex'),hash=pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
process.stdout.write(JSON.stringify({salt,hash,iterations:100000})+'\n');
