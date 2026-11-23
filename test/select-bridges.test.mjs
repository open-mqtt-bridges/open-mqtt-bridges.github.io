import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectBridges } from '../scripts/select-bridges.mjs';

test('selects the owning bridge for source or guide changes, all for shared CI, none for website or archive work', () => {
  const active = ['wled', 'modbus'];
  assert.deepEqual(selectBridges(['bridges/wled/src/main.ts', 'README.md'], active), ['wled']);
  assert.deepEqual(selectBridges(['bridges/modbus/docs/index.md'], active), ['modbus']);
  assert.deepEqual(selectBridges(['.github/workflows/bridge-ci.yml'], active), ['modbus', 'wled']);
  assert.deepEqual(selectBridges(['archive/idm-energy/config.yml', 'docs/development.md'], active), []);
});
