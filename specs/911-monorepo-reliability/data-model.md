# Design Entities: Monorepo Reliability and Delivery

No database or persistent service is introduced. CI records are configuration or workflow evidence; runtime health lives in memory.

- **Bridge check assignment**: One row per active catalog `slug` with the owning check class and one or more CI jobs. Reject missing, duplicate, and unknown assignments. Release eligibility is a separate property, not inferred from check membership.
- **Bridge health snapshot**: Liveness, broker/session state, required subscriptions, and optional bridge-specific readiness reasons. Transitions: starting → ready → degraded on disconnect → ready after recovery. Credential values, device inventories, and identifying topic data are not health output.
- **Command handling outcome**: Accepted, rejected input, or runtime failure. Rejected input stays local to the message; runtime failures retain the bridge's existing reporting and recovery rules.
- **Release candidate**: Bridge slug, reviewed commit/tag and manifest version, configured publisher, tested image ID, archive checksum, and smoke result. State advances from built to tested to eligible only when smoke and policy gates succeed; no candidate rebuild between testing and publication.
- **Alias observation**: Publisher ref, digest, observed version evidence, and move decision. Immutable entries are never replaced. A mutable alias can stay put or advance; unknown provenance blocks the affected release.
- **Distribution observation**: Bridge slug, install reference, distinct publisher reference, anonymous resolution, observed digest when available, verification timestamp, and handoff state. Ping has no publisher. A failed or blocked lookup does not authorize a URL change.
