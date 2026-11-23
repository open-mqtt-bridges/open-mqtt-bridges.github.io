# Implementation Plan: Remediate dependency alerts

**Base**: `main` at `946b43b`; branch `24-remediate-remaining-dependency-alerts` ([#24](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/issues/24))

**Spec**: [spec.md](spec.md) · **Date**: 2026-11-23

## Summary and technical context

Use the root repository's current Dependabot PRs first. Ship the remaining defense-only changes in three independently verified increments, with each project retaining its own lockfile and supported toolchain.

1. `bridges/ping`: remove `rustls-webpki 0.102.8` from the resolution while retaining the custom rustls client configuration. Prefer a compatible upstream release; if none exists, evaluate a minimal, reviewable `rumqttc` patch that uses the already resolved safe 0.103 series. Keep the pinned Rust toolchain and TLS features.
2. `bridges/display`: eliminate `serde_yaml 0.7.5` without changing the Display bridge's configuration parser or DDC behavior. Prefer a compatible upstream chain; otherwise evaluate a minimal `mccs-db 0.1.3` patch to use safe YAML parsing of its bundled data. Preserve the existing `nom` patch.
3. `archive/idm-energy`: keep Yarn Classic. Prefer published compatible parent updates and scoped in-range lockfile updates. If still needed after bot merges, use `rimraf 6.1.4` to resolve `glob 14` and `minimatch 11.0.1+` without a cross-major resolution override. Update remaining flagged `minimatch 3` and `picomatch 2` entries as applicable.

## Constitution check

No public contract, storage, deployment, or hardware change. A third-party patch is a fallback, not an assumed edit: document upstream source, license, exact delta, and removal condition; do not switch trust sources or ship an unverified patch. Preserve certificate verification and package identifiers. Each increment must pass the relevant [validation](quickstart.md); failed candidates are not merged.

## Project structure and design artifacts

- Implementation: `bridges/ping/`, `bridges/display/`, `archive/idm-energy/` only, plus scoped evidence.
- [Research](research.md), [validation quickstart](quickstart.md), [compatibility contract](contracts/compatibility.md).
- No application data model changes. Dependency resolutions and alert evidence are tracked in their existing lockfiles and GitHub, not a new schema.
