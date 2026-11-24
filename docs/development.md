# Development

## Toolchain and checks

The manifest, owning lockfile and CI define the toolchain. Pages and Node bridge CI use Node.js 26.13.1. Use the pnpm version pinned by the owning package; bridge pins can differ from the root. Preserve the established tooling and do not edit generated or vendored code.

| Area                                                               | Run from               | Checks and scope                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Website, shared libraries and repository tooling                   | Repository root        | Install with `pnpm install --frozen-lockfile`. Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck` (Nuxt website only), and `pnpm test` (root Node tests, including shared libraries and repository tooling).                                                                                             |
| Guide site                                                         | `docs/`                | Install with `pnpm install --frozen-lockfile`; run `pnpm build` for the guide site. From the repository root, `pnpm build` assembles both sites in `.output/public/`, and `pnpm check` verifies the built output. Install both the root and guide dependencies first.                                        |
| Home Connect, Landroid, Philips Hue, PocketBase, Roborock and WLED | `bridges/<slug>/`      | Run `pnpm install --frozen-lockfile`, `pnpm lint` (includes Prettier), `pnpm typecheck`, `pnpm test`, and `pnpm build`. Bridge CI runs `pnpm test:coverage` instead of `pnpm test` for PocketBase and adds `pnpm test:availability` for WLED. It also checks container health.                               |
| AdGuard Home                                                       | `bridges/adguardhome/` | Run `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm test`; see the [development guide](bridges/adguardhome/development.md) for prerequisites and bundling. There is no dedicated lint or format script. Bridge CI builds its Docker image rather than invoking the package test target separately. |
| Display, Modbus and Ping                                           | `bridges/<slug>/`      | Use `cargo fmt --check`, Clippy with warnings denied, and locked tests. Use the exact crate-specific flags and additional build or broker checks from [Bridge CI](../.github/workflows/bridge-ci.yml).                                                                                                       |

`apps/website/` owns the Nuxt catalog, legal pages, public assets and site version. The root pnpm workspace covers that app and the private packages in [`libs/`](../libs/README.md). Individual bridges use their own lockfiles. Guide sources and the VitePress build live in `docs/`. The root build assembles both sites in `.output/public/`, the directory uploaded by the Pages workflow.

Lint and format checks do not rewrite source files; builds and some tests produce artifacts. From the root, `pnpm format` is an explicit write command. Root Prettier skips `bridges/` via [`.prettierignore`](../.prettierignore). Root ESLint 10 can still discover the six nearer bridge configurations and check their files; AdGuard Home has no local ESLint configuration and remains excluded by the [root config](../eslint.config.mjs). Run the owning bridge checks rather than relying on root lint as a substitute. [Pages CI](../.github/workflows/pages.yml) and the affected-bridge jobs validate different scopes.

`scripts/` contains the bridge CI and release selectors, release notes, catalog and profile synchronization, deployment version, guide assembly, output checks and local preview. `test/` covers bridge layout, catalog/search, CI selection, release selection, release notes and deployment version. The output checks run against a built site rather than as unit tests.

After `pnpm build`, run `pnpm --dir apps/website exec playwright install chromium` once for the pinned browser, then `pnpm --dir apps/website test:browser`. The browser suite serves the assembled output on loopback, checks the mobile search and keyboard focus, and opens the catalog with JavaScript disabled. Pages CI runs it before artifact upload.

## Coding conventions

### JavaScript and TypeScript

Use the [root Prettier configuration](../.prettierrc.json) or the owning bridge's configuration: two spaces, single quotes for strings, semicolons, trailing commas where supported, and a 120-column print width. Keep adjacent imports together and preserve side-effect imports. The six ESLint-managed Node bridges organize imports with their local Prettier integration and preserve existing line endings. Inspect import changes before committing.

Prefer domain types or `unknown` with narrowing at untrusted boundaries. Website lint and PocketBase reject explicit `any`; the other five ESLint-managed bridge presets allow it. Treat that allowance as a package exception, not a recommendation. Use existing names and framework file conventions, including Nuxt's file-based page names, rather than renaming files solely for style.

### Documentation and ownership

Document changed public behavior and declaration contracts at their owning boundary, including non-obvious inputs, outputs, errors, and side effects. Use JSDoc-style comments in JavaScript and TypeScript and Rustdoc in Rust where appropriate. Review coverage and accuracy manually: lint and type checks do not prove coverage, and there is no blanket requirement to document every private helper or callback.

Follow `rustfmt` and crate-local Clippy flags for Rust; do not apply JavaScript conventions to Rust crates. Preserve generated, vendored and archived code, and keep style fixes scoped to the task.

## Spec Kit (Codex)

This repository includes Spec Kit 1.3.2 templates, Bash helpers and `.agents/skills/speckit-*` Codex skills. Install the matching CLI with `uv tool install specify-cli==1.3.2`; do not silently upgrade it. Run `specify check`, then invoke `$speckit-specify`, `$speckit-plan`, `$speckit-tasks` and `$speckit-analyze` in Codex as needed. Read `.specify/memory/constitution.md` first. Native events are disabled and no automatic Git/release extensions are installed.

Select the feature you are working on explicitly, for example:

```bash
export SPECIFY_FEATURE_DIRECTORY=specs/900-organization-readiness
bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
```

Feature context is local checkout state, not a branch-name convention. Preserve existing specifications. Templates and skills are upstream-managed; put project policy in the constitution and this guide.

Keep contributor tooling at the monorepo root. The [bridge specification archive](../.specify/bridges/README.md) preserves each bridge's original feature records and Spec Kit configuration. New guide material belongs in [`docs/bridges/<slug>/`](README.md), with package READMEs linking to the guide. Run bridge runtime commands from `bridges/<slug>/` using its owning lockfile.

## Contributions and security

Follow the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) and any local security policy. Never commit `.env`, runtime configuration, tokens or sessions. Use documented example placeholders. Preserve MQTT topics, payloads, command retention and existing deployment identifiers. A dependency upgrade, release, merge or deployment is a separate action from a Spec Kit step.

## Vue and Nuxt standards

Use the generated Nuxt ESLint integration and project-owned configuration; never edit `.nuxt` output. Write Vue blocks as template, TypeScript script setup, then optional style. ESLint enforces block order and attribute grouping: structural directives, identity, model, other directives, globals, static values, bindings, events, then content. Order within a group is not alphabetical. Use typed props and events when declaring new component contracts.

Prettier owns template layout; the project does not require separate content lines or a dedicated delimiter line for every multiline tag. Preserve significant whitespace and binding precedence. Document public helpers and non-obvious lifecycle behavior. Lint, type checks, and browser acceptance cover different risks.

Fonts are disabled in Nuxt UI; Lucide icons are bundled, not fetched at runtime. Legal pages must reflect the deployed host and actual client storage. Footer version metadata is generated at build time from the package version and deployment commit.
