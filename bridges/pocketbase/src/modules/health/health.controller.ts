import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';

@Controller()
export class HealthController {
  constructor(@Inject(MqttService) private readonly mqtt: Pick<MqttService, 'isReady'>) {}

  /** Reports readiness without exposing broker or device details. */
  @Get('readyz')
  getReadiness() {
    if (!this.mqtt.isReady()) throw new HttpException({ status: 'not_ready' }, HttpStatus.SERVICE_UNAVAILABLE);
    return { status: 'ok' };
  }

  @Get('health')
  check() {
    return { status: 'ok' };
  }
}
