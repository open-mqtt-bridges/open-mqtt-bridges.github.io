# Operations

## ICMP permissions

The Compose service runs as UID/GID `65532:65532` on a read-only filesystem
with all capabilities dropped. Linux must allow group `65532` to open ICMP
datagram sockets via `net.ipv4.ping_group_range` in the service's network
namespace. Compose sets this on the default bridge network.

If your runtime does not allow Compose to set that sysctl, configure an allowed
group in the service's network namespace before launch. With host networking,
configure the host namespace instead. Do not make the container privileged
to work around a socket denial.

## Health endpoints

- `GET /livez` returns HTTP `200` while the process responds.
- `GET /readyz` reports `broker_connected` and `probe_engine_healthy`.
  It returns HTTP `503` if the broker is disconnected or the most recent probe
  for any device failed locally. An unreachable target does not make the
  bridge unready.

These endpoints are unauthenticated. Keep them on a private interface.
The default listener is container loopback and Compose does not publish it.

## Legacy cutover and rollback

1. Copy legacy `topic` to `base_topic`, `interval` in seconds to `interval_secs`,
   and device mappings to `[devices]` without changing IDs.
2. Record a baseline from the legacy publisher. Run the new bridge with a
   different MQTT client ID and a temporary base topic. Compare several sweeps,
   including a controlled timeout and recovery, against consumer expectations.
3. Back up the legacy configuration and record its image digest. Disable only
   legacy Ping before switching the new bridge to the production topic. Confirm
   there is one publisher and existing consumers still see devices update.
4. If validation fails, stop the new publisher, restore and re-enable legacy
   Ping, and confirm that production topics and consumer behavior recover.
