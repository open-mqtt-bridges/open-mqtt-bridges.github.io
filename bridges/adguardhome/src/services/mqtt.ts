import mqtt from 'mqtt';
import { createServer } from 'node:net';
import { ENV } from '../config/env';
import { logger } from '../config/logger';
import { TOPICS } from '../config/topics';

export const mqttClient = mqtt.connect(
	`${ENV.MQTT_PROTOCOL}://${ENV.MQTT_HOST}:${ENV.MQTT_PORT}?EIO=3&transport=websocket`,
	{
		clientId: ENV.MQTT_CLIENTID,
		port: ENV.MQTT_PORT,
		username: ENV.MQTT_USERNAME,
		password: ENV.MQTT_PASSWORD,
		rejectUnauthorized: true,
		clean: false,

		will: {
			topic: TOPICS.ADGUARD.ONLINE,
			payload: 'false',
		},
	}
);

mqttClient.on('error', (err) => {
	logger.scope('mqtt').error('MQTT connection error', err);
});

// MQTT.js restores the persistent session, or resubscribes when the broker no longer has it.
let acknowledged = false;
mqttClient.on('packetreceive', (packet) => {
	if (packet.cmd === 'connack' && !packet.sessionPresent) acknowledged = false;
	if (packet.cmd === 'suback') acknowledged = packet.granted.some((qos) => qos === 0 || qos === 1 || qos === 2);
});

const readinessPort = process.env.BRIDGE_READY_PORT;
if (readinessPort !== undefined) {
	const port = Number(readinessPort);
	if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('Invalid BRIDGE_READY_PORT');
	createServer((socket) => {
		socket.on('error', () => socket.destroy());
		socket.end(mqttClient.connected && acknowledged ? '1' : '0');
	}).listen(port, '127.0.0.1');
}
