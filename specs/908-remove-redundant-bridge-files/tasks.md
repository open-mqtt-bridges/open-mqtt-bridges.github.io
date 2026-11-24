# Tasks: Remove redundant bridge files

## Setup and foundations

No new infrastructure or shared prerequisite changes. Use the existing checkout and record the relevant [quickstart](quickstart.md) baseline before each increment.

## User story 1: Maintain bridge configuration in one place (P1, MVP)

- [x] T001 [US1] Redirect the 13 production and test imports listed by `git grep -n '~/types/config/' -- bridges` to explicit type-only imports from each bridge's `~/config/config`. Delete the five forwarding files named in [the inventory](data-model.md) and `bridges/roborock/src/util/object.ts`. Confirm the old paths and Roborock helper have no consumers, and run lint, typecheck, unit tests, and build for all five bridges plus WLED availability; commit this verified increment separately.

## User story 2: Build Display with the tools it needs (P2)

- [x] T002 [US2] Delete `bridges/display/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml}`. Update the active steps in `docs/bridges/display/development.md` and remove only the Display npm directory in `.github/dependabot.yml`. Verify the documented Cargo checks, Docker build, and identical Display release selector output before and after; retain Docker and Cargo dependency updates. Commit this increment separately.

## Final integration

- [x] T003 Verify the nine removals against `specs/908-remove-redundant-bridge-files/data-model.md`, run the central checks in [the quickstart](quickstart.md), and record results and any blockers. Review bridge-owned Changesets policy after verification; handle applicable feature metadata separately without versioning or publishing.

## Dependencies and execution

Deliver T001 first as the smallest useful source cleanup. T002 is independent and can be validated without T001; T003 requires both. Within T001 the five bridge suites can run independently; within T002 the selector check can run alongside the Cargo or Docker build. No public interface or data migration is involved.

## Verification results

- T001 (`c806c86`): All five frozen installs, lint checks, typechecks, and bundles passed. Jest: 143 passed, one optional Roborock test skipped. The Roborock map permission test passed with `umask 0022` rather than the host's `0077`. WLED broker availability passed.
- T002 (`c8ab2d1`): Display's Rust builder passed fmt, Clippy, 10 tests, and the locked release build. The final Docker image built; release selector JSON was identical before and after.
- T003: Nine bridge files removed. Root lint, typecheck, format, 12 tests, site build, and output checks passed, including links and assets across 89 guide pages. Local Node was 26.13.1.
