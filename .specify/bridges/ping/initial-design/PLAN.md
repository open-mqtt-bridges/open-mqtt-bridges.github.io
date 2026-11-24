# Implementation plan

## Goal

Build a standalone Linux service in Rust that periodically checks configured devices with ICMP echo and publishes reachability and round-trip time over MQTT. Existing consumers can keep their topic subscriptions and payload parsers. Version 1 targets Linux containers on `linux/amd64` and `linux/arm64`, configured IPv4 addresses, and MQTT 3.1.1. Discovery, IPv6, and MQTT commands are outside version 1.

## MQTT contract

| Topic | Payload | When published |
| --- | --- | --- |
| `<base>/<device-id>/alive` | `true` or `false` as unquoted UTF-8 | After each completed probe, including unchanged reachability |
| `<base>/<device-id>/time` | Decimal milliseconds as UTF-8 text, e.g. `1.42`, with no quotes or unit suffix | Only after a successful echo reply |

Default the base topic to `stats/ping`. Preserve existing device IDs and publish both topics at QoS 1 with `retain=false`. Treat a completed timeout or an ICMP unreachable response as `false`. Skip device publications for local failures such as permission errors or a socket fault. Log those failures and expose bridge health separately from device reachability. Consumers must use `alive` to interpret the last `time` value, since a failed probe does not publish a new latency.

## Implementation sequence

1. **Configuration.** Scaffold a Cargo binary with Tokio, Serde, structured logging, and an async MQTT client. Load a read-only config file with broker settings, a unique client ID, base topic, interval, timeout, parallelism, and a device ID-to-IPv4 mapping. Support MQTT credentials from environment variables or mounted secret files and TLS with certificate validation, including a configurable CA for private brokers. Validate configuration before starting tasks. Reject duplicate IDs, invalid addresses, MQTT wildcards, invalid topic segments, and zero or out-of-range timing settings. Document how to translate the legacy `topic`, `interval` in seconds, and `devices` fields. Use a five-second probe timeout by default for legacy parity.
2. **ICMP and scheduling.** Prototype native Linux ICMP datagram sockets in the intended container network before locking in the Rust backend. Run as a non-root user and grant its group access through `net.ipv4.ping_group_range` where supported. Verify socket access on startup and exit with an actionable error if denied. Correlate replies to outstanding probes and measure round-trip time with a monotonic clock. Probe immediately on startup, cap parallelism, allow one in-flight probe per device, and skip missed ticks instead of starting catch-up bursts. Shut down cleanly on SIGTERM. Document the required permissions and verify them for each target platform.
3. **MQTT publishing.** Drive the MQTT connection independently of the probe scheduler. Publish every completed result while connected. During disconnects, keep at most the latest result per device and bound the MQTT client's queue and in-flight publishes. After reconnect, resume with current results. Test that updates cannot leave consumers with an older final state after reconnect. Use backoff during reconnects and report broker or probe-engine failures without logging credentials. Expose process and broker health independently of whether monitored devices reply.
4. **Package and validate.** Add a non-root multi-architecture container, a Compose example, and configuration using synthetic device IDs and documentation-only addresses. Run `cargo fmt --check`, `cargo clippy --all-targets --locked -- -D warnings`, and `cargo test --locked` in CI. Check the Docker image with a broker and a controlled ICMP echo target on Linux. Pick the project license and document the supported Rust toolchain before the first implementation commit.

## Acceptance checks

- Unit tests cover config validation, exact topic and payload encoding, decimal latency, local errors, and omission of `time` on timeout. Deterministic scheduler tests cover bounded concurrency, missed ticks, and cancellation.
- MQTT integration with a test broker verifies QoS 1, no retained state for new subscribers, recovery after broker restart, and bounded buffering with the latest state delivered after reconnection.
- The container runs as non-root without privileged mode and publishes `true` plus latency for a controlled responder and `false` alone for a controlled nonresponder. A denied socket fails startup with a clear diagnostic and produces no device state.
- A subscription using the existing consumer contract receives the same topic names and byte-level payload types for a reachable device, a timeout, and recovery.

## Cutover and rollback

1. Capture a private baseline from the running legacy bridge for the deployed device IDs, intervals, and message format. Run the new bridge alongside it with a different MQTT client ID and a temporary base topic. Compare results across multiple cycles, including a controlled timeout and recovery. Check app behavior with the existing subscriptions before switching the production topics.
2. Back up the legacy bridge configuration and record its image digest. Disable only the legacy Ping module before pointing the new bridge at the existing base topic. Verify that one publisher owns those topics, all existing device IDs update within the expected polling window, and the app still displays presence correctly.
3. On failed validation, stop the new publisher, restore and re-enable legacy Ping, then verify that production topics and app presence recover. Keep the legacy configuration and image available until acceptance is complete.

## References

- [Linux kernel IP sysctl documentation](https://docs.kernel.org/networking/ip-sysctl.html)
- [OASIS MQTT 3.1.1 specification](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
