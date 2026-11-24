jest.mock('./health.controller', () => ({ HealthController: class HealthController {} }));
jest.mock('../mqtt/mqtt.module', () => ({ MqttModule: class MqttModule {} }));

import { HealthModule } from './health.module';

describe('HealthModule', () => {
  it('can be initialized', () => {
    expect(HealthModule).toBeDefined();
  });
});
