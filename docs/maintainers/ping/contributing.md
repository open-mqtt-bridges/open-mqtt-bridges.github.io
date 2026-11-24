# Contributing

For a bug, open an issue with the expected behavior, actual behavior, version,
and a minimal reproducible configuration. Replace broker details, credentials,
and device inventories with synthetic values. For security issues, follow
[SECURITY.md](security.md) instead.

Use the Rust version pinned in `rust-toolchain.toml` and keep `Cargo.lock` in
sync with `Cargo.toml`. Use native Rust conventions: `rustfmt`, `snake_case`
for functions and modules, and `PascalCase` for types. Document why a
non-obvious invariant or unsafe operation is necessary. Prefer tests that
exercise the observable contract over tests coupled to implementation details.
Do not change the existing MQTT topics, payload bytes, QoS, or retain behavior
without documenting compatibility impact.

Run from `bridges/ping/` on Linux before opening a pull request:

```bash
cargo fmt --check
cargo clippy --all-targets --locked -- -D warnings
cargo test --locked
# With Mosquitto available on PATH:
cargo test --locked --test mqtt_broker -- --ignored
# With a Linux Docker Engine:
docker build -t ping-mqtt-bridge:ci .
bash tests/container-smoke.sh ping-mqtt-bridge:ci
```

See the [central guide instructions](../../README.md) for the VitePress preview and build.
