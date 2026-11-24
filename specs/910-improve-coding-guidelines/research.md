# Research: Improve Coding Guidelines

## Canonical source

**Decision**: Extend `docs/development.md` in place. **Rationale**: Both contributor entry points already route there, and the constitution assigns project policy to the development guide and constitution. **Alternative considered**: Add a separate guidelines document; rejected because the existing document already covers toolchain and Vue policy and would require relocating or duplicating rules.

## Style and documentation boundary

**Decision**: Record current policy; do not adopt stricter enforcement in this increment. **Rationale**: Root Prettier and the pnpm-bridge formatters already agree on the core JS/TS defaults. Effective Vue ESLint matches baseline block and attribute order, but layout is currently Prettier-owned and does not guarantee the baseline's multiline delimiter/content rules. The guide and organization rules emphasize changed public contracts; sampled ESLint configurations have no JSDoc coverage check. **Alternative considered**: Enable the entire style and documentation baseline now; rejected because this would change contributor obligations and requires separate agreement and deterministic formatter and coverage evidence.

## Verification scope and drift

**Decision**: Describe root and local checks independently, with explicit exclusions and gaps. **Rationale**: At the planning revision, root Prettier excludes `bridges/`; effective ESLint 10 resolves the closer package config for pnpm bridge files but applies the root exclusion to AdGuard Home. PocketBase differs from the other pnpm bridges on explicit `any`. Rust checks run per bridge in CI. At this revision, AdGuard Home uses Yarn locally and its bridge CI job only builds a container; the guide site uses npm. Pending bridge metadata work may change both package managers. **Alternative considered**: Publish a single repository-wide command list or anticipate the pending changes; rejected because either would misstate the actual checks at delivery time.

Evidence comes from the read-only comparison at `129d554`: root lint and format checks passed; resolved configurations were inspected on representative Vue, JS, TS, and bridge files. This is planning evidence, not validation of the future documentation change.
