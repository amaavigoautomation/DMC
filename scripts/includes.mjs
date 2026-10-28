// Shared page includes (header, footer).
//
// Pages in website/ contain one-line references such as
//
//   <!-- include:header -->
//   <!-- include:footer -->
//
// The build replaces each reference with partials/<name>.html while it reads the
// pages (scripts/build-pricing.mjs). The files in website/ never hold a copy, so
// editing partials/header.html or partials/footer.html once and rebuilding
// updates every page that references it. The server still receives complete HTML.
import fs from 'node:fs';

const dir = new URL('../partials/', import.meta.url);
const cache = new Map();

export function partial(name) {
  if (!/^[a-z0-9-]+$/.test(name)) throw Error('Invalid include name: ' + name);
  if (!cache.has(name)) {
    const file = new URL(name + '.html', dir);
    if (!fs.existsSync(file)) throw Error(`Unknown include "${name}": expected partials/${name}.html`);
    cache.set(name, fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trim());
  }
  return cache.get(name);
}

export const includeNames = html => [...html.matchAll(/<!-- include:([a-z0-9-]+) -->/g)].map(m => m[1]);

export function expandIncludes(html) {
  return html.replace(/<!-- include:([a-z0-9-]+) -->/g, (_, name) => partial(name));
}
