# Troubleshooting

## Startup fails with a socket permission error

Check the effective group and `net.ipv4.ping_group_range` in the bridge's
network namespace. See [ICMP permissions](./operations.md#icmp-permissions).
For startup errors reading configuration or credentials, verify that the
paths are mounted and readable by UID/GID `65532:65532`.

## No MQTT messages arrive

- Check `docker compose logs ping` for configuration, connection, or probe
  errors.
- Confirm the subscriber's filter matches `base_topic` and the device ID.
  Subscribe before the next sweep; there is no retained result.
- Verify broker connectivity, publish permissions, and a unique client ID.
  For TLS errors, check the port, certificate hostname, and trust bundle.
- A local probe failure is not reported as `alive=false`; it suppresses both
  publications for the affected device.

## A device reports `false` or stops updating latency

Check the configured IPv4 address and whether the device answers ICMP echo
from the bridge's network. A timeout or ICMP unreachable response emits
`alive=false` without a new `time` value.

## Readiness returns HTTP 503

Check `broker_connected` and `probe_engine_healthy` to distinguish broker
disconnection from local probe errors. An ordinary timeout does not affect
readiness. See [health endpoints](./operations.md#health-endpoints).
