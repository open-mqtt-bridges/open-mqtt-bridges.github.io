# Deployment

Images built from the current monorepo Dockerfile use a pinned Node.js Alpine base and run as `node` (UID/GID `1000:1000`). Older published images may differ. The application does not need a writable application directory. Compose environment settings continue to work. If you mount an `.env` file at `/app/.env`, mount it read-only and grant the container user or its group read access, not write access. Avoid making files with real credentials world-readable.

### 🐋 Docker

```yaml
# compose.yaml

services:
  adguard-mqtt-bridge:
    container_name: adguard-mqtt-bridge
    image: ghcr.io/tobiaswaelde/adguard-mqtt-bridge
    restart: always
    environment:
      MQTT_HOST: 192.168.1.10
      MQTT_PORT: 1883
      MQTT_USERNAME: username
      MQTT_PASSWORD: password
      ADGUARD_HOST: 192.168.178.11
      ADGUARD_USERNAME: admin
      ADGUARD_PASSWORD: secret
      TOPIC: adguard
```
