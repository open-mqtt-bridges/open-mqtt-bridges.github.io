# MQTT contract

Each controller keeps one persistent WebSocket and publishes `<topic>/connected`, `json`, flattened `state/... ` and `info/... `, plus `effects` and `palettes`. The complete WLED segment array is additionally published as JSON to `<topic>/state/seg`.

`<topic>/connected` reports the bridge's latest WebSocket status as `true` or `false`. The bridge sends transitions promptly while MQTT is connected and refreshes the current value about every 30 seconds. A late or reconnected subscriber can update its cache without restarting the controller. Treat duplicate values as normal.

Availability uses non-retained QoS 0. The bridge skips sends while MQTT is disconnected rather than queuing old values. Delivery is not guaranteed, and the broker does not store an online value from this bridge after it crashes. Consumers that need to expire cached values while the bridge is down must do so themselves.

Publish a WLED JSON state object to `<topic>/cmd`:

```json
{ "on": true, "bri": 180 }
```

The bridge adds WLED's `v: true` flag and receives the resulting state from the existing socket.

All command publications must be non-retained. The bridge clears a successfully received command topic with an empty payload.
