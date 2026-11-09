# Development

## Toolchain and checks

The manifest, owning lockfile and existing CI define the toolchain. Use Node.js 26.13.0; use the pnpm version pinned in `package.json`. Preserve the established formatter/linter configuration; do not edit generated or vendored code. Run these commands from the repository root:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm test`
- `pnpm build`
- `pnpm check`

Document changed public behavior and declaration contracts at their owning boundary, including inputs, outputs, errors and side effects where they are not obvious. Existing lint/type checks do not prove documentation coverage. Keep imports, comments and intentional formatting conventions intact; scope fixes to the task.

## Spec Kit (Codex)

This repository includes Spec Kit 1.3.2 templates, Bash helpers and `.agents/skills/speckit-*` Codex skills. Install the matching CLI with `uv tool install specify-cli==1.3.2`; do not silently upgrade it. Run `specify check`, then invoke `$speckit-specify`, `$speckit-plan`, `$speckit-tasks` and `$speckit-analyze` in Codex as needed. Read `.specify/memory/constitution.md` first. Native events are disabled and no automatic Git/release extensions are installed.

For this work select the feature explicitly:

```bash
export SPECIFY_FEATURE_DIRECTORY=specs/900-organization-readiness
bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
```

Feature context is local checkout state, not a branch-name convention. Preserve existing specifications. Templates and skills are upstream-managed; put project policy in the constitution and this guide.

## Contributions and security

Follow the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) and any local security policy. Never commit `.env`, runtime configuration, tokens or sessions. Use documented example placeholders. Preserve MQTT topics, payloads, command retention and existing deployment identifiers. A dependency upgrade, release, merge or deployment is a separate action from a Spec Kit step.

## Vue and Nuxt standards

Use the generated Nuxt ESLint integration and project-owned configuration; never edit `.nuxt` output. Vue blocks are template, script setup in TypeScript, then optional style. Attribute groups follow structural directives, identity, model, other directives, globals, static values, bindings, events and content. Preserve significant whitespace and binding precedence. Document public helpers and non-obvious lifecycle behavior. Prettier owns formatting; lint/type checks and browser acceptance cover different risks.

Use `pnpm format` for explicit formatting fixes; `pnpm format:check` never rewrites files. Fonts are disabled in Nuxt UI; Lucide icons are bundled, not fetched at runtime. Legal pages must reflect the deployed host and actual client storage. Footer version metadata is generated at build time from the package version and deployment commit.
