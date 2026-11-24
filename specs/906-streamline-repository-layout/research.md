# Tooling ownership

- **Retain bridge CI and releases:** `select-bridges.mjs`, `select-release.mjs`, `bridge-release-notes.mjs`. Actions invokes all three. The first two still read migration manifests.
- **Retain site and profile operations:** `catalog.mjs`, `sync-profile.mjs`, `deployment-version.mjs`, `assemble-guides.mjs`, `check.mjs`, `check-guides.py`, `preview.py`. These validate or consume the catalog, generate release identity, assemble or verify Pages, serve clean URLs, or explicitly synchronize the organization profile.
- **Retain tests:** `bridge-layout`, `bridge-release-notes`, `catalog`, `select-bridges`, `select-release`, `version`.
- **Retire after decoupling:** `scripts/migration/{snapshot,import,verify}.mjs` and `test/migration-{history,import,snapshot}.test.mjs`. They implement and exercise the completed one-time historical import.
- **Hosting decision:** keep the organization-site repository name and its current root URL. Renaming to a project repository without separate hosting would change the Pages path.
