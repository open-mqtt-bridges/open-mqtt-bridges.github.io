import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connectMqtt } from '@open-mqtt-bridges/mqtt';
import type { MqttClient } from 'mqtt';

import { CONFIG } from '~/config/config';

export type MqttMessageHandler = (topic: string, payload: string) => void;

export interface MqttBridgeClient {
  publish(topic: string, payload: string | number | boolean | null): void;
  subscribe(topic: string, handler: MqttMessageHandler): () => void;
}

/** Owns the one local MQTT connection and dispatches subscriptions to bridge instances. */
@Injectable()
export class MqttService implements MqttBridgeClient, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private readonly client: MqttClient;
  private readonly subscriptions = new Map<string, Set<MqttMessageHandler>>();
  /** Connects with the configured broker options. */
  constructor() {
    this.client = connectMqtt(CONFIG.mqtt);
    this.client.on('error', (error) => this.logger.error('MQTT connection failed', error));
    this.client.on('message', (topic, payload) => this.dispatch(topic, payload.toString()));
  }
  /** Publishes a non-retained scalar MQTT payload. */
  publish(topic: string, payload: string | number | boolean | null) {
    this.client.publish(
      topic,
      payload === null ? '' : String(payload),
      { retain: false },
      (error) => error && this.logger.error(`Failed to publish ${topic}`, error),
    );
  }
  /** Adds a handler to a shared broker subscription and returns its cleanup callback. */
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
  /** Drops all handlers and closes the shared broker connection. */
  onModuleDestroy() {
    this.subscriptions.clear();
    this.client.end();
  }
  /** Calls each handler whose MQTT filter matches an incoming publication. */
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

/** Matches the `+` and terminal `#` MQTT wildcards used by bridge subscriptions. */
function matches(filter: string, topic: string) {
  const a = filter.split('/'),
    b = topic.split('/');
  return (
    a.every((part, index) => (part === '#' ? index === a.length - 1 : part === '+' || part === b[index])) &&
    (a.at(-1) === '#' || a.length === b.length)
  );
}
