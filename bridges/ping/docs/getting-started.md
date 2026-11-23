# Getting started

Use a Linux Docker Engine with Compose on `linux/amd64` or `linux/arm64`.
Have an MQTT 3.1.1 broker and at least one reachable IPv4 target ready.

## Start the bridge

```bash
git clone https://github.com/open-mqtt-bridges/ping.git
cd ping
cp examples/bridge.toml bridge.toml
```

Edit `bridge.toml` and replace the placeholder broker and device addresses.
Set a unique `broker.client_id` and check the broker's TLS settings. If the
broker requires authentication, configure the service's
[credential sources](./configuration.md#broker-credentials) before starting.

```bash
docker compose up -d --build
docker compose logs -f ping
```

## Confirm MQTT delivery

Subscribe with a separate MQTT client to `stats/ping/+/alive` and
`stats/ping/+/time`, or replace `stats/ping` with your `base_topic`. Subscribe
before a sweep or wait for the next one: results are not retained.

A reachable target publishes `true` and a round-trip time in milliseconds.
See the [MQTT contract](./mqtt.md) for timeout and error behavior. If messages
are missing, check [troubleshooting](./troubleshooting.md).
