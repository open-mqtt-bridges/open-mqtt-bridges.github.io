# Bridge health

Use liveness to check whether the process can respond. Use readiness when deciding whether the bridge can currently use its MQTT broker. An unavailable device or vendor service does not by itself mean the MQTT connection is down.

## Home Connect, Landroid, Philips Hue, PocketBase, Roborock, and WLED

- `GET /health` remains the process liveness check, with the existing response for each bridge. Leave existing Docker liveness checks on this endpoint.
- `GET /readyz` returns HTTP `200` and `{"status":"ok"}` when MQTT is connected and the broker has acknowledged all currently registered MQTT subscriptions.
- `GET /readyz` returns HTTP `503` and `{"status":"not_ready"}` during initial connection, after a disconnect, and while a required subscription is pending or denied. After a clean reconnect the bridge waits for fresh acknowledgements. Publish-only configurations require a broker connection but have no MQTT subscriptions to acknowledge.

Readiness does not probe a specific vendor device, cloud API, or collection. In particular, PocketBase synchronization and MQTT readiness are separate: check the PocketBase bridge logs when MQTT is ready but records do not arrive. No endpoint returns credentials, topic names, or device identifiers. Keep health endpoints on the same private network as the bridge.
