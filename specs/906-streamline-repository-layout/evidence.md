# Verification

- Exported the staged source tree into an empty directory with no generated files or dependencies. The frozen pnpm workspace install and docs npm clean install passed. Root lint, typecheck, format check, all nine remaining unit tests, static build and output checks passed there.
- All ten active bridge cards were present in prerendered HTML, including Ping; IDM Energy was absent. The artifact crawl checked links, fragments and assets on 89 guide pages.
- Compared all ten CI targets and the full release descriptor for each of the nine GHCR publishers against the pre-refactor results. Image names, versions, immutable tags and aliases matched. Selection tests reject unpublished, unknown and malformed release tags. No image was published.
- The tracked tree contains ten root scripts and six root test files. Retired import paths and the former root Nuxt source paths are gone. Bridge runtime packages and their version streams were not modified; no bridge changeset applies.
- The repository remains `open-mqtt-bridges/open-mqtt-bridges.github.io`. GitHub's homepage field and Pages settings both report `https://open-mqtt-bridges.github.io/`; the live homepage returned HTTP 200. This verifies the existing deployment, not deployment of the feature branch.
