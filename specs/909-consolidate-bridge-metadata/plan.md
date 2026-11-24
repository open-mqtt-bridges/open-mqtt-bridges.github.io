# Implementation plan: Consolidate bridge metadata and standardize Node tooling

**Base:** `main` · **Date:** 2026-11-24 · [Specification](spec.md)

## Design and sequence

1. Move Git ignore behavior into the root `.gitignore`. Prefix rooted/path patterns with the exact bridge path; translate basename patterns to recursive equivalents. Keep exception precedence, file vs. directory semantics, and bridge-specific rules. Compare temporary-repository path probes against the original before removing the ten files.
2. Replace six duplicate licenses with relative root-license links in their READMEs. Update the repository ownership description and any current guide links. Compare notice bytes and inspect artifact packaging inputs; preserve all existing independently distributed notices, including Display and Ping vendored notices and Modbus's GPL archive.
3. Migrate AdGuard Home independently to the repository's pnpm 11.28.9. Import its Yarn lock before removing it, carry `resolutions` into pnpm overrides, and confirm the resolved graph and dependency versions. Make cleanup/build/test/bundle sequencing explicit if lifecycle behavior differs. Update the Dockerfile and active guide, and verify frozen installation, existing tests, bundle, and image.
4. Keep `docs/` an independent pnpm project. Convert its npm lock, preserve security overrides and peer resolution, and update root build, Pages CI, command hints, root/guide contributor docs, cache and ignore metadata. Verify frozen installs, individual guide selection, and the assembled ten-guide site. Review live Yarn/npm references; do not rewrite historical records or remove npm used only to bootstrap pinned pnpm.

## Technical context and constitution

Existing Node 26, TypeScript, Cargo, Docker, VitePress, Nuxt, and GitHub Actions stay in place. No database or deployed state changes. Keep private bridge configuration excluded and retain license attribution. Isolated pnpm projects avoid imposing the root esbuild override on VitePress. Existing bridge-owned lockfiles stay independent. Validate [compatibility](contracts/compatibility.md) before and after each increment; revert the corresponding commit as a unit to restore its files, manager, and instructions.

## Artifacts

[Inventory](data-model.md), [research decisions](research.md), [validation guide](quickstart.md).
