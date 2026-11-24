# Implementation plan: Streamline the repository layout

**Base:** `main` at `4ccb1a8` · [Specification](spec.md)

1. Isolate the already tested local IDM Energy removal in its own commit; exclude `bridge-sources/`.
2. Replace the migration inputs in `scripts/select-bridges.mjs` with the current bridge inventory. Move only active publisher configuration to a permanent release-owned manifest. Compare selection, image, tag and alias results against the original for all nine publishers, including rejection of Ping and IDM.
3. Remove `migration/`, `scripts/migration/` and the three migration-only tests. Move current release and Pages operating instructions out of `docs/migration/`; remove retired procedures and update live links. Historical specs, bridge-specific guides about user migrations and Git history are not import tooling.
4. Relocate the Nuxt application, shared site code, static files and Nuxt configuration into `apps/website/`. Keep the catalog and cross-project automation root-owned. Preserve the root command interface and frozen dependency ownership; update imports, ESLint/TypeScript integration, output assembly, CI, build checks and documentation together.
5. Verify using [the acceptance guide](quickstart.md). No change to GitHub repository identity, external bridge repositories, registry settings, or Pages base path. The current Pages URL has already been added to the repository homepage field.

## Constitution and rollback

No MQTT, public URL or release-contract change. Preserve licenses, immutable evidence in existing feature specs, and bridge lockfiles. A revert of the owning increment restores its previous paths and behavior.
