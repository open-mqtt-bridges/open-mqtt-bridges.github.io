# Feature Specification: Remediate dependency alerts

**Feature Branch**: `24-remediate-remaining-dependency-alerts`

**Created**: 2026-11-23

**Status**: Draft

## User Scenarios & Testing

### User Story 1 — Keep active bridges secure and compatible (P1)

As a bridge operator, I want the known vulnerable dependencies removed from Ping and Display without changing how I configure or use the integrations.

**Independent test**: Inspect each resolved dependency graph and run the owning bridge's validation.

- Ping still supports its existing MQTT transports, certificate trust settings, and MQTT output.
- Display still interprets its configuration and controls supported displays as before.
- If no compatible fix verifies, report the remaining advisory and blocker rather than dismissing it.

### User Story 2 — Preserve a buildable IDM archive (P2)

As a maintainer, I want the archived IDM project to remain buildable without the flagged dependency versions.

**Independent test**: Install from the committed archive lockfile in a clean checkout and build the bundle.

- The archive remains inactive; source history, configuration, and release status do not change.
- If a bot PR already fixes an advisory, verify it and do not duplicate its change.

## Requirements

- **FR-001**: Address the remaining dependency alerts in Ping, Display, and archived IDM; do not dismiss alerts to meet the target.
- **FR-002**: Preserve MQTT, certificate verification, configuration, and hardware behavior. Do not publish or release bridge artifacts.
- **FR-003**: Record what was fixed, what was verified, and any remaining blockers.

## Success Criteria

- **SC-001**: No in-scope vulnerable versions remain in the reviewed dependency graphs; any exception is reported explicitly as incomplete.
- **SC-002**: Clean IDM install and bundle, and both affected bridge validation suites, pass without disabling checks.
- **SC-003**: GitHub confirms the associated alerts are fixed on the default branch after processing the merged changes, or a temporary scan delay is reported.
