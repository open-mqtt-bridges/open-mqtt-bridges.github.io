# Compatibility contract

Preserve path resolution against the process working directory and the existing missing-file error. Reject malformed YAML and schema-invalid documents before opening a broker connection. Preserve bridge-specific accepted values and validation paths. Avoid logging credentials or configuration contents. Keep the broker protocol, host, port, credentials, client ID, keepalive and reconnect values passed to MQTT.js identical. Do not couple publication or subscription behavior to file loading.
