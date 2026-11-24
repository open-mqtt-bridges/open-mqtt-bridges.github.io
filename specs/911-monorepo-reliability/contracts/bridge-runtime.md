# Bridge Runtime Compatibility

## Commands

- **Modbus**: A rejected command must not write to a device, close the processing channel, or stop the bridge. A subsequent valid command follows the same write and response path as before. Keep existing topic, payload, QoS, and retention behavior.
- **Display**: Reconnect and restore the existing command subscription without operator action. Avoid duplicate registrations for one active session. Do not infer command availability from a retained heartbeat. Preserve command and status publication contracts, including retained status.

## Health

- **Liveness**: The process can respond or run its owning probe independently of broker state. Existing `/health` routes keep their status semantics and response shape; existing consumers do not have to switch.
- **Readiness**: A bridge is not ready until its broker session and required subscriptions are usable. It becomes not ready on disconnect and recovers when prerequisites return. Include required bridge-level dependencies only where they prevent service; individual monitored devices being offline do not automatically make the bridge unhealthy.
- **Exposure**: For bridges with HTTP health, follow Ping's success/unavailable behavior (`200`/`503`) on the additive `/readyz`. Where HTTP is not already exposed, document and test a native or container-local equivalent. Do not expose credentials, connection strings, or device identifiers.

## Files and containers

- **Roborock**: New and replaced map files keep the existing path and atomic replacement behavior. The requested `0640` mode is constrained by the process `umask`; no implicit broadening. Operators providing group access must also configure traversable directories and appropriate group ownership.
- **AdGuard**: Keep launch, input, and transport contracts while running as non-root. Preserve certificate and hostname verification and the existing plain MQTT option. Document runtime user and writable mounts.
