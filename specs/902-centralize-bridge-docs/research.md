# Documentation Migration Decisions

## Single publisher and source pinning

Use `open-mqtt-bridges.github.io` as publisher and Git submodules as reviewed revision pointers. Submodules check out complete repositories, so keep them outside the served tree and publish only known documentation build outputs. Reject unpinned default-branch downloads and copied Markdown as the main update mechanism.

## Reuse VitePress and existing routes

Eight repositories already build VitePress and use `/<bridge>/` as their base. Validate the combined artifact at those bases before cutover instead of rewriting hard-coded asset URLs for a temporary path. Prefer stable page paths or explicit compatibility pages. Display uses its root pnpm workspace; Modbus builds inside `docs/` with its own npm lockfile. Use those two to prove the integration without requiring a bridge-wide toolchain upgrade.

## Source and archive exceptions

AdGuard Home has developer notes but no published user guide. Ping has no `docs/` at the upstream default branch; the local checkout has existing uncommitted docs and is behind upstream. Treat those files as user work, not as clean migration inputs. IDM Energy remains archived and gets a website-owned archive page.

## GitHub entry points

The repository's source URL is stable; the README and About Website field point to the guide. Existing Pages paths share the same hostname already, so host continuity alone does not prove the central artifact is serving them. Inventory current owners and verify the deployment handoff explicitly.
