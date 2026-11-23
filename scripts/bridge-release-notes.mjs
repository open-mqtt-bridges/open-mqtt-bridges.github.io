import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { selectRelease } from './select-release.mjs';

/** Return only this bridge's changelog entry, accepting Changesets and bracketed version headings. */
export function releaseNotes(text, version) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const title = line.match(/^## (?:\[(\d+\.\d+\.\d+)\](?: - .*)?|(\d+\.\d+\.\d+))\s*$/);
    return title && (title[1] || title[2]) === version;
  });
  const body = [];
  if (start >= 0)
    for (const line of lines.slice(start + 1)) {
      if (/^## /.test(line)) break;
      body.push(line);
    }
  const notes = body.join('\n').trim();
  if (!notes) throw new Error(`Missing bridge changelog entry: ${version}`);
  return notes;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const selected = selectRelease(process.argv[2]);
  console.log(releaseNotes(readFileSync(`${selected.prefix}/CHANGELOG.md`, 'utf8'), selected.version));
}
