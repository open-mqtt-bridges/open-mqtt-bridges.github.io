# Research: Recover WLED Availability

## Recovery policy

**Decision**: Replay non-retained availability every 30 seconds using the existing one-second bridge tick. Preserve prompt transition announcements and repeat both online and offline states.

**Rationale**: `Wled.setConnected()` suppresses repeated values and `MqttService.publish()` sends non-retained messages. A healthy socket can outlive multiple subscriber sessions. A recurring refresh covers late and reconnected subscribers without modifying device traffic or choosing a new retention contract. The interval adds about two scheduled messages per minute per enabled controller.

**Alternatives considered**: A broker reconnect hook alone does not handle late consumers on an uninterrupted MQTT connection. Retained `true` can survive a bridge crash; one Last Will on the shared MQTT client cannot directly clear or replace every device's retained topic. Reopening the WLED socket to regenerate availability is unnecessary and disruptive.

## MQTT transport

**Decision**: Skip all availability sends when the MQTT client reports disconnected. Do not change queue behavior for other messages.

**Rationale**: The lockfile's [MQTT.js v5.16.1](https://github.com/mqttjs/MQTT.js/blob/v5.16.1/src/lib/client.ts) defaults to QoS 0 and enables offline queuing for it. A FIFO of old availability does not represent the latest state. Keeping the latest value in `Wled` and only submitting when MQTT is connected avoids building an availability backlog. A connected check is not a broker acknowledgment; retries come from the next periodic refresh.

**Alternatives considered**: Disable QoS 0 queuing globally (would change commands and telemetry); buffer one latest value per topic in the MQTT service (unnecessary duplicate state and lifecycle complexity).

## Scope of proof

**Decision**: Pair deterministic cadence/lifecycle checks with an isolated real-broker regression using the project's MQTT client and a local HTTP/WebSocket WLED fixture.

**Rationale**: Mock publish counts do not show whether a subscriber joining after the first publish can update its cache or recover after reconnect. A fixture can assert that the WLED socket never reconnects and avoid production devices, Redis, credentials, and network conditions.

**Alternatives considered**: A mock-only test misses transport semantics; production reproduction is intrusive and unnecessary; a second JavaScript broker dependency is not needed when a disposable Mosquitto process/container is available.
