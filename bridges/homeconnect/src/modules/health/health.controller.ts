import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';

/**
 * Executes `HealthController`.
 */
@Controller()
export class HealthController {
  constructor(@Inject(MqttService) private readonly mqtt: Pick<MqttService, 'isReady'>) {}

  /** Reports readiness without exposing broker or device details. */
  @Get('readyz') getReadiness() {
    if (!this.mqtt.isReady()) throw new HttpException({ status: 'not_ready' }, HttpStatus.SERVICE_UNAVAILABLE);
    return { status: 'ok' };
  }

  /**
   * Executes `getHealth`.
   * @returns {{ status: string; name: string; version: string; uptime: number; }} Result.
   */
  @Get('health') getHealth() {
    return {
      status: 'ok',
      name: process.env.npm_package_name ?? 'homeconnect-mqtt-bridge',
      version: process.env.npm_package_version ?? '0.0.0',
      uptime: process.uptime(),
    };
  }
}
