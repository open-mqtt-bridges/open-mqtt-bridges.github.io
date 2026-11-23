import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { importBridge } from '../scripts/migration/import.mjs';
import { snapshot } from '../scripts/migration/snapshot.mjs';
import { git } from '../scripts/migration/verify.mjs';

test('import isolates colliding tag names, preserves both parents, and rejects conflicting refs on retry', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'bridge-import-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const create = (name) => {
    git(root, 'init', '-q', '-b', 'main', name);
    const repo = join(root, name);
    for (const [key, val] of Object.entries({
      'user.name': 'Fixture',
      'user.email': 'fixture@example.org',
      'commit.gpgsign': 'false',
      'tag.gpgsign': 'false',
    }))
      git(repo, 'config', key, val);
    writeFileSync(join(repo, 'README.md'), name);
    git(repo, 'add', 'README.md');
    git(repo, 'commit', '-qm', name);
    git(repo, 'tag', '-am', name, 'v1');
    return repo;
  };
  const target = create('target');
  const targetTag = git(target, 'rev-parse', 'v1');
  for (const slug of ['first', 'second']) {
    const source = create(slug);
    const backup = join(root, slug + '-backup');
    snapshot({ source, defaultBranch: 'main', knownTips: [], clones: [] }, backup);
    const rec = importBridge(target, backup, slug, 'T006');
    assert.equal(git(target, 'rev-parse', `${rec.importCommit}^2`), git(source, 'rev-parse', 'HEAD'));
    assert.deepEqual(importBridge(target, backup, slug, 'T006'), rec);
    assert.equal(git(target, 'rev-parse', `refs/tags/import/${slug}/v1`), git(source, 'rev-parse', 'v1'));
    assert.equal(git(target, 'rev-parse', 'v1'), targetTag);
    git(target, 'update-ref', `refs/tags/import/${slug}/v1`, targetTag);
    assert.throws(() => importBridge(target, backup, slug, 'T006'), /Conflicting target ref/);
  }
});
