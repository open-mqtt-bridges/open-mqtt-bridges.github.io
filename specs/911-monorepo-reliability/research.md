# Research: Monorepo Reliability and Delivery

## Bridge command processing

- **Decision**: Contain per-message Modbus decoding errors. Restore Display subscriptions at broker session establishment with bounded queue handling.
- **Rationale**: Modbus propagates decoding failure from the MQTT driver; its command channel then closes. Display currently enqueues its subscription before polling and uses the MQTT client's default clean sessions, so broker state is not retained. Modbus already has an example of draining subscription requests without blocking the poller.
- **Alternatives considered**: Generic process restarts hide the underlying failure. Making Display sessions persistent changes deployment semantics and still does not address broker state loss.

## Health and local permissions

- **Decision**: Preserve existing liveness endpoints and process file-creation masks. Add readiness from observed runtime state. Give AdGuard a pinned, non-root runtime with explicit mount behavior.
- **Rationale**: Ping already distinguishes liveness from readiness. TCP reachability or successful HTTP alone does not prove authenticated broker connection. The Roborock permission test passed with `0022` and failed with `0077`, consistent with Node applying the process mask.
- **Alternatives considered**: Changing `/health` would break consumers. Probing every device would conflate bridge health with monitored device availability. A post-write `chmod` would undo an operator security policy.

## CI and repository policy

- **Decision**: Require validated catalog-to-job coverage in CI, then use verified stable status contexts for branch enforcement. Treat rule application as independently approved.
- **Rationale**: The audit observed both a successful aggregate and the absence of active rules on `main`. The selector lists changed bridge folders but fixed workflow routing has no complete inventory assertion.
- **Alternatives considered**: Running every bridge on every PR would not prove that the hard-coded inventory contains future bridges. Requiring every matrix job would make skipped or renamed jobs fragile for branch protection.

## Release and registry

- **Decision**: Test the locally loaded Buildx candidate, verify identity across the artifact handoff, and fail closed if a mutable alias would regress or its state cannot be proven. Keep public installation and publication targets distinct until evidence supports a handoff.
- **Rationale**: The release workflow already builds and saves one image, but does not start it. Keep the new harness outside the tagged checkout so old tags are still testable. Compare each actual alias target with the proposed SemVer, not the highest Git tag or the registry timestamp; distinguish a confirmed absent alias from a failed lookup. Workflow serialization cannot enforce exclusivity against external writers. The operator runbook already forbids rewriting immutable versions after partial publication. Public WLED and Home Connect legacy `latest` resolved anonymously in the audit; the corresponding organizational token requests returned `401`. That does not prove the organizational packages are absent or determine access for other clients.
- **Alternatives considered**: Rebuilding after testing does not prove artifact identity. Publishing a registry test tag still mutates package state. Replacing image URLs based only on the publisher allowlist can break public installation.

## Website verification

- **Decision**: Test production static output in a small Chromium suite under Playwright. Retain the existing SSR and guide checks.
- **Rationale**: The audit's Chromium smoke covered hydration, 320 px width, focus restoration, and script-free output. A generated-site fixture exercises the same boundary as Pages, unlike a component-only test.
- **Alternatives considered**: A live-site PR gate cannot verify the candidate being reviewed. End-to-end runs in several browser engines are not required by this audit; add them only if support evidence warrants it.
