# Validate the cleanup

Run from the repository root. Use Node.js 26.13.0 and the pinned pnpm version in each affected manifest. For Display use Rust with rustfmt and Clippy, Linux with `libudev-dev`, OpenSSL development headers and `pkg-config`, and Docker. Record baseline failures before editing.

## TypeScript bridges

Before removal, `git grep -n '~/types/config/' -- bridges` should list 13 imports; after removal, the same search should return no matches. In Roborock, `git grep -n objectToMap -- bridges/roborock` should go from the single declaration to no matches. Inspect the replacement imports: each must be type-only.

```bash
set -e
for bridge in homeconnect landroid philips-hue roborock wled; do
  (cd "bridges/$bridge" && pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build)
done
(cd bridges/wled && pnpm test:availability)
```

## Display and central tooling

```bash
set -e
(cd bridges/display && cargo fmt --all --check && cargo clippy --locked --all-targets --all-features -- -D warnings && cargo test --locked --all-targets --all-features && cargo build --release --locked)
docker build -t displays-mqtt-bridge:ci bridges/display
node --test test/bridge-layout.test.mjs test/select-bridges.test.mjs test/select-release.test.mjs
```

Compare `node scripts/select-release.mjs display/v<VERSION>` using the actual version from `bridges/display/Cargo.toml` before and after removal; the JSON must match. Review `.github/dependabot.yml` for the retained Cargo entry and Docker wildcard. Follow the updated Display development instructions without a bridge-local pnpm install.

For the central guide and repository checks, install root and docs dependencies as described in [Development](../../docs/development.md), then run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm test`, `pnpm build`, and `pnpm check`. Root tooling still uses Node.
