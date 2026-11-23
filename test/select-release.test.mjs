import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { selectRelease } from '../scripts/select-release.mjs';

test('selects only the named publisher and preserves historical image naming', () => {
  const nodeVersion = JSON.parse(readFileSync('bridges/wled/package.json')).version;
  const release = selectRelease(`wled/v${nodeVersion}`);
  assert.equal(release.image, 'ghcr.io/open-mqtt-bridges/wled');
  assert.equal(release.immutable, `v${nodeVersion}`);
  const cargoVersion = /^version = "([^"]+)"$/m.exec(readFileSync('bridges/display/Cargo.toml', 'utf8'))[1];
  const display = selectRelease(`display/v${cargoVersion}`);
  assert.equal(display.immutable, cargoVersion);
  assert.ok(display.aliases.includes(cargoVersion.split('.').slice(0, 2).join('.')));
});

test('rejects archive, recovery, malformed, unknown, unpublished, and mismatched tags', () => {
  for (const tag of [
    'import/wled/v1.0.0',
    'recovery/wled/foo',
    'v1.0.0',
    'idm-energy/v1.0.0',
    'ping/v1.0.0',
    'website/v1.0.0',
    'wled/v999999.0.0',
    '../v1.0.0',
  ])
    assert.throws(() => selectRelease(tag));
});
