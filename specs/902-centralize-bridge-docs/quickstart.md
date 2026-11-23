# Validation Quickstart

1. Start from a clean website checkout with the pinned Node and pnpm versions. Initialize the reviewed submodules with `git submodule update --init` and install dependencies with `pnpm install --frozen-lockfile`.
2. Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm test`, `pnpm build` and `pnpm check`. The Pages workflow must exercise the same artifact assembly and checks before upload.
3. Serve the combined artifact locally. Open all catalog links; check direct access and reloads, local assets, navigation, tracked legacy routes and anchors, and the IDM Energy notice. Exercise representative setup and troubleshooting paths on mobile and with a keyboard.
4. Remove or invalidate a source in a disposable checkout and confirm the assembly fails instead of producing a publishable partial artifact.
5. For each active bridge, compare the guide's recommended setup and sample configuration with its versioned examples and supported behavior. Record any procedure not tested on its target hardware or service.
6. At the separately approved cutover, run the route checks against the live domain, verify GitHub Website links and READMEs, confirm the organization profile uses the same destinations, and verify only the website deployment remains active.
