import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { archiveRefs, git, json } from './verify.mjs';

/** Import into a local integration checkout only. Does not push or run publication jobs. */
export function importBridge(repo, snapshot, slug, task) {
  assert.match(task, /^T\d{3}$/);
  const report = json(snapshot, 'report.json');
  const refs = archiveRefs(slug, json(snapshot, 'refs.json'));
  assert.ok(report.gitRestoreVerified);
  const prefix = slug === 'idm-energy' ? `archive/${slug}` : `bridges/${slug}`;
  const targetBranch = git(repo, 'symbolic-ref', '--short', 'HEAD');
  const base = git(repo, 'rev-parse', 'HEAD');
  const tip = report.sourceTip;
  assert.equal(refs.get(`refs/heads/import/${slug}/heads/${report.defaultBranch}`), tip);
  // Read the verified bundle's objects without changing any source, branch, tag, or remote.
  git(repo, 'bundle', 'unbundle', resolve(snapshot, 'source.bundle'));
  const sourceTree = git(repo, 'rev-parse', `${tip}^{tree}`);
  const byName = new Map(
    git(repo, 'for-each-ref', '--format=%(refname) %(objectname)')
      .split('\n')
      .map((line) => line.split(' ')),
  );
  const updates = [];
  for (const [ref, oid] of refs) {
    git(repo, 'check-ref-format', ref);
    if (byName.has(ref)) assert.equal(byName.get(ref), oid, `Conflicting target ref: ${ref}`);
    else updates.push(`create ${ref} ${oid}`);
  }
  const parents = git(repo, 'log', '--first-parent', '--merges', '--format=%H %P')
    .split('\n')
    .map((line) => line.split(' '));
  for (const [previous, first, second] of parents) {
    if (second !== tip || !git(repo, 'ls-tree', previous, '--', prefix)) continue;
    assert.equal(git(repo, 'rev-parse', `${previous}:${prefix}`), sourceTree);
    assert.equal(updates.length, 0, 'Prior import is missing archive refs');
    return { slug, prefix, base: first, sourceTree, importCommit: previous, targetBranch };
  }
  assert.equal(git(repo, 'ls-tree', base, '--', prefix), '', 'Occupied target prefix');
  assert.ok(!existsSync(resolve(repo, prefix)), 'Occupied working directory');
  git(repo, 'diff', '--quiet');
  git(repo, 'diff', '--cached', '--quiet');
  const scratch = mkdtempSync(join(tmpdir(), 'bridge-index-'));
  try {
    const index = (...args) =>
      execFileSync('git', ['-C', repo, ...args], {
        encoding: 'utf8',
        env: { ...process.env, GIT_INDEX_FILE: join(scratch, 'index'), GIT_NO_REPLACE_OBJECTS: '1' },
      }).trimEnd();
    index('read-tree', base);
    index('read-tree', `--prefix=${prefix}/`, tip);
    const tree = index('write-tree');
    const importCommit = git(
      repo,
      'commit-tree',
      tree,
      '-p',
      base,
      '-p',
      tip,
      '-m',
      `feat: import ${slug} with its original history (${task}, #17)`,
    );
    assert.equal(git(repo, 'rev-parse', `${importCommit}:${prefix}`), sourceTree);
    git(repo, 'diff', '--quiet', base, importCommit, '--', '.', `:(exclude)${prefix}`);
    if (updates.length)
      execFileSync('git', ['-C', repo, 'update-ref', '--stdin'], { input: updates.join('\n') + '\n' });
    assert.equal(git(repo, 'rev-parse', 'HEAD'), base);
    git(repo, 'merge', '--ff-only', '--no-edit', importCommit);
    return { slug, prefix, base, sourceTree, importCommit, targetBranch };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(importBridge(...process.argv.slice(2))));
}
