# AdGuard Home MQTT Bridge
- 🔌 Simple bridge between **Adguard Home** and **MQTT**
- 📡 Publishes:
  - Status → `${TOPIC}/status`
  - Stats → `${TOPIC}/stats`
- 🕒 Adaptive polling:
  - Polls at `ADGUARD_POLL_INTERVAL` while healthy
  - Falls back to `ADGUARD_TIMEOUT_DURATION` polling if Adguard Home is unreachable for `ADGUARD_TIMEOUT`
- 🎛️ Supports MQTT commands:
  - `push_status`, `push_stats`, `set_protection`
- 🐳 Ready-to-use **Docker image**



See [Configuration](./configuration.md), [Deployment](./deployment.md) and the [MQTT contract](./mqtt.md).
