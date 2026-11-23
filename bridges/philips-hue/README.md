# Hue MQTT Bridge

[![CI](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/philips-hue/ci.yml?style=for-the-badge&label=CI)](https://github.com/open-mqtt-bridges/philips-hue/actions/workflows/ci.yml) [![Docs](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/philips-hue/docs.yml?style=for-the-badge&label=Docs)](https://github.com/open-mqtt-bridges/philips-hue/actions/workflows/docs.yml) [![Deploy](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/philips-hue/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/open-mqtt-bridges/philips-hue/actions/workflows/deploy.yml)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-tobiaswaelde-FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/tobiaswaelde)

NestJS bridge between a local Philips Hue Bridge and MQTT. Full documentation: [open-mqtt-bridges.github.io/philips-hue](https://open-mqtt-bridges.github.io/philips-hue/).

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
  clientId: hue-mqtt-bridge
  username: mqtt-user
  password: change-me
instances:
  - id: living-room
    topic: home/hue/living-room
    host: 192.168.1.10
    username: hue-api-username
    interval: 10000
```

`mqtt.clientId` may be empty; the bridge then generates a UUID for the running process.
All lamps available through the configured Hue API user are discovered automatically; no lamp IDs need to be configured.

Example command:

```bash
mosquitto_pub -h mqtt.example.net -t 'home/hue/living-room/lights/1/command/json' -m '{"state":{"on":true,"bri":180}}'
```

## Documentation

- [Documentation home](https://open-mqtt-bridges.github.io/philips-hue/)
- [Configuration](https://open-mqtt-bridges.github.io/philips-hue/configuration)
- [Authentication](https://open-mqtt-bridges.github.io/philips-hue/authentication)
- [MQTT contract](https://open-mqtt-bridges.github.io/philips-hue/mqtt)
- [Docker deployment](https://open-mqtt-bridges.github.io/philips-hue/deployment)
- [WLED MQTT Bridge for WLED controllers](https://open-mqtt-bridges.github.io/wled/)

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. Node-based application runtimes require Node.js 26. Builds use TypeScript 7; ESLint and compiler-API consumers use the TypeScript 6 compatibility package. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

## Contributing

See the [development guide](docs/development.md) for the pinned toolchain, checks and Spec Kit usage, and the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) for pull requests.
