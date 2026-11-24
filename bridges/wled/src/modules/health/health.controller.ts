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
   * @returns {{ status: string; name: string; version: string; uptime: number }} Health response.
   */
  @Get('health') getHealth() {
    return {
      status: 'ok',
      name: process.env.npm_package_name ?? 'wled-mqtt-bridge',
      version: process.env.npm_package_version ?? '2.0.8',
      uptime: process.uptime(),
    };
  }
}
