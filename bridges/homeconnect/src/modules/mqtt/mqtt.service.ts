import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connectMqtt, isMqttReady } from '@open-mqtt-bridges/mqtt';
import type { MqttClient } from 'mqtt';
import { CONFIG } from '~/config/config';

export type MqttMessageHandler = (topic: string, payload: string) => void;

/** Options that control MQTT publication semantics. */
export interface MqttPublishOptions {
  retain?: boolean;
}

export interface MqttBridgeClient {
  publish(topic: string, payload: string | number | boolean | null, options?: MqttPublishOptions): void;
  subscribe(topic: string, handler: MqttMessageHandler): () => void;
}

/**
 * Executes `MqttService`.
 */
@Injectable()
export class MqttService implements MqttBridgeClient, OnModuleDestroy {
  /** Reports readiness for this connection and its registered command filters. */
  isReady() {
    return isMqttReady(this.client, this.subscriptions.keys());
  }

  private readonly logger = new Logger(MqttService.name);
  private readonly client: MqttClient;
  private readonly subscriptions = new Map<string, Set<MqttMessageHandler>>();
  /**
   * Creates the class instance.
   */
  constructor() {
    this.client = connectMqtt(CONFIG.mqtt);
    this.client.on('error', (error) => this.logger.error('MQTT connection failed', error));
    this.client.on('message', (topic, payload) => this.dispatch(topic, payload.toString()));
  }
  /**
   * Executes `publish`.
   * @param {string} topic The topic value.
   * @param {string | number | boolean | null} payload The payload value.
   * @returns {void} Result.
   */
  publish(topic: string, payload: string | number | boolean | null, options: MqttPublishOptions = {}) {
    this.client.publish(
      topic,
      payload === null ? '' : String(payload),
      { retain: options.retain ?? false },
      (error) => error && this.logger.error(`Failed to publish ${topic}`, error),
    );
  }
  /**
   * Executes `subscribe`.
   * @param {string} filter The filter value.
   * @param {MqttMessageHandler} handler The handler value.
   * @returns {() => void} Result.
   */
  subscribe(filter: string, handler: MqttMessageHandler) {
    let handlers = this.subscriptions.get(filter);
    if (!handlers) {
      handlers = new Set();
      this.subscriptions.set(filter, handlers);
      this.client.subscribe(filter, (error) => error && this.logger.error(`Failed to subscribe ${filter}`, error));
    }
    handlers.add(handler);
    return () => {
      const current = this.subscriptions.get(filter);
      if (!current) return;
      current.delete(handler);
      if (current.size) return;
      this.subscriptions.delete(filter);
      this.client.unsubscribe(filter);
    };
  }
  /**
   * Executes `onModuleDestroy`.
   * @returns {void} Result.
   */
  onModuleDestroy() {
    this.subscriptions.clear();
    this.client.end();
  }
  /**
   * Executes `dispatch`.
   * @param {string} topic The topic value.
   * @param {string} payload The payload value.
   * @returns {void} Result.
   */
  private dispatch(topic: string, payload: string) {
    for (const [filter, handlers] of this.subscriptions)
      if (matches(filter, topic))
        for (const handler of handlers)
          try {
            handler(topic, payload);
          } catch (error) {
            this.logger.error(`MQTT handler failed for ${filter}`, error);
          }
  }
}

/**
 * Executes `matches`.
 * @param {string} filter The filter value.
 * @param {string} topic The topic value.
 * @returns {boolean} Result.
 */
function matches(filter: string, topic: string) {
  const a = filter.split('/'),
    b = topic.split('/');
  return (
    a.every((part, index) => (part === '#' ? index === a.length - 1 : part === '+' || part === b[index])) &&
    (a.at(-1) === '#' || a.length === b.length)
  );
}
