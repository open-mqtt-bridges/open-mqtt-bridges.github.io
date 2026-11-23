# Home Connect MQTT Bridge

[![CI](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/homeconnect/ci.yml?style=for-the-badge&label=CI)](https://github.com/open-mqtt-bridges/homeconnect/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/homeconnect/docs.yml?style=for-the-badge&label=Docs)](https://github.com/open-mqtt-bridges/homeconnect/actions/workflows/docs.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/homeconnect/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/open-mqtt-bridges/homeconnect/actions/workflows/deploy.yml)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-tobiaswaelde-FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/tobiaswaelde)

NestJS bridge between Home Connect appliances and MQTT. Full documentation: [open-mqtt-bridges.github.io/homeconnect](https://open-mqtt-bridges.github.io/homeconnect/).

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
  clientId: homeconnect-mqtt-bridge
  username: mqtt-user
  password: change-me
instances:
  - id: kitchen
    topic: home/home-connect/kitchen
    clientId: your-client-id
    clientSecret: your-client-secret
    redirectUri: https://bridge.example.net/home-connect/callback
    updateInterval: 600000
```

`mqtt.clientId` may be empty; the bridge then generates a UUID for the running process.

Example command:

```bash
mosquitto_pub -h mqtt.example.net -t 'home/home-connect/kitchen/appliances/BOSCH-HA-ID/commands/programs-active/set/json' -m '{"key":"ConsumerProducts.CoffeeMaker.Program.Beverage.Espresso"}'
```

Available programs are published retained below each appliance at `programs/available/json`. Stop an active program by publishing `{}` to `commands/programs-active-stop/set/json`.

Discover `BOSCH-HA-ID` after authentication with:

```bash
mosquitto_sub -h mqtt.example.net -t 'home/home-connect/kitchen/bridge/appliances/json' -C 1
```

## Documentation

- [Documentation home](https://open-mqtt-bridges.github.io/homeconnect/)
- [Configuration](https://open-mqtt-bridges.github.io/homeconnect/configuration)
- [Authentication](https://open-mqtt-bridges.github.io/homeconnect/authentication)
- [MQTT contract](https://open-mqtt-bridges.github.io/homeconnect/mqtt)
- [Docker deployment](https://open-mqtt-bridges.github.io/homeconnect/deployment)
- [WLED MQTT Bridge for local LED controllers](https://open-mqtt-bridges.github.io/wled/)

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. Node-based application runtimes require Node.js 26. Builds use TypeScript 7; ESLint and compiler-API consumers use the TypeScript 6 compatibility package. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

## Contributing

See the [development guide](docs/development.md) for the pinned toolchain, checks and Spec Kit usage, and the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) for pull requests.
