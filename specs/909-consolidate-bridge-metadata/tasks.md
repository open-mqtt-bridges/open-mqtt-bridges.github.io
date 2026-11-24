# Tasks: Consolidate bridge metadata and standardize Node tooling

Each implementation task is a separate commit. Use the [quickstart](quickstart.md) for commands and [inventory](data-model.md) for scope. No new shared infrastructure is needed.

- [ ] T001 [US1] Capture baseline Git ignore decisions in a disposable Git fixture. Consolidate `bridges/*/.gitignore` into `.gitignore` and remove the ten original files. Verify identical scoped behavior for files, directories, nested names, examples, and negative controls; keep a focused regression test for sensitive and example paths.
- [ ] T002 [US2] Compare the six inventoried `bridges/<slug>/LICENSE` files with `LICENSE`. Remove only those copies, update bridge README links, active documentation and root ownership wording, and verify links and distributed notice inputs. Preserve the four exceptions and all third-party notices.
- [ ] T003 [US3] Convert `bridges/adguardhome/yarn.lock` using the pinned pnpm CLI, translate resolutions, update manifest scripts, Dockerfile and active guide, then remove the Yarn lock. Compare resolved versions and validate security overrides, frozen install, dev runner, transport tests, bundle and container build.
- [ ] T004 [US4] Migrate `docs/package-lock.json` to a docs-owned pnpm workspace and lockfile with equivalent overrides. Update `package.json`, `.github/workflows/pages.yml`, docs scripts, command hints and current contributor instructions. Validate the resolved graph, frozen install, single-guide and full site builds, lint, typecheck, format, tests and output checks; verify no tracked Yarn/npm locks remain. Record results and apply bridge-owned release metadata where applicable.

**Order:** T001 → T002 → T003 → T004. The first two verification fixtures and package-manager baseline inspections are independent; commit shared documentation changes with their owning task. T004 proves repository-wide acceptance after both migrations.
