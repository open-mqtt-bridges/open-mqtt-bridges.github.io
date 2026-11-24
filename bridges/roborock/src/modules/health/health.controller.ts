import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';

/** Reports process health for container and orchestration probes. */
@Controller()
export class HealthController {
  constructor(@Inject(MqttService) private readonly mqtt: Pick<MqttService, 'isReady'>) {}

  /** Reports readiness without exposing broker or device details. */
  @Get('readyz') getReadiness() {
    if (!this.mqtt.isReady()) throw new HttpException({ status: 'not_ready' }, HttpStatus.SERVICE_UNAVAILABLE);
    return { status: 'ok' };
  }

  /** Returns the service identity and process uptime. */
  @Get('health') getHealth() {
    return {
      status: 'ok',
      name: process.env.npm_package_name ?? 'roborock-mqtt-bridge',
      version: process.env.npm_package_version ?? '0.0.0',
      uptime: process.uptime(),
    };
  }
}
