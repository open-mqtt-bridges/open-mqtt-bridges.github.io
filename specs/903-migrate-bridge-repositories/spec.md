# Feature specification: Migrate the bridge repositories

**Status:** Proposed · **Created:** November 23, 2026 · **Base:** `main`

## User scenarios and testing

### US1 — Retrieve original history (P1)

A maintainer can look up an old revision by its original ID from a new copy of the monorepo, even if it never reached the old default branch. WLED and Modbus are the first independently verifiable delivery.

**Acceptance:** Given a source inventory, every listed commit and original tag object can be retrieved without the old repository; the imported bridge files match the frozen source. A known missing revision blocks acceptance.

### US2 — Maintain and validate each bridge independently (P2)

A contributor can change a bridge and run its established checks without changing another bridge's version or dependencies.

**Acceptance:** A single-bridge change selects that bridge's checks. A shared change selects all affected checks. Each active bridge builds with its existing tools; the archive never builds or releases by default.

### US3 — Keep using the same released packages (P3)

An operator can pull a previously deployed version and receive future releases at the same package address. A maintainer can identify the monorepo as the source and publisher of each existing package.

**Acceptance:** The registry shows the new source, prior access and digests still work, only the selected bridge can publish a new version, and its former repository can no longer write after handoff. Returning publishing control to the old source is documented and rehearsed.

### Edge cases

Duplicate tag names, annotated tags, closed or fork-only PRs, unreachable local commits, multiple toolchains, an archived source, packages with inherited permissions, and a moving documentation branch must not silently reduce coverage.

## Requirements

- **FR-001:** Preserve the website's history and all recoverable original commits and tag objects from ten active bridges and the IDM Energy archive. Account for non-default branches, PR refs, fork tips, local work, and pinned revisions.
- **FR-002:** Require a recoverable source backup, an independent clean-copy comparison, an unchanged source tree per import, and a repeatable final delta check before accepting a source.
- **FR-003:** Keep independent builds, versions, releases, and all existing runtime interfaces; preserve current public documentation routes and historical download links.
- **FR-004:** For every existing package, hand source linkage and publishing rights to the monorepo while preserving registry namespace, visibility, versions, pull access, and digests. Require evidence and a rollback point for each package.
- **FR-005:** Keep the open documentation project independent. Do not require it to merge, change editorial content, or switch Pages providers to deliver this migration.
- **FR-006:** Separate rehearsal, merge, live package handoff, and eventual archival. Historical issues, discussions, and release assets must remain accessible.

**Key entities:** Source snapshot, original revision, archive ref, import record, bridge, existing package, publisher grant, and cutover record; see [inventory model](data-model.md).

## Success criteria

1. Zero missing inventoried commits and zero altered original tag objects or imported source trees across eleven sources; the target alone supplies them.
2. All ten active bridges retain independent verification and release decisions. No release is selected for archive content or another bridge's change.
3. Every existing package has handoff evidence and its pre-cutover release remains retrievable; no overlapping active publishers.
4. All inventoried public entry points continue working; no dependency on completing feature 902.

## Assumptions

Owners identify unpublished clones and provide access for checks at the agreed cutoff. Unrecoverable or private material stops the affected handoff for an explicit decision. Production actions require separate approval.
