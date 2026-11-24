# Configuration

### 🌍 Environment Variables
| Variable                 | Type   | Required | Default Value | Description                                                          |
| ------------------------ | ------ | -------- | ------------- | -------------------------------------------------------------------- |
| MQTT_PROTOCOL            | string | no       | `'mqtt'`      | Protocol for MQTT connection                                         |
| MQTT_HOST                | string | yes      |               | MQTT broker hostname or IP                                           |
| MQTT_PORT                | number | no       | `1883`        | MQTT broker port                                                     |
| MQTT_USERNAME            | string | yes      |               | MQTT username                                                        |
| MQTT_PASSWORD            | string | yes      |               | MQTT password                                                        |
| MQTT_CLIENTID            | string | no       | *random UUID* | MQTT client ID                                                       |
| ADGUARD_HOST             | string | yes      |               | Adguard Home hostname or IP (e.g., `http://192.168.1.50`)            |
| ADGUARD_USERNAME         | string | yes      |               | Adguard Home username                                                |
| ADGUARD_PASSWORD         | string | yes      |               | Adguard Home password                                                |
| ADGUARD_TOPIC            | string | yes      |               | MQTT topic prefix for Adguard Home messages                          |
| ADGUARD_POLL_INTERVAL    | number | no       | `1000`        | Poll interval in ms for Adguard Home. Set to `0` to disable polling. |
| ADGUARD_TIMEOUT          | number | no       | `30000`       | Time (ms) of consecutive failures before increasing poll interval    |
| ADGUARD_TIMEOUT_DURATION | number | no       | `30000`       | Poll interval in ms after timeout                                    |
| PUSH_JSON_OBJECT         | bool   | no       | `true`        | If `true`, publish Adguard Home status/stats as full JSON objects    |
| PUSH_JSON_KEYS           | bool   | no       | `true`        | If `true`, also publish individual JSON keys as MQTT topics          |


### MQTT TLS certificates

With `MQTT_PROTOCOL=mqtts`, the bridge verifies the broker certificate chain and hostname. Brokers using an untrusted issuer or a certificate that does not match `MQTT_HOST` will fail to connect. Plain `mqtt` connections retain their existing behavior and do not provide TLS encryption.

For a private certificate authority, set [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile) to a PEM file containing the trusted CA certificate. Node reads this setting when the process starts, so set it in the process/container environment rather than relying on the application's `.env` loader. The broker certificate must still match its hostname.

For Docker Compose, add these entries to your existing service configuration:

```yaml
environment:
  MQTT_PROTOCOL: mqtts
  MQTT_HOST: mqtt.example.net
  MQTT_PORT: 8883
  NODE_EXTRA_CA_CERTS: /app/certs/mqtt-ca.pem
volumes:
  - ./mqtt-ca.pem:/app/certs/mqtt-ca.pem:ro
```

