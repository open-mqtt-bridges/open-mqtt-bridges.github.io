import type { IClientOptions, MqttClient } from 'mqtt';

export interface BrokerSettings {
  protocol: NonNullable<IClientOptions['protocol']>;
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  keepAliveSeconds: number;
  reconnectDelayMs: number;
}
export function resolveMqttClientId(clientId: string): string;
export function connectMqtt(settings: BrokerSettings): MqttClient;
/** True only when connected and every required filter is acknowledged in the current session. */
export function isMqttReady(client: MqttClient, filters: Iterable<string>): boolean;
