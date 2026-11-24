import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const [command, selected] = process.argv.slice(2);
const guides = readdirSync('bridges', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
if (!['build', 'dev', 'preview'].includes(command) || (selected ? !guides.includes(selected) : command !== 'build')) {
  throw new Error('Usage: npm run build [-- <slug>] or npm run dev/preview -- <slug>');
}
for (const slug of selected ? [selected] : guides) {
  const result = spawnSync('vitepress', [command, '.'], { stdio: 'inherit', env: { ...process.env, GUIDE: slug } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
