'use strict';
const { randomUUID } = require('node:crypto');
const { connect } = require('mqtt');

function resolveMqttClientId(clientId) {
  return clientId || randomUUID();
}

/** Open one connection; subscriptions, availability and shutdown belong to its caller. */
function connectMqtt({ protocol, host, port, clientId, username, password, keepAliveSeconds, reconnectDelayMs }) {
  return connect({
    protocol,
    host,
    port,
    clientId: resolveMqttClientId(clientId),
    username,
    password,
    keepalive: keepAliveSeconds,
    reconnectPeriod: reconnectDelayMs,
  });
}

module.exports = { connectMqtt, resolveMqttClientId };
