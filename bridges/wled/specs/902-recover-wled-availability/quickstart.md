# Quickstart: Validate Availability Recovery

This guide describes the automated broker-backed regression. Do not run these tests against production devices or brokers.

## Prerequisites and commands

Use Node.js 26.13.0, the repository's pinned pnpm 11.28.9, and a working Docker daemon. Run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:availability
pnpm docs:build
```

CI runs `test:availability` after `pnpm build`. The test starts a version-pinned, disposable Mosquitto container with persistence disabled on an OS-selected loopback port held fixed across restarts. It serves `/json` and `/ws` from a local HTTP/WebSocket fixture and runs the built bridge with a temporary `CONFIG_FILE` and synthetic topics. It uses clean MQTT subscribers with SUBACK barriers and cleans up clients, fixture sockets, bridge, broker, and temporary configuration.

## Expected results

1. **Late consumer, stale cache:** Observe the first live `true` from an early subscriber. Only then open a clean subscriber with an empty cache and another with a cache initialized to `false`. With no further WLED frames or state transitions, both receive non-retained `true` and update their caches within 35 seconds of subscription. This must fail on the one-shot baseline.
2. **Broker restart:** Stop the broker and confirm MQTT disconnects. Restart it on the same port, confirm bridge MQTT readiness and the subscriber's new SUBACK, then expect live `true` within 35 seconds. Assert that the original WLED socket remains open, there was only one accepted WLED connection, and `/json` was fetched just once.
3. **State changes during outage:** In a separate case, take the WLED fixture offline while MQTT is down. Upon broker recovery, require the first availability received to be `false`, not an obsolete queued `true`. Unit tests exercise several missed ticks and multiple transitions without real-time waits.
4. **No retained online assertion:** After live `true` is observed, abruptly stop the bridge with the broker still running. A fresh subscription must not receive a stored `true`. Register the packet listener before subscribing and use a bounded observation synchronized by a broker round trip.
5. **Command compatibility:** While the bridge is running, send one non-retained fixture command; observe one WebSocket command and the empty MQTT clear, then verify a fresh `/cmd` subscription receives no retained command or clear.

Use event barriers and bounded waits for broker checks, and an injected clock or fake timers for unit cadence checks. Compare wire observations with the [MQTT contract](contracts/mqtt-availability.md); confirm cleanup does not rely on Jest `--forceExit`.
