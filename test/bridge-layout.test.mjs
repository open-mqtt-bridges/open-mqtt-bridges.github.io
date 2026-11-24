import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
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

test('bridge-local secrets stay ignored without hiding shareable examples', () => {
  const hidden = [
    'bridges/ping/secrets/token',
    'bridges/homeconnect/config/.device.auth.json',
    'bridges/landroid/backup/device.auth.json',
    'bridges/modbus/config/device.local.yaml',
    'bridges/adguardhome/config/config.yml',
  ];
  const visible = [
    'bridges/adguardhome/.env.example',
    'bridges/homeconnect/config/config.example.yml',
    'bridges/ping/examples/bridge.toml',
    'bridges/philips-hue/backup/device.auth.json',
  ];
  const ignored = execFileSync('git', ['-c', 'core.excludesFile=/dev/null', 'check-ignore', '--no-index', '--stdin'], {
    input: [...hidden, ...visible].join('\n') + '\n',
    encoding: 'utf8',
  });
  assert.deepEqual(ignored.trimEnd().split('\n'), hidden);
});
