import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function stableVersion(tag, prefix) {
  if (!tag.startsWith(prefix)) return null;
  const match = semver.exec(tag.slice(prefix.length));
  return match?.[0] === tag.slice(prefix.length) ? match.slice(1).map(BigInt) : null;
}

/** Fail closed unless every proposed alias advances or retains a proved version, or is confirmed absent. */
export function checkReleaseAliases(pages, immutable, tags) {
  const prefix = immutable.startsWith('v') ? 'v' : '';
  const proposed = stableVersion(immutable, prefix);
  if (!proposed || !tags.includes(immutable) || new Set(tags).size !== tags.length) {
    throw new Error('Invalid proposed release tags');
  }
  if (!Array.isArray(pages) || !pages.length || !pages.every(Array.isArray)) {
    throw new Error('Package version evidence is unavailable');
  }
  const versions = pages.flat().map((version) => {
    const observed = version?.metadata?.container?.tags;
    if (!Array.isArray(observed) || !observed.every((tag) => typeof tag === 'string')) {
      throw new Error('Incomplete package version evidence');
    }
    return observed;
  });
  for (const tag of tags) {
    const targets = versions.filter((version) => version.includes(tag));
    if (!targets.length) continue;
    if (tag === immutable || /^sha-[0-9a-f]{7}$/.test(tag)) throw new Error(`Immutable tag already exists: ${tag}`);
    const stable = targets.flatMap((target) => target.map((name) => stableVersion(name, prefix)).filter(Boolean));
    if (targets.length !== 1 || stable.length !== 1) throw new Error(`Cannot prove current version for ${tag}`);
    const delta = proposed.findIndex((segment, index) => segment !== stable[0][index]);
    if (delta !== -1 && proposed[delta] < stable[0][delta]) throw new Error(`Release would move ${tag} backward`);
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { IMAGE, IMMUTABLE, TAGS } = process.env;
  if (!IMAGE || !IMMUTABLE || !TAGS) throw new Error('Missing release identity');
  const refs = TAGS.split(',');
  if (refs.some((ref) => !ref.startsWith(`${IMAGE}:`) || !ref.slice(IMAGE.length + 1))) {
    throw new Error('Unexpected release image reference');
  }
  checkReleaseAliases(
    JSON.parse(readFileSync(process.argv[2], 'utf8')),
    IMMUTABLE,
    refs.map((ref) => ref.slice(IMAGE.length + 1)),
  );
}
