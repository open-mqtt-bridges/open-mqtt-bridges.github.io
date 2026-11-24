# Feature Specification: Monorepo Reliability and Delivery

**Feature Branch**: `71-monorepo-reliability-and-delivery`

**Created**: 2026-11-24

**Status**: Draft

**Input**: Plan all ten findings from the monorepo audit at `9d3b192`.

## User Scenarios & Testing

### User Story 1 - Keep bridges working through routine failures (P1)

As a bridge operator, I want invalid input or a temporary broker outage not to require a manual restart, and I want a status check that distinguishes a running process from a usable bridge.

**Why this priority**: A running or apparently healthy bridge can otherwise stop processing commands.

**Independent test**: Use local, synthetic integrations without vendor credentials or physical devices.

1. Given running Modbus, when an invalid command is rejected, then the process stays alive and a subsequent valid command is processed.
2. Given connected Display, when the broker loses its session and returns, then Display resumes receiving commands without a process restart.
3. Given a running bridge with a disconnected broker, when health is queried, then liveness remains positive and readiness reports the outage; readiness recovers after required connections or subscriptions are restored.

### User Story 2 - Trust merges, releases, and installation instructions (P1)

As a maintainer, I want checks that cannot silently skip a bridge and release evidence for the artifact users actually install.

**Why this priority**: A successful build or workflow does not by itself prove merge protection, artifact behavior, or public pull access.

**Independent test**: Use configuration fixtures, a non-publishing release rehearsal, and clean unauthenticated reads of public installation references.

1. Given a new active bridge without a check assignment, when repository checks run, then they fail instead of silently skipping it.
2. Given a candidate that cannot start or reports the wrong version, when release verification runs, then it cannot proceed to publication; an older release cannot move a newer alias backward.
3. Given documented image references, when an operator validates them from a clean client, then each intended public reference resolves without credentials or is explicitly recorded as a blocker.
4. Given a proposed change to `main`, then the approved repository policy requires a pull request and the designated checks on that change.

### User Story 3 - Make local and public behavior repeatable (P2)

As a contributor or visitor, I want predictable file permissions, a minimally privileged runtime, and browser checks for core website behavior.

**Why this priority**: CI needs to catch environment-dependent failures and browser-only regressions before release.

**Independent test**: Run permission cases in isolated processes, run the built AdGuard image with representative mounts, and exercise the static website with and without scripts.

1. Given a restrictive process file-creation mask, when Roborock creates or replaces a map, then the file is not made more permissive than the mask allows.
2. Given AdGuard's documented mounts, when the packaged bridge starts, then it runs without root and its TLS tests still pass.
3. Given a 320 px viewport, when a visitor searches, gets no results, or clears the query, then the display and keyboard focus behave correctly without horizontal scrolling; all cards and their links remain available without scripts.

### Edge Cases

- Repeated reconnects, failed subscription restoration, or a full outbound queue must not strand Display or block broker polling.
- Existing health consumers must continue working after readiness is introduced. Broker failure must not masquerade as process death.
- A missing, inaccessible, or unverified registry reference is not evidence of a completed handoff. A partly published release must not overwrite its immutable artifact on retry.
- Existing public links, topics, payloads, retention rules, configuration keys, image identifiers, and archive filenames are compatibility constraints.

## Requirements

### Functional Requirements

- **FR-001**: Modbus MUST isolate input rejection from runtime failure and continue handling subsequent valid commands.
- **FR-002**: Display MUST restore its command subscription after broker session loss.
- **FR-003**: The project MUST define reviewable merge protection for `main` and verify the effective rules after separate administrator approval.
- **FR-004**: Releases MUST test the exact artifact intended for publication, reject backward alias moves, and preserve immutable versions and existing artifacts.
- **FR-005**: Each active bridge MUST have documented health observation appropriate to its runtime. Where HTTP exists, provide separate readiness without changing the existing liveness contract; cover broker outage and recovery.
- **FR-006**: The project MUST identify each bridge's installation image and publishing target independently, verify intended public access, and preserve existing references until an approved replacement is verified. Ping remains build-only unless separately approved.
- **FR-007**: Roborock MUST respect restrictive process file-creation masks and validate both ordinary and restrictive permissions on new and replaced maps.
- **FR-008**: The AdGuard container MUST run as non-root on an explicitly selected runtime base and retain existing transport and mount behavior.
- **FR-009**: CI MUST reject missing or unknown validation assignments for active bridges.
- **FR-010**: Website CI MUST exercise search, keyboard focus, narrow-screen layout, and script-free browsing against generated output.

### Key Entities

- **Bridge validation record**: Active bridge, owning checks, health evidence, and any blocked verification.
- **Release candidate**: Reviewed revision, version, artifact identity, smoke results, and proposed channel aliases.
- **Distribution record**: Documented install reference, publisher target, access expectations, observed results, and handoff approval state.

## Success Criteria

- **SC-001**: Modbus processes a valid command after rejecting an invalid command; Display processes a command after a broker restart; neither process requires a manual restart.
- **SC-002**: All ten active bridges map to checks, and missing mappings fail validation. Designated checks are required on `main` once operator work is approved and applied.
- **SC-003**: Every supported publisher has a non-publishing rehearsal path with artifact-level evidence. A failed smoke test or backward alias request cannot update the affected release channel.
- **SC-004**: All documented public image references are verified or listed with a concrete blocker and owner action. Existing working references are not changed without evidence and approval.
- **SC-005**: Roborock passes both permission environments; AdGuard passes non-root startup and transport checks; the website passes the scripted and script-free browser scenarios.
- **SC-006**: Health verification distinguishes a running process from broker readiness during startup, connection loss, and recovery, while existing health consumers retain their contract.

## Assumptions

- The ten audit findings are the complete feature scope. No general refactor, dependency upgrade program, or workspace migration is included.
- Preserve existing site behavior and bridge wire contracts; additive readiness is permitted. Do not expand AdGuard's or Display's external port surface solely for monitoring.
- Repository and registry setting changes, handoffs, real publication, and deployment require separate authorization. Planning and code review may produce runbooks and fixture evidence without executing those operations.
