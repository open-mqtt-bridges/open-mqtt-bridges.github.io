# Validation quickstart

Use a clean disposable checkout or container, without real bridge credentials or devices.

- **IDM**: Run Yarn Classic `yarn install --frozen-lockfile` and `yarn bundle` in `archive/idm-energy`; confirm affected resolved versions in `yarn.lock`.
- **Ping**: Run `cargo tree --locked -i rustls-webpki`, `cargo fmt --check`, `cargo clippy --locked --all-targets -- -D warnings`, `cargo test --locked`, and the ignored MQTT broker test with a disposable Mosquitto instance. Validate working trusted TLS and refusal of untrusted certificates. Run the existing container CI.
- **Display**: Run `cargo tree --locked -i serde_yaml`, `cargo fmt --check`, `cargo clippy --locked --all-targets -- -D warnings`, `cargo test --locked`, and `cargo build --locked --release`. Add focused offline coverage for bundled monitor data if the loader dependency changes. Run the existing container CI; report physical monitor coverage separately.
- **Acceptance**: Check each current-head workflow and relevant scanner output. After merging, reconcile the in-scope alert states against GitHub. No releases, dismissals, or production tests.
