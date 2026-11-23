# PocketBase MQTT Bridge

[![CI](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/pocketbase/ci.yml?style=for-the-badge&label=CI)](https://github.com/open-mqtt-bridges/pocketbase/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/pocketbase/docs.yml?style=for-the-badge&label=Docs)](https://github.com/open-mqtt-bridges/pocketbase/actions/workflows/docs.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/pocketbase/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/open-mqtt-bridges/pocketbase/actions/workflows/deploy.yml)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-tobiaswaelde-FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/tobiaswaelde)

Publish selected PocketBase collections to MQTT as non-retained events, a retained latest record, or retained state per record. Full documentation is published at [open-mqtt-bridges.github.io/pocketbase](https://open-mqtt-bridges.github.io/pocketbase/).

## Quick start

```bash
cp .env.example .env
cp config/config.example.yml config/config.yml
docker compose up -d
```

The included Beszel configuration publishes current systems, system details, and containers as retained records. It also publishes the newest `system_stats` and `container_stats` one-minute sample per system without retaining historical samples.

## Documentation

- [Getting started](https://open-mqtt-bridges.github.io/pocketbase/getting-started)
- [Configuration](https://open-mqtt-bridges.github.io/pocketbase/configuration)
- [MQTT contract](https://open-mqtt-bridges.github.io/pocketbase/mqtt)
- [Beszel](https://open-mqtt-bridges.github.io/pocketbase/beszel)
- [Docker deployment](https://open-mqtt-bridges.github.io/pocketbase/deployment)
- [Changelog](CHANGELOG.md)

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. Node-based application runtimes require Node.js 26. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

## Contributing

See the [development guide](docs/development.md) for the pinned toolchain, checks and Spec Kit usage, and the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) for pull requests.
