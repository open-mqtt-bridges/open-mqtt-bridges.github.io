# Ping MQTT Bridge

Ping MQTT Bridge is a standalone Linux service that probes configured IPv4
devices with ICMP echo and publishes reachability and latency over MQTT 3.1.1.
It preserves the legacy Ping topics and payloads. It does not discover devices,
probe IPv6 addresses, or receive MQTT commands.

See the [documentation](../../docs/bridges/ping/index.md) for setup, configuration, the MQTT
contract, and troubleshooting.

## Run with Docker Compose

On a Linux Docker Engine (`linux/amd64` or `linux/arm64`):

```bash
cp examples/bridge.toml bridge.toml
# Set broker host, port, TLS, unique client ID, and the device IDs and addresses.
docker compose up -d --build
docker compose logs -f ping
```

The example broker and device addresses are placeholders. The container runs
as UID/GID `65532:65532` with a read-only filesystem and no capabilities. Its
numeric group must be allowed by `net.ipv4.ping_group_range` **in its network
namespace**. Compose sets this on the default bridge network. If your runtime
disallows that sysctl, configure an allowed group in the namespace before
launch. With host networking, configure the host namespace, not the container.
Do not make the container privileged to fix this. Startup fails with a
diagnostic if the socket is denied. The runtime user also needs read access
to the mounted config and any secret files.

## Configuration

Pass a TOML file path as the first argument (default: `bridge.toml` when run
outside the container). Settings are read and validated only at startup.

| Setting | Default | Details |
| --- | --- | --- |
| `base_topic` | `stats/ping` | Slash-separated nonempty topic segments |
| `interval_secs` | `30` | `1` to `86400` seconds between scheduled sweeps |
| `timeout_ms` | `5000` | `1` to `60000` ms per probe |
| `parallelism` | `16` | `1` to `256` concurrent probes |
| `health_bind` | `127.0.0.1:8080` | Health listener; use a private bind address |
| `broker.host` | Required | Hostname or IP address |
| `broker.port` | `1883` | Set explicitly (typically `8883` for TLS) |
| `broker.client_id` | Required | Unique on the broker |
| `broker.tls` | `false` | Enable certificate and hostname verification |
| `broker.ca_file` | None | PEM trust bundle replacing the built-in Mozilla roots |
| `devices` | Required | `1` to `4096` unique IDs mapped to unicast IPv4 addresses |

Copy legacy `topic` to `base_topic`, legacy `interval` (in seconds) to
`interval_secs`, and legacy `devices` to `[devices]` verbatim. Quote TOML
keys that contain spaces or dots. Keep existing device IDs unchanged; IDs
must not contain `/`, MQTT wildcards (`+`, `#`), or control characters.

Set `MQTT_USERNAME` and `MQTT_PASSWORD`, or set `MQTT_USERNAME_FILE` and
`MQTT_PASSWORD_FILE` to paths of read-only mounted secrets. For each
credential, set only one source. A single trailing LF or CRLF is stripped
from a secret file. The bridge never reads credentials from TOML. Enable TLS
when sending credentials over networks that are not trusted. Mount a private
CA and set `broker.ca_file` when using a private trust chain; use a broker name
matching the certificate.

## MQTT contract

| Topic | Exact payload type | When published |
| --- | --- | --- |
| `<base>/<device-id>/alive` | Unquoted `true` or `false` as UTF-8 | Every completed probe, including unchanged reachability |
| `<base>/<device-id>/time` | Decimal milliseconds, e.g. `1.42`, as UTF-8 | Successful echo replies only |

Both topics use **QoS 1**, `retain=false`. QoS 1 can produce duplicates. A
timeout or ICMP unreachable response publishes `false` without a new `time`;
interpret the last latency using `alive`. A local probe failure, such as a
socket error, publishes neither value. No retained state is created.

The bridge probes at startup, runs one bounded sweep at a time, and skips
elapsed ticks if a sweep runs long. While connected it queues up to 64
results and allows one MQTT packet in flight, applying backpressure instead of
silently dropping completed results. During outages it keeps only the latest
unsent result per device, in memory. A reconnect uses a fresh MQTT session;
the bridge does not replay older MQTT-library requests after publishing a
newer result. This is not a durable event log.

## Health and cutover

`GET /livez` returns HTTP 200 while the process responds. `GET /readyz` reports
`broker_connected` and `probe_engine_healthy`; it returns 503 when the broker
is disconnected or the last probe for any device failed locally. Timeout and
unreachable results do not degrade bridge health. Keep these unauthenticated
endpoints on a private interface; Compose does not publish the port.

Before replacing a running legacy deployment, compare the two publishers
using different client IDs and a temporary base topic. Confirm timeout,
recovery, and compatibility with your consumers before switching. See
[cutover and rollback](PLAN.md#cutover-and-rollback).

## Development and license

Use Linux and Rust **1.100.0**, pinned in [`rust-toolchain.toml`](rust-toolchain.toml).
See [CONTRIBUTING.md](CONTRIBUTING.md) for checks and [SECURITY.md](SECURITY.md)
for private reporting. Licensed under [MIT](LICENSE).
