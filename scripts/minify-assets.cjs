// Usage: NODE_PATH=/path/to/node_modules node scripts/minify-assets.cjs
// Requires esbuild 0.25+; generates delivery assets, preserving authored files.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
(async () => {
  const hashes = {};
  for (const [kind, target] of [['js', 'es2020']]) {
    const input = path.join(root, 'website', kind, 'main.' + kind);
    const output = input.replace('.' + kind, '.min.' + kind);
    await esbuild.build({entryPoints:[input], outfile:output, minify:true, target, legalComments:'none', logLevel:'warning'});
    hashes[kind] = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex').slice(0,12);
    console.log(kind, fs.statSync(input).size, '->', fs.statSync(output).size, 'bytes');
  }
  hashes.css = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'website/css/main.css'))).digest('hex').slice(0,12);
  fs.rmSync(path.join(root,'website/css/main.min.css'),{force:true});
  for (const file of fs.readdirSync(path.join(root,'website')).filter(x=>x.endsWith('.html'))) {
    const p=path.join(root,'website',file);let s=fs.readFileSync(p,'utf8');
    s=s.replace(/href="css\/main(?:\.min)?\.css(?:\?v=[^"]*)?"/g, `href="css/main.css?v=${hashes.css}"`);
    const re=/<script\b[^>]*src="js\/main(?:\.min)?\.js(?:\?v=[^"]*)?"[^>]*><\/script>/g;
    const matches=[...s.matchAll(re)];if(matches.length!==1)throw new Error('Expected one shared script: '+file);
    let tag=matches[0][0].replace(/src="[^"]+"/,`src="js/main.min.js?v=${hashes.js}"`);
    if(!/\bdefer\b/.test(tag))tag=tag.replace('<script','<script defer');
    s=s.replace(re,'').replace('</head>',tag+'\n</head>');fs.writeFileSync(p,s);
  }
})();
