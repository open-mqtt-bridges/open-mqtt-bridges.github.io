# 🌈 WLED MQTT Bridge

[![CI](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/wled/ci.yml?style=for-the-badge&label=CI)](https://github.com/open-mqtt-bridges/wled/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/wled/docs.yml?style=for-the-badge&label=Docs)](https://github.com/open-mqtt-bridges/wled/actions/workflows/docs.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/wled/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/open-mqtt-bridges/wled/actions/workflows/deploy.yml)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-tobiaswaelde-FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/tobiaswaelde)

NestJS bridge between multiple WLED controllers and MQTT. Full documentation: [open-mqtt-bridges.github.io/wled](https://open-mqtt-bridges.github.io/wled/).

## 🚀 Quick start

```bash
cp config/config.example.yml config/config.yml
# edit config/config.yml
docker compose up -d
```

Minimal configuration:

```yaml
mqtt:
  host: mqtt.example.net
  clientId: wled-mqtt-bridge
  username: mqtt-user
  password: change-me
instances:
  - id: desk
    topic: home/wled/desk
    host: 192.168.1.30
    pingInterval: 15000
    pongTimeout: 5000
    reconnectInterval: 15000
  - id: kitchen
    topic: home/wled/kitchen
    host: 192.168.1.31
```

`mqtt.clientId` may be empty; the bridge then generates a UUID for the running process.

Example command:

```bash
mosquitto_pub -h mqtt.example.net -t 'home/wled/desk/cmd' -m '{"on":true,"bri":180}'
```

## 📚 Documentation

- [🏠 Documentation home](https://open-mqtt-bridges.github.io/wled/)
- [⚙️ Configuration](https://open-mqtt-bridges.github.io/wled/configuration)
- [📡 MQTT contract](https://open-mqtt-bridges.github.io/wled/mqtt)
- [🔐 Authentication](https://open-mqtt-bridges.github.io/wled/authentication)
- [🐳 Docker deployment](https://open-mqtt-bridges.github.io/wled/deployment)

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. Node-based application runtimes require Node.js 26. Builds use TypeScript 7; ESLint and compiler-API consumers use the TypeScript 6 compatibility package. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

## Contributing

See the [development guide](docs/development.md) for the pinned toolchain, checks and Spec Kit usage, and the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) for pull requests.
