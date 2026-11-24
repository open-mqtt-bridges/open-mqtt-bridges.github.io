# Implementation plan: Consolidate bridge documentation and project metadata

**Date:** 2026-11-24 · **Base:** `main` at `de11f6e` · [Specification](spec.md)

## Summary

Fix Ping discovery first. Consolidate the ten active bridges' documentation under `docs/bridges/<slug>/`, with one guide index and shared static build. Preserve historical feature materials under `.specify/bridges/<slug>/`. Nuxt remains the catalog and owns the Pages artifact.

## Technical context and delivery order

1. Add Ping to the catalog, calculate counts, and validate membership against active and archived directories. Test a missing bridge and the prerendered output. Preserve README-only destinations until their replacements are ready.
2. Inventory tracked guide pages, assets, old routes, package scripts, docs-only dependencies, CI jobs, Dependabot entries and container build inputs. Record local spec and configuration paths and Git blob IDs against the base revision.
3. Assemble a shared VitePress guide build under `docs/`, using root-owned docs dependencies. Isolate published content from internal docs. Organize each guide by overview, setup, configuration, MQTT behavior and operations where applicable. Retain specialized material such as monitor hardware and Roborock enum values. Extract AdGuard Home's README guide and keep bridge README pointers. Preserve old routes, assets and fragment targets.
4. Stage the static guides, then merge them under their slug paths into the Nuxt Pages artifact with a collision check. Verify public route ownership before any external handoff: an existing GitHub project site can still own `/<slug>/`. Document the operator check, sequence and fallback. Replace legacy docs build calls and target the monorepo in edit links.
5. Move the historical trees following the [layout contract](contracts/layout.md). Compare old and new blobs. Inspect `.github`, `.agents`, and `.vscode` for unique behavior; port necessary settings to root with bridge scope, drop redundant scaffolding and keep obsolete publishers inactive. Update contributor guidance and add a regression check for the layout.

## Constitution check

Before and after design: compatible MQTT and release contracts; no change to credentials or package visibility. Preserve licenses, offline static links, keyboard navigation, independent runtime lockfiles and root Spec Kit behavior. Verify with root quality gates, a static guide crawl and affected bridge builds.

## Verification and rollback

See [acceptance checks](quickstart.md) and [research](research.md). Revert the scoped migration commits to restore the original layout; leave existing guide hosts serving until a separately coordinated handoff is verified. Do not move release tags or modify migration snapshots.
