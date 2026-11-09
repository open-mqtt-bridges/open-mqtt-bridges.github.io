import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCatalog, profileTable } from './catalog.mjs';
import { deploymentVersion } from './deployment-version.mjs';

const catalog = await loadCatalog();
const output = new URL('../.output/public/', import.meta.url);
const html = await readFile(new URL('index.html', output), 'utf8');
for (const bridge of catalog) {
  assert.ok(html.includes(`data-bridge-slug="${bridge.slug}"`), `Missing SSR card: ${bridge.slug}`);
  assert.ok(html.includes(`href="${bridge.repository}"`));
  assert.ok(html.includes(`href="${bridge.documentation}"`));
}
const form = html.match(/<form[^>]*data-search-form[^>]*>/)?.[0];
assert.ok(form?.includes('display:none'), 'Search must remain hidden before hydration.');
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
let commit = process.env.GITHUB_SHA || '';
if (!commit) {
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    /* Source archive. */
  }
}
const version = deploymentVersion(pkg.version, commit, process.env.NUXT_PUBLIC_SITE_VERSION);
for (const route of ['', 'imprint/', 'privacy-policy/']) {
  const page = await readFile(new URL(`${route}index.html`, output), 'utf8');
  assert.ok(page.includes(`data-site-version="${version}"`), `Wrong deployment version: ${route}`);
  assert.ok(page.includes('href="https://buymeacoffee.com/tobiaswaelde"'), `Missing support badge: ${route}`);
  assert.ok(page.includes('href="https://tobiaswaelde.com"'), `Missing author footer: ${route}`);
  assert.ok(
    page.includes('href="/imprint"') && page.includes('href="/privacy-policy"'),
    `Missing legal footer: ${route}`,
  );
  for (const match of page.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url = new URL(match[1], `https://open-mqtt-bridges.github.io/${route}`);
    if (url.origin !== 'https://open-mqtt-bridges.github.io' || !['http:', 'https:'].includes(url.protocol)) continue;
    // Bridge docs share the origin but are deployed by their own repositories.
    if (catalog.some((bridge) => bridge.documentationType === 'site' && url.pathname.startsWith(`/${bridge.slug}/`)))
      continue;
    const path = new URL(url.pathname.slice(1), output);
    const candidates = [
      path,
      new URL(
        `${url.pathname.replace(/^\//, '').replace(/\/$/, '')}${url.pathname === '/' ? '' : '/'}index.html`,
        output,
      ),
    ];
    const found = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          return (await stat(candidate)).isFile();
        } catch {
          return false;
        }
      }),
    );
    assert.ok(found.some(Boolean), `Missing generated route/asset: ${url.pathname}`);
  }
}
const imprint = await readFile(new URL('imprint/index.html', output), 'utf8');
assert.ok(
  imprint.includes('Tobias Wälde') && imprint.includes('Sandhübel 8') && imprint.includes('business@tobiaswaelde.com'),
);
const privacy = await readFile(new URL('privacy-policy/index.html', output), 'utf8');
assert.ok(privacy.includes('GitHub Pages') && privacy.includes('omb-color-mode'));
const profileIndex = process.argv.indexOf('--profile-root');
if (profileIndex !== -1) {
  if (!process.argv[profileIndex + 1]) throw new Error('--profile-root requires a path.');
  for (const file of ['README.md', 'profile/README.md']) {
    const text = await readFile(resolve(process.argv[profileIndex + 1], file), 'utf8');
    assert.equal(text.match(/<!-- bridges:start -->\n([\s\S]*?)\n<!-- bridges:end -->/)?.[1], profileTable(catalog));
  }
}
console.log(`Nuxt SSR catalog, legal routes, assets and deployment version ${version} passed.`);
