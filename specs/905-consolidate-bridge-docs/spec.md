# Feature specification: Consolidate bridge documentation and project metadata

**Created:** 2026-11-24 · **Status:** Draft for review

## User scenarios and testing

1. **P1 — Find every bridge.** A visitor searching for Ping can open its source and guide. Without JavaScript the catalog still lists ten active bridges and one archived bridge. An unlisted active bridge fails validation.
2. **P1 — Maintain one guide library.** A contributor can start at the root documentation index, find a bridge, edit a topic, and preview it as a reader sees it. Existing guide bookmarks, examples, assets and specialized topics remain usable.
3. **P1 — Recover previous decisions.** A maintainer can locate original feature documents and bridge-specific Spec Kit policies, including features with identical numbers and names in other bridges.

## Requirements

- Give each active bridge one entry and one guide landing page. Derive catalog counts from the data and reconcile membership with the repository directories.
- Use a shared root guide structure and navigation vocabulary. Keep specialized pages and original technical content. Retain a short README entry point, changelog and license with each bridge.
- Build guides from the monorepo and preserve public paths or supply tested compatibility routes. Keep contributor-only records and templates out of the public guide build.
- Move each active bridge's feature records and tracked Spec Kit material into root `.specify/` without collisions. Remove local `docs/`, `specs/`, `.agents/`, `.github/`, `.specify/`, and `.vscode/` after relocating required contents and updating consumers.
- Preserve effective checks, runtime packaging, release identifiers and lockfile ownership. Do not enable legacy publishers.

## Success criteria

- All 11 catalog entries appear in the static site; a missing Ping entry fails a regression test.
- All ten active guides are reachable from the index. The production artifact contains their pages and assets; existing guide URLs resolve to equivalent content in preview or through the documented hosting transition.
- Every tracked source spec and Spec Kit file maps to an identical Git blob at its destination. All 20 original feature directories remain distinct.
- No targeted local directory remains under an active bridge. Changed CI selectors, package build contexts and documentation references pass their owning checks.

## Assumptions

The cleanup applies to `bridges/*`. `archive/idm-energy` remains historical and listed. The untracked `bridge-sources/` directory is not an input. Changes to external repositories, live Pages settings and production packages are separate from this repository change.
