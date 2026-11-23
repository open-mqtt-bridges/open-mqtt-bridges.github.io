---
description: "Implementation tasks for WLED availability recovery (#48)"
---

# Tasks: Recover WLED Availability

**Input**: [Spec](spec.md), [plan](plan.md), [research](research.md), [data model](data-model.md), [MQTT contract](contracts/mqtt-availability.md), and [quickstart](quickstart.md).

**Format**: `- [ ] TNNN [P?] [USn?] Description with exact file path`. Every code-bearing task includes its tests and one validated commit; for story tasks, write the regression first, capture the expected baseline failure where applicable, then commit only the passing increment. Pure verification needs no empty commit.

## Phase 1: Setup

**Purpose**: Verify the actual implementation baseline without modifying the toolchain.

- [X] T001 Confirm the issue branch was based on current `main`, inspect `package.json`, `pnpm-lock.yaml`, `jest.config.ts`, and `.github/workflows/ci.yml` for the actual pinned versions and gates, and run the frozen install, existing tests, and build in [quickstart.md](quickstart.md). Verify Docker access for the disposable broker; record pre-existing failures separately from feature failures.

## Phase 2: Foundational

**Purpose**: Establish a real MQTT and WLED fixture that passes before the product change.

- [X] T002 Add the separate `test:availability` script in `package.json` and fixture in `test/availability.integration.ts`: start a version-pinned, disposable Mosquitto container with persistence off and an ephemeral loopback port, serve `/json` and `/ws` locally, and launch the built bridge with a temporary synthetic `CONFIG_FILE`. Use a clean early subscriber with a SUBACK barrier to assert the live `true`, and record socket accepts and `/json` requests. Use bounded waits, fail on missing infrastructure, and clean up all resources in `finally`. Validate the fixture on the unchanged bridge with `pnpm build` and `pnpm test:availability`; keep the default Jest coverage gate unchanged.

**Checkpoint**: The early-subscriber fixture passes on the baseline without hardware, Redis, or production access.

## Phase 3: User Story 1 — Correct Availability After Late Startup (P1, MVP)

**Goal**: Recover current status for consumers that missed the first online announcement.

**Independent test**: After live `true`, activate clean subscriptions with empty and preloaded `false` caches. Both receive non-retained `true` within 35 seconds on the original WLED socket.

- [X] T003 [US1] First extend `test/availability.integration.ts` to reproduce the late-subscriber timeout on the baseline and add cadence/lifecycle and adapter tests in `src/lib/wled/index.spec.ts` and `src/modules/mqtt/mqtt.service.spec.ts`. Then implement the 30-second refresh on the existing tick in `src/lib/wled/index.ts` and the availability-only connected publish path in `src/modules/mqtt/mqtt.service.ts`. Enforce the connection model: “Starts `false`; changes to `true` on open and to `false` on disconnect. MQTT outages do not change it.” Track the last attempt as “timestamp or unset”; “A skipped publish while disconnected does not advance it.” Route startup, transitions, replay, and orderly shutdown through the guard; exercise latest offline replay, no catch-up burst, no replay before setup/after destroy, and no MQTT availability queue growth during disconnect. Preserve generic publication and command clearing; update `docs/mqtt.md` with cadence, QoS 0, idempotency, and cache-expiry limits. Pass lint, typecheck, the coverage gate, build, and the broker test before committing.

**Checkpoint**: The empty and stale caches recover without new WLED frames, WebSocket connections, or `/json` requests.

## Phase 4: User Story 2 — Recover After a Broker Outage (P1)

**Goal**: Prove that the shared refresh resumes after broker recovery and publishes only the latest device status.

**Independent test**: Restart the broker while the original WLED socket remains open; after both MQTT clients are ready and the subscriber has a new SUBACK, the cache seeded with `false` receives `true` within 35 seconds. In a separate case, change device state while the broker is down and require `false` as the first availability after recovery.

- [X] T004 [US2] Extend `test/availability.integration.ts` to stop and restart Mosquitto on the same endpoint and verify the two outage cases in [quickstart.md](quickstart.md). In the online case assert the original socket is still open, exactly one WLED connection was accepted, and `/json` was fetched once. In the offline case hold the fixture offline after disconnecting it during the outage and require the first received payload to be non-retained `false`, not a stale queued `true`. Use explicit MQTT readiness/SUBACK barriers and demonstrate both cases with `pnpm test:availability`; reuse T003's recovery path without adding another timer or reconnect hook.

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T005 Add the crash and command compatibility cases in `test/availability.integration.ts`: observe live `true`, abruptly stop the bridge, then verify no stored `true` is delivered to a fresh subscriber while the broker remains up. While the bridge is running, send one synthetic non-retained command, confirm one device command and a zero-byte MQTT clear, and verify a fresh `/cmd` subscription receives neither as retained. Register listeners before subscribing, use broker round-trip barriers and bounded observations, and add `pnpm test:availability` after build in `.github/workflows/ci.yml` without weakening any existing gate. Run the full command list in [quickstart.md](quickstart.md).
- [X] T006 After all feature checks pass, use `pnpm changeset` with `.changeset/config.json` to record one patch changeset for `wled-mqtt-bridge`. Describe the availability recovery and unchanged retention/commands; validate the metadata and commit it separately. Do not version or publish.

## Dependencies & Execution Order

- **Required order**: T001 → T002 → T003 (US1) → T004 (US2) → T005 → T006.
- **US1 → US2**: Both can be validated independently; US2 reuses the refresh and test fixture from US1 instead of introducing a second recovery mechanism.
- **Parallel opportunities**: No whole tasks qualify for `[P]`. Within US1, adapter tests and late-subscriber assertions touch different files and can be prepared independently after T002. Within US2, the uninterrupted-socket and offline-after-outage cases share one test file and should be edited in order; their runs can be isolated in separate disposable fixtures.

## Implementation Strategy

- **MVP**: Complete T001–T003 and demonstrate late-subscriber recovery, including an overwritten `false`, on the unchanged WLED connection.
- **Issue acceptance**: Complete T004–T005 for broker restart, current offline recovery, and wire compatibility. Run all checks before T006. The MVP alone does not close #48.
