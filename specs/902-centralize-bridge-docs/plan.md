# Implementation Plan: Centralize Bridge Documentation

**Branch**: `15-centralize-bridge-documentation-and-github-pages` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/902-centralize-bridge-docs/spec.md`.

## Summary

Use the existing Nuxt site as the only publisher. Build each guide with VitePress from pinned bridge repository sources, with a common sidebar and reader-first content structure. Keep existing public entry paths wherever practical. Separate the verified central build from the live Pages cutover and provide a rollback procedure.

## Technical Context

- **Toolchain**: Website's pinned Node 26.13.0 and pnpm; retain the existing source-project toolchains where required. Modbus currently owns an npm lockfile and uses Node 20 for its existing Pages build.
- **Dependencies**: Existing Nuxt and VitePress; add no hosted service. Resolve dependency and lockfile ownership before adding any shared build dependency.
- **Storage**: Markdown and assets in active bridge repositories, Git submodule revision pointers in the website, static output in the Pages artifact.
- **Testing**: Existing website checks, source-layout and link checks, generated artifact checks and browser acceptance. Live checks only during a separately approved cutover.
- **Scope**: Ten active repositories, one archived guide, website and organization profile; eight current bridge Pages workflows to inventory.

## Constitution Check

- Preserve runtime behavior, identifiers, settings, topics and payloads.
- Keep sources in the owning repositories; preserve existing toolchain and asset licenses.
- Use placeholders and avoid secrets in examples and build credentials.
- Maintain accessible navigation, en-US content and stable public links.
- Separate implementation, merge and production cutover approval. No policy exception required.

## Project Structure

- Website `.github/workflows/pages.yml`, `scripts/`, `test/`: reproducible assembly and checks, one publication workflow.
- Website `bridges.json` and profile synchronization: central destinations, including Ping and the IDM Energy archive.
- Website source checkouts: one pinned submodule per active bridge, outside `public/`; only designated documentation output enters the artifact.
- Bridge `docs/` and `README.md`: reader guides and short entry points; keep contributor notes distinct.
- Website-owned archive content: an overview linking to IDM Energy's unchanged repository.

## Implementation and Rollout

1. Inventory public paths, anchors, link targets and Pages state; preserve the existing output and deployment path for rollback. Inspect repository instructions, current branches and local work before each migration.
2. Prove a combined build using Display and Modbus. Validate generated output at the eventual URL paths in an isolated preview; never try to serve competing live versions at the same path. Make artifact assembly fail on missing sources, link errors, output collisions or unexpected files.
3. Normalize guides in the active source repositories and add missing content grounded in maintained examples and actual supported features. Reconcile Ping's local work only with explicit permission if it must be taken into a task branch. Pin published source revisions once reviewable and reachable.
4. Add all active guides and the archive to the artifact and verify the complete output. Prepare README, Website metadata and organization profile changes; newly introduced links should not go live before their central destinations.
5. During the approved cutover, deploy the central artifact, probe the live routes, then disable individual publication in a controlled sequence. If separate Pages deployments mask the central copy at existing paths, validate the artifact independently first, retire one bridge at a time, and probe immediately. Keep docs build checks in source repositories where useful.
6. Update GitHub Website metadata and any remaining landing links, verify all entry points, and document the process for bumping a source revision.

## Rollback

Before changing live state, capture current Pages settings, workflows, successful revisions and repository Website metadata. Stop on any failed live probe. Restore the affected bridge's prior publishing setup and links if needed; restore the prior website artifact if central output is at fault. Do not remove the existing deployment path or rollback inputs before end-to-end acceptance.

## Design Artifacts

- [Research](research.md)
- [Data Model](data-model.md)
- [Guide and URL Contract](contracts/guides.md)
- [Validation Quickstart](quickstart.md)
