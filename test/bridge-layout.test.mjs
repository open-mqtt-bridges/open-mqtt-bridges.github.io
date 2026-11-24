import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { loadCatalog } from '../scripts/catalog.mjs';

test('active bridges use the central guide and project tooling', async () => {
  for (const { slug, archived } of await loadCatalog()) {
    if (archived) continue;
    assert.ok(existsSync(`docs/bridges/${slug}/index.md`), `Missing central guide for ${slug}`);
    for (const name of ['.agents', '.github', '.specify', '.vscode', 'docs', 'specs']) {
      const path = `bridges/${slug}/${name}`;
      assert.ok(!existsSync(path), `Unexpected bridge-local ${path}`);
    }
  }
});
