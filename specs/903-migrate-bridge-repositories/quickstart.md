# Phase 1: Validation guide

Run these checks independently of feature 902. Prerequisites: reconciled and frozen manifests, verified backups, an isolated import environment, a fresh full network clone of the rehearsal or production target, and each project's toolchain. Keep production publishing disabled during rehearsal. The checks below are acceptance criteria, not recorded results.

## 1. Verify original objects

In the fresh clone, `origin` points only to the target. `$expected` contains one expected commit OID per line and was derived independently from the source. `$report` is an existing directory outside the checkout. Read `$source_tip`, `$source_tree`, `$base`, `$import`, `$prefix`, and `$default` from the manifest. Supply `$prefix` without a trailing slash.

```bash
set -euo pipefail
export LC_ALL=C GIT_NO_REPLACE_OBJECTS=1
git fetch origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*'
git fsck --full --strict
test -s "$expected"
sort -u "$expected" > "$report/expected.sorted"
git rev-list --all | sort -u > "$report/reachable.sorted"
comm -23 "$report/expected.sorted" "$report/reachable.sorted" > "$report/missing"
test ! -s "$report/missing"
test "$(git show -s --format=%P "$import")" = "$base $source_tip"
test "$(git rev-parse "$import:$prefix")" = "$source_tree"
git diff --quiet "$base" "$import" -- . ":(exclude)$prefix"
git merge-base --is-ancestor "$import" "refs/remotes/origin/$default"
```

For each ref mapping, compare the original OID to `git rev-parse --verify "$clone_ref"`. Use `refs/remotes/origin/...` for remote branches and `refs/tags/...` for tags; do **not** peel annotated tags with `^{}`. The source tree OID must identify a tree, not a gitlink. Missing inventories, refs, backups, inputs, or LFS content fail the check. As a negative test, omit a tip reachable only from a side branch in the disposable target and verify the inventory check fails. Matching counts alone are insufficient.

## 2. Build both pilots

- **WLED:** In the bridge directory, use its pinned Node and pnpm versions. Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm docs:build`, and `pnpm test:availability`. Run the source CI's container build and `/health` smoke test; the reported version must match the package.
- **Modbus:** In the bridge directory, run `cargo fmt --all --check`, `cargo clippy --locked --all-targets --all-features -- -D warnings`, `cargo test --locked --all-targets --all-features`, and `cargo build --locked --release`. In `docs/`, use its Node version and run `npm ci` and `npm run build`. Builds must leave sources and lockfiles unchanged.
- Capture each remaining bridge's existing CI before importing it. Reproduce its behavior and platform checks in the target. For example, Ping includes a Mosquitto broker test and container checks on amd64 and arm64.
- **Website:** At the root, run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm test`, `pnpm build`, and `pnpm check`. Verify the current Pages artifact and probe separately hosted guide URLs and anchors against the live baseline.

## 3. Verify isolation, cutover, and rollback

At each package handoff, check the registry's package settings independently of the workflow configuration. Record the linked monorepo, unchanged namespace and visibility, and effective grants. With the old publisher paused, publish an isolated tag **to the existing package** from the monorepo workflow, pull it, and inspect its source label. Pull a pre-cutover digest with the same access level as before. Verify the old repository no longer has write access before declaring the handoff complete. A successful push to a newly created test package does not prove ownership of the existing one.

1. Rehearse a WLED-only change, a shared workflow change, and a documentation-only change. Check selected CI jobs and confirm no unintended release jobs run. A broken existing documentation link blocks cutover.
2. Exercise release selection with an archive tag, a version mismatch, and a valid release candidate. Only the valid candidate may select a bridge, and it must select exactly one. Pull the isolated test image and confirm the previous production digest is unchanged.
3. Restore backups in an empty environment. For one pilot, rehearse returning write ownership to the old repository and restoring documentation and image publishing. Record observed results, OIDs, owners, and external dependencies.
4. After separate merge, release, and Pages approvals, repeat fresh-clone checks, image pulls, historical release links, and public route checks on the real target. Stop cutover on any missing OID, tree mismatch, missing platform build, or overlapping publishers.
