# Verification: Monorepo Reliability and Delivery

Verified locally on 2026-11-24. Application and workflow sources were checked at `5d270b0`; the verification record and pending-release metadata do not change those sources.

- **Root and Pages:** ESLint, Nuxt type checking, Prettier, 21 root tests, generated-site build, and link/asset verification on 89 guide pages passed. Two Chromium cases passed against assembled output: keyboard and focus at 320 px, and catalog links without JavaScript.
- **NestJS and MQTT:** All six packages passed the owning lint, type, test, and build gates with frozen lockfiles. PocketBase and WLED retained 100% coverage. The WLED Mosquitto fixture verified HTTP readiness `200 → 503 → 200` and unchanged `/health`. Roborock's map suite covered both `0022` and `0077`; its existing opt-in test remains skipped.
- **Native bridges:** Display, Modbus, and Ping passed Rust format, Clippy, locked tests, and their Mosquitto integration checks. Display, Modbus, and AdGuard images passed container-local startup, connection, broker loss, and recovery checks. AdGuard also passed its five development and TLS tests, UID `1000` check, read-only runtime/config fixture, and exact-image smoke.
- **CI and release:** Bridge selection covered all ten slugs, including both Ping jobs, and rejected malformed or incomplete coverage. The workflow YAML and shell steps parsed. All nine existing tagged images passed the non-publishing candidate smoke. The Modbus save/checksum/load check preserved the image ID, and the static binary archive and SHA-256 sidecar matched the existing layout. Fixtures covered failed starts, version mismatches, conflicting aliases, and immutable-tag conflicts after a partial publication. No hosted release dispatch was performed.
- **Known warnings:** Nuxt emitted existing build/tooling warnings. Cargo reported the existing Modbus `futures` manifest warning and Display's vendored `mccs-db` future-compatibility warnings.

## Operator decisions and remote checks

Read-only branch policy and registry observations are in [main branch protection](../../docs/operations/main-branch-protection.md) and [image distribution](../../docs/operations/image-distribution.md). The repository rules were not applied, and the public install references were not changed. The configured organizational registry targets returned anonymous `401` on token issuance. A host-level rule change, permission or visibility change, registry publish, and production deployment all remain outside this implementation.

Use [PR #72](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/pull/72) for GitHub's current check results; this record does not assert remote results for a different head.
