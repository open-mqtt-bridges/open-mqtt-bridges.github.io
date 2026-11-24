# Implementation Plan: Remove redundant bridge files

**Base checkout:** `main` · **Date:** 2026-11-24 · **Input:** [Specification](spec.md)

## Summary

Remove nine files in two independently verifiable changes:

1. In the five TypeScript bridges listed in the [inventory](data-model.md), replace 13 imports from forwarding files with explicit `import type` from `~/config/config`. Remove the five forwarding files and Roborock's unreferenced `src/util/object.ts`. Do not move schemas or change configuration initialization.
2. Remove Display's unused `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`. In `docs/bridges/display/development.md`, remove the pnpm version and install command. In `.github/dependabot.yml`, remove Display from the npm directory list only. Keep its Cargo and Docker coverage.

## Technical context

Five independent NestJS applications use TypeScript, Jest, ncc, Node.js 26.13.0, and bridge-owned pnpm lockfiles. Display uses Cargo, Linux native libraries, and a Dockerfile that builds from Cargo inputs. The central guide has its own toolchain. No dependency upgrade, replacement library, or new release mechanism is required.

## Constitution check

Before research: the proposed changes concern internal source paths and retired tooling only. After design: type-only imports preserve startup timing; Display keeps its owning Rust toolchain, image, and release selection. No changes to public configuration, MQTT, credentials, licenses, or vendored code. Contributor guidance stays in en-US. Verify each increment using the [quickstart](quickstart.md) before committing it.

## Project structure and verification

The [inventory](data-model.md) pins the file and consumer counts. [Research](research.md) records evidence and rejected alternatives. The [compatibility contract](contracts/compatibility.md) defines observable behavior to preserve. Check production and test imports, run the five existing bridge suites and builds, and verify Display's Cargo, Docker, guide, and release paths. Distinguish missing prerequisites from passing checks.
