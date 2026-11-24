import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const origin = 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './test/browser',
  reporter: 'line',
  use: { baseURL: origin, browserName: 'chromium', viewport: { width: 320, height: 780 }, reducedMotion: 'reduce' },
  webServer: {
    command: 'python3 scripts/preview.py --bind 127.0.0.1 --port 4174',
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    url: origin,
    reuseExistingServer: false,
  },
});
