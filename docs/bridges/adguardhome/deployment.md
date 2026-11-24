# Deployment

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


