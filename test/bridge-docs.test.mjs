import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { assembleBridgeDocs } from '../scripts/build-bridge-docs.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'bridge-docs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const publicDir = join(root, 'public');
  const source = join(root, 'source');
  const output = join(source, 'dist');
  mkdirSync(publicDir);
  mkdirSync(output, { recursive: true });
  writeFileSync(join(publicDir, 'index.html'), 'Website');
  writeFileSync(join(output, 'index.html'), 'Guide');
  writeFileSync(join(source, 'README.md'), 'Not a public asset');
  return { publicDir, source, output, entry: { slug: 'display', output } };
}

test('only the build output is published below the bridge route', (t) => {
  const { publicDir, entry } = fixture(t);
  assembleBridgeDocs(publicDir, [entry]);
  assert.equal(readFileSync(join(publicDir, 'display', 'index.html'), 'utf8'), 'Guide');
  assert.equal(readFileSync(join(publicDir, 'index.html'), 'utf8'), 'Website');
  assert.equal(existsSync(join(publicDir, 'display', 'README.md')), false);
});

test('missing output and existing routes are rejected before copying', (t) => {
  const { publicDir, entry, source } = fixture(t);
  assert.throws(
    () => assembleBridgeDocs(publicDir, [entry, { slug: 'modbus', output: join(source, 'missing') }]),
    /Missing build output/,
  );
  assert.equal(existsSync(join(publicDir, 'display')), false);
  mkdirSync(join(publicDir, 'modbus'));
  assert.throws(() => assembleBridgeDocs(publicDir, [entry, { ...entry, slug: 'modbus' }]), /route collision/);
  assert.equal(existsSync(join(publicDir, 'display')), false);
});

test('symlinks, hidden files and duplicate or invalid slugs are never published', (t) => {
  const { publicDir, source, output, entry } = fixture(t);
  assert.throws(() => assembleBridgeDocs(publicDir, [entry, entry]), /route collision/);
  assert.throws(() => assembleBridgeDocs(publicDir, [{ ...entry, slug: '../display' }]), /Invalid documentation slug/);
  symlinkSync(join(source, 'README.md'), join(output, 'source.md'));
  assert.throws(() => assembleBridgeDocs(publicDir, [entry]), /Unexpected documentation build output/);
  rmSync(join(output, 'source.md'));
  writeFileSync(join(output, '.hidden'), 'Not a public asset');
  assert.throws(() => assembleBridgeDocs(publicDir, [entry]), /Unexpected documentation build output/);
  assert.equal(existsSync(join(publicDir, 'display')), false);
});

test('clean URLs and assets must resolve within the generated documentation', (t) => {
  const { publicDir, output, entry } = fixture(t);
  writeFileSync(join(output, 'index.html'), '<a href="/display/setup#start">Setup</a><img src="/display/logo.svg">');
  writeFileSync(join(output, 'setup.html'), '<h1 id="start">Setup</h1>');
  assert.throws(() => assembleBridgeDocs(publicDir, [entry]), /Missing documentation link target.*logo\.svg/);
  writeFileSync(join(output, 'logo.svg'), '<svg/>');
  assembleBridgeDocs(publicDir, [entry]);
  assert.equal(existsSync(join(publicDir, 'display', 'setup.html')), true);
});
