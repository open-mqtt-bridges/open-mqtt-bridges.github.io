---
description: 'Implementation tasks for monorepo reliability and delivery'
---

# Tasks: Monorepo Reliability and Delivery

**Input**: [Specification](spec.md), [plan](plan.md), [research](research.md), [entities](data-model.md), [runtime contract](contracts/bridge-runtime.md), [delivery contract](contracts/delivery.md), and [validation guide](quickstart.md).

## Phase 1: Setup

No project initialization or toolchain migration is needed. Confirm the task branch, approved issue, owning toolchains, and known baseline limits in [quickstart.md](quickstart.md) before editing. Read-only setup does not require a commit.

## Phase 2: Foundation

Use the existing root test runner, Buildx and Mosquitto fixtures, owning package CI, and Pages build. No shared framework is a prerequisite for the bridge fixes. Add tests and their matching implementation in the same coherent task; record the failing regression first where practical.

## Phase 3: User Story 1 - Keep Bridges Working Through Routine Failures (P1)

**Independent test:** Modbus and Display continue processing valid commands after common failures; bridge health accurately reflects startup, disconnect, and recovery without changing existing consumers.

- [x] T001 [P] [US1] Contain rejected input in `bridges/modbus/src/bridge.rs`; add the regression in `bridges/modbus/tests/mqtt_command_recovery.rs` and document expected error handling in `docs/bridges/modbus/topic-contract.md`. Verify that rejection does not produce a write and that a subsequent valid command succeeds with the same running process. Run the owning Rust checks. FR-001.
- [x] T002 [P] [US1] Restore `<base>/cmd` after a new broker session using bounded, nonblocking subscription handling in `bridges/display/src/app.rs` and `bridges/display/src/mqtt.rs`; add a hardware-free broker regression in `bridges/display/tests/mqtt_reconnect.rs` and document recovery in `docs/bridges/display/troubleshooting.md`. Verify command handling after broker restart, not merely a retained heartbeat. Run the owning Rust checks. FR-002.
- [x] T003 [US1] Add broker/session-based `/readyz` to the six NestJS bridges, starting with `bridges/homeconnect/src/modules/health/health.controller.ts`, `bridges/pocketbase/src/modules/health/health.controller.ts`, and their owning MQTT services; apply the same compatibility tests to Landroid, Philips Hue, Roborock, and WLED. Preserve existing `/health`; verify `503` on startup and disconnect and `200` after required subscriptions recover. Record behavior in `docs/operations/bridge-health.md`. FR-005.
- [x] T004 [US1] Extend or verify native health probes for Display, Modbus, Ping, and AdGuard in `bridges/display/Dockerfile`, `bridges/modbus/src/main.rs`, `bridges/ping/src/health.rs`, and `bridges/adguardhome/src/services/mqtt.ts`. Keep external port exposure stable, verify all four recovery scenarios with fixture or existing integration evidence, and complete `docs/operations/bridge-health.md`. Align Display and Modbus readiness with T001/T002. FR-005.

**Checkpoint:** Validate T001 and T002 first as the minimum useful runtime increment; complete readiness independently after that milestone.

## Phase 4: User Story 2 - Trust Merges, Releases, and Installation Instructions (P1)

**Independent test:** Missing assignment cannot yield a green check; failed or stale release candidates cannot publish; public references are verified or recorded as blocked; the administrator can apply and verify the reviewed `main` policy independently.

- [x] T005 [US2] Establish explicit active-bridge check coverage in `scripts/select-bridges.mjs`, `.github/workflows/bridge-ci.yml`, and `test/select-bridges.test.mjs`. Reject missing, duplicate, and unknown assignments even for an empty affected set. Preserve affected-only execution, Ping's broker and dual-architecture container checks, and the stable `bridge-checks` result. Run `pnpm test` and validate CI job selection. FR-009.
- [ ] T006 [US2] Add the policy, verified check contexts, approval boundary, and rollback steps in `docs/operations/main-branch-protection.md`. Match actual pull-request checks and document recovery access. Record effective rules read-only; applying them requires separate administrator permission and is not a code task. FR-003.
- [ ] T007 [US2] Add a pure alias policy in `scripts/check-release-aliases.mjs`, fixtures in `test/release-aliases.test.mjs`, and a before-push check in `.github/workflows/bridge-release.yml`. Compare the current target's proved stable version; reject regression or unavailable evidence, distinguish confirmed absence, and preserve immutable tag formats, `latest`, Display minor aliases, and Modbus `master`/`sha-*`. Update `docs/operations/releases.md`. FR-004.
- [ ] T008 [US2] Test the exact candidate in `.github/workflows/bridge-release.yml` with a workflow-owned `scripts/smoke-release-image.mjs` and fixtures under `test/`. Keep the harness usable for historical tags, validate bridge-specific identity and startup, prove image ID and archive checksum survive handoff, and keep Modbus assets compatible. Verify failed smoke blocks both publish modes and use non-publishing fixtures or an approved `dry-run` for release evidence. Update `docs/operations/releases.md`. FR-004.
- [ ] T009 [P] [US2] Create the verified distribution matrix in `docs/operations/image-distribution.md` using `.github/bridge-publishers.json`, Compose files, and the relevant bridge deployment guides. Cover all nine configured publishers and Ping build-only; record public read result, time, and known-good digest or blocker. Preserve installed references; describe separate approval, access validation, and rollback for any eventual cutover. FR-006.

## Phase 5: User Story 3 - Make Local and Public Behavior Repeatable (P2)

**Independent test:** A local permission matrix passes, the AdGuard candidate starts non-root with its documented mounts, and Chromium proves acceptance against the generated website with scripts on and off.

- [ ] T010 [P] [US3] Isolate both `0022` and `0077` permission scenarios in `bridges/roborock/src/lib/roborock/map.spec.ts`; preserve mask behavior in `bridges/roborock/src/lib/roborock/map.ts` and document group/directory requirements in `docs/bridges/roborock/configuration.md`. Check modes `0640` and `0600` on new and replaced maps without changing permissions to make tests pass. Run the complete owning test suite. FR-007.
- [ ] T011 [US3] Pin the compatible base and use an unprivileged runtime user in `bridges/adguardhome/Dockerfile`, with an isolated mount/start smoke in `bridges/adguardhome/test/container-smoke.sh` and docs in `docs/bridges/adguardhome/deployment.md`. Run the Docker build with its existing OpenSSL TLS gate and verify the candidate smoke from T008 against the new image shape. FR-008.
- [ ] T012 [P] [US3] Add Playwright in `apps/website/package.json` with the owning `pnpm-lock.yaml`, test actual generated output in `apps/website/test/browser/catalog.spec.ts`, and gate artifact upload in `.github/workflows/pages.yml`. At 320 px verify search, empty state, keyboard reset/focus, no overflow and no page errors; verify all catalog cards and links with no JavaScript. Reuse clean-URL preview behavior on loopback and leave root static checks intact. FR-010.

## Final Phase: Cross-Cutting Verification

- [ ] T013 Run documented repository, owning package, MQTT/health contract, browser, and release-fixture checks in `specs/911-monorepo-reliability/quickstart.md`. Record HEAD-specific evidence, environment limits, deferred administrator operations, and only actual release metadata required by owning bridge policy; do not run version, publish, or deploy commands.

## Dependencies & Execution Order

- T001 and T002 are independent and first. T003 can proceed independently of the Rust implementation; T004 follows T001, T002, and T003 because it uses the established health semantics and updates the same operations guide.
- T006 follows T005 so the documented context is stable. An administrator may handle the rule separately once the relevant proof and approval exist.
- T008 follows T007 because both change the release workflow and gate the same candidate. T011 follows T004 and T008 so the container verification covers the native probe and the exact-image check.
- T009, T010, and T012 are independent of each other and can proceed alongside the bridge fixes. T013 follows all implementation tasks.

## Parallel Opportunities

- US1: Work on the Modbus and Display first increments independently.
- US2: Verify documented public image references while CI mapping or release policy is being implemented; do not edit the same release runbook concurrently.
- US3: Run Roborock's permission matrix work alongside the website browser gate; wait for the release gate before final AdGuard candidate verification.

## Implementation Strategy

Start with T001 and T002, proving the regressions separately. Then protect coverage and release evidence, followed by the remaining runtime and browser checks. Each completed implementation task has its own reviewed commit; no unrelated cleanup, operator changes, or release metadata for packages that are not affected. Repository policy changes, live package handoffs, registry writes, and deployments stay outside the code workflow until explicitly approved.
