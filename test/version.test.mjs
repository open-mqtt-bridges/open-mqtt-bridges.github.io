import assert from 'node:assert/strict';
import test from 'node:test';
import { deploymentVersion } from '../scripts/deployment-version.mjs';

test('deployment identity uses the package version and actual deployed commit', () => {
  assert.equal(deploymentVersion('0.1.0', '0123456789abcdef'), 'v0.1.0+0123456');
  assert.equal(deploymentVersion('0.1.0', '', ' v0.2.0 '), 'v0.2.0');
  assert.equal(deploymentVersion('0.1.0', ''), 'v0.1.0+local');
});
