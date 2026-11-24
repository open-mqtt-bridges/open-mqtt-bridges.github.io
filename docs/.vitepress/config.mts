import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import catalog from '../../bridges.json';

const bridge = catalog.find(({ slug, archived }) => slug === process.env.GUIDE && !archived);
if (!bridge) throw new Error('Select an active bridge with npm --prefix docs run dev -- <slug>.');
const { slug, name, repository } = bridge;
const folder = `bridges/${slug}`;
const pages = readdirSync(folder).filter((file) => file.endsWith('.md'));
const topics = [
  'index',
  'getting-started',
  'configuration',
  'authentication',
  'mqtt',
  'topic-contract',
  'deployment',
  'operations',
  'troubleshooting',
];
const labels = { index: 'Overview', mqtt: 'MQTT contract', 'topic-contract': 'MQTT contract' };
const sidebar = [...new Set([...topics, ...pages.map((file) => file.slice(0, -3))])]
  .filter((page) => pages.includes(`${page}.md`))
  .map((page) => ({
    text: labels[page] ?? (page[0].toUpperCase() + page.slice(1)).replaceAll('-', ' '),
    link: page === 'index' ? '/' : `/${page}`,
  }));
const config = defineConfig({
  title: `${name} MQTT Bridge`,
  description: bridge.description,
  base: `/${slug}/`,
  srcDir: folder,
  outDir: `../.output/guides/${slug}`,
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: existsSync(`${folder}/public/logo.svg`) ? '/logo.svg' : undefined,
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'All bridges', link: 'https://open-mqtt-bridges.github.io/#bridges' },
    ],
    sidebar,
    search: { provider: 'local' },
    editLink: {
      pattern: `https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/edit/main/docs/${folder}/:path`,
    },
    socialLinks: [{ icon: 'github', link: repository }],
  },
});
export default slug === 'modbus' ? withMermaid(config) : config;
