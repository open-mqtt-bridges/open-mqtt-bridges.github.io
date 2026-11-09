# Organization readiness: open-mqtt-bridges.github.io

Status: approved for implementation on 2026-11-09. Task: https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/issues/1.

## User outcomes

1. Contributors can invoke the installed Codex Spec Kit skills and discover this repository's exact verification commands.
2. Users can find the correct organization repository and documentation with compatible examples.
3. Public source carries its intended license and clear contribution/security guidance.
4. Documentation builds and public assets use the post-transfer repository URL where a docs site exists.

## Requirements

- Install Spec Kit 1.3.2, Bash helpers and Codex skills; disable native event handlers and automatic Git/release extensions.
- Preserve existing constitutions/specifications, runtime contracts, container addresses and third-party licensing.
- Add MIT only for previously unlicensed own content; preserve existing MIT/GPL terms.
- Correct current organization links, metadata and Pages paths; keep historical changelogs intact.
- Use shared organization community defaults with accurate repository-specific instructions.
- Exclude archived idm-energy from all changes.

## Acceptance

Spec Kit helpers resolve this explicit feature directory and usable spec/plan/tasks. Applicable checks pass or documented external/pre-existing failures remain visible. No credentials are published. Existing docs load HTML, CSS, JS, icons and direct subpages after approved merge. PRs remain open for the user's merge approval.

## Additional organization deliverables

The .github repository owns the shared audit matrix, contributor templates, alphabetic README/profile lists and brand assets. The open-mqtt-bridges.github.io repository owns the static landing-page source, authoritative ten-bridge catalog, progressive search and root-domain Pages workflow. Both use the same logo. Website links remain usable without JavaScript. Archived IDM Energy is labeled; AdGuard Home and IDM Energy use README documentation.

## Approved design refinement

On 2026-11-09 the user requested visual similarity to crateview.de and repovio.de: centered oversized hero, quiet network illustration, neutral light/dark surfaces, turquoise accents, rounded cards and compact navigation. Keep the static implementation and bridge content. Add system/light/dark color modes without external assets or analytics.

## Approved Nuxt UI and legal refinement

The user requested actual Nuxt UI components, deployment version in the footer, imprint and privacy pages. Use Nuxt 4.6.3 / Nuxt UI 4.12.0 with static prerendering, frozen pnpm installs and local fonts/icons. Package version plus the actual deployment SHA identifies every generated footer. Legal pages are directly loadable and linked from every page. The user confirmed Crateview publisher/contact details. Describe GitHub Pages hosting rather than the reference sites’ hosting. Validate hydration/search/theme states, direct legal routes, no-JS catalog links, local assets and version metadata.
