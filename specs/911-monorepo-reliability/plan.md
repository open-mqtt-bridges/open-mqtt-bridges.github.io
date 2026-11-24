# Implementation Plan: Monorepo Reliability and Delivery

**Branch**: `71-monorepo-reliability-and-delivery` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: `specs/911-monorepo-reliability/spec.md`; audit baseline `9d3b192`.

## Summary

Keep all ten audit findings in one plan. Deliver the two MQTT fixes as independent increments, then close CI and release verification gaps. Validate health, distribution, permissions, and website behavior without forcing a workspace migration or changing public contracts. Track separately approved GitHub and registry operations as explicit handoffs, not as side effects of implementation.

## Technical Context

- **Language/Version**: Existing pinned Rust toolchains, Node.js 26.13.1, TypeScript, pnpm, and GitHub Actions YAML; each package retains its lockfile.
- **Primary Dependencies**: Existing MQTT clients, NestJS, Nuxt, VitePress, Buildx, and Mosquitto. Use Playwright for Chromium browser checks, with its package and browser pinned together in the website's existing workspace. No general dependency upgrades.
- **Storage**: Existing map files and workflow artifacts only. No database, new service, or persistent status store.
- **Testing**: Owning Rust and Node checks, real loopback-only broker tests where necessary, root Node tests, exact-image container smoke, and generated-site browser tests. No physical devices or real credentials are required in CI.
- **Target Platform**: Linux images and GitHub Actions; existing release architecture remains `linux/amd64`. Ping retains existing `amd64` and `arm64` CI smoke checks.
- **Project Type**: Mixed Rust/Node monorepo with static GitHub Pages, separate bridge releases, and independent package lifecycles.
- **Performance Goals**: No indefinite wait in broker polling or CI readiness; use bounded waits on observable state, not arbitrary sleeps. Reuse build artifacts and existing smoke fixtures.
- **Constraints**: Preserve MQTT topics, payloads, QoS and retention, config keys, `/health`, historical package identifiers, and release asset filenames. No credentials in fixtures or logs. No live repository, registry, or deployment writes without separate authorization.
- **Scale/Scope**: Ten active bridges, nine configured publishers, the static website, and maintainer documentation.

## Constitution Check

- **Compatibility:** Preserve bridge and release contracts. After design: additive health only; no changes to topics, existing endpoints, image identifiers, or release asset names.
- **Scoped ownership:** Use owning packages and CI. After design: no new runtime service or workspace restructuring; local fixes and shared fixtures stay at their existing boundaries.
- **Credential protection:** Test without production credentials. After design: use synthetic fixtures and anonymous registry reads; production permissions stay with the operator.
- **Documentation and accessibility:** Document in en-US and retain accessible site behavior. After design: validate keyboard focus, narrow viewport, and script-free browsing; document health, installation, release, and rollback.
- **Verified delivery:** Validate each increment independently. After design: each audit point has an evidence gate; publication, repository rules, and registry changes are separately approved.

## Project Structure

```text
specs/911-monorepo-reliability/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── bridge-runtime.md
│   └── delivery.md
└── checklists/requirements.md

bridges/{modbus,display,roborock,adguardhome}/   # Targeted runtime or packaging changes
bridges/*/src/                                # Bridge-owned readiness integration
.github/workflows/                            # Bridge CI, release, Pages
scripts/                                      # CI mapping, release verification, optional fixture helpers
test/                                         # Repository-tool tests
apps/website/                                 # Website-owned browser cases and command
docs/{bridges,operations}/                     # Contract notes and handoff runbooks
```

**Structure Decision**: Keep code, tests, and lockfiles with their owners. Do not move release ownership or combine independent bridges' version histories.

## Delivery Sequence

### A. Restore runtime reliability and prepare merge protection

1. **Modbus (FR-001):** Handle an input rejection at the command boundary without propagating it through `drive_mqtt_event_loop`. Keep internal, transport, and genuine worker failures distinguishable. Verify the rejection path and a subsequent successful write through a synthetic Modbus target.
2. **Display (FR-002):** Re-establish command subscription on `ConnAck` for each new session. Do not wait on an outbound request queue from the code that drains it; use nonblocking enqueue with retry driven by the event loop or a bounded producer. Add a broker restart test that verifies inbound command handling, not just outbound heartbeat, without DDC/CI hardware.
3. **CI assignment (FR-009):** Validate an explicit check assignment for every active catalog slug, including Ping's multiple jobs. Derive matrix selection from this assignment or assert exact parity. Run the inventory validation even when no bridge job matches. Test a missing, unknown, and duplicate assignment. Preserve affected-only jobs and the stable aggregate `bridge-checks`.
4. **`main` rules (FR-003):** Prepare the rule and rollback runbook in parallel with the runtime fixes. Verify check context names, normal PR triggering, and administrator/recovery access. Require PR-based changes and the verified Bridge and Website contexts; include CodeQL only once its stable contexts and applicability are confirmed. Applying rules is an administrator operation. It does not need to wait for unrelated packaging or browser work.

### B. Verify what gets shipped

5. **AdGuard non-root (FR-008):** Select and pin a compatible Node/Alpine base matching the verified runtime, use an explicit unprivileged user, and run the existing TLS gate. Verify documented read-only config and writable paths with representative mount permissions. Document any required ownership adjustment before release.
6. **Release gate (FR-004):** Keep the smoke harness at the workflow revision and build once from a separate reviewed-tag checkout. Smoke-test that image before saving/exporting it; check packaged identity, startup, and the applicable health behavior for each publisher. Reuse fixture primitives from bridge CI, not registry credentials. For PocketBase, verify image-derived version evidence rather than add version to `/health`. Carry the tested image ID and archive checksum to the publish job and verify them after loading. Preflight mutable aliases immediately before any push and reject a backward or unprovable move. Rehearse the stale-alias, candidate-failure, and interrupted-publication cases without mutating package state. Keep immutable tag formats, Display's minor-series alias, Modbus `master` and `sha-*` tags, and the Modbus binary archive policy.
7. **Distribution (FR-006):** Record the current install and publisher references side by side for all nine publishers; record Ping as build-only. Verify the intended public references anonymously and capture HTTP/result, time, and digest where observable. Preserve known-good references until an independently approved visibility, mirroring, or cutover decision is verified. Document rollback by known-good digest.

### C. Make operational and browser behavior repeatable

8. **Health (FR-005):** Follow Ping's separation of liveness and readiness. Keep NestJS `/health` stable and add readiness driven by actual connection/subscription state, with operationally required upstream state only where appropriate. For Rust runtimes and AdGuard, reuse native probe surfaces or use an internal command/status check where needed; do not add a public listener solely for health. Track each bridge's expected state through startup, disconnect, and recovery.
9. **Roborock (FR-007):** Preserve restrictive `umask` behavior; do not chmod maps to widen access. Run create/replace cases in child processes with isolated masks (`0022` and `0077`), assert `0640` and `0600`, and document the directory and group prerequisites separately from the file mode.
10. **Website (FR-010):** Run Playwright Chromium against the assembled Pages output in the existing Pages build job, after `pnpm build` and before artifact upload. Use the existing clean-URL preview behavior; bind the CI test server to loopback. Cover 320 px layout, search hits/empty/reset, keyboard focus, no-JavaScript fallback, and no page errors in the scripted flow. Derive catalog counts from current data and keep Playwright specs out of the root Node test glob. Preserve existing static verification.

The release smoke harness must work with existing tagged AdGuard package shapes and can use existing boot checks before optional readiness signals mature. Re-run the AdGuard candidate probe after hardening its image. Release and Pages work do not need to wait for a live registry handoff. Health rollout should reuse the connection semantics verified by the runtime fixes. Roborock and website checks have no runtime dependencies on those fixes.

See [research](research.md), [entities](data-model.md), [runtime contracts](contracts/bridge-runtime.md), [delivery contracts](contracts/delivery.md), and [validation](quickstart.md). Detailed task IDs and commits are deferred to approved `speckit-tasks`.
