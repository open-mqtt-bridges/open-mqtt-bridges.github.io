import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCatalog, profileTable, renderSite } from './catalog.mjs';

const catalog = await loadCatalog();
const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL('index.html', output), await renderSite(catalog));
await cp(new URL('../assets/', import.meta.url), new URL('assets/', output), {
  recursive: true,
  filter: (source) => !source.endsWith('README.md'),
});
await cp(new URL('../src/styles.css', import.meta.url), new URL('styles.css', output));
await cp(new URL('../src/search.js', import.meta.url), new URL('search.js', output));
await cp(new URL('../src/theme.js', import.meta.url), new URL('theme.js', output));
await writeFile(new URL('.nojekyll', output), '');

const profileIndex = process.argv.indexOf('--profile-root');
if (profileIndex !== -1) {
  if (!process.argv[profileIndex + 1]) throw new Error('--profile-root requires a path.');
  const root = resolve(process.argv[profileIndex + 1]);
  for (const file of ['README.md', 'profile/README.md']) {
    const path = resolve(root, file);
    const text = await readFile(path, 'utf8');
    const region = /<!-- bridges:start -->[\s\S]*?<!-- bridges:end -->/;
    if (!region.test(text)) throw new Error(`Missing bridge table markers: ${path}`);
    await writeFile(
      path,
      text.replace(region, `<!-- bridges:start -->\n${profileTable(catalog)}\n<!-- bridges:end -->`),
    );
  }
}
console.log(`Built ${catalog.length} bridge cards in dist/.`);
