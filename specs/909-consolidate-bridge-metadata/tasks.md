# Tasks: Consolidate bridge metadata and standardize Node tooling

Each implementation task is a separate commit. Use the [quickstart](quickstart.md) for commands and [inventory](data-model.md) for scope. No new shared infrastructure is needed.

- [x] T001 [US1] Capture baseline Git ignore decisions in a disposable Git fixture. Consolidate `bridges/*/.gitignore` into `.gitignore` and remove the ten original files. Verify identical scoped behavior for files, directories, nested names, examples, and negative controls; keep a focused regression test for sensitive and example paths.
- [x] T002 [US2] Compare the six inventoried `bridges/<slug>/LICENSE` files with `LICENSE`. Remove only those copies, update bridge README links, active documentation and root ownership wording, and verify links and distributed notice inputs. Preserve the four exceptions and all third-party notices.
- [x] T003 [US3] Convert `bridges/adguardhome/yarn.lock` using the pinned pnpm CLI, translate resolutions, update manifest scripts, Dockerfile and active guide, then remove the Yarn lock. Compare resolved versions and validate security overrides, frozen install, dev runner, transport tests, bundle and container build.
- [x] T004 [US4] Migrate `docs/package-lock.json` to a docs-owned pnpm workspace and lockfile with equivalent overrides. Update `package.json`, `.github/workflows/pages.yml`, docs scripts, command hints and current contributor instructions. Validate the resolved graph, frozen install, single-guide and full site builds, lint, typecheck, format, tests and output checks; verify no tracked Yarn/npm locks remain. Record results and apply bridge-owned release metadata where applicable.

**Order:** T001 → T002 → T003 → T004. The first two verification fixtures and package-manager baseline inspections are independent; commit shared documentation changes with their owning task. T004 proves repository-wide acceptance after both migrations.

## Validation evidence

- T001 `eae3e19`: all 3,000 Git ignore decisions matched, including 744 ignored paths. Regression coverage checks sensitive paths and examples.
- T002 `514b072`: all six removed notices and replacement README targets matched the root license bytes. Distinct notices and existing artifact packaging inputs remain unchanged.
- T003 `1871c2a`: old and new sets of package names and versions matched, including all three overrides. Frozen install and bundle passed. The host lacks the OpenSSL executable; all five tests passed in the Docker builder, and the runtime image built.
- T004: the docs lock retained the original package/version set and all four overrides. Fresh frozen install, a single-guide build, the full ten-guide build, root lint, typecheck, formatting, all 13 root tests, and link/asset checks on 89 guide pages passed. No tracked Yarn or npm locks remain.

The maintenance changes do not request bridge version bumps. Empty entries use the existing six independent Changesets projects; AdGuard Home and the docs have no Changesets project.
