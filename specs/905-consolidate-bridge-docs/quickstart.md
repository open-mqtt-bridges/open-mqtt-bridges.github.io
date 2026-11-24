# Acceptance guide

1. Use the pinned Node and pnpm versions. Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm test`, `pnpm build`, and `pnpm check`.
2. Serve `.output/public` with `pnpm preview`. Find Ping in search and in prerendered HTML. Check for ten active bridges and one archived bridge.
3. Crawl each guide route, asset and internal link in the assembled Pages artifact. Test an old deep bookmark per guide. Verify an AdGuard Home setup example, the Modbus topic contract, and Roborock enum values.
4. Compare `git ls-tree -r` entries for the old bridge `specs/` and `.specify/` trees with the committed destination trees. Require identical relative paths, modes and blob IDs. Check for any forbidden bridge-local directory.
5. Run affected bridge packaging and CI-path checks, including frozen installs from the owning directory. For a separately approved hosting handoff, probe the same public URLs before and after the switch.
