# Maintenance evidence

Issue: https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/issues/7
Base: `e7389721bab79382662ccba7939f8950436f5db2` on `main`. Runtime used for local Node checks: Node 26.13.0; Cargo checks: Rust/Cargo 1.99.

## Baseline and selected targets

Original declared versions, aliases, engines and overrides are preserved in `baseline.json`. Registry metadata and release notes supplied target versions and peer/engine constraints.

| Dependency                              | Before                  | After      |
| --------------------------------------- | ----------------------- | ---------- |
| `@iconify-json/lucide` (package.json)   | `^1.2.0`                | `^1.2.152` |
| `nuxt` (package.json)                   | `4.6.3`                 | `4.6.4`    |
| `tailwindcss` (package.json)            | `^4.1.0`                | `^4.3.5`   |
| `@nuxt/eslint` (package.json)           | `1.15.0`                | `1.17.0`   |
| `eslint-plugin-import-x` (package.json) | `not declared directly` | `^4.18.0`  |
| `vue-tsc` (package.json)                | `^3.1.0`                | `^3.3.14`  |

## Compatibility decisions

- Direct `eslint-plugin-import-x@4.18.0` deduplicates the compatible import plugin required for minimatch 11 ESM exports under @nuxt/eslint 1.17.0. Nuxt remains on the reviewed 4.6.4 target.

## Release-age policy and deferred updates

The user explicitly selected versions published at least 24 hours before update selection, following a fresh-container pnpm policy rejection. NestJS 12.4.2, dotenv 18.0.10, eventsource 5.1.5, eslint-plugin-import-x 4.18.1 and ws 8.22.2 are deferred where applicable. Further fresh Rollup/Vite/follow-redirects and Cargo fixedbitset/itoa/syn/uuid versions were checked and reverted to aged stable resolutions. No new minimumReleaseAgeExclude entries, peer/engine bypass, registry changes or build-script trust expansions are retained. Existing TypeScript aliases are preserved where tooling excludes TypeScript 7.

## Security coverage

GitHub API readback confirms Dependabot alerts, secret scanning and secret-scanning push protection enabled. Public repository dependency graphs support the enabled alerts. Available Dependabot security updates were enabled for dependency-bearing repositories. Secret-scanning open-alert lists were empty after activation. CodeQL configuration is added or retained for the repository's supported source language; successful PR/default-branch analysis must be verified separately. Dependabot entries match actual manifests, with coupled NestJS updates grouped and pnpm workspaces tracked at their lockfile root. Action major references were checked against official releases; release/deployment trigger behavior is preserved.

## Lockfile audits

- `corepack pnpm audit --json`: exit 1; {"info": 0, "low": 1, "moderate": 0, "high": 0, "critical": 0}.

### Residual findings

`deepmerge@4.3.1`: low severity [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), no patched release advertised. Path: Nuxt → Nitro → @rollup/plugin-node-resolve. This site is generated statically; the dependency is exercised during the trusted build, not by the deployed static browser bundle. The advisory remains open; build inputs remain trusted.

## Validation

- `corepack pnpm lint`: passed.
- `corepack pnpm typecheck`: passed.
- `corepack pnpm test`: passed.
- `corepack pnpm build`: passed.
- Clean isolated immutable install (empty pnpm store where applicable), lockfile unchanged: passed.
- Browser acceptance: search filtering, empty results, keyboard clearing and FAQ expansion, Imprint client navigation, mobile 390 × 844 and desktop layout passed. No broken images, horizontal overflow at 390 px, or console warning/error observed. Real devices and cloud APIs were not used.

## Delivery

PR: https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/pull/8; closes #7. Existing matching Dependabot PRs remain open and are linked as superseded. Required CI must pass on the PR current head before any separately authorized merge. No release, deployment or release-PR merge was performed.

## Hosted CI evidence

All reported checks on implementation head `98f362ad147673076e94a4f9f419985df70b4dc7` completed without failures at 2026-11-09T13:23:15.934296+00:00. Deployment jobs were intentionally skipped on the PR. CodeQL PR analysis completed for the supported source language. This final documentation-only task update follows that successful implementation verification; the current PR checks remain authoritative before merge.
