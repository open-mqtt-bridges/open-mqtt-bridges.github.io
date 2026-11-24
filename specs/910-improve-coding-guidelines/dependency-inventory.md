# Dependency Inventory

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

## Cargo, images, and CI

- **Display**: crates.io reports `anyhow` 1.0.104 → 1.0.105, `clap` 4.6.7 → 4.6.9 (#36), and `uuid` 1.29.1 → 1.29.3 (#33). `mccs` and `mccs-db` 0.1.3 → 0.2.0 need a coordinated migration: #35 fails with Rust `E0308` and Display has local `mccs-db` and `nom` patches.
- **Modbus**: `anyhow` 1.0.104 → 1.0.105 and `clap` 4.6.7 → 4.6.9 (#37).
- **Ping**: `toml` 1.2.1 → 1.2.2 (both `+spec-1.1.0`). Keep the patched `rumqttc`, compiler requirement, and image digest policy intact.
- **Images**: Registry manifests resolve for Node `26.13.1-bookworm-slim` (already used by Roborock and WLED), Rust `1.100-bookworm` and `1.100-alpine`, and the existing `node:lts-alpine` and `debian:bookworm-slim` tags. Ping's checked-in Rust and Debian digests match the queried tags. This confirms availability, not platform or runtime compatibility.
- **Actions**: Stable release checks did not surface a newer major for the sampled release-tagged actions. Most workflows follow floating major refs; do not turn these into pins or change signing/trust policy as part of a refresh. Ping's exact checkout SHA is annotated as `v7.0.1`, the observed latest release. Confirm its ref and review CodeQL and `dtolnay/rust-toolchain` under their respective ref policies rather than comparing bundle or branch names as versions.

## Advisory coverage

`pnpm audit --json` reported zero advisories in the root workspace, guide site, and all seven Node bridges. OSV matched two informational, unmaintained-crate records in the registry entries of the three Cargo lockfiles, not vulnerabilities with a patched version available:

- Display and Modbus: [`unsafe-libyaml` 0.2.11 (RUSTSEC-2024-0449)](https://rustsec.org/advisories/RUSTSEC-2024-0449.html), reached via `serde_yaml`.
- Ping: [`rustls-pemfile` 2.2.0 (RUSTSEC-2025-0134)](https://rustsec.org/advisories/RUSTSEC-2025-0134.html).

Separate replacement proposals from ordinary updates. These scans do not establish advisory coverage for vendor patches or operating-system packages inside container images.

## Next merge candidate

[#38](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/pull/38) upgrades four NestJS packages to `^12.6.0` across six bridges; its diff touches all six owning lockfiles. Prior [Bridge CI](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/actions/runs/45310061720) passed, but the PR API still shows the parent base `129d554`, not current `e36c321`. Request a bot rebase and verify fresh current-base checks before separately requesting approval to merge. Re-evaluate overlapping Axios, dotenv and TypeScript ESLint PRs afterward. #66's website job fails during lint with `typescript-eslint does not support TS 7.0`; do not merge or relax the check.

## Remaining evidence

Validate compatible transitive targets, release notes, peer and engine ranges, vendored/native behavior, and platform and runtime checks for proposed updates. Cargo is not installed locally; no Cargo builds or tests were run. Reconcile every candidate and PR diff before applying updates. T004–T007 remain open.
