# Verification evidence

## Baseline after initial bot merges

At `946b43b`, GitHub reported 10 open Dependabot alerts:

- Ping `bridges/ping/Cargo.lock`: #65–#68, all from `rustls-webpki 0.102.8`.
- Display `bridges/display/Cargo.lock`: #64, `serde_yaml 0.7.5`.
- IDM `archive/idm-energy/yarn.lock`: #3, #11, #12, #14, and #63 (`glob`, `minimatch`, and `picomatch`).

Dependabot PRs #19, #20, #22, and #23 are merged. Frozen Yarn Classic installs with scripts disabled and separate bundle builds passed for both archive update groups. GitHub no longer lists the advisories for the versions those four PRs replaced.

## Ping

`cargo tree --locked -i rustls-webpki` shows only `0.103.17`. In the pinned Rust 1.100.0 environment, formatting, strict Clippy, 10 unit tests, and the separate Mosquitto integration test passed. A disposable TLS broker connected with a configured test CA and was rejected without it. The locked release container build and amd64 runtime smoke passed (non-root, denied socket, reachability, timeout, recovery, health, SIGTERM). Remote multi-platform CI will be checked on the PR.

## Display

`cargo tree --locked -i serde_yaml` shows only `0.9.34+deprecated`, the bridge's existing parser. Formatting, strict Clippy for the bridge, 10 tests, the locked release build, and the container build passed on the Rust 1.99 line. The new test checks bundled MCCS 2.0–3.0 input selection offline. The vendored dependency emits upstream `nom` future-compatibility warnings; no warning is suppressed. No physical monitor was tested.

## Archived IDM

Yarn Classic 1.22.22 resolved `rimraf 6.1.4`, `glob 14.0.6`, `minimatch 3.1.5` and `11.0.9`, and `picomatch 2.3.2` without overrides. The already patched `ws 8.23.0` and `brace-expansion 1.1.22` remain resolved. A clean audit also found `diff 4.0.2` under `ts-node`; its existing range accepts patched `4.0.4`. A second clean frozen install, TypeScript build, bundle, and Yarn audit all passed; Yarn reported zero advisories.

## Integration

RustSec also identified `url 2.5.8` in Display. The scoped update to `2.5.9` also resolves the required `form_urlencoded 1.2.3`. Display's format, Clippy, 10 tests, locked release, and container build passed again. Cargo Audit reports zero vulnerabilities in both lockfiles. Its pre-existing unmaintained-package warnings for `rustls-pemfile` (Ping) and `unsafe-libyaml` (Display) remain.

The website's clean frozen pnpm install, lint, type check, format check, static build, catalog smoke check, and 11 tests passed on the integrated feature branch. Hosted current-head and post-merge results are tracked in GitHub.
