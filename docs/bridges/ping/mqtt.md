# MQTT contract

The bridge publishes over MQTT 3.1.1 and does not subscribe to command topics.
The default `<base>` is `stats/ping`.

| Topic | UTF-8 payload | When published |
| --- | --- | --- |
| `<base>/<device-id>/alive` | Unquoted `true` or `false` | Every completed probe with a reachability result, including unchanged results |
| `<base>/<device-id>/time` | Decimal milliseconds, for example `1.42` | Successful echo replies only |

Both topics use QoS 1 and `retain=false`. Consumers can receive duplicates.
A timeout or ICMP unreachable reply publishes `false` without a new `time`.
Treat previous latency as stale when the target is not alive. A local probe
failure, such as a socket error, publishes neither value.

## Scheduling and reconnects

The bridge starts probing immediately. Sweeps do not overlap; elapsed ticks
are skipped when a sweep runs long. While connected, it queues up to 64
results and allows one MQTT packet in flight, applying backpressure rather
than silently dropping completed results.

While disconnected, the bridge keeps the latest unsent result per device
in memory. It reconnects with a fresh MQTT session and does not replay older
library requests after publishing newer results. This is not a durable event log.
