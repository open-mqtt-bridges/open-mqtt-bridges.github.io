import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { smokeReleaseImage } from '../scripts/smoke-release-image.mjs';

const id = `sha256:${'a'.repeat(64)}`;
const revision = 'b'.repeat(40);
const base = {
  slug: 'wled',
  source: fileURLToPath(new URL('../', import.meta.url)),
  image: 'candidate',
  version: '1.2.3',
  revision,
};

function fixture({ version = base.version, ready = true, health = { status: 'ok', version }, log = '' } = {}) {
  const calls = [];
  const run = (...args) => {
    calls.push(args);
    switch (args[0]) {
      case 'image':
        return JSON.stringify([
          {
            Id: id,
            Config: {
              Labels: { 'org.opencontainers.image.version': version, 'org.opencontainers.image.revision': revision },
            },
          },
        ]);
      case 'inspect':
        return String(ready);
      case 'exec':
        return JSON.stringify(health);
      case 'logs':
        return log;
      case 'run':
        return args.at(-1) === '--version' ? `modbus-mqtt-bridge ${version}` : '';
      case 'rm':
        return '';
      default:
        throw new Error(`Unexpected Docker call: ${args[0]}`);
    }
  };
  return { run, calls };
}

test('smokes immutable local image IDs and cleans up the disposable runtime', async () => {
  const { run, calls } = fixture();
  assert.equal(await smokeReleaseImage(base, run), id);
  const start = calls.find(([command]) => command === 'run');
  assert.equal(start.at(-1), id);
  assert.equal(start[start.indexOf('--network') + 1], 'none');
  assert.equal(calls.at(-1)[0], 'rm');
});

test('does not return a publishable image for a failed start or mismatched identity', async () => {
  await assert.rejects(smokeReleaseImage(base, fixture({ version: '1.2.2' }).run), /1\.2\.3/);
  await assert.rejects(smokeReleaseImage(base, fixture({ ready: false }).run), /exited/i);
  await assert.rejects(smokeReleaseImage(base, fixture({ health: { status: 'ok', version: '1.2.2' } }).run), /1\.2\.3/);
  await assert.rejects(
    smokeReleaseImage({ ...base, slug: 'display' }, fixture().run, async () => {}),
    /startup boundary/,
  );
});

test('recognizes versionless PocketBase liveness and verifies the Modbus executable', async () => {
  assert.equal(await smokeReleaseImage({ ...base, slug: 'pocketbase' }, fixture({ health: { status: 'ok' } }).run), id);
  assert.equal(await smokeReleaseImage({ ...base, slug: 'modbus' }, fixture({ log: 'mqtt loop error' }).run), id);
});
