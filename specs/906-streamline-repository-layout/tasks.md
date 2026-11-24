# Tasks: Streamline the repository layout

## Foundation

- [x] T001 Isolate the requested `archive/idm-energy/` and catalog removal already in the checkout. Run catalog, layout and release selection tests; commit only that increment.

## Bridge automation

- [x] T002 [US2] Decouple `scripts/select-bridges.mjs` and `scripts/select-release.mjs` from `migration/`; verify current CI routing and all nine GHCR mappings, including aliases and negative cases, using their owning tests.
- [ ] T003 [US2] Remove `migration/`, `scripts/migration/`, import-only tests and obsolete `docs/migration/` material. Retain current release and hosting instructions under `docs/`; update live references. Validate the surviving tests and the documented script inventory.

## Site ownership

- [ ] T004 [US1] Move the website to `apps/website/` and keep `bridges/` and `docs/bridges/` stable. Adapt root commands, build and lint paths, tests, CI and contributor guidance. Verify frozen install, lint, typecheck, format, tests, static generation and the output crawl from a clean build.

## Acceptance

- [ ] T005 [US3] Verify repository homepage and current Pages origin, protected publishing behavior, ten advertised bridges, static routes and all guide links. Record results in `specs/906-streamline-repository-layout/evidence.md`.

Deliver T001 → T002 → T003 → T004 → T005. T002's comparison fixtures and the website baseline may be inspected independently; no release, repository rename or external guide-host change is needed.
