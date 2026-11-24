import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCatalog } from './catalog.mjs';

const fixed = ['adguardhome', 'display', 'modbus', 'ping'];

/** Validate the complete inventory before filtering it; a successful check must not hide missing coverage. */
export function selectJobs(inventory, active, affected) {
  const jobs = { node: [], adguardhome: [], display: [], modbus: [], ping: [], 'ping-container': [] };
  const known = new Set(active);
  const seen = new Set();
  const selected = new Set(affected);
  if (!Array.isArray(inventory)) throw new Error('Expected bridge check assignments');
  for (const entry of inventory) {
    if (!Array.isArray(entry) || entry.length !== 2) throw new Error('Expected a slug and its check profile');
    const [slug, profile] = entry;
    if (!known.has(slug)) throw new Error(`Unknown bridge: ${slug}`);
    if (seen.has(slug)) throw new Error(`Duplicate bridge assignment: ${slug}`);
    if (!(fixed.includes(slug) ? profile === slug : profile === 'node')) {
      throw new Error(`Unsupported check profile ${profile} for ${slug}`);
    }
    seen.add(slug);
    if (!selected.has(slug)) continue;
    jobs[profile].push(slug);
    if (profile === 'ping') jobs['ping-container'].push(slug);
  }
  for (const slug of active) if (!seen.has(slug)) throw new Error(`Missing check assignment: ${slug}`);
  return jobs;
}

/** Select checks, never publishers. Shared bridge tooling affects all integrated active bridges. */
export function selectBridges(paths, active) {
  const all = active.slice().sort();
  const shared =
    /^(?:bridges\.json$|\.github\/(?:actions\/|workflows\/bridge-|bridge-(?:publishers|checks)\.json$)|scripts\/(?:select-bridges\.mjs|check-native-readiness\.sh)$)/;
  if (paths.some((path) => shared.test(path))) return all;
  const libs = new Set(paths.filter((path) => path.startsWith('libs/')).map((path) => path.split('/')[1]));
  return all.filter((slug) => {
    if (paths.some((path) => path.startsWith(`bridges/${slug}/`) || path.startsWith(`docs/bridges/${slug}/`)))
      return true;
    const manifest = `bridges/${slug}/package.json`;
    if (!libs.size || !existsSync(manifest)) return false;
    const { dependencies = {} } = JSON.parse(readFileSync(manifest, 'utf8'));
    return [...libs].some((lib) => dependencies[`@open-mqtt-bridges/${lib}`] === `file:../../libs/${lib}`);
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [base, head, mode] = process.argv.slice(2);
  const active = (await loadCatalog()).filter((bridge) => !bridge.archived).map(({ slug }) => slug);
  const inventory = JSON.parse(readFileSync(new URL('../.github/bridge-checks.json', import.meta.url), 'utf8'));
  let affected = active;
  if (base && !/^0+$/.test(base)) {
    if (![base, head].every((s) => /^[0-9a-f]{40}$/.test(s))) throw new Error('Expected full Git revisions');
    const paths = execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, head, '--'], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    }).split('\0');
    affected = selectBridges(paths, active);
  }
  const jobs = selectJobs(inventory, active, affected);
  console.log(JSON.stringify(mode === '--jobs' ? jobs : affected));
}
