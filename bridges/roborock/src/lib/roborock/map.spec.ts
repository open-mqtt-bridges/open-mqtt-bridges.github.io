import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { renderMapImage } from './map';

const checkStorage = `
  import assert from 'node:assert/strict';
  import { readdir, readFile, stat } from 'node:fs/promises';
  import path from 'node:path';
  import { storeMapImage } from './src/lib/roborock/map.ts';
  const [directory, mask, mode, rawMap] = process.argv.slice(1);
  process.umask(Number(mask));
  const map = JSON.parse(rawMap);
  const expected = path.join(directory, 'robot-1', '42.png');
  for (let write = 0; write < 2; write++) {
    const file = await storeMapImage(directory, 'robot-1', 42, map);
    assert.equal(file, expected);
    assert.equal((await stat(file)).mode & 0o777, Number(mode));
  }
  assert.deepEqual(await readdir(path.dirname(expected)), ['42.png']);
  assert.deepEqual((await readFile(expected)).subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
`;

describe('Roborock map storage', () => {
  const map = {
    floor: [0, 1, 2, 3, 4, 5],
    height: 2,
    obstacle: [1],
    segments: [2 | (1 << 21)],
    width: 3,
  };

  it('renders a PNG image', () => {
    expect(renderMapImage(map).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  });

  it.each([
    ['0o022', '0o640'],
    ['0o077', '0o600'],
  ])('creates and replaces stable PNG maps with umask %s (expected mode %s)', async (mask, mode) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'mqtt-bridges-roborock-maps-'));
    try {
      execFileSync(
        process.execPath,
        ['--input-type=module', '--eval', checkStorage, directory, mask, mode, JSON.stringify(map)],
        { stdio: 'pipe', timeout: 5000 },
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
