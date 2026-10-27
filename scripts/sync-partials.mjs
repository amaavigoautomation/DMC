// Shared page partials (header, footer).
//
// Edit partials/header.html or partials/footer.html once, then run the build
// (or `node scripts/sync-partials.mjs`). Every page that contains a marker pair
//
//   <!-- partial:header -->
//   ...anything, replaced on sync...
//   <!-- /partial:header -->
//
// gets the partial's content written between the markers. Pages stay complete,
// self-contained HTML (good for crawlers and no-JS visitors) and the server and
// runtime are unaffected. Pages without markers (admin pages, previews, the
// pages whose header is injected by shared JavaScript) are never touched.
//
//   node scripts/sync-partials.mjs           write changes
//   node scripts/sync-partials.mjs --check   change nothing; exit 1 if any page is out of date
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const pagesDir = path.join(root, 'website');
const partialsDir = path.join(root, 'partials');
const check = process.argv.includes('--check');

const partials = {};
for (const file of fs.readdirSync(partialsDir).filter(f => f.endsWith('.html'))) {
  partials[file.slice(0, -5)] = fs.readFileSync(path.join(partialsDir, file), 'utf8').replace(/\r\n/g, '\n').trim();
}

const markers = /<!-- partial:([a-z0-9-]+) -->[\s\S]*?<!-- \/partial:\1 -->/g;
const stale = [];
let synced = 0;

for (const file of fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).sort()) {
  const full = path.join(pagesDir, file);
  const original = fs.readFileSync(full, 'utf8');
  if (!original.includes('<!-- partial:')) continue;
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const updated = original.replace(markers, (_, name) => {
    if (!(name in partials)) throw Error(`${file}: unknown partial "${name}" (expected a file partials/${name}.html)`);
    const body = partials[name].replace(/\n/g, eol);
    return `<!-- partial:${name} -->${eol}${body}${eol}<!-- /partial:${name} -->`;
  });
  // Unbalanced or nested markers would silently survive the regex; fail loudly.
  const opens = (updated.match(/<!-- partial:/g) || []).length;
  const closes = (updated.match(/<!-- \/partial:/g) || []).length;
  if (opens !== closes) throw Error(`${file}: unbalanced partial markers`);
  if (updated === original) { synced++; continue; }
  stale.push(file);
  if (!check) fs.writeFileSync(full, updated);
}

if (check) {
  if (stale.length) {
    console.error('Out of date with partials/ (run: node scripts/sync-partials.mjs):\n  ' + stale.join('\n  '));
    process.exit(1);
  }
  console.log(`Partials in sync (${synced} pages).`);
} else {
  console.log(`Partials synced: ${stale.length} page(s) updated, ${synced} already current.`);
}
