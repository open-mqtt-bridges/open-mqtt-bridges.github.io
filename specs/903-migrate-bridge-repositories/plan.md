# Migration plan: Open MQTT Bridges monorepo

Date: November 23, 2026 · Target: `open-mqtt-bridges/open-mqtt-bridges.github.io` · Status: design only.

**Feature 902 is independent and remains open.** Start from the published website and `main`; capture current routes, source revisions, and publishers at kickoff. Preserve work on the documentation branch without requiring its merge.

## Outcome and acceptance

A contributor can change a bridge, its tests, and its guide in one pull request. Each active bridge remains independently buildable, versioned, and releasable. Existing users can keep pulling the same images and following the same documentation links.

**Preserving every commit means preserving its original Git object ID.** Authors, timestamps, parent relationships, merge topology, messages, and existing Git signatures remain intact. The inventory includes commits outside default branches, including tag-only, pull-request-only, and unpublished local commits. A fresh full clone of the target alone must contain the recorded source commit set. A backup or an archived repository is not a substitute. No method can reconstruct an object that no longer exists anywhere; a known missing object blocks acceptance.

## Scope and technical context

- Ten active bridges: `adguardhome`, `display`, `homeconnect`, `landroid`, `modbus`, `philips-hue`, `ping`, `pocketbase`, `roborock`, and `wled`. Import each into `bridges/<slug>/`. Import `idm-energy` into `archive/idm-energy/` without introducing an active build, release, or support commitment.
- The website stays at the repository root with its history intact. The `.github` organization profile repository stays separate because GitHub uses it for organization-wide features. Imported bridges become ordinary directories, not submodules. Historical commits retain their original root-relative paths.
- At planning time, Modbus uses `master`; the other bridge repositories use `main`. AdGuard Home uses Yarn Classic, PocketBase uses pnpm 12, and several other bridges use pnpm 11. Display uses Cargo and pnpm; Modbus uses Cargo and npm for documentation; Ping pins a Rust toolchain. Recheck at kickoff. Preserve each project's toolchain, lockfiles, and build context; a shared workspace is not a prerequisite.
- Preserve any bridge revisions pinned by feature 902 as historical inputs, including pins absent from `main`. Do not activate its proposed documentation architecture or change the independent branch.

## Implementation sequence

**Package ownership is part of each bridge's cutover.** For every existing GHCR package, make the monorepo its linked source repository and the repository authorized to publish updates. The registry owner remains the `open-mqtt-bridges` organization; changing the repository association must not rename or recreate the package. Record the old association and permissions, verify the new association in the registry and a test publish from the monorepo, then remove the former bridge repository's write access. Keep the old publisher disabled throughout the handoff. For any other registry in the inventory, record and verify its equivalent source and publishing controls. A package with an unverified handoff blocks that bridge's cutover.

| Stage | Work | Exit criteria |
|---|---|---|
| 1. Establish the baseline | Record the current website revision, live guide URLs, anchors, and publishers. Identify owners of open PRs and unpublished work. | The baseline can be reproduced independently of the open docs project. |
| 2. Inventory and back up | For each source, capture refs, default branch, tag objects, PR refs, local clones and worktrees, and any LFS objects or submodule revisions. Inventory releases, assets, GHCR names and access, public routes, issues, PRs, and checks. Follow the [history contract](contracts/history.md) and rehearse restoration. | Each source has a recoverable snapshot. Resolve missing or private objects, historical credentials, hosting size limits, and incompatible repository rules before publishing anything. |
| 3. Rehearse the import offline | Import WLED (Node/pnpm, container health check) and Modbus (Rust, `master`, npm documentation) into a clean, isolated clone. Use one history-joining import commit per bridge, then make integration changes separately. Anchor other historical refs as well. | Both commit inventories match; each imported tree is identical to its source tree at the import commit; nothing outside the prefix changed; no publication occurred. |
| 4. Integrate the pilots | Run bridge jobs from root CI with explicit working directories, toolchains, cache keys, and Docker contexts. Build existing bridge guides with their original tools. Dry-run GHCR and release selection. | Both pilots pass the [validation guide](quickstart.md); invalid tags and another bridge's changes cannot release a pilot. |
| 5. Import the remaining sources | Apply the proven pnpm pattern to `homeconnect`, `landroid`, `philips-hue`, and `roborock`. Handle `pocketbase`, `adguardhome`, `display`, and `ping` with their specific toolchains and tests. Import `idm-energy` separately as an archive. Review each source independently. | Each source passes its history check. Record baseline failures and unavailable hardware or external tests explicitly; do not report skipped checks as passes. |
| 6. Rehearse on GitHub | Use a disposable target with publishing disabled. Test the archive refs, final merge strategy, branch protection, and full network clone. Build the entire Pages artifact. Verify shared changes select all dependent jobs, and test package permissions and rollback per bridge. | The target clone alone supplies every expected commit. Repository rules permit a history-preserving merge. Each release and documentation route has one designated publisher. |
| 7. Cut over one bridge at a time | Agree on a short write freeze. Capture changes since the snapshot, including new tags, PR heads, and local commits. Refresh the manifest and rerun affected checks if anything changed. After merge approval, transfer the verified graph and refs, then repeat verification from the real target. Pause the old publisher before enabling its replacement. Switch Pages separately. | The bridge can release under its existing identifiers. Production publication requires separate approval. No two workflows write the same image tag or serve the same route. |
| 8. Observe and archive | Check image pulls, old release assets, guides, and public links. Transfer open issues where appropriate and record URL mappings. Continue open PRs in the target with backlinks; old reviews and discussions remain in the source. Add relocation notices. | Archive former active repositories only after a successful normal release or operating cycle and explicit approval. Retain historical repositories, releases, images, and tags. |

## Rollback

For a package handoff, disable the monorepo publisher first. Restore the recorded repository association and access settings, verify the old publisher's access, and only then reenable it. Check that existing package URLs, versions, and digests still resolve.

- **Before cutover:** Discard or correct the integration branch. The original source remains authoritative. Keep manifests and backups independently of the target.
- **After merge, before publication:** Keep target publishers disabled and use the old source. If necessary, make a normal corrective or revert commit. Do not reset or force-push `main`; retain the archive refs and original history.
- **After cutover:** Stop only the affected publisher. Capture changes and issues created since cutover. Port and test any new bridge changes in the old layout before reopening it for writes. Restore the previous publishing configuration and known-good Pages artifact. Pin a known-good image digest if needed; do not repoint an immutable version tag. Verify public URLs and confirm that only one publisher is active.

## Constitution check and delivery boundary

The [compatibility contract](contracts/compatibility.md) covers public behavior and identifiers. Project-owned lockfiles, toolchains, versions, and license notices preserve ownership. Transfer credentials through secret configuration, never migration manifests. Keep public documentation in en-US and verify accessibility and existing routes. Delivery requires bridge baselines, website checks, and a fresh-clone proof; implementation, merge, release, and deployment are separate decisions.

Feature context: [specification](spec.md) and [ordered tasks](tasks.md). This feature preserves existing documentation hosting; any Pages switch belongs to a separately approved documentation change. Do not archive an old repository while doing so would break a live route. No import, release, or deployment has been performed during planning.

Supporting artifacts: [design decisions](research.md), [inventory model](data-model.md), [Git history contract](contracts/history.md), [compatibility contract](contracts/compatibility.md), and [validation guide](quickstart.md).
