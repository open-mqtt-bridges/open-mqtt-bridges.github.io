# Bridge health

Use liveness to check whether the process can respond. Use readiness when deciding whether the bridge can currently use its MQTT broker. An unavailable device or vendor service does not by itself mean the MQTT connection is down.

## Home Connect, Landroid, Philips Hue, PocketBase, Roborock, and WLED

- `GET /health` remains the process liveness check, with the existing response for each bridge. Leave existing Docker liveness checks on this endpoint.
- `GET /readyz` returns HTTP `200` and `{"status":"ok"}` when MQTT is connected and the broker has acknowledged all currently registered MQTT subscriptions.
- `GET /readyz` returns HTTP `503` and `{"status":"not_ready"}` during initial connection, after a disconnect, and while a required subscription is pending or denied. After a clean reconnect the bridge waits for fresh acknowledgements. Publish-only configurations require a broker connection but have no MQTT subscriptions to acknowledge.

Readiness does not probe a specific vendor device, cloud API, or collection. In particular, PocketBase synchronization and MQTT readiness are separate: check the PocketBase bridge logs when MQTT is ready but records do not arrive. No endpoint returns credentials, topic names, or device identifiers. Keep health endpoints on the same private network as the bridge.

## Display, Modbus, AdGuard Home, and Ping

Display, Modbus, and AdGuard Home expose a loopback-only readiness probe inside their containers. No host port mapping is needed. The commands below exit `0` only when the running bridge is connected and its required MQTT command subscriptions are acknowledged.

- Display: `docker exec <container> displays-mqtt-bridge --readycheck`.
- Modbus: `docker exec <container> /modbus-mqtt-bridge --readycheck`. The older `--healthcheck` still validates configuration and broker TCP reachability; it is not session readiness.
- AdGuard Home: `docker exec <container> node tools/readycheck.cjs`.
- Ping: keep using its existing `/livez` and `/readyz`; monitored targets being unreachable do not make Ping unready.

For a direct run outside Docker, set `BRIDGE_READY_PORT` to a free nonzero local port for both the running process and its probe command. The container defaults are `38081` (Display), `38082` (Modbus), and `38083` (AdGuard Home). The checks do not probe device credentials, external accounts, or the physical devices themselves. Keep readiness separate from container liveness so that a temporary broker outage does not trigger a bridge restart.
