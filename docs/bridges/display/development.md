# Development

## Toolchain and checks

Build the bridge with Rust and Cargo. On Debian, install `libssl-dev`, `libudev-dev`, and `pkg-config`. Run these commands from `bridges/display/`:

- `cargo fmt --all --check`
- `cargo clippy --locked --all-targets --all-features -- -D warnings`
- `cargo test --locked --all-targets --all-features`
- `cargo build --locked --release`

Document changed public behavior and declaration contracts at their owning boundary, including inputs, outputs, errors and side effects where they are not obvious. Existing lint/type checks do not prove documentation coverage. Keep imports, comments and intentional formatting conventions intact; scope fixes to the task.

## Spec Kit

Use the [monorepo development guide](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/blob/main/docs/development.md) for the active Spec Kit installation and feature selection.

## Contributions and security

Follow the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) and any local security policy. Never commit `.env`, runtime configuration, tokens or sessions. Use documented example placeholders. Preserve MQTT topics, payloads, command retention and existing deployment identifiers. A dependency upgrade, release, merge or deployment is a separate action from a Spec Kit step.
