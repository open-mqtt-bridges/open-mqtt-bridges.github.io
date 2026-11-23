# Tasks: Remediate dependency alerts

## Setup and baseline

- [x] T001 Reconcile current Dependabot alerts and overlapping bot PRs against the three lockfiles; record the baseline and verification commands in `specs/904-remediate-dependency-alerts/evidence.md`.

## US1 — Active bridges

**Independent acceptance**: Each resolved Cargo graph excludes the flagged version and its existing bridge checks pass.

- [x] T002 [US1] Remove the vulnerable `rustls-webpki` resolution from `bridges/ping/Cargo.lock`, retaining the configured TLS transport in `bridges/ping/Cargo.toml`; document and license any necessary upstream-derived patch. Verify the graph, TLS trust behavior, and Ping CI.
- [ ] T003 [US1] Remove `serde_yaml 0.7.5` from `bridges/display/Cargo.lock`, addressing the `mccs-db` path in `bridges/display/Cargo.toml`; preserve the existing `nom` patch, verify bundled monitor data, and run Display CI.

## US2 — Archived IDM build

**Independent acceptance**: A clean, frozen Yarn Classic install and archive bundle pass without the flagged resolved versions.

- [ ] T004 [US2] Remediate residual `glob`, `minimatch`, and `picomatch` findings as applicable through `archive/idm-energy/package.json` and `archive/idm-energy/yarn.lock`; verify bot-fixed `ws` and `brace-expansion` remain patched.

## Integration and delivery

- [ ] T005 Record final lockfile, scanner, and current-head CI evidence and any blockers in `specs/904-remediate-dependency-alerts/evidence.md`; submit the scoped PR and reconcile the alert states after an approved merge.

## Dependencies and delivery order

T001 precedes every fix. T002, T003, and T004 have independent paths and checks; Ping and Display are the first delivery priority. Validate and commit each increment separately. T005 follows all completed increments; post-merge GitHub status is tracked only once merge is approved.
