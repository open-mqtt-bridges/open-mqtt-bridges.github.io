# Tasks: Migrate the bridge repositories

**Input:** [Specification](spec.md), [plan](plan.md), [inventory](data-model.md), [history contract](contracts/history.md), [compatibility contract](contracts/compatibility.md), and [validation guide](quickstart.md).

**Delivery rule:** Validate and commit each implementation task separately. For an import task the two-parent import commit **is** the task commit; never wrap it in a squash or mix in integration edits. Record its resulting OID in the external verification report and issue, not in the import's own tree. No task authorizes publication, changes to production permissions, or archival.

## Phase 1 — Setup

- [x] T001 Record the target revision, all eleven sources, default branches, maintainers and freeze contacts in `migration/sources.json`; record live docs, old download links, CI/platforms, issue/PR disposition and publishing baselines in `migration/baseline.md`. Include distinct website, archive, and organization profile roles. Check that feature 902 need not merge.

## Phase 2 — Foundation

- [x] T002 Implement source capture and private recovery instructions in `scripts/migration/snapshot.mjs` and `docs/migration/recovery.md`. Follow `contracts/history.md`: capture heads, original tag objects, PRs, fork/local tips, worktree/reflog finds, relevant gitlinks and LFS references. Preserve distinct local tips even when names match. Write full OID lists, checksums and standalone bundles outside the checkout; restore to an empty repository. Stop on missing objects or unresolved publication rights.
- [x] T003 Record a sanitized per-source restore result in `migration/snapshots.json` and a package/public-interface baseline in `migration/packages.json` for all existing packages, including original repo association, effective grants, namespace, visibility, architectures, old digest and rollback settings. Verify recoverability without consulting the originals; keep private backup paths and material outside Git.

## Phase 3 — US1: Retrieve original history (P1, MVP)

**Independent test:** A fresh clone from a disposable target alone contains every inventoried pilot OID and original tag object. Each import has the frozen source as second parent and its exact tree under the designated prefix. An omitted side-branch tip must fail verification.

- [x] T004 [P] [US1] Implement manifest-driven independent verification in `scripts/migration/verify.mjs` with a positive and deliberately incomplete full-clone fixture in `test/migration-history.test.mjs`. Check exact ref OIDs, source-set difference, both parents, ancestry, prefix tree and unchanged paths outside it; reject empty input.
- [x] T005 [P] [US1] Implement the two-parent import and durable standard-ref mapping in `scripts/migration/import.mjs` with fixtures in `test/migration-import.test.mjs`. Preserve original annotated tag objects across identical names. Repeating a verified import with the same snapshot is a no-op; conflicting target refs or prefixes must not be overwritten. Disable publication in rehearsals; never mirror-push or rewrite a source.
- [x] T006 [US1] Import WLED at `bridges/wled/` using the verified snapshot and T005; run T004 and the existing WLED checks at the pinned toolchain. Record the original tree and both parent OIDs externally.
- [x] T007 [US1] Import Modbus from its verified default branch at `bridges/modbus/`; repeat the full history check, Cargo checks and npm guide build using [quickstart.md](quickstart.md). Prove both pilots from a fresh target clone before expanding.

## Phase 4 — US2: Maintain and validate each bridge (P2)

**Independent test:** A WLED change selects only WLED, shared input changes select every affected bridge, and archive-only changes release nothing. Builds use each bridge's original lockfiles. Verify the eleven-source history after expansion.

- [x] T008 [P] [US2] Implement affected-bridge selection and an always-running aggregate check in `.github/workflows/bridge-ci.yml` and `scripts/select-bridges.mjs`; cover single, shared, archive-only and docs-only changes in `test/select-bridges.test.mjs`. Use explicit working directories, Docker contexts and toolchain-specific cache keys; start with both pilots.
- [x] T009 [P] [US2] Verify website-only scope in `eslint.config.mjs`, `.prettierignore`, `nuxt.config.ts`, and `.github/workflows/pages.yml`; adjust only where the import would lint, bundle or publish unrelated bridge content. Run all six website checks and compare current routes; leave feature 902 untouched.
- [x] T010 [US2] Import `bridges/homeconnect/`; compare the original tree and OIDs and run its pinned source CI commands from the new location.
- [x] T011 [US2] Import `bridges/landroid/`; verify its history and run its own locked build, tests, and existing container checks.
- [x] T012 [US2] Import `bridges/philips-hue/`; verify its history, locked build, tests, and supported runtime checks against the baseline.
- [x] T013 [US2] Import `bridges/roborock/`; verify its history and source CI including existing container checks, without using real user credentials.
- [x] T014 [US2] Import `bridges/pocketbase/`; verify its history and run its own pinned pnpm, test and coverage checks independently of the website's package manager.
- [x] T015 [US2] Import `bridges/adguardhome/`; verify its history and reproduce its Yarn Classic installation and baseline checks without replacing the lockfile.
- [x] T016 [US2] Import `bridges/display/`; verify its history, including known documentation pins, and reproduce both Rust and Node checks.
- [x] T017 [US2] Import `bridges/ping/`; verify its history, pinned Rust checks, Mosquitto integration test and amd64/arm64 container checks. Report unavailable runners separately.
- [x] T018 [US2] Import `archive/idm-energy/` without reopening its source; verify its original history and tree and demonstrate it is excluded from active jobs.
- [x] T019 [US2] Complete all ten active CI profiles in `.github/workflows/bridge-ci.yml` against `migration/baseline.md`; run the complete CI selection matrix and eleven-source clean-clone check. Document only genuine baseline failures or hardware gaps in `migration/validation.md`.

## Phase 5 — US3: Keep existing packages usable (P3)

**Independent test:** Validate release selection against production names without writing to them. An isolated package handoff demonstrates one publisher, stable identity and rollback. Live proof for each existing package is a separate post-approval operation, never inferred from a disposable test.

- [x] T020 [P] [US3] Implement per-bridge release/tag selection in `scripts/select-release.mjs` and `test/select-release.test.mjs`. Require an exact active slug and its own manifest version; reject `import/**`, mismatches, archive, website and unrelated tags. Resolve the existing registry name explicitly.
- [x] T021 [P] [US3] Write the per-package handoff and rollback checklist in `docs/migration/package-handoff.md` using `migration/packages.json`: registry association, unchanged visibility/owner, old publisher pause, explicit or inherited grants, monorepo source label, existing-package test tag, old digest pull, old write grant removal, and rollback. Specify who verifies each result.
- [x] T022 [US3] Integrate per-bridge versioning, changelogs, release notes, artifact/platform builds and source labels in `.github/workflows/bridge-release.yml` using T020 and each source's version owner. Keep a dry-run path, enforce separate production authorization, preserve existing package names, and give the archive or previously unpublished bridges no new publisher.
- [ ] T023 [US3] Rehearse handoff and rollback on a disposable package and record evidence in `migration/package-rehearsal.md`; distinguish the test package's result from live evidence still required for every existing package. Exercise a cached digest pull and confirm a disabled former publisher cannot run.

## Phase 6 — Cross-cutting verification and operational handoff

- [ ] T024 Record the disposable GitHub target rehearsal in `migration/validation.md`: verify full history from a network clone, hosted branch rules, safe transfer of historical workflows/refs, supported build matrix, current Pages routes, and package rollback. No squash/rebase merge; halt if target settings cannot preserve ancestry.
- [ ] T025 Prepare `docs/migration/cutover.md` and `migration/cutover-status.md`: name the operator, approvals and order for the final freeze, delta recapture, refreshed tests, exact-graph transfer, post-merge full-clone proof, package ownership handoff per existing package, stable live links, and restoration. Prepare source-link updates for `bridges.json` and `../.github/README.md` for when targets exist. Retain old issues, PRs, assets and repositories; defer archival until the observation period and explicit approval. Record live actions as pending until actually verified.

## Dependencies, parallel work, and release boundary

T001 → T002 → T003 → US1 → US2 → US3 → T024 → T025. Within US1, T004 and T005 can be developed against independent fixtures; both must pass before the first import. Within US2, T008 and T009 can proceed independently; run import commits sequentially on the integration branch. Within US3, T020 and T021 can proceed independently; both feed integration and rehearsal.

The MVP ends at T007: verifiable original Node and Rust histories without touching production. Add the remaining bridges only after validating both pilots. A changed snapshot invalidates the affected checks; resume only from the last verified state. Merge, live ref transfers, actual package relinking/publishing, Pages changes (if separately requested), and eventual archival are operator gates beyond preparing this PR. The operational migration is not complete until the live checks in T025 have been performed and recorded.
