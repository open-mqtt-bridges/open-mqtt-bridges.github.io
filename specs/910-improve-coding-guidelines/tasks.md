# Tasks: Improve Coding Guidelines

**Design**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md), and [dependency rollout](dependency-rollout.md).

**Format**: Checklist with sequential IDs; user-story tasks carry their story label.

**Paths**: Relative to the repository root. Keep each validated documentation increment or custom update group in its own commit. Existing bot PRs retain their own delivery and merge approvals.

## Phase 1: Setup

No new tools or dependencies. Confirm the intended feature context and follow the owning setup instructions before collecting evidence.

## Phase 2: Foundational Checks

As part of T001, recheck the implementation base, especially the package managers for AdGuard Home and the guide site. Use the existing manifests, lockfiles, effective configs, and CI; do not carry historical commands into a changed base.

## Phase 3: User Story 1 - Find the right checks (P1, MVP)

**Independent test**: Follow the README for the website, shared libraries, a pnpm bridge, AdGuard Home, a Rust bridge, and the guide site. For each, identify the working directory, applicable commands, and mutating versus read-only behavior.

- [x] T001 [US1] Document the verified check and fix matrix in `docs/development.md`, preserving the existing contributor links and Spec Kit guidance. Verify scope and exclusions against `package.json`, `.prettierignore`, representative effective ESLint configs, and `.github/workflows/{pages,bridge-ci}.yml`, including the root/package distinction and coverage gaps. Walk all six README routes, verify local links, and run the applicable read-only checks from `specs/910-improve-coding-guidelines/quickstart.md` before committing.

## Phase 4: User Story 2 - Review against actual project policy (P2)

**Independent test**: A reviewer can classify Vue ordering, formatter-owned layout, changed public contract documentation, and private helper documentation according to the actual policy.

- [x] T002 [US2] Document applicable JS/TS, Vue, and Rust conventions and exceptions in `docs/development.md`, distinguishing lint/formatter enforcement, manual review, and baseline rules not adopted. Verify the Vue and documentation examples and effective package differences against `eslint.config.mjs`, `bridges/homeconnect/eslint.config.mjs`, `bridges/pocketbase/eslint.config.mjs`, and the representative source listed in the plan. Run relevant checks from `specs/910-improve-coding-guidelines/quickstart.md` before committing.

## Guidelines Track Verification

- [x] T003 Validate the combined result using `specs/910-improve-coding-guidelines/quickstart.md`; confirm that `docs/development.md` and any scoped link corrections are the only delivery changes besides planning artifacts. Record actual checks and gaps in the issue. Do not create an empty verification commit.

## Phase 5: User Story 3 - Bring dependencies up to date (P1)

**Independent test**: Reconcile the complete inventory with final manifests, lockfiles, current CI evidence, and the disposition of each Dependabot PR.

- [x] T004 [US3] Refresh the inventory from `pnpm-workspace.yaml`, `apps/website/package.json`, `libs/*/package.json`, `docs/package.json`, `bridges/*/package.json`, `bridges/*/Cargo.toml`, `bridges/*/Dockerfile`, and `.github/workflows/*.yml`. Reconcile the owning lockfiles, patches, protected pins, advisories, candidate versions, and active Dependabot diffs; record the evidence and candidate groups under `specs/910-improve-coding-guidelines/`.
- [ ] T005 [US3] Review every current Dependabot PR for the owners in `.github/dependabot.yml`. Record current head/base checks and readiness, blockers or replacement options in `specs/910-improve-coding-guidelines/dependency-rollout.md` or its linked inventory. Obtain explicit named merge approval and merge only verified PRs, one at a time where their files overlap; recheck after each base change. Do not create local commits for bot PR merges.
- [x] T006 [US3] From the T004 inventory and T005 outcomes, propose exact targets and validation for uncovered updates in the same owning manifests and lockfiles. Split delivery into separately identified tasks and reviewable changes by compatibility group before edits. Escalate breaking targets and protected pin changes for explicit decisions. Validate each approved group with clean locked installs and affected checks before its own commit/PR.

## Final Phase: Cross-Track Verification

- [ ] T007 Reconcile candidate and PR dispositions against `specs/910-improve-coding-guidelines/dependency-rollout.md`, confirm current required checks for delivered groups, and verify `docs/development.md` against the resulting base using `specs/910-improve-coding-guidelines/quickstart.md`. Record unresolved updates explicitly; commit only real scoped corrections.

## Dependencies & Execution Order

T001 precedes T002 because both edit the canonical guide; T003 requires both. T004 can collect evidence independently of the guidelines edits. T005 follows T004, T006 follows T005 triage and refreshes the remaining candidates after overlapping merges, and T007 requires both tracks to have recorded outcomes. Independent manifest/config evidence reads may run in parallel; overlapping merges must be serialized. There are no `[P]` implementation tasks.

## Implementation Strategy

Deliver the command matrix as the guidelines MVP, then add review expectations. Dependency maintenance remains separately reviewable and has explicit approval and CI gates. Preserve guideline enforcement and public behavior. The guidelines themselves have no package release impact; dependency changes follow the owning bridge release policy when applicable.
