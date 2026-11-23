# Maintenance evidence

Issue: https://github.com/open-mqtt-bridges/modbus/issues/3
Base: `27894a7cdaf93b7a0b156b48416f7984d9a06a35` on `master`. Runtime used for local Node checks: Node 26.13.0; Cargo checks: Rust/Cargo 1.99.

## Baseline and selected targets

Original declared versions, aliases, engines and overrides are preserved in `baseline.json`. Registry metadata and release notes supplied target versions and peer/engine constraints.

| Dependency                   | Before | After     |
| ---------------------------- | ------ | --------- |
| `anyhow` (Cargo)             | `1`    | `1.0.104` |
| `clap` (Cargo)               | `4`    | `4.6.7`   |
| `futures` (Cargo)            | `0.3`  | `0.3.34`  |
| `rumqttc` (Cargo)            | `0.25` | `0.25.1`  |
| `serde` (Cargo)              | `1`    | `1.0.229` |
| `serde_json` (Cargo)         | `1`    | `1.0.154` |
| `tokio` (Cargo)              | `1`    | `1.54.1`  |
| `tokio-modbus` (Cargo)       | `0.13` | `0.17.0`  |
| `tracing` (Cargo)            | `0.1`  | `0.1.44`  |
| `tracing-subscriber` (Cargo) | `0.3`  | `0.3.23`  |

## Compatibility decisions

- `tokio-modbus` updates from 0.13 to 0.17 without source API changes required by this bridge; existing tests exercise register/coil behavior. The bridge only constructs rumqttc plain-TCP MqttOptions and exposes no TLS configuration. Disabling unused default TLS features removes vulnerable rustls-webpki without removing a supported transport. The Rust builder advances from 1.87 to 1.99, matching the validated stable build toolchain; the scratch runtime stays unchanged.
- Documentation uses Vite 6.4.5, compatible esbuild 0.25.12, Rollup 4.68.0 and KaTeX 0.18.4. esbuild 0.28.2 fails the Mermaid transform, and KaTeX 0.18.11 is deprecated for accidental breaking changes; compatible fixed versions are deliberately retained. Mermaid remains within the plugin peer range.

## Release-age policy and deferred updates

The user explicitly selected versions published at least 24 hours before update selection, following a fresh-container pnpm policy rejection. NestJS 12.4.2, dotenv 18.0.10, eventsource 5.1.5, eslint-plugin-import-x 4.18.1 and ws 8.22.2 are deferred where applicable. Further fresh Rollup/Vite/follow-redirects and Cargo fixedbitset/itoa/syn/uuid versions were checked and reverted to aged stable resolutions. No new minimumReleaseAgeExclude entries, peer/engine bypass, registry changes or build-script trust expansions are retained. Existing TypeScript aliases are preserved where tooling excludes TypeScript 7.

## Security coverage

GitHub API readback confirms Dependabot alerts, secret scanning and secret-scanning push protection enabled. Public repository dependency graphs support the enabled alerts. Available Dependabot security updates were enabled for dependency-bearing repositories. Secret-scanning open-alert lists were empty after activation. CodeQL configuration is added or retained for the repository's supported source language; successful PR/default-branch analysis must be verified separately. Dependabot entries match actual manifests, with coupled NestJS updates grouped and pnpm workspaces tracked at their lockfile root. Action major references were checked against official releases; release/deployment trigger behavior is preserved.

## Lockfile audits

- `npm audit --prefix docs --json`: exit 0; {"info": 0, "low": 0, "moderate": 0, "high": 0, "critical": 0, "total": 0}.
- `cargo audit --json`: exit 0; {"vulnerabilities": 0, "warnings": ["unmaintained"]}.

### Residual findings

No vulnerable Cargo or npm dependencies remain in the tested locks. RustSec retains an informational warning for unmaintained `unsafe-libyaml`, used by the existing configuration parser. Replacing that parser is deferred to a separately specified compatibility migration.

## Validation

- `npm --prefix docs run build`: FAILED.
- `cargo fmt --all --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets --all-features`: passed.
- `cargo build --release`: passed.
- `npm --prefix docs run build`: passed.
- Clean isolated immutable install (empty pnpm store where applicable), lockfile unchanged: passed.
- Container build with base-image pull: passed.
- Synthetic container smoke: built-in MQTT/config health check with synthetic broker: passed.

## Delivery

PR: https://github.com/open-mqtt-bridges/modbus/pull/6; closes #3. Existing matching Dependabot PRs remain open and are linked as superseded. Required CI must pass on the PR current head before any separately authorized merge. No release, deployment or release-PR merge was performed.

## Hosted CI evidence

All reported checks on implementation head `7b0cffca97e5584ba6730df740f5f3125d450895` completed without failures at 2026-11-09T13:23:15.934296+00:00. Deployment jobs were intentionally skipped on the PR. CodeQL PR analysis completed for the supported source language. This final documentation-only task update follows that successful implementation verification; the current PR checks remain authoritative before merge.
