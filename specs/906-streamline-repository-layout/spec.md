# Feature specification: Streamline the repository layout

## User scenarios

1. A contributor finds bridge implementations in `bridges/`, the site in `apps/website/`, and guide content in `docs/bridges/`.
2. A maintainer can select the changed bridges or a release candidate without any import-time files. The removed IDM Energy bridge is absent from the catalog and has no publisher.
3. A visitor can open the current Pages site from GitHub's About section and follow the same public URLs after the refactor.

## Requirements and success criteria

- Preserve the repository name, URL, Pages origin, guide routes, legal pages, original brand assets and extracted spec history.
- Keep all ten current bridge implementations and their independent toolchains. Remove one-off migration code, tests and reports from the live repository tree. Preserve operational guidance still needed for publishing and guide hosting.
- Keep existing root development and validation commands usable. Build one Pages artifact containing the catalog and all ten guides; validate its links and assets.
- CI selection still covers ten bridges, and exactly nine named GHCR publishers retain their current packages, aliases and manifest version checks.
- Preserve the pending requested IDM removal and unrelated untracked work.
