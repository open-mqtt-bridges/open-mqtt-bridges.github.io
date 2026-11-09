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

/** Escape catalog text before interpolating it into static HTML. */
export function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}

/** Render accessible cards with direct links; search never owns link availability. */
export function renderCards(catalog) {
  return catalog
    .map(
      (
        bridge,
        index,
      ) => `<article class="bridge-card${bridge.archived ? ' archived' : ''}" data-bridge data-search="${escapeHtml(`${bridge.name} ${bridge.slug} ${bridge.description} ${bridge.category} ${bridge.tag}`)}">
  <div class="card-top"><span class="bridge-monogram" aria-hidden="true">${escapeHtml(bridge.initials)}</span><span class="category">${escapeHtml(bridge.category)}</span><span class="card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></div>
  <h3>${escapeHtml(bridge.name)}${bridge.archived ? ' <span class="archive-label">Archived</span>' : ''}</h3>
  <p>${escapeHtml(bridge.description)}</p>
  <div class="card-links"><a href="${bridge.documentation}" aria-label="${escapeHtml(bridge.name)} ${bridge.documentationType === 'readme' ? 'README documentation' : 'documentation'}">${bridge.documentationType === 'readme' ? 'README docs' : 'Documentation'} <span aria-hidden="true">↗</span></a><a href="${bridge.repository}" aria-label="${escapeHtml(bridge.name)} on GitHub">GitHub <span aria-hidden="true">↗</span></a></div>
</article>`,
    )
    .join('\n');
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

/** Build deterministic HTML from the template, refusing unknown or missing tokens. */
export async function renderSite(catalog) {
  const template = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
  const result = template
    .replace('{{CARDS}}', renderCards(catalog))
    .replaceAll('{{ACTIVE_COUNT}}', String(catalog.filter((bridge) => !bridge.archived).length).padStart(2, '0'))
    .replaceAll('{{TOTAL_COUNT}}', String(catalog.length));
  if (/\{\{[A-Z_]+\}\}/.test(result)) throw new Error('Unresolved HTML template token.');
  return result;
}
