import { Module } from '@nestjs/common';
import { MqttModule } from '../mqtt/mqtt.module';
import { HealthController } from './health.controller';

/** Exposes the lightweight HTTP health endpoint. */
@Module({ controllers: [HealthController], imports: [MqttModule] })
export class HealthModule {}
