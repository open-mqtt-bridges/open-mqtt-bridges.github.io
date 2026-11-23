import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { snapshot } from '../scripts/migration/snapshot.mjs';
import { archiveRefs, git, json, verify } from '../scripts/migration/verify.mjs';

export function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'bridge-history-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const init = (name) => {
    git(root, 'init', '-q', '-b', 'main', name);
    const dir = join(root, name);
    for (const [key, value] of Object.entries({
      'user.name': 'Fixture',
      'user.email': 'fixture@example.org',
      'commit.gpgsign': 'false',
      'tag.gpgsign': 'false',
    }))
      git(dir, 'config', key, value);
    writeFileSync(join(dir, name), name);
    git(dir, 'add', name);
    git(dir, 'commit', '-qm', name);
    return dir;
  };
  const source = init('source');
  const repo = init('target');
  git(source, 'tag', '-am', 'Original annotation', 'v1');
  git(source, 'switch', '-qc', 'side');
  git(source, 'commit', '-qm', 'never merged', '--allow-empty');
  git(source, 'switch', '-q', 'main');
  const snap = join(root, 'backup');
  snapshot({ source, defaultBranch: 'main', clones: [], knownTips: [] }, snap);
  return { root, source, repo, snap };
}

test('a fresh clone verifies the integrated tree and rejects loss of a side-only commit', (t) => {
  const { root, source, repo, snap } = fixture(t);
  const slug = 'pilot';
  const prefix = `bridges/${slug}`;
  const base = git(repo, 'rev-parse', 'HEAD');
  const tip = git(source, 'rev-parse', 'HEAD');
  const sourceTree = git(source, 'rev-parse', 'HEAD^{tree}');
  git(repo, 'fetch', '--no-tags', source, '+refs/*:refs/fixture/*');
  git(repo, 'merge', '--no-commit', '--no-ff', '--allow-unrelated-histories', '-s', 'ours', tip);
  git(repo, 'read-tree', `--prefix=${prefix}/`, '-u', tip);
  git(repo, 'commit', '-qm', 'integration');
  const record = { slug, prefix, base, sourceTree, importCommit: git(repo, 'rev-parse', 'HEAD'), targetBranch: 'main' };
  const remote = join(root, 'remote.git');
  git(root, 'init', '--bare', '-qb', 'main', remote);
  git(repo, 'push', '-q', remote, 'main');
  git(root, 'clone', '-q', pathToFileURL(remote).href, 'incomplete');
  assert.throws(() => verify(join(root, 'incomplete'), snap, record), /Missing source commits/);
  for (const [ref, oid] of archiveRefs(slug, json(snap, 'refs.json'))) git(repo, 'push', '-q', remote, `${oid}:${ref}`);
  git(root, 'clone', '-q', pathToFileURL(remote).href, 'complete');
  assert.equal(verify(join(root, 'complete'), snap, record).missing, 0);
});
