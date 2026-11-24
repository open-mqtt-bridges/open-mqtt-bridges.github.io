import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import config from '../libs/config/index.js';
import mqtt from '../libs/mqtt/index.js';

test('load validated YAML with environment precedence over CLI and default', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'bridge-config-'));
  const previous = process.env.CONFIG_FILE;
  const argv = process.argv;
  t.after(() => {
    if (previous === undefined) delete process.env.CONFIG_FILE;
    else process.env.CONFIG_FILE = previous;
    process.argv = argv;
    rmSync(dir, { recursive: true, force: true });
  });
  delete process.env.CONFIG_FILE;
  process.argv = argv.slice(0, 2);
  assert.equal(config.configFilePath(), join(process.cwd(), 'config/config.yml'));
  process.argv.push('--config', join(dir, 'cli.yml'));
  assert.equal(config.configFilePath(), join(dir, 'cli.yml'));
  const file = (process.env.CONFIG_FILE = join(dir, 'env.yml'));
  assert.equal(config.configDirectory(), dir);
  assert.throws(() => config.loadConfig(config.commonSchema), { message: `Configuration file not found: ${file}` });
  writeFileSync(file, 'mqtt: [');
  assert.throws(() => config.loadConfig(config.commonSchema));
  writeFileSync(file, 'mqtt: {host: ""}');
  assert.throws(() => config.loadConfig(config.commonSchema), { name: 'ZodError' });
  writeFileSync(file, 'mqtt: {host: broker, clientId: ""}');
  assert.deepEqual(config.loadConfig(config.commonSchema).mqtt, {
    protocol: 'mqtt',
    host: 'broker',
    port: 1883,
    clientId: '',
    keepAliveSeconds: 30,
    reconnectDelayMs: 5000,
  });
});

test('readiness requires a current broker connection and acknowledgements of all active filters', () => {
  const client = mqtt.connectMqtt({
    protocol: 'mqtt',
    host: '127.0.0.1',
    port: 1,
    clientId: 'test',
    keepAliveSeconds: 30,
    reconnectDelayMs: 0,
  });
  const filter = 'fixture/cmd';
  const ready = () => mqtt.isMqttReady(client, [filter]);
  const send = (messageId) =>
    client.emit('packetsend', { cmd: 'subscribe', messageId, subscriptions: [{ topic: filter }] });
  const ack = (messageId, code) => client.emit('packetreceive', { cmd: 'suback', messageId, granted: [code] });
  try {
    assert.equal(ready(), false);
    client.connected = true;
    send(1);
    assert.equal(ready(), false);
    ack(1, 128);
    assert.equal(ready(), false);
    send(2);
    ack(2, 0);
    assert.equal(ready(), true);
    client.emit('close');
    assert.equal(ready(), false);
    client.connected = true;
    send(3);
    ack(3, 1);
    assert.equal(ready(), true);
    send(4);
    client.emit('packetsend', { cmd: 'unsubscribe', unsubscriptions: [filter] });
    ack(4, 0);
    assert.equal(ready(), false);
    assert.equal(mqtt.isMqttReady(client, []), true);
  } finally {
    client.connected = false;
    client.end(true);
  }
});

test('pass validated broker settings through to MQTT.js and scope generated IDs per connection', () => {
  const settings = {
    protocol: 'mqtt',
    host: '127.0.0.1',
    port: 1,
    clientId: 'explicit',
    username: 'fixture',
    password: 'fixture',
    keepAliveSeconds: 12,
    reconnectDelayMs: 0,
  };
  const client = mqtt.connectMqtt(settings);
  try {
    const { protocol, host, port, username, password, clientId, keepalive, reconnectPeriod } = client.options;
    assert.deepEqual(
      [protocol, host, port, username, password, clientId, keepalive, reconnectPeriod],
      ['mqtt', '127.0.0.1', 1, 'fixture', 'fixture', 'explicit', 12, 0],
    );
    assert.match(mqtt.resolveMqttClientId(''), /^[0-9a-f-]{36}$/);
    assert.notEqual(mqtt.resolveMqttClientId(''), mqtt.resolveMqttClientId(''));
  } finally {
    client.end(true);
  }
});
