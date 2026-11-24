'use strict';
const { randomUUID } = require('node:crypto');
const { connect } = require('mqtt');
const sessions = new WeakMap();

function resolveMqttClientId(clientId) {
  return clientId || randomUUID();
}

/** Open one connection; subscriptions, availability and shutdown belong to its caller. */
function connectMqtt({ protocol, host, port, clientId, username, password, keepAliveSeconds, reconnectDelayMs }) {
  const client = connect({
    protocol,
    host,
    port,
    clientId: resolveMqttClientId(clientId),
    username,
    password,
    keepalive: keepAliveSeconds,
    reconnectPeriod: reconnectDelayMs,
  });
  const pending = new Map();
  const acknowledged = new Set();
  sessions.set(client, acknowledged);
  // Observe MQTT.js's initial subscriptions and automatic resubscriptions without changing their delivery.
  client.on('packetsend', (packet) => {
    if (packet.cmd === 'subscribe') {
      const filters = packet.subscriptions.map(({ topic }) => topic);
      for (const filter of filters) acknowledged.delete(filter);
      pending.set(packet.messageId, filters);
    } else if (packet.cmd === 'unsubscribe') {
      for (const filter of packet.unsubscriptions) {
        acknowledged.delete(filter);
        for (const filters of pending.values()) {
          const index = filters.indexOf(filter);
          if (index !== -1) filters[index] = undefined;
        }
      }
    }
  });
  client.on('packetreceive', (packet) => {
    if (packet.cmd !== 'suback') return;
    const filters = pending.get(packet.messageId);
    pending.delete(packet.messageId);
    filters?.forEach((filter, index) => {
      const granted = packet.granted[index];
      if (filter !== undefined && (granted === 0 || granted === 1 || granted === 2)) acknowledged.add(filter);
    });
  });
  client.on('close', () => {
    pending.clear();
    acknowledged.clear();
  });
  return client;
}

/** Check the current connection and broker acknowledgements of all active filters. */
function isMqttReady(client, filters) {
  const acknowledged = sessions.get(client);
  return !!(client.connected && acknowledged && [...filters].every((filter) => acknowledged.has(filter)));
}

module.exports = { connectMqtt, isMqttReady, resolveMqttClientId };
