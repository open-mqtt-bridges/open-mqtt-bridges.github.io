# Tasks: Consolidate bridge documentation and project metadata

Follow the [plan](plan.md) and [layout contract](contracts/layout.md). Each task is a reviewable increment.

## Catalog (US1)

- [x] T001 [US1] Add Ping to `bridges.json`; reconcile active and archived membership in `scripts/catalog.mjs`, derive displayed counts in `app/pages/index.vue`, and update `README.md` and `test/catalog.test.mjs`. Verify that a missing bridge fails, Ping is searchable, and all entries render without JavaScript.

## Migration baseline

- [x] T002 Record source paths, public routes and fragments, assets, and relevant config consumers against `de11f6e` in `specs/905-consolidate-bridge-docs/inventory.md`. Reproduce counts from the Git tree: ten guide directories, 20 feature directories, 88 spec files and 180 Spec Kit files. Identify runtime references before removing build inputs.

## Central documentation (US2)

- [x] T003 [US2] Establish the shared root docs project and index under `docs/`; migrate Ping as a complete pilot into `docs/bridges/ping/`, update its `README.md`, `.github/workflows/bridge-ci.yml`, Dependabot configuration and path selectors. Build its guide with the owning frozen lockfile and verify its setup, links and assets in static output.
- [ ] T004 [US2] Move the remaining nine active guides into `docs/bridges/<slug>/`, using common topic navigation and retaining specialized pages. Migrate applicable guide text from package READMEs; update working references, CI, doc scripts, Docker inputs and docs dependency ownership. Compare all guide content with T002, run the shared static build and affected package/container checks.
- [ ] T005 [US2] Assemble all guide output with the Nuxt Pages artifact in `.github/workflows/pages.yml` and the root build script. Update catalog destinations, `scripts/check.mjs`, `README.md` and `docs/development.md`; verify existing deep links, anchors, assets, deployment-version pages and edit links. Document the public project-site precedence check and rollback before any external handoff.

## Root-owned project metadata (US3)

- [x] T006 [US3] Relocate all tracked `bridges/*/specs/` and `bridges/*/.specify/` content into `.specify/bridges/<slug>/`. Add a root archive index; verify modes, paths and all 268 blobs against T002, including duplicate feature names. Keep historical files out of active formatter and template discovery.
- [ ] T007 [US3] Remove bridge-local `.agents/`, `.github/` and `.vscode/`; retain unique applicable guidance and settings in their root-owned equivalents. Reconcile CI/Dependabot coverage without enabling old release workflows. Add an active-bridge layout regression check under `test/`; verify root Spec Kit and bridge selectors.

## Acceptance

- [ ] T008 Record the [quickstart](quickstart.md) results in `specs/905-consolidate-bridge-docs/evidence.md`: root checks, guide crawl, catalog browser and no-JavaScript checks, frozen package builds for affected owners, and blob equality. Report external hosting verification separately from local evidence.

## Dependencies and delivery

T001 is the minimum independently useful change. T002 precedes all moves. T003 → T004 → T005 delivers the guide library; after T002, T006 can be checked independently of that guide work. T007 follows the docs and spec moves so obsolete tooling has no remaining consumers. T008 verifies the integrated tree. Do not change the historical archive or external repositories during these tasks.
