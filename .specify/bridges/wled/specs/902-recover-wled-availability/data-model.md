# Data Model: Recover WLED Availability

## Controller availability

One in-memory record per enabled WLED instance. The configured topic prefix identifies its MQTT address; no schema or configuration changes.

- **Connection state** (`boolean`): Latest connection state reported by the existing WLED connection. Starts `false`; changes to `true` on open and to `false` on disconnect. MQTT outages do not change it.
- **Last availability attempt** (timestamp or unset): Cadence bookkeeping for the last attempt submitted while MQTT reported connected. A skipped publish while disconnected does not advance it. This is not proof of delivery.
- **Lifecycle**: No periodic messages before setup or after destruction. Preserve the startup `false` and orderly teardown transition to `false` when MQTT is available.

## Consumer cache entry

An external mapping from `<topic>/connected` to the last received `true`/`false`. Missing values can default to offline. A replay overwrites a stale entry with current status. The bridge does not store, inspect, or expire this cache.
