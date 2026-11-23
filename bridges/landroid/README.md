# Landroid MQTT Bridge

[![CI](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/landroid/ci.yml?style=for-the-badge&label=CI)](https://github.com/open-mqtt-bridges/landroid/actions/workflows/ci.yml) [![Docs](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/landroid/docs.yml?style=for-the-badge&label=Docs)](https://github.com/open-mqtt-bridges/landroid/actions/workflows/docs.yml) [![Deploy](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/landroid/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/open-mqtt-bridges/landroid/actions/workflows/deploy.yml)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-tobiaswaelde-FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/tobiaswaelde)

NestJS bridge between Worx, Kress, Landxcape, or Ferrex mower accounts and MQTT. Full documentation: [open-mqtt-bridges.github.io/landroid](https://open-mqtt-bridges.github.io/landroid/).

## Quick start

```bash
cp config/config.example.yml config/config.yml
# edit config/config.yml
docker compose up -d
```

Minimal configuration:

```yaml
mqtt:
  host: mqtt.example.net
  clientId: landroid-mqtt-bridge
  username: mqtt-user
  password: change-me
instances:
  - id: garden
    topic: home/landroid/garden
    cloud:
      type: worx
      email: mower-account@example.com
      password: change-me
    mowers:
      - serial: '20213026710100887292'
    updateInterval: 60000
```

`mqtt.clientId` may be empty; the bridge then generates a UUID for the running process.

Example command:

```bash
mosquitto_pub -h mqtt.example.net -t 'home/landroid/garden/mowers/20213026710100887292/set/json' -m '{"cmd":"start"}'
```

Commands use readable strings: `start`, `pause` (or `stop`), `home`, `zone_training`, `lock`, and `unlock`. The bridge rejects numeric command codes at the MQTT boundary and converts these names for the vendor cloud. See the [MQTT contract](https://open-mqtt-bridges.github.io/landroid/mqtt) for every published topic, command parameters, and the status/error-code enums.

## Documentation

- [Documentation home](https://open-mqtt-bridges.github.io/landroid/)
- [Configuration](https://open-mqtt-bridges.github.io/landroid/configuration)
- [Authentication](https://open-mqtt-bridges.github.io/landroid/authentication)
- [MQTT contract](https://open-mqtt-bridges.github.io/landroid/mqtt)
- [Docker deployment](https://open-mqtt-bridges.github.io/landroid/deployment)
- [Troubleshooting](https://open-mqtt-bridges.github.io/landroid/troubleshooting)
- [WLED MQTT Bridge for local lighting](https://open-mqtt-bridges.github.io/wled/)

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. Node-based application runtimes require Node.js 26. Builds use TypeScript 7; ESLint and compiler-API consumers use the TypeScript 6 compatibility package. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

## Contributing

See the [development guide](docs/development.md) for the pinned toolchain, checks and Spec Kit usage, and the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) for pull requests.
