import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCatalog, validateCatalog } from '../scripts/catalog.mjs';

test('public catalog rejects missing, duplicate and reordered bridges', async () => {
  const catalog = await loadCatalog();
  assert.throws(() => validateCatalog(catalog.filter((bridge) => bridge.slug !== 'ping')));
  assert.throws(() => validateCatalog(catalog.slice(1)));
  assert.throws(() => validateCatalog([catalog[1], ...catalog.slice(1)]));
  assert.throws(() => validateCatalog([...catalog].reverse()));
});

test('public catalog rejects incorrect hosts, archived flags and README destinations', async () => {
  const catalog = await loadCatalog();
  for (const mutate of [
    (items) => {
      items[0].repository = 'https://example.org/adguardhome';
    },
    (items) => {
      items[0].archived = true;
    },
    (items) => {
      items[0].documentation = 'https://github.com/open-mqtt-bridges/adguardhome#readme';
    },
    (items) => {
      items[0].documentationType = 'readme';
    },
  ]) {
    const invalid = structuredClone(catalog);
    mutate(invalid);
    assert.throws(() => validateCatalog(invalid));
  }
});

test('local search handles categories, case, whitespace, empty and unmatched input', async () => {
  const catalog = await loadCatalog();
  const { filterBridges } = await import('../shared/bridges.ts');
  assert.deepEqual(
    filterBridges(catalog, '  LIGHTING  ').map((bridge) => bridge.slug),
    ['philips-hue', 'wled'],
  );
  assert.equal(filterBridges(catalog, '').length, catalog.length);
  assert.equal(filterBridges(catalog, 'ICMP')[0].slug, 'ping');
  assert.equal(filterBridges(catalog, 'does-not-exist').length, 0);
  assert.deepEqual(filterBridges(catalog, 'IDM'), []);
});
