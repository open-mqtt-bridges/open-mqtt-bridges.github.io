jest.mock('../mqtt/mqtt.service', () => ({ MqttService: class MqttService {} }));

import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports a healthy bridge process', () => {
    expect(new HealthController({ isReady: () => false }).check()).toEqual({ status: 'ok' });
  });

  it('reports broker readiness independently of liveness', () => {
    const mqtt = { isReady: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true) };
    const controller = new HealthController(mqtt);
    expect(() => controller.getReadiness()).toThrow(
      expect.objectContaining({ status: 503, response: { status: 'not_ready' } }),
    );
    expect(controller.getReadiness()).toEqual({ status: 'ok' });
  });
});
