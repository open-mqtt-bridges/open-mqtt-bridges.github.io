import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectBridges } from '../scripts/select-bridges.mjs';

test('selects the owning bridge for source or guide changes, all for shared CI, none for website or archive work', () => {
  const active = ['wled', 'modbus'];
  assert.deepEqual(selectBridges(['bridges/wled/src/main.ts', 'README.md'], active), ['wled']);
  assert.deepEqual(selectBridges(['docs/bridges/modbus/index.md'], active), ['modbus']);
  assert.deepEqual(selectBridges(['.github/workflows/bridge-ci.yml'], active), ['modbus', 'wled']);
  assert.deepEqual(selectBridges(['archive/idm-energy/config.yml', 'docs/development.md'], active), []);
});

test('shared runtime changes select their consumers plus any directly changed bridge', () => {
  const active = ['modbus', 'philips-hue', 'homeconnect', 'ping'];
  assert.deepEqual(selectBridges(['libs/mqtt/index.js'], active), ['homeconnect', 'philips-hue']);
  assert.deepEqual(selectBridges(['libs/config/package.json', 'bridges/ping/src/main.rs'], active), [
    'homeconnect',
    'philips-hue',
    'ping',
  ]);
});
