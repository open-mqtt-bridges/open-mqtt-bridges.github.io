import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { snapshot } from '../scripts/migration/snapshot.mjs';

test('restores an original tag object and an abandoned local commit, and inventories historical external content', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'bridge-snapshot-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (cwd, ...args) =>
    execFileSync(
      'git',
      [
        '-C',
        cwd,
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.org',
        '-c',
        'commit.gpgSign=false',
        '-c',
        'tag.gpgSign=false',
        ...args,
      ],
      { encoding: 'utf8' },
    ).trim();
  const source = join(root, 'source');
  git(root, 'init', '-qb', 'main', source);
  const digest = 'a'.repeat(64);
  writeFileSync(join(source, 'pointer'), `version https://git-lfs.github.com/spec/v1\noid sha256:${digest}\nsize 42\n`);
  git(source, 'add', 'pointer');
  git(source, 'commit', '-qm', 'original');
  const original = git(source, 'rev-parse', 'HEAD');
  git(source, 'tag', '-a', 'v1', '-m', 'signed-content-shaped tag');
  const tag = git(source, 'rev-parse', 'refs/tags/v1');
  git(source, 'rm', 'pointer');
  git(source, 'update-index', '--add', '--cacheinfo', `160000,${original},dependency`);
  git(source, 'commit', '-qm', 'historical pointer removed');
  const local = join(root, 'local');
  git(root, 'clone', '-q', source, local);
  git(local, 'commit', '--allow-empty', '-qm', 'private work');
  const privateTip = git(local, 'rev-parse', 'HEAD');
  git(local, 'reset', '--hard', 'HEAD~');
  const out = join(root, 'snapshot');
  const config = { source, defaultBranch: 'main', clones: [local], knownTips: [{ ref: 'pin', oid: original }] };
  const report = snapshot(config, out);
  assert.deepEqual(report.lfs, [digest]);
  assert.deepEqual(report.gitlinks, [{ oid: original, name: 'dependency' }]);
  assert.equal(git(join(out, 'restored.git'), 'rev-parse', 'refs/tags/v1'), tag);
  assert.ok(readFileSync(join(out, 'expected.txt'), 'utf8').split('\n').includes(privateTip));
  assert.throws(() => snapshot(config, out), /EEXIST/);
});
