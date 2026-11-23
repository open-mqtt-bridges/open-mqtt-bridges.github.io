# Tasks: Centralize Bridge Documentation

**Inputs**: [Specification](spec.md), [plan](plan.md), [guide contract](contracts/guides.md), [validation](quickstart.md).

## Phase 1: Setup

- [x] T001 Record the current Pages paths, tracked anchors, repository Website URLs, publishing settings and rollback steps in `specs/902-centralize-bridge-docs/baseline.md`. Inspect local and remote branch state before selecting source checkouts; record Ping's prior local work without modifying it.

## Phase 2: Foundation

- [ ] T002 Add pinned Display and Modbus source submodules in `.gitmodules`, assemble their existing docs through `scripts/` and `.github/workflows/pages.yml`, and test the combined artifact at `/display/` and `/modbus/` in an isolated preview. Check both lockfile owners, failure paths and artifact boundaries in `test/`; add no new public catalog links in this increment.

## Phase 3: Find all guides on the website (US1)

**Independent test**: In a combined preview, each catalog card opens the right central guide, and each guide links back to the catalog.

- [ ] T003 [US1] Add the website-owned IDM Energy archive page in `app/pages/` and tests for its status and historical repository link; do not modify the archived repository.
- [ ] T004 [US1] After T005–T008 have produced reachable revisions, pin all active docs in `.gitmodules`, update `bridges.json` and `scripts/catalog.mjs`, and verify the complete catalog and artifact using `scripts/check.mjs` and `test/`.

## Phase 4: Set up and troubleshoot without reading code (US2)

**Independent test**: Against each versioned bridge, follow the guide through the first verification and find a symptom-based troubleshooting action; confirm the guide matches supported behavior.

- [ ] T005 [P] [US2] Normalize Display, Home Connect, Landroid and Philips Hue in each bridge's `docs/`, including `docs/.vitepress/config.mts`; validate paths and assets with the owning builds. Prepare each bridge's README link without requiring it to go live early. Commit per repository.
- [ ] T006 [P] [US2] Normalize Modbus, PocketBase, Roborock and WLED in each bridge's `docs/`, including `docs/.vitepress/config.mts`; retain relevant technical reference, verify old paths and run the owning builds. Prepare each README link. Commit per repository.
- [ ] T007 [P] [US2] Add a supported AdGuard Home user guide in `adguardhome/docs/`, based on versioned configuration and deployment examples, and prepare `adguardhome/README.md`. Run the guide build and check its instructions and anchors.
- [ ] T008 [US2] Reconcile Ping's existing local work without editing it in place; use it only with permission if not already upstream. Complete `ping/docs/` and prepare `ping/README.md`; check Linux prerequisites, verification and MQTT behavior against versioned sources.

## Phase 5: Preserve external entry points (US3)

**Independent test**: Probe the inventoried paths against the assembled artifact; after cutover, follow repository Website and README links and repeat live probes.

- [ ] T009 [US3] Preserve inventoried deep paths and anchors in the owning `docs/` files or compatibility output under `scripts/`. Prepare the `.github/profile/README.md` update using `scripts/sync-profile.mjs`; verify scope and exact link destinations.
- [ ] T010 [US3] Prepare source repository workflow changes in each `.github/workflows/docs.yml` or `.github/workflows/pages.yml` so validation can remain but independent publication can be retired. Document and rehearse the exact cutover and rollback in `docs/development.md` before changing live state.
- [ ] T011 [US3] After separate approval and verified CI, deploy the central artifact, probe old and new routes, retire separate publishing one bridge at a time, and publish README/profile changes plus repository Website metadata. Record outcomes and rollback evidence in `specs/902-centralize-bridge-docs/baseline.md`.

## Phase 6: Cross-cutting verification

- [ ] T012 Run the complete `quickstart.md` rehearsal and record build, mobile, keyboard, assets and language checks in `docs/verification.md` before proposing the live cutover. Document the maintenance steps for updating submodule revisions in `docs/development.md`.

## Dependencies and Incremental Delivery

- Start with T001 → T002. Complete T005–T008 before T004; T003 can land independently after setup.
- The source documentation tasks for separate repositories can run independently once the shared contract is fixed. Ping can remain blocked independently; full catalog publication waits for its verified source.
- Rehearsal T012 follows T004, T009 and T010 and precedes T011. T011 is explicitly gated; stop on failed live checks.
- The first increment proves central assembly for Display and Modbus without replacing existing publication. Subsequent increments make the full catalog reviewable before live cutover.
