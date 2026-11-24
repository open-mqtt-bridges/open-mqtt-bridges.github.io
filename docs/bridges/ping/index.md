---
layout: home
hero:
  name: Ping MQTT Bridge
  text: IPv4 reachability over MQTT
  tagline: Probe known devices on Linux and publish their reachability and round-trip latency to your MQTT broker.
  image:
    src: /logo.svg
    alt: Ping MQTT Bridge logo
  actions:
    - theme: brand
      text: Get started
      link: ./getting-started
    - theme: alt
      text: MQTT contract
      link: ./mqtt
    - theme: alt
      text: GitHub
      link: https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/tree/main/bridges/ping
features:
  - icon: 📡
    title: ICMP echo probes
    details: Monitor a configured list of IPv4 devices at a fixed interval with bounded concurrency.
  - icon: 🔌
    title: Legacy MQTT compatibility
    details: Keep existing topic names, device IDs, and reachability and latency payloads.
  - icon: 🔒
    title: Unprivileged Linux runtime
    details: Run without container capabilities using Linux ICMP datagram sockets.
---

The bridge does not discover devices, probe IPv6 addresses, or receive MQTT
commands. Start with the [Docker Compose quickstart](./getting-started.md) or
review [how to migrate a legacy deployment](./operations.md#legacy-cutover-and-rollback).
