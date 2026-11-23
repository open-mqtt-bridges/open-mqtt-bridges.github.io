import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const bridges = [
  { slug: 'display', directory: '.', lockfile: 'pnpm-lock.yaml', manager: 'pnpm', build: 'docs:build' },
  { slug: 'modbus', directory: 'docs', lockfile: 'package-lock.json', manager: 'npm', build: 'build' },
];
const origin = 'https://open-mqtt-bridges.github.io';

function validateTree(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || !(entry.isDirectory() || entry.isFile())) {
      throw new Error(`Unexpected documentation build output: ${path}`);
    }
    if (entry.isDirectory()) files.push(...validateTree(path));
    else files.push(path);
  }
  return files;
}

function validateLinks(slug, output, files) {
  const base = `${origin}/${slug}/`;
  const fileSet = new Set(files);
  const pages = new Map(
    files.filter((path) => path.endsWith('.html')).map((path) => [path, readFileSync(path, 'utf8')]),
  );
  for (const file of files.filter((path) => path.endsWith('.html'))) {
    const route = file.slice(output.length + 1).replace(/(^|\/)index\.html$/, '$1');
    const html = pages.get(file);
    for (const [, target] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(target, new URL(route, base));
      if (url.origin !== origin || !url.pathname.startsWith(`/${slug}/`)) continue;
      const path = join(output, decodeURIComponent(url.pathname.slice(slug.length + 2)));
      const candidates = url.pathname.endsWith('/') ? [join(path, 'index.html')] : [path, `${path}.html`];
      const destination = candidates.find((candidate) => fileSet.has(candidate));
      if (!destination) {
        throw new Error(`Missing documentation link target ${target} from ${slug}/${route}`);
      }
      const linkedPage = pages.get(destination);
      if (url.hash && linkedPage && !linkedPage.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) {
        throw new Error(`Missing documentation anchor ${target} from ${slug}/${route}`);
      }
    }
  }
}

/** Validate VitePress outputs and copy only those outputs into unused Pages routes. */
export function assembleBridgeDocs(publicDir, outputs) {
  if (!existsSync(join(publicDir, 'index.html'))) throw new Error('Build the Nuxt website before adding bridge docs.');
  const destinations = new Set();
  for (const { slug, output } of outputs) {
    if (!/^[a-z][a-z0-9-]*$/.test(slug)) throw new Error(`Invalid documentation slug: ${slug}`);
    const destination = join(publicDir, slug);
    if (destinations.has(destination) || readdirSync(publicDir).includes(slug)) {
      throw new Error(`Documentation route collision: ${slug}`);
    }
    destinations.add(destination);
    if (!existsSync(output) || !lstatSync(output).isDirectory() || !existsSync(join(output, 'index.html'))) {
      throw new Error(`Missing build output for ${slug}: ${output}`);
    }
    const files = validateTree(output);
    if (!lstatSync(join(output, 'index.html')).isFile()) throw new Error(`Invalid index for ${slug}: ${output}`);
    validateLinks(slug, output, files);
  }
  for (const { slug, output } of outputs) {
    cpSync(output, join(publicDir, slug), { recursive: true, errorOnExist: true, force: false });
  }
}

/** Build the pinned sources with their owning lockfiles and add their static output to Pages. */
export function buildBridgeDocs(root) {
  const outputs = [];
  for (const { slug, directory, lockfile, manager, build } of bridges) {
    const source = join(root, 'bridge-sources', slug);
    const cwd = join(source, directory);
    if (!existsSync(join(cwd, lockfile)) || !existsSync(join(source, 'docs', 'index.md'))) {
      throw new Error(`Missing sources for ${slug}. Initialize the pinned Git submodules before building.`);
    }
    const install = manager === 'pnpm' ? ['install', '--frozen-lockfile'] : ['ci'];
    execFileSync(manager, install, { cwd, stdio: 'inherit' });
    execFileSync(manager, ['run', build], { cwd, stdio: 'inherit' });
    outputs.push({ slug, output: join(source, 'docs', '.vitepress', 'dist') });
  }
  assembleBridgeDocs(join(root, '.output', 'public'), outputs);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildBridgeDocs(process.cwd());
}
