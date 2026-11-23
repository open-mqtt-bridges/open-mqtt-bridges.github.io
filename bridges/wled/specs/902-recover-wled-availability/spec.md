# Feature Specification: Recover WLED Availability

**Feature Branch**: `48-availability-remains-staleoffline-when-consumers-miss-the-one-shot-connected-publication`

**Created**: 2026-11-18

**Status**: Draft

**Input**: [Issue #48](https://github.com/open-mqtt-bridges/wled/issues/48)

## User Scenarios & Testing

### User Story 1 - Correct availability after late startup (Priority: P1)

As a dashboard operator, I want reachable controllers to appear online after the dashboard's subscriber starts, even if it missed their original online announcement.

**Why this priority**: A healthy controller can otherwise remain falsely offline indefinitely after a stack restart.

**Independent Test**: Start the bridge with a reachable controller, wait for it to report online, then subscribe with an empty cache and with a separate cache preloaded as offline.

**Acceptance Scenarios**:

1. **Given** a connected controller, **when** a fresh consumer subscribes after the online announcement, **then** it receives the current online status without a controller or bridge restart.
2. **Given** a consumer cache contains offline, **when** the consumer re-subscribes while the controller remains connected, **then** it receives online and can replace the cached value.

### User Story 2 - Recover after a broker outage (Priority: P1)

As an operator, I want current availability to resume when messaging recovers, even if no controller connection changed.

**Why this priority**: Broker recovery must not depend on disrupting a healthy controller.

**Independent Test**: Interrupt and restore the broker without interrupting the bridge-to-controller connection. Re-subscribe with an offline cache.

**Acceptance Scenarios**:

1. **Given** a controller remains connected throughout the broker outage, **when** the bridge and consumer reconnect and the consumer's subscription is active, **then** the consumer receives the controller's online status within the recovery window.
2. **Given** a controller disconnected while the broker was unavailable, **when** both sides reconnect to messaging, **then** the consumer receives the controller's current offline status rather than an outdated online announcement from the outage.

### Edge Cases

- Controllers that have not connected yet report offline. Disabled instances do not announce availability.
- A late subscriber to a live bridge can be corrected from stale online to offline as well as from offline to online.
- An abrupt bridge exit must not leave a new subscriber receiving a broker-stored online assertion from this bridge. This feature does not expire values in an already populated consumer cache while the bridge is down.

## Requirements

### Functional Requirements

- **FR-001**: Enabled controllers MUST publish current availability to active subscribers after late subscription or messaging reconnection, without needing a controller state transition.
- **FR-002**: A replay MUST represent the latest observed controller connection state, independently per controller. Preserve prompt announcements of connection transitions when messaging is available.
- **FR-003**: Preserve existing topic names, `true`/`false` availability payloads, non-retained availability and commands, and the empty command-clear payload.
- **FR-004**: Availability recovery MUST NOT replay commands, re-fetch device state, or reconnect the device solely to regenerate availability.
- **FR-005**: Regression coverage MUST exercise actual broker delivery to a late subscriber and recovery across a broker restart, including a consumer with a previously cached `false`.

### Key Entities

- **Controller availability**: Per-enabled-controller online or offline status reported by the bridge.
- **Consumer cache entry**: Last availability value observed by a consumer for one controller; it can outlive the consumer's subscription.

## Success Criteria

### Measurable Outcomes

- **SC-001**: In a healthy local validation environment, a late subscriber with an empty or offline cache sees a connected controller as online within 35 seconds after its subscription is active.
- **SC-002**: After a broker restart, the consumer cache converges to current status within 35 seconds of both sides being ready, with no additional controller connection in the online scenario.
- **SC-003**: A new subscriber receives no stored online availability after an abrupt bridge exit, and command topic, payload, and retention behavior match the baseline.

## Assumptions

- The recovery bound is a planning default, not a guarantee during broker failure, delivery loss, or process stalls. Subscribers process duplicate availability values idempotently.
- The bridge reports its existing view of the device connection, including its current disconnect detection delay. Network/device repair, consumer cache expiry, and changes to unrelated topics are out of scope.
