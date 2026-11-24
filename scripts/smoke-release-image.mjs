import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { chmodSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const nest = new Set(['homeconnect', 'landroid', 'philips-hue', 'pocketbase', 'roborock', 'wled']);
const native = new Map([
  ['adguardhome', 'MQTT connection error'],
  ['display', 'starting MQTT screen controller'],
  ['modbus', 'mqtt loop error'],
]);
const requestHealth =
  "fetch('http://127.0.0.1:3000/health',{signal:AbortSignal.timeout(1500)}).then(async r=>{if(!r.ok)process.exit(1);console.log(JSON.stringify(await r.json()))}).catch(()=>process.exit(1))";

function docker(...args) {
  if (args[0] === 'logs') {
    const result = spawnSync('docker', args, { encoding: 'utf8', timeout: 20_000 });
    if (result.error || result.status !== 0) throw result.error ?? new Error('Cannot read candidate logs');
    return `${result.stdout}\n${result.stderr}`;
  }
  return execFileSync('docker', args, { encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** Verify the built candidate without registry access or live service/device credentials. */
export async function smokeReleaseImage({ slug, source, image, version, revision }, run = docker, pause = delay) {
  if (!nest.has(slug) && !native.has(slug)) throw new Error(`No release smoke fixture for ${slug}`);
  if (!source || !image || !version || !revision) throw new Error('Missing release candidate identity');
  const inspected = JSON.parse(run('image', 'inspect', image))[0];
  assert.match(inspected.Id, /^sha256:[0-9a-f]{64}$/);
  assert.equal(inspected.Config.Labels['org.opencontainers.image.version'], version);
  assert.equal(inspected.Config.Labels['org.opencontainers.image.revision'], revision);
  if (slug === 'modbus') {
    assert.equal(run('run', '--rm', '--network', 'none', inspected.Id, '--version'), `modbus-mqtt-bridge ${version}`);
  }

  const name = `bridge-release-smoke-${randomUUID()}`;
  const fixture = ['-e', 'PORT=3000', '-e', 'HOST=127.0.0.1'];
  if (slug === 'pocketbase' || slug === 'adguardhome') {
    const environment = { MQTT_HOST: '127.0.0.1', MQTT_PORT: '1', MQTT_USERNAME: 'fixture', MQTT_PASSWORD: 'fixture' };
    Object.assign(
      environment,
      slug === 'pocketbase'
        ? {
            POCKETBASE_URL: 'http://127.0.0.1:9',
            POCKETBASE_AUTH_COLLECTION: 'users',
            POCKETBASE_USERNAME: 'fixture',
            POCKETBASE_PASSWORD: 'fixture',
          }
        : {
            ADGUARD_HOST: 'http://127.0.0.1:9',
            ADGUARD_USERNAME: 'fixture',
            ADGUARD_PASSWORD: 'fixture',
            ADGUARD_POLL_INTERVAL: '0',
          },
    );
    for (const [key, value] of Object.entries(environment)) fixture.push('-e', `${key}=${value}`);
  }

  let directory;
  try {
    if (slug !== 'adguardhome') {
      directory = mkdtempSync(join(tmpdir(), 'bridge-release-smoke-'));
      const config = join(directory, 'config.yml');
      copyFileSync(resolve(source, 'bridges', slug, 'config/config.example.yml'), config);
      chmodSync(config, 0o644);
      fixture.push('-v', `${config}:/app/config/config.yml:ro`);
    }
    run('run', '-d', '--name', name, '--network', 'none', ...fixture, inspected.Id);
    for (let attempt = 0; attempt < 15; attempt++) {
      if (run('inspect', '-f', '{{.State.Running}}', name) !== 'true') {
        throw new Error(`Candidate exited during startup\n${run('logs', name).slice(-2000)}`);
      }
      if (nest.has(slug)) {
        let body;
        try {
          body = run('exec', name, 'node', '-e', requestHealth);
        } catch {
          /* HTTP is not listening yet. */
        }
        if (body) {
          const health = JSON.parse(body);
          assert.equal(health.status, 'ok');
          if (slug !== 'pocketbase') assert.equal(health.version, version);
          return inspected.Id;
        }
      } else if (run('logs', name).includes(native.get(slug))) {
        return inspected.Id;
      }
      await pause(500);
    }
    throw new Error(`Candidate ${slug} did not reach the expected startup boundary`);
  } finally {
    try {
      run('rm', '-f', name);
    } catch {
      /* No container remains if it failed to start. */
    }
    if (directory) rmSync(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [slug, source, image, version, revision] = process.argv.slice(2);
  console.log(await smokeReleaseImage({ slug, source, image, version, revision }));
}
