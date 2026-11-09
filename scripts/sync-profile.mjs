import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCatalog, profileTable } from './catalog.mjs';

const root = process.argv[2];
if (!root) throw new Error('Usage: node scripts/sync-profile.mjs <organization-repository>');
const table = profileTable(await loadCatalog());
for (const file of ['README.md', 'profile/README.md']) {
  const path = resolve(root, file);
  const text = await readFile(path, 'utf8');
  const region = /<!-- bridges:start -->[\s\S]*?<!-- bridges:end -->/;
  if (!region.test(text)) throw new Error(`Missing bridge markers: ${path}`);
  await writeFile(path, text.replace(region, `<!-- bridges:start -->\n${table}\n<!-- bridges:end -->`));
}
console.log('Organization README tables synchronized.');
