# Ping MQTT Bridge tasks

[PLAN.md](PLAN.md) defines the MQTT contract, acceptance checks, and cutover.

- [x] **T01 — Establish the project and validate configuration.** Use MIT
  and pin the supported Rust toolchain before the first implementation commit.
  Scaffold the Cargo project, validate settings before starting workers, and
  test legacy defaults, duplicate IDs, invalid values, and credential sources.
- [x] **T02 — Implement Linux ICMP and scheduling.** After T01, prototype
  native ICMP datagram sockets in a non-root container. Implement correlated
  echo probes, monotonic latency, typed local failures, bounded concurrency,
  skipped ticks, and cancellation; verify allowed and denied socket access.
- [x] **T03 — Implement the MQTT service.** After T02, connect the scheduler to
  an independent MQTT 3.1.1 connection with TLS verification, reconnect
  backoff, a bounded latest-result buffer, and independent service health.
  Test exact topics/payloads, QoS 1, non-retained delivery, and broker recovery.
- [x] **T04 — Package and prepare the public repository.** After T03, add the
  non-root amd64/arm64 image, Compose example, configuration and operator
  documentation, contribution and security policies, and GitHub CI. Verify
  the container against a controlled broker and echo target for each
  architecture; report any unavailable validation. Do not cut over or publish
  a release as part of this task.

Native amd64 container smoke checks passed locally. Native arm64 execution is
covered by the GitHub Actions matrix; the local Docker host cannot execute
arm64 binaries.

Each implementation task has a separate commit. Use Rust-native formatting and
linting with `cargo fmt --check`, `cargo clippy --all-targets --locked -- -D warnings`,
and `cargo test --locked`; keep deployment credentials and device inventories
out of the repository.
