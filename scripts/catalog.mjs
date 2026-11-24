import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

function directories(folder) {
  return readdirSync(new URL(`../${folder}/`, import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/** Enforce the public catalog contract, including archive and documentation destinations. */
export function validateCatalog(catalog) {
  const archived = new Set(directories('archive'));
  const slugs = [...directories('bridges'), ...archived].sort();
  if (!Array.isArray(catalog) || JSON.stringify(catalog.map((bridge) => bridge.slug)) !== JSON.stringify(slugs)) {
    throw new Error('Catalog must match the active and archived bridge directories in alphabetic order.');
  }
  for (const bridge of catalog) {
    for (const field of ['name', 'description', 'category', 'tag', 'initials']) {
      if (typeof bridge[field] !== 'string' || !bridge[field].trim())
        throw new Error(`Missing ${field}: ${bridge.slug}`);
    }
    if (bridge.logo !== null && bridge.logo !== `/assets/bridges/${bridge.slug}.svg`)
      throw new Error(`Incorrect local logo path: ${bridge.slug}`);
    if (bridge.archived !== archived.has(bridge.slug)) throw new Error(`Incorrect archive status: ${bridge.slug}`);
    const originalRepository = `https://github.com/open-mqtt-bridges/${bridge.slug}`;
    const repository = `https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/tree/main/${bridge.archived ? 'archive' : 'bridges'}/${bridge.slug}`;
    const readme = bridge.archived;
    if (
      bridge.repository !== repository ||
      bridge.documentation !==
        (readme ? `${originalRepository}#readme` : `https://open-mqtt-bridges.github.io/${bridge.slug}/`)
    ) {
      throw new Error(`Incorrect public URL: ${bridge.slug}`);
    }
    if (bridge.documentationType !== (readme ? 'readme' : 'site'))
      throw new Error(`Incorrect documentation type: ${bridge.slug}`);
  }
  return catalog;
}

/** Read and validate the repository-owned catalog. */
export async function loadCatalog() {
  return validateCatalog(JSON.parse(await readFile(new URL('../bridges.json', import.meta.url), 'utf8')));
}

/** Produce the shared profile table; only its delimited region is synchronized. */
export function profileTable(catalog) {
  return [
    '| Bridge | What it connects | Documentation | Status |',
    '| --- | --- | --- | --- |',
    ...catalog.map(
      (bridge) =>
        `| [${bridge.name}](${bridge.repository}) | ${bridge.description} | [${bridge.documentationType === 'readme' ? 'README' : 'Docs'}](${bridge.documentation}) | ${bridge.archived ? 'Archived' : 'Active'} |`,
    ),
  ].join('\n');
}
