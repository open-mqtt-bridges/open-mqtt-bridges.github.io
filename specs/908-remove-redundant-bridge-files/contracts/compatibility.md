# Compatibility contract

- The Node bridges must start, read configuration, and connect to MQTT as before. Type resolution alone must not read YAML or connect to a broker.
- MQTT topics, payloads, availability, configuration keys, and local build entry points are unchanged.
- Display's development build requires no Node installation. Its Cargo version, registry image, immutable tag, and `latest` and minor-version aliases stay unchanged.
- The central guide remains available at `/display/`. Display still receives Cargo and Docker dependency updates.
