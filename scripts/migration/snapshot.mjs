import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../../', import.meta.url)));
const opts = { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' } };
const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], opts).trimEnd();
const lines = (value) => (value ? value.split('\n') : []);
const oidPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

/** Capture a private, immutable source snapshot. Never push refs or change a source checkout. */
export function snapshot(config, destination) {
  process.umask(0o077);
  const parent = realpathSync(resolve(destination, '..'));
  const out = join(parent, resolve(destination).split(sep).at(-1));
  if (out === root || out.startsWith(root + sep)) throw new Error('Store snapshots outside the target checkout');
  if (!config.source || !config.defaultBranch || !Array.isArray(config.clones) || !Array.isArray(config.knownTips)) {
    throw new Error('Expected source, defaultBranch, clones, and knownTips');
  }
  // Exclusive creation keeps a failed/partial run from becoming a later success.
  mkdirSync(out, { mode: 0o700 });
  const mirror = join(out, 'source.git');
  const restored = join(out, 'restored.git');
  const bundle = join(out, 'source.bundle');
  git(out, 'clone', '--mirror', '--no-local', '--', config.source, mirror);
  const objects = new Map();
  const refs = [];
  const wanted = [];
  const availableRefs = (repo) => lines(git(repo, 'for-each-ref', '--format=%(objectname) %(refname)'));
  const baseline = availableRefs(mirror);
  const assertFull = (repo) => {
    if (git(repo, 'rev-parse', '--is-shallow-repository') !== 'false') throw new Error('Shallow source');
    if (
      lines(git(repo, 'config', '--list', '--local')).some((s) =>
        /^(extensions\.partialclone|remote\..+\.promisor=true)/i.test(s),
      )
    ) {
      throw new Error('Partial source');
    }
  };
  assertFull(mirror);
  if (!baseline.some((entry) => entry.endsWith(' refs/heads/' + config.defaultBranch)))
    throw new Error('Missing default branch');
  if (baseline.some((entry) => entry.includes(' refs/snapshot/')))
    throw new Error('Reserved snapshot namespace in source');
  for (const entry of baseline) {
    const [oid, ref] = entry.split(' ');
    refs.push({ origin: 'remote', ref, oid });
  }
  const add = (origin, ref, oid, from) => {
    if (!oidPattern.test(oid)) throw new Error('Invalid source object ID');
    wanted.push({ origin, ref, oid, from });
    if (!objects.has(oid)) objects.set(oid, new Set());
    if (from) objects.get(oid).add(from);
  };
  for (const [index, name] of config.clones.entries()) {
    const repo = realpathSync(name);
    assertFull(repo);
    for (const entry of availableRefs(repo)) {
      const [oid, ref] = entry.split(' ');
      add(`clone-${index}`, ref, oid, repo);
    }
    for (const entry of lines(git(repo, 'worktree', 'list', '--porcelain'))) {
      if (entry.startsWith('HEAD ')) add(`clone-${index}`, 'worktree', entry.slice(5), repo);
    }
    for (const oid of lines(git(repo, 'reflog', 'show', '--all', '--format=%H')))
      add(`clone-${index}`, 'reflog', oid, repo);
    for (const entry of lines(git(repo, 'fsck', '--full', '--no-reflogs', '--unreachable', '--no-progress'))) {
      const m = /^unreachable (?:commit|tag) ([a-f0-9]+)$/.exec(entry);
      if (m) add(`clone-${index}`, 'recovery', m[1], repo);
    }
  }
  for (const { ref, oid, from } of config.knownTips) add('inventory', ref, oid, from);
  for (const [oid, alternatives] of objects) {
    const has = () => {
      try {
        git(mirror, 'cat-file', '-e', oid);
        return true;
      } catch {
        return false;
      }
    };
    for (const location of [...alternatives, config.source]) {
      if (has()) break;
      try {
        git(mirror, '-c', 'gc.auto=0', 'fetch', '--no-tags', '--no-write-fetch-head', '--', location, oid);
      } catch {
        // A fork may be gone. Try all recorded locations before declaring a gap.
      }
    }
    if (!has()) throw new Error(`Missing inventoried object ${oid}`);
    git(mirror, 'update-ref', `refs/snapshot/${oid}`, oid);
  }
  refs.push(...wanted.map(({ origin, ref, oid }) => ({ origin, ref, oid })));
  const commits = (repo) =>
    lines(git(repo, 'rev-list', '--all'))
      .sort()
      .join('\n') + '\n';
  const list = commits(mirror);
  writeFileSync(join(out, 'expected.txt'), list);
  writeFileSync(join(out, 'refs.json'), JSON.stringify(refs, null, 2));
  git(mirror, 'bundle', 'create', bundle, '--all');
  git(out, 'init', '--bare', restored);
  git(restored, 'bundle', 'verify', bundle);
  git(restored, 'fetch', '--quiet', bundle, '+refs/*:refs/*');
  git(restored, 'symbolic-ref', 'HEAD', `refs/heads/${config.defaultBranch}`);
  git(restored, 'fsck', '--full', '--strict', '--no-progress');
  if (availableRefs(mirror).join('\n') !== availableRefs(restored).join('\n') || list !== commits(restored)) {
    throw new Error('Restored inventory differs from source');
  }
  const gitlinks = new Map();
  const lfs = new Set();
  // Inspect each unique tree, including historical files no longer present at the tip.
  for (const row of lines(
    git(restored, 'cat-file', '--batch-all-objects', '--batch-check=%(objectname) %(objecttype) %(objectsize)'),
  )) {
    const [oid, type, size] = row.split(' ');
    if (type === 'tree') {
      for (const item of git(restored, 'ls-tree', '-z', oid).split('\0')) {
        const m = /^160000 commit ([a-f0-9]+)\t([\s\S]+)$/.exec(item);
        if (m) gitlinks.set(`${m[1]}:${m[2]}`, { oid: m[1], name: m[2] });
      }
    } else if (type === 'blob' && Number(size) < 1024) {
      const text = git(restored, 'cat-file', 'blob', oid);
      if (text.startsWith('version https://git-lfs.github.com/spec/v1\n')) {
        const m = /^oid sha256:([a-f0-9]{64})$/m.exec(text);
        if (!m) throw new Error(`Invalid LFS pointer ${oid}`);
        lfs.add(m[1]);
      }
    }
  }
  const report = {
    source: config.source,
    defaultBranch: config.defaultBranch,
    sourceTip: git(restored, 'rev-parse', 'HEAD'),
    commitCount: lines(list.trimEnd()).length,
    commitListSha256: createHash('sha256').update(list).digest('hex'),
    refCount: availableRefs(restored).length,
    gitlinks: [...gitlinks.values()],
    lfs: [...lfs].sort(),
    gitRestoreVerified: true,
  };
  writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [config, destination] = process.argv.slice(2);
  if (!config || !destination || !existsSync(config))
    throw new Error('Usage: node snapshot.mjs PRIVATE-CONFIG.json NEW-PRIVATE-DIRECTORY');
  console.log(JSON.stringify(snapshot(JSON.parse(readFileSync(config, 'utf8')), destination)));
}
