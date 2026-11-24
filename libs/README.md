# Bridge runtime libraries

`@open-mqtt-bridges/config` provides YAML loading, common broker and instance schemas, and path resolution (`CONFIG_FILE`, then `--config`, then `config/config.yml`). Extend the schemas in the consuming bridge and call `loadConfig(schema)` at startup. Importing the package does not read a file.

`@open-mqtt-bridges/mqtt` exposes `connectMqtt(settings)`. Pass validated settings, including keepalive in seconds and reconnect delay in milliseconds. An empty client ID generates a UUID. The caller owns the returned MQTT.js client, its handlers, availability messages and shutdown.

Both packages are private. Bridges use local file dependencies and their own locked peer versions. Their CommonJS entry points and TypeScript declarations work with the existing Jest and ncc toolchains without a separate library build or registry.
