import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Resolve a stable release tag against the selected bridge's own version and existing registry package. */
export function selectRelease(tag, root = '.') {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/.exec(tag);
  if (!match || match[0] !== tag) throw new Error('Expected <bridge>/v<major>.<minor>.<patch>');
  const [, slug, version] = match;
  const read = (name) => readFileSync(join(root, name), 'utf8');
  const source = JSON.parse(read('migration/sources.json')).sources.find(
    (source) => source.slug === slug && !source.archived,
  );
  const image = JSON.parse(read('migration/packages.json')).packages.find(
    (p) => p.package === source?.container,
  )?.package;
  if (!source || !image || source.prefix !== `bridges/${slug}`) throw new Error('Bridge has no active publisher');
  let manifestVersion;
  if (slug === 'modbus' || slug === 'display') {
    const section = read(`${source.prefix}/Cargo.toml`)
      .split(/^\[package\]\s*$/m)[1]
      ?.split(/^\[/m)[0];
    manifestVersion = /^version\s*=\s*"([^"]+)"\s*$/m.exec(section ?? '')?.[1];
  } else manifestVersion = JSON.parse(read(`${source.prefix}/package.json`)).version;
  if (version !== manifestVersion) throw new Error('Release tag does not match the bridge manifest');
  const immutable = ['adguardhome', 'display'].includes(slug) ? version : `v${version}`;
  const aliases = ['latest'];
  if (slug === 'display') aliases.push(version.split('.').slice(0, 2).join('.'));
  if (slug === 'modbus') aliases.push('master'); // Preserve the original default-branch image alias.
  return { slug, prefix: source.prefix, version, image, immutable, aliases };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(selectRelease(process.argv[2])));
}
