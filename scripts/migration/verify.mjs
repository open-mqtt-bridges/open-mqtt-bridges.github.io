import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const git = (repo, ...args) =>
  execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' },
  }).trimEnd();
export const json = (dir, name) => JSON.parse(readFileSync(resolve(dir, name), 'utf8'));
const objectId = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

/** Derive durable target refs from the frozen source inventory, independently of the imported graph. */
export function archiveRefs(slug, inventory) {
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(inventory.length, 'Empty ref inventory');
  const refs = new Map();
  for (const { origin, ref, oid } of inventory) {
    assert.match(oid, objectId);
    let target;
    if (origin === 'remote' && ref.startsWith('refs/heads/'))
      target = `refs/heads/import/${slug}/heads/${ref.slice(11)}`;
    else if (origin === 'remote' && ref.startsWith('refs/tags/')) target = `refs/tags/import/${slug}/${ref.slice(10)}`;
    else if (origin === 'remote' && /^refs\/pull\/\d+\/(?:head|merge)$/.test(ref))
      target = `refs/heads/import/${slug}/pr/${ref.slice(10)}`;
    // Recovery tags can retain any object type, including original tag objects.
    else target = `refs/tags/recovery/${slug}/${oid}`;
    assert.ok(!refs.has(target) || refs.get(target) === oid, `Conflicting mapping: ${target}`);
    refs.set(target, oid);
  }
  return refs;
}

/** Check a fresh full target clone against private source evidence. Does not fetch from source repositories. */
export function verify(repo, snapshot, { slug, prefix, base, sourceTree, importCommit, targetBranch }) {
  for (const id of [base, sourceTree, importCommit]) assert.match(id, objectId);
  assert.ok(prefix === `bridges/${slug}` || (slug === 'idm-energy' && prefix === 'archive/idm-energy'));
  const report = json(snapshot, 'report.json');
  assert.match(report.sourceTip, objectId);
  const expected = readFileSync(resolve(snapshot, 'expected.txt'), 'utf8');
  const commits = expected.trimEnd().split('\n');
  assert.ok(
    report.gitRestoreVerified && expected.length && commits.every((id) => objectId.test(id)),
    'Invalid source inventory',
  );
  assert.equal(commits.length, report.commitCount);
  assert.equal(createHash('sha256').update(expected).digest('hex'), report.commitListSha256);
  assert.equal(git(repo, 'remote'), 'origin');
  assert.equal(git(repo, 'rev-parse', '--is-shallow-repository'), 'false');
  assert.ok(!process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES && !process.env.GIT_OBJECT_DIRECTORY);
  assert.ok(!existsSync(resolve(repo, git(repo, 'rev-parse', '--git-path', 'objects/info/alternates'))));
  assert.doesNotMatch(
    git(repo, 'config', '--list', '--local'),
    /^(extensions\.partialclone|remote\..+\.promisor=true)/im,
  );
  git(repo, 'fsck', '--full', '--strict', '--no-progress');
  const reachable = new Set(git(repo, 'rev-list', '--remotes=origin', '--tags').split('\n'));
  const missing = commits.filter((id) => !reachable.has(id));
  assert.equal(missing.length, 0, `Missing source commits: ${missing.slice(0, 5).join(', ')}`);
  const refs = archiveRefs(slug, json(snapshot, 'refs.json'));
  for (const [ref, oid] of refs) {
    const localRef = ref.replace(/^refs\/heads\//, 'refs/remotes/origin/');
    assert.equal(git(repo, 'rev-parse', '--verify', localRef), oid, ref);
  }
  assert.equal(git(repo, 'show', '-s', '--format=%P', importCommit), `${base} ${report.sourceTip}`);
  assert.equal(git(repo, 'rev-parse', `${report.sourceTip}^{tree}`), sourceTree);
  assert.equal(git(repo, 'rev-parse', `${importCommit}:${prefix}`), sourceTree);
  assert.equal(git(repo, 'ls-tree', base, '--', prefix), '');
  git(repo, 'diff', '--quiet', base, importCommit, '--', '.', `:(exclude)${prefix}`);
  git(repo, 'merge-base', '--is-ancestor', importCommit, `refs/remotes/origin/${targetBranch}`);
  return { slug, commitCount: commits.length, archiveRefs: refs.size, missing: 0, importCommit };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [repo, snapshot, record] = process.argv.slice(2);
  console.log(JSON.stringify(verify(repo, snapshot, JSON.parse(readFileSync(record, 'utf8')))));
}
