# Open MQTT Bridges website

Nuxt 4 and Nuxt UI source for [open-mqtt-bridges.github.io](https://open-mqtt-bridges.github.io/). GitHub Pages serves statically prerendered HTML; no application server is deployed.

## Local development

Use Node.js 26.13.0 and the pnpm version pinned in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Preview on `http://localhost:4173`. Production validation:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm check
pnpm preview
```

Nuxt UI provides the header, footer, hero, cards, input, buttons and color-mode control. The design follows Crateview and Repovio with the organization’s own turquoise palette. All bridge links are prerendered and work without JavaScript; search runs locally after hydration. Fonts and icons are local; no analytics or remote icon API is enabled.

## Catalog and organization profile

`bridges.json` is the authoritative ten-bridge catalog. Optional `logo` paths refer to bundled SVG artwork; cards without artwork retain their initials. See [bridge artwork and licensing](public/assets/bridges/README.md). Keep entries alphabetic by repository slug and mark archived projects. README-only documentation is labeled explicitly. Synchronize both organization README tables and check them before review:

```bash
node scripts/sync-profile.mjs ../.github
pnpm build
pnpm check --profile-root ../.github
```

Synchronization edits only the delimited bridge-table regions in the sibling organization repository. Ordinary builds never edit another repository.

## Deployment and version

The Pages workflow installs from the frozen lockfile, validates PRs and publishes `.output/public` only from `main`. The footer on every generated page displays `v<package version>+<first seven characters of GITHUB_SHA>`, linking to the exact build commit. Local builds use their Git revision or `+local` for source archives. `NUXT_PUBLIC_SITE_VERSION` can explicitly override the visible version for a tagged/release deployment. No live GitHub API call is needed to display the version.

The initial package version is 0.1.0. This change does not publish a release or merge a PR. Public deployment verification remains pending merge approval.

## Legal and project guidance

`/imprint` and `/privacy-policy` are prerendered and linked from every footer. The owner confirmed publisher/contact data from the existing Crateview imprint. The privacy text describes this GitHub Pages deployment and local UI behavior; it does not copy the reference sites’ different hosting setup. See [legal sources](docs/legal-sources.md).

See [development and Spec Kit](docs/development.md), [organization contribution guidance](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md), and [brand assets](assets/README.md). Source and original branding are MIT licensed.
