import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Select checks, never publishers. Shared bridge tooling affects all integrated active bridges. */
export function selectBridges(paths, active) {
  const all = active.slice().sort();
  const shared =
    /^(?:\.github\/(?:actions\/|workflows\/bridge-|bridge-publishers\.json$)|scripts\/select-bridges\.mjs$)/;
  if (paths.some((path) => shared.test(path))) return all;
  return all.filter((slug) =>
    paths.some((path) => path.startsWith(`bridges/${slug}/`) || path.startsWith(`docs/bridges/${slug}/`)),
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [base, head] = process.argv.slice(2);
  const active = readdirSync('bridges', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  if (!base || /^0+$/.test(base)) console.log(JSON.stringify(active.sort()));
  else {
    if (![base, head].every((s) => /^[0-9a-f]{40}$/.test(s))) throw new Error('Expected full Git revisions');
    const paths = execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, head, '--'], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    }).split('\0');
    console.log(JSON.stringify(selectBridges(paths, active)));
  }
}
