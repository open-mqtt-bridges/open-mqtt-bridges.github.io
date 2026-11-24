# Dependency Inventory: Initial Pass

**Base**: `e36c321f029df0a3cea9510416cd542f3c3310d9` (2026-11-24). AdGuard Home and the guide site now own pnpm lockfiles. No dependency was changed.

## Direct pnpm candidates

The root recursive report and package-local `pnpm outdated --json` reports were collected after frozen installs. The registry versions below are observations, not verified compatible targets. A wanted version equal to the current version signals a declared constraint; inspect the manifest and any exact pin before changing it.

| Owner                               | Candidates (current → latest observed)                                                                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website/root workspace              | Lucide icon data 1.2.157 → 1.2.158; TypeScript 6.0.3 → 7.0.2 (blocked by the failed website build on #66).                                                                                         |
| Guide site                          | No direct candidates reported; still verify resolved dependency and advisory coverage.                                                                                                             |
| AdGuard Home                        | Axios 1.21.0 → 1.21.1; dotenv 18.0.9 → 18.0.10. Existing PRs #40 and #39 conflict after the lockfile migration.                                                                                    |
| Home Connect, Landroid, Philips Hue | Axios 1.21.0 → 1.21.1; dotenv 18.0.9 → 18.0.10; reported NestJS packages 12.4.0 → 12.6.0; ESLint 10.14.0 → 10.15.0; Prettier 3.9.10 → 3.10.1; reported typescript-eslint packages 8.72.1 → 8.73.0. |
| PocketBase                          | dotenv, NestJS, ESLint, Prettier and typescript-eslint as above; EventSource 5.1.4 → 5.1.5; PocketBase SDK 0.28.2 → 0.29.0 requires a breaking-change review.                                      |
| Roborock                            | Axios, Prettier and typescript-eslint as above; NestJS 12.5.0 → 12.6.0; homebridge-roborock-matter 3.40.3 → 3.42.0.                                                                                |
| WLED                                | Prettier and typescript-eslint as above; NestJS 12.5.0 → 12.6.0; ws 8.22.1 → 8.23.0.                                                                                                               |

## PR triage after the base changed

- 33 open PRs: 23 reported `CLEAN`, two `DIRTY` (#39, #40), and eight `UNSTABLE` (#28–#32, #34, #35, #66). These are GitHub merge states, not merge approvals or evidence of current required checks.
- #38 has passing check results for its head, but `main` and that head have diverged by one commit each. Validate against the new base and verify its actual target and lockfile overlap before proposing a merge.
- Do not treat missing PRs as proof that Cargo crates, Docker images, or GitHub Actions are current.

## Remaining evidence

Resolve registry versions and advisory paths for Cargo, container and GitHub Actions owners; verify candidate peers, engines, overrides, vendored patches, and advisory paths across the full graph. Cargo is not installed in the current worktree environment. Reconcile bot diffs and protected version ranges before selecting implementation targets or requesting named merge approvals. T004–T007 remain open.
