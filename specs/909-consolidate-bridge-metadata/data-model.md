# Ownership inventory

- **Ignore rules:** Ten `bridges/<slug>/.gitignore` files → root `.gitignore`. Scope includes hidden names, nested paths, anchored paths, directory-only patterns, tracked examples, and negative controls outside the bridge.
- **MIT duplicates:** `bridges/{display,homeconnect,landroid,philips-hue,pocketbase,roborock}/LICENSE` → `LICENSE`.
- **AdGuard Home:** `bridges/adguardhome/yarn.lock` and manifest `resolutions` → bridge-local pnpm lock and workspace overrides (`nodemon>minimatch`, `ws`, `follow-redirects`).
- **Docs:** `docs/package-lock.json` and manifest `overrides` → docs-local pnpm lock and workspace overrides (`vite`, `esbuild`, `katex`, `rollup`).
- No migration of user configuration, MQTT payloads, or persisted data.
