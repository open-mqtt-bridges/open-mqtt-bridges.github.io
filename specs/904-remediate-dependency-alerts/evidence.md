# Verification evidence

## Baseline after initial bot merges

At `946b43b`, GitHub reported 10 open Dependabot alerts:

- Ping `bridges/ping/Cargo.lock`: #65–#68, all from `rustls-webpki 0.102.8`.
- Display `bridges/display/Cargo.lock`: #64, `serde_yaml 0.7.5`.
- IDM `archive/idm-energy/yarn.lock`: #3, #11, #12, #14, and #63 (`glob`, `minimatch`, and `picomatch`).

Dependabot PRs #19, #20, #22, and #23 are merged. Frozen Yarn Classic installs with scripts disabled and separate bundle builds passed for both archive update groups. GitHub no longer lists the advisories for the versions those four PRs replaced.

## Ping

`cargo tree --locked -i rustls-webpki` shows only `0.103.17`. In the pinned Rust 1.100.0 environment, formatting, strict Clippy, 10 unit tests, and the separate Mosquitto integration test passed. A disposable TLS broker connected with a configured test CA and was rejected without it. The locked release container build and amd64 runtime smoke passed (non-root, denied socket, reachability, timeout, recovery, health, SIGTERM). Remote multi-platform CI will be checked on the PR.
