import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCatalog, profileTable, renderSite } from './catalog.mjs';

const catalog = await loadCatalog();
const output = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', output), 'utf8');
assert.equal(html, await renderSite(catalog), 'Run the build: generated HTML differs from source/catalog.');
assert.equal((html.match(/data-bridge /g) ?? []).length, 10);
for (const bridge of catalog) {
  assert.ok(html.includes(`href="${bridge.repository}"`));
  assert.ok(html.includes(`href="${bridge.documentation}"`));
}
for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
  if (/^https:\/\//.test(match[1])) continue;
  assert.ok(!match[1].startsWith('//'), 'Protocol-relative external assets are not permitted.');
  assert.ok(
    (await stat(new URL(match[1] === './' ? 'index.html' : match[1], output))).isFile(),
    `Missing asset: ${match[1]}`,
  );
}
assert.ok(html.includes('id="bridge-search"'));
assert.ok(html.includes('data-search-form hidden'), 'Search controls must remain hidden without JavaScript.');
assert.ok(html.includes('aria-live="polite"'));
assert.ok(html.includes('href="#bridges"'));
const css = await readFile(new URL('styles.css', output), 'utf8');
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(css.includes(':focus-visible'));
assert.ok(!html.includes('fonts.googleapis.com'));

const profileIndex = process.argv.indexOf('--profile-root');
if (profileIndex !== -1) {
  if (!process.argv[profileIndex + 1]) throw new Error('--profile-root requires a path.');
  for (const file of ['README.md', 'profile/README.md']) {
    const text = await readFile(resolve(process.argv[profileIndex + 1], file), 'utf8');
    assert.equal(
      text.match(/<!-- bridges:start -->\n([\s\S]*?)\n<!-- bridges:end -->/)?.[1],
      profileTable(catalog),
      `Profile catalog differs: ${file}`,
    );
  }
}
console.log('Catalog, deterministic HTML, local assets and profile consistency checks passed.');
