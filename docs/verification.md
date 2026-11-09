# Website readiness verification

Verified locally on November 9, 2026. The implementation uses Nuxt 4.6.3 and Nuxt UI 4.12.0 and prerenders the catalog, imprint and privacy routes for GitHub Pages.

## Automated checks

- Frozen pnpm dependency installation and reviewed package build scripts.
- ESLint with Nuxt integration, Vue template/script/style block ordering and attribute grouping.
- Nuxt type checking and non-mutating Prettier verification.
- Four Node tests covering invalid catalog membership/order/URLs/archive flags, local search and deployment identity.
- Nuxt static generation and checks for all ten SSR cards, native documentation/repository links, generated routes/assets, legal footer links and the build version on every page.
- Explicit cross-repository comparison against both organization README tables; brand SVG/PNG/favicon copies are identical.
- Spec Kit 1.3.2 manifests, Bash syntax, Codex skills, explicit feature prerequisites and isolated setup smoke tests.

## Browser acceptance

The production static output passed desktop, 390 px and 320 px viewport checks without horizontal overflow. Search handles case/whitespace, two lighting matches, empty results and reset/focus return. Keyboard Tab reaches native documentation links. Nuxt UI light/dark controls and client hydration work without observed hydration errors. Direct refresh and client navigation to imprint/privacy pages retain the deployment footer version. A script-blocked HTML fixture preserves all ten bridge cards, twenty bridge links, both legal links and the prerendered version while search remains hidden.

Review screenshots are in `docs/screenshots/`; they show a local build, not a completed public deployment. Publisher/contact details were confirmed by the owner from Crateview. See `docs/legal-sources.md` for technical facts and legal references.

## Remaining boundaries

GitHub Pages is configured to use Actions. The feature PR remains open; production deployment and live URL/asset verification require approved merge. The footer is built from the package version and actual deployment `GITHUB_SHA`, with an optional explicit version override. No release is published here.

The dependency audit reports one low-severity `deepmerge` advisory in build tooling, with no patched upstream version reported. No visitor input reaches that configuration-merge utility, and no application server is deployed. This is recorded rather than claiming a fully clean audit. Website-specific transitive overrides select patched esbuild/glob/minimatch versions and passed the full build/check suite. Existing bridge dependency findings remain recorded in the organization audit; they are not silently upgraded by this change.
