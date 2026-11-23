import assert from 'node:assert/strict';
import { test } from 'node:test';
import { releaseNotes } from '../scripts/bridge-release-notes.mjs';

test('release notes exclude other versions and require an entry for the selected release', () => {
  const changelog = '# Log\n## [Unreleased]\nUpcoming\n## [1.1.0] - 2026-11-01\n### Added\nA\n## 1.0.0\nB';
  assert.equal(releaseNotes(changelog, '1.1.0'), '### Added\nA');
  assert.equal(releaseNotes(changelog, '1.0.0'), 'B');
  assert.throws(() => releaseNotes(changelog, '2.0.0'));
  assert.throws(() => releaseNotes('## 1.0.0\n\n## 0.1.0\nPrevious', '1.0.0'));
});
