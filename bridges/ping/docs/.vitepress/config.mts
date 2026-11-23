import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Ping MQTT Bridge',
  description: 'Publish IPv4 reachability and latency over MQTT',
  base: '/ping/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/ping/logo.svg' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'MQTT', link: '/mqtt' },
      { text: 'Operations', link: '/operations' },
    ],
    sidebar: [
      { text: 'Overview', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'MQTT contract', link: '/mqtt' },
      { text: 'Operations', link: '/operations' },
      { text: 'Troubleshooting', link: '/troubleshooting' },
    ],
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/open-mqtt-bridges/ping/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/open-mqtt-bridges/ping' }],
    footer: { message: 'Released under the MIT License' },
  },
});
