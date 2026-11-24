# Implementation Plan: Recover WLED Availability

**Branch**: `48-availability-remains-staleoffline-when-consumers-miss-the-one-shot-connected-publication` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: [Issue #48](https://github.com/open-mqtt-bridges/wled/issues/48)

## Summary

Keep immediate availability transitions and replay each enabled controller's current `true` or `false` every 30 seconds using the existing bridge loop. Skip availability publishes while MQTT is disconnected, without deferring old values. A late subscriber or reconnecting consumer can recover on the next refresh without disturbing the WLED connection.

## Technical Context

**Language/Version**: TypeScript; Node.js `>=26.13.0 <27`; pnpm `11.28.9`.
**Primary Dependencies**: Existing NestJS, MQTT.js, `ws`, and Axios.
**Storage**: In-memory per-device state; no broker persistence or consumer cache changes.
**Testing**: Jest unit tests; required separate broker-backed CI check using disposable Mosquitto, a loopback WLED fixture, and a separate subscriber. Preserve the regular Jest coverage gate.
**Target Platform**: Existing Linux/container deployment.
**Project Type**: NestJS network bridge.
**Performance Goals**: One scheduled availability message per enabled device per 30 seconds while MQTT is up, plus existing transitions. Validate convergence within 35 seconds under healthy test conditions.
**Constraints**: No device polling, reconnect hooks, new runtime timers, production access, topic/payload changes, or global MQTT queue changes.
**Scale/Scope**: Only availability timing and offline handling change; existing command, telemetry, configuration, and health behavior remain intact.

## Constitution Check

- **Compatibility — pass before and after design**: [MQTT contract](contracts/mqtt-availability.md) specifies the additive message cadence and unchanged wire shape. Update `docs/mqtt.md`; no consumer migration required for clients that handle duplicate status messages.
- **Scoped ownership — pass**: Reuse the bridge lifecycle and MQTT adapter; no new runtime dependency or toolchain change.
- **Credential protection — pass**: Use disposable loopback fixtures and synthetic settings only.
- **Documentation and accessibility — pass**: Document the MQTT behavior and its limits in en-US at the owning boundary; no UI impact.
- **Verified delivery — pass for design**: Plan unit and real-subscriber checks plus the existing CI gates. Implementation evidence remains pending; no automatic merge, release, or deployment.

## Project Structure

### Documentation (this feature)

```text
specs/902-recover-wled-availability/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/mqtt-availability.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/wled/index.ts
├── lib/wled/index.spec.ts
├── modules/bridge.service.ts         # Existing shared tick; no runtime change expected
└── modules/mqtt/
    ├── mqtt.service.ts
    └── mqtt.service.spec.ts
docs/mqtt.md
test/availability.integration.ts      # Separate process-level regression
package.json                          # Separate test:availability command
.github/workflows/ci.yml              # Run broker-backed regression after build
```

**Structure Decision**: `Wled` owns the current availability and cadence. `MqttService` owns a connected-only availability publish path. Keep the separate process-level regression under `test/`, outside Jest's `src/` coverage inputs.

## Design

1. Route startup, state transitions, refresh, and orderly shutdown through the same availability publishing path. Keep WLED state updates independent from MQTT connection state.
2. Use the existing one-second `BridgeService` tick. Measure cadence from the last connected publish attempt, not from a skipped tick; use the latest state on every attempt. No catch-up burst. Keep replay inactive before setup and after destruction.
3. Guard only availability at the adapter boundary using the existing MQTT client's `connected` state. Do not enqueue offline availability transitions or repeats. Preserve the existing scalar serialization, non-retained QoS 0, and publish error handling.
4. Prove the failure against the baseline, then validate late subscription, stale cache replacement, broker restart on an uninterrupted WLED socket, latest offline state after an outage, no broker-stored availability after bridge failure, and unchanged command behavior. Follow [quickstart.md](quickstart.md).
