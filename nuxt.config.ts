import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { deploymentVersion } from './scripts/deployment-version.mjs';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
let commit = process.env.GITHUB_SHA || '';
if (!commit) {
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    // Source archives can be previewed without Git metadata.
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  buildDir: '.nuxt',
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  ui: { fonts: false },
  colorMode: { preference: 'system', fallback: 'light', storageKey: 'omb-color-mode' },
  icon: { provider: 'none', clientBundle: { scan: true }, serverBundle: { collections: ['lucide'] } },
  runtimeConfig: {
    public: {
      siteVersion: deploymentVersion(version, commit, process.env.NUXT_PUBLIC_SITE_VERSION),
      siteCommit: commit,
    },
  },
  nitro: { prerender: { routes: ['/', '/imprint', '/privacy-policy'], crawlLinks: true, failOnError: true } },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Open MQTT Bridges',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#18181b' },
        { name: 'description', content: 'Open-source MQTT bridges for your devices, services and automations.' },
        { property: 'og:image', content: 'https://open-mqtt-bridges.github.io/assets/logo.png' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/assets/favicon.svg' }],
    },
  },
  typescript: { strict: true },
  eslint: { config: { stylistic: false } },
});
