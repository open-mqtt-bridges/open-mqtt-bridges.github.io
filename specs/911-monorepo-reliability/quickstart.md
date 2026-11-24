# Validation Guide: Monorepo Reliability and Delivery

Use the owning lockfiles and CI tool versions in [development](../../docs/development.md). Broker and device fixtures must be isolated and synthetic. Do not perform live settings changes or registry writes as part of these checks. See [verification.md](verification.md) for recorded evidence.

## 1. Bridge runtime gates

- In `bridges/modbus/`, run `cargo fmt --all --check`, `cargo clippy --locked --all-targets --all-features -- -D warnings`, and `cargo test --locked --all-targets --all-features`. With `mosquitto` installed, run `cargo test --locked --test mqtt_command_recovery -- --ignored`. The broker fixture must show rejection without a device write, followed by a valid command and expected synthetic write without restarting.
- In `bridges/display/`, install the existing `libudev` build prerequisite; run `cargo fmt --check`, `cargo clippy --locked --all-targets -- -D warnings`, and `cargo test --locked`. With `mosquitto` installed, run `cargo test --locked --test mqtt_reconnect -- --ignored`. The test must lose and restore the session, then observe command handling after reconnect without physical hardware.
- For each bridge's readiness check, exercise starting without a broker, healthy connection, disconnect, and recovery. Expected: existing liveness remains valid; readiness reflects the actual broker/session state. From the repository root, use `bash scripts/check-native-readiness.sh <slug> <local-image>` for Display, Modbus, or AdGuard Home. Run WLED's `pnpm test:availability` in its owning directory for HTTP and connection transitions. Include Ping's existing broker/container tests as compatibility evidence.
- In `bridges/roborock/`, run `pnpm test --runTestsByPath src/lib/roborock/map.spec.ts`. The revised suite must exercise both `0022` and `0077` in isolated processes and verify new and replaced files, then pass `pnpm test` as a whole.
- In `bridges/adguardhome/`, run `docker build -t adguard-mqtt-bridge:verify .` to exercise the TLS tests with OpenSSL. Run `bash test/container-smoke.sh adguard-mqtt-bridge:verify` for non-root startup with a read-only filesystem and mounted `.env` fixture.

## 2. CI, release, and distribution gates

- From the repository root, run `pnpm test`. Expect inventory coverage for every bridge, negative cases for missing and unknown assignments, and release policy fixture tests covering equal/newer, older, and unverifiable alias states.
- Simulate a release candidate with failed smoke and expect no publish eligibility. Rehearse a successful candidate in non-publishing `dry-run`, first with local fixtures and then via the repository workflow only if approved to dispatch it. Check the tested image ID, archive checksum, successful smoke, and Modbus asset compatibility. Verify interrupted-publication handling with fixtures. Do not use `handoff-test` as a substitute for a no-write rehearsal.
- Compare the documented install ref and authorized publisher for each bridge. Read public manifests anonymously; record unavailable access separately from known absence and capture the digest for known-good refs. Do not change package visibility, grants, or URLs during verification.
- Verify GitHub's effective `main` rule state and check names with read-only requests. Confirm a normal PR produces those contexts before any administrator applies rules. After a separately approved change, verify its effective policy and rollback details.

## 3. Website and final checks

From the root, install the root and guide dependencies with their frozen lockfiles. Run:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm check
```

Run `pnpm --dir apps/website exec playwright install chromium` once, then `pnpm --dir apps/website test:browser`. The tests use the generated `.output/public/` artifact and pinned Chromium. Expect no 320 px horizontal overflow, a valid search hit, empty results, keyboard-accessible reset with focus returned to search, and a script-free context with all cards and native links visible but search hidden. Record current CI, local proof, and any operator steps separately.
