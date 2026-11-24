# Acceptance evidence

- Root frozen pnpm install, lint, type checking, format check, all 12 Node tests, static generation and output validation passed. The local shell used Node 26.13.1 and pnpm 11.28.9; hosted CI uses the pinned Node 26.13.0.
- The shared docs project installed with `npm ci`. All 99 original Markdown pages and SVG assets under the bridge guide directories have corresponding central files. The assembled artifact has 89 guide pages; its same-site links, fragments and assets passed the crawl.
- Chromium verified the ICMP search returns only Ping, `/ping/configuration` works on direct navigation, its edit link targets the central source, and all eleven catalog cards render with JavaScript disabled.
- All seven affected bridge pnpm projects passed frozen installation. Docker built the six changed Node bridge contexts: Home Connect, Landroid, Philips Hue, PocketBase, Roborock and WLED.
- The 18 moved `specs/` and `.specify/` trees have the same Git tree IDs as at `de11f6e`: 268 files with identical content, names and modes. The standalone initial designs for Ping and PocketBase are also retained. Shared Spec Kit prerequisites resolved in the new layout.
- Each active bridge passed the forbidden-directory check. All 81 removed bridge-local skill files had root equivalents with identical bytes. Common editor and funding settings and bridge-specific update coverage now live at the root.
- These changes produce a documentation artifact, not a new runtime release. The website has no Changesets workflow; the six independent runtime version streams have no behavior change. No version or release metadata was generated.
- Production host ownership requires the [per-guide handoff](../../docs/migration/guide-hosting.md) after deployment. No external Pages or registry settings were changed during implementation.
