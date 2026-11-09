import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCatalog, validateCatalog, renderCards } from '../scripts/catalog.mjs';

test('public catalog rejects missing, duplicate and reordered bridges', async () => {
  const catalog = await loadCatalog();
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
      items[3].archived = false;
    },
    (items) => {
      items[0].documentation = 'https://open-mqtt-bridges.github.io/adguardhome/';
    },
    (items) => {
      items[0].documentationType = 'site';
    },
  ]) {
    const invalid = structuredClone(catalog);
    mutate(invalid);
    assert.throws(() => validateCatalog(invalid));
  }
});

test('catalog text is escaped while all bridge links remain native anchors', async () => {
  const catalog = await loadCatalog();
  catalog[0].description = '<script>alert("unsafe")</script>';
  const html = renderCards(catalog);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  for (const bridge of catalog) assert.ok(html.includes(`href="${bridge.documentation}"`));
});
