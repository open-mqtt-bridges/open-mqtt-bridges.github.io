import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkReleaseAliases } from '../scripts/check-release-aliases.mjs';

const version = (...tags) => ({ metadata: { container: { tags } } });

test('allows a confirmed absent alias or a numeric SemVer advance for each alias', () => {
  checkReleaseAliases([[]], 'v1.0.0', ['v1.0.0', 'latest']);
  checkReleaseAliases([[version('v1.9.1', 'latest')], [version('v1.10.0', 'master')]], 'v1.10.1', [
    'v1.10.1',
    'latest',
    'master',
    'sha-123abcd',
  ]);
  checkReleaseAliases([[version('1.2.9', 'latest', '1.2')]], '1.2.10', ['1.2.10', 'latest', '1.2']);
});

test('rejects an older alias move even when another alias could advance', () => {
  assert.throws(
    () =>
      checkReleaseAliases([[version('v1.0.0', 'latest'), version('v2.1.0', 'master')]], 'v2.0.0', [
        'v2.0.0',
        'latest',
        'master',
      ]),
    /move master backward/,
  );
});

test('rejects unavailable evidence, ambiguous provenance, and overwritten immutable tags', () => {
  const check = (pages) => checkReleaseAliases(pages, 'v2.0.0', ['v2.0.0', 'latest', 'sha-123abcd']);
  assert.throws(() => check([]), /unavailable/);
  assert.throws(() => check([[{}]]), /incomplete/i);
  assert.throws(() => check([[version('latest')]]), /cannot prove/i);
  assert.throws(() => check([[version('latest', 'v1.0.0', 'v1.1.0')]]), /cannot prove/i);
  assert.throws(() => check([[version('v2.0.0', 'latest')]]), /immutable/i);
  assert.throws(() => check([[version('v1.0.0', 'sha-123abcd')]]), /immutable/i);
});
