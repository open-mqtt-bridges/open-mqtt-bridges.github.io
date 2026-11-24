import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadCatalog } from '../scripts/catalog.mjs';
import { selectBridges, selectJobs } from '../scripts/select-bridges.mjs';

test('validates coverage even when nothing is affected and routes Ping to both jobs', async () => {
  const active = (await loadCatalog()).filter((bridge) => !bridge.archived).map(({ slug }) => slug);
  const inventory = JSON.parse(readFileSync('.github/bridge-checks.json', 'utf8'));
  const all = selectJobs(inventory, active, active);
  assert.deepEqual(
    Object.values(all)
      .flat()
      .filter((slug) => slug !== 'ping')
      .sort(),
    active.filter((slug) => slug !== 'ping'),
  );
  assert.deepEqual(all.ping, ['ping']);
  assert.deepEqual(all['ping-container'], ['ping']);
  assert.deepEqual(Object.values(selectJobs(inventory, active, [])).flat(), []);
  assert.throws(() => selectJobs(inventory.slice(1), active, []), /missing check assignment/i);
  assert.throws(() => selectJobs([...inventory, inventory[0]], active, []), /duplicate bridge/i);
  assert.throws(() => selectJobs([...inventory, ['unknown', 'node']], active, []), /unknown bridge/i);
  assert.throws(() => selectJobs([['ping', 'node']], ['ping'], []), /unsupported check profile/i);
});

test('selects the owning bridge for source or guide changes, all for shared CI, none for website or archive work', () => {
  const active = ['wled', 'modbus'];
  assert.deepEqual(selectBridges(['bridges/wled/src/main.ts', 'README.md'], active), ['wled']);
  assert.deepEqual(selectBridges(['docs/bridges/modbus/index.md'], active), ['modbus']);
  assert.deepEqual(selectBridges(['.github/workflows/bridge-ci.yml'], active), ['modbus', 'wled']);
  assert.deepEqual(selectBridges(['archive/idm-energy/config.yml', 'docs/development.md'], active), []);
});

test('shared runtime changes select their consumers plus any directly changed bridge', () => {
  const consumers = ['homeconnect', 'landroid', 'philips-hue', 'pocketbase', 'roborock', 'wled'];
  const active = [...consumers, 'adguardhome', 'display', 'modbus', 'ping'];
  assert.deepEqual(selectBridges(['libs/mqtt/index.js'], active), consumers);
  assert.deepEqual(
    selectBridges(['libs/config/package.json', 'bridges/ping/src/main.rs'], active),
    [...consumers, 'ping'].sort(),
  );
});
