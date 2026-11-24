# Configuration

The bridge loads and validates TOML at startup. Compose mounts `bridge.toml`
at `/etc/ping-mqtt-bridge/bridge.toml`. Outside the container, pass the path
as the first argument or omit it to use `bridge.toml` in the current directory.
Restart the bridge to apply changes.

<<< ../../../bridges/ping/examples/bridge.toml

| Setting | Default | Details |
| --- | --- | --- |
| `base_topic` | `stats/ping` | Slash-separated nonempty topic segments |
| `interval_secs` | `30` | `1`–`86400` seconds between scheduled sweeps |
| `timeout_ms` | `5000` | `1`–`60000` milliseconds per probe |
| `parallelism` | `16` | `1`–`256` concurrent probes |
| `health_bind` | `127.0.0.1:8080` | Private HTTP health listener |
| `broker.host` | Required | Broker hostname or IP address |
| `broker.port` | `1883` | Set explicitly for TLS (typically `8883`) |
| `broker.client_id` | Required | Must be unique on the broker |
| `broker.tls` | `false` | Enables TLS with certificate and hostname verification |
| `broker.ca_file` | Not set | PEM trust bundle replacing the built-in Mozilla roots |
| `devices` | Required | `1`–`4096` unique IDs mapped to unicast IPv4 addresses |

Device IDs are MQTT topic segments. Do not include `/`, `+`, `#`, or control
characters. Quote TOML keys that contain spaces or dots. Keep legacy device
IDs unchanged when [migrating](./operations.md#legacy-cutover-and-rollback).

## Broker credentials

Set `MQTT_USERNAME` and `MQTT_PASSWORD` in the service environment, or use
`MQTT_USERNAME_FILE` and `MQTT_PASSWORD_FILE` to point to read-only secret
files visible to the service. Set at most one source per credential.
The bridge strips a single trailing LF or CRLF from secret files and does
not read credentials from TOML.

For Compose, pass the environment variables to the `ping` service explicitly.
For file-based credentials, also mount the files and ensure UID/GID
`65532:65532` can read them. Enable TLS when credentials cross an untrusted
network. For a private CA, mount the PEM bundle and set `broker.ca_file`.
