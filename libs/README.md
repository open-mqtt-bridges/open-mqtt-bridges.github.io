# Bridge runtime libraries

`@open-mqtt-bridges/config` provides YAML loading, common broker and instance schemas, and path resolution (`CONFIG_FILE`, then `--config`, then `config/config.yml`). Extend the schemas in the consuming bridge and call `loadConfig(schema)` at startup. Importing the package does not read a file.

`@open-mqtt-bridges/mqtt` exposes `connectMqtt(settings)`. Pass validated settings, including keepalive in seconds and reconnect delay in milliseconds. An empty client ID generates a UUID. The caller owns the returned MQTT.js client, its handlers, availability messages and shutdown.

Both packages are private. Bridges use local file dependencies and their own locked peer versions. Their CommonJS entry points and TypeScript declarations work with the existing Jest and ncc toolchains without a separate library build or registry.

Consumers: Home Connect, Landroid, Philips Hue, PocketBase, Roborock and WLED. PocketBase loads its collection rules from YAML and passes validated broker settings from its environment. To add another Node consumer, declare `file:../../libs/config` or `file:../../libs/mqtt`, install its peers in the bridge and update that bridge's lockfile. CI selects consumers by these manifest dependencies. Tests for file precedence, validation and MQTT option mapping run with `pnpm test` at the repository root.

For a local image build, use the bridge as the primary context and provide the libraries separately. For example, from the repository root:

```bash
docker buildx build --load --build-context bridge-libs=libs -t homeconnect:local bridges/homeconnect
```
