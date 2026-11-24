# Dependency Rollout

## Inventory and ownership

Review every declared runtime/dev dependency and eligible resolved transitive update. Check root pnpm (website and shared libraries), the guide site, six pnpm bridges, AdGuard Home, three Cargo crates, Docker base images, and GitHub Actions. Recheck the owning manager/lockfile after the concurrent bridge metadata work. Include workspace catalogs, peer dependencies, overrides, vendored patches, and supported runtime/toolchain pins. Do not replace existing patches, widen trusted sources, or change a protected pin just because an update is available.

Record current declared and resolved version, candidate version from the registry and release notes, owner, peer/engine/native compatibility, validation, PR, release impact, and disposition. Cover breaking/major candidates in the inventory but treat them and protected pin changes as explicitly approved migrations. Do not report an unverified latest version as a target.

## Dependabot snapshot

Read-only snapshot on 2026-11-24: 33 open PRs against `main`, #28–#59 and #66. Re-enumerate at execution; a snapshot is not merge evidence.

- [#38](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/pull/38), NestJS across six bridges: sampled checks passed; recheck current head, base, required protections, and reviews.
- [#35](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/pull/35), Display `mccs` 0.1.3 → 0.2.0: Display/bridge CI failed. Review API compatibility and the vendored patch relationship before proposing a fix or replacement.
- [#66](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/pull/66), website TypeScript 6.0.3 → 7.0.2: website build job failed. Verify the actual failure and supported Nuxt, `vue-tsc`, compiler, and ESLint parser combination before proposing a migration.
- Review the ESLint/parser PRs as a coupled group per owning package, and check lockfile overlaps with NestJS, Axios, and dotenv PRs. Re-evaluate AdGuard Home PRs after any lockfile migration and never restore an obsolete lockfile to merge a stale PR.

## Order and approval gates

1. Refresh the base and inventory. Map Dependabot coverage to the graph, classify compatibility groups, and prioritize verified security fixes and ready compatible updates. Keep guidelines, dependency groups, and breaking migrations separately reviewable.
2. For each PR, review its actual diff, authority, lockfile ownership, and check results on the current head and applicable base. Propose a merge only for named PRs with evidence. Require separate approval and verify protections and required checks before merging. After each overlapping merge, refresh and recheck the remaining PRs before proceeding; never batch-merge stale heads.
3. Leave failing, conflicting, or obsolete PRs open until a concrete disposition is agreed. Prefer updating the existing PR when supported; otherwise propose a scoped replacement linked to its predecessor. Do not close or supersede a PR without evidence and authorization.
4. For dependencies not covered by Dependabot, use the owning package manager to prepare compatible groups. Keep required fixes and tests with each group; regenerate only owning lockfiles/generated outputs. Use the coding workflow's issue, implementation, CI, and merge gates. Coordinate with active package-manager work rather than making the same change twice.
5. Verify with clean frozen/locked installs on supported runtimes; run affected lint, format, type checks, tests, builds, and container/MQTT checks from CI. Exercise browser/SSR behavior for website dependency changes and two-pass formatter convergence for style-tool changes. Preserve required changeset conventions; never merge Version Packages/release PRs or trigger publication as part of this work.
6. Report each candidate and PR as current, merged, superseded, blocked, or deferred, with the evidence and reason. Recheck the resulting base before validating the guidelines matrix.
