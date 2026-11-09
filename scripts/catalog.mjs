import { readFile } from 'node:fs/promises';

const slugs = [
  'adguardhome',
  'display',
  'homeconnect',
  'idm-energy',
  'landroid',
  'modbus',
  'philips-hue',
  'pocketbase',
  'roborock',
  'wled',
];

/** Enforce the public catalog contract, including archive and documentation destinations. */
export function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || JSON.stringify(catalog.map((bridge) => bridge.slug)) !== JSON.stringify(slugs)) {
    throw new Error('Catalog must contain exactly the ten bridges in alphabetic repository order.');
  }
  for (const bridge of catalog) {
    for (const field of ['name', 'description', 'category', 'tag', 'initials']) {
      if (typeof bridge[field] !== 'string' || !bridge[field].trim())
        throw new Error(`Missing ${field}: ${bridge.slug}`);
    }
    if (bridge.logo !== null && bridge.logo !== `/assets/bridges/${bridge.slug}.svg`)
      throw new Error(`Incorrect local logo path: ${bridge.slug}`);
    if (bridge.archived !== (bridge.slug === 'idm-energy')) throw new Error(`Incorrect archive status: ${bridge.slug}`);
    const repository = `https://github.com/open-mqtt-bridges/${bridge.slug}`;
    const readme = ['adguardhome', 'idm-energy'].includes(bridge.slug);
    if (
      bridge.repository !== repository ||
      bridge.documentation !== (readme ? `${repository}#readme` : `https://open-mqtt-bridges.github.io/${bridge.slug}/`)
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
