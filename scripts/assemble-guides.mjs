import { cp, lstat } from 'node:fs/promises';
import { loadCatalog } from './catalog.mjs';

// Nuxt owns the root. Each guide owns exactly one new top-level directory.
for (const { slug, archived } of await loadCatalog()) {
  if (archived) continue;
  const source = new URL(`../.output/guides/${slug}/`, import.meta.url);
  const target = new URL(`../.output/public/${slug}`, import.meta.url);
  if (!(await lstat(new URL('index.html', source))).isFile()) throw new Error(`No guide entry point: ${slug}`);
  if (await lstat(target).catch((error) => (error.code === 'ENOENT' ? null : Promise.reject(error)))) {
    throw new Error(`Guide collides with existing Pages output: ${slug}`);
  }
  await cp(source, target, { recursive: true, force: false, errorOnExist: true });
}
