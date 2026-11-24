# Consolidate bridge metadata and standardize Node tooling

## User scenarios and requirements

1. **Contributors (P1):** Moving the ten bridge ignore files to the repository root must leave every existing ignore rule effective in exactly its former scope, including exceptions. A local credential remains hidden; a shareable example remains visible where it was visible before.
2. **Distributors (P1):** Six bridges with byte-identical MIT notices use the repository license as their source of truth. Links from each bridge must still identify its license. All other first- and third-party notices and their distribution paths remain intact.
3. **AdGuard Home maintainers (P1):** Install, develop, test, bundle, and build the image using pnpm instead of Yarn. Preserve dependency constraints, security overrides, build cleanup, and runtime behavior.
4. **Guide maintainers (P1):** Install, preview, and build all documentation using pnpm instead of npm. Published routes, diagrams, and guide assets remain usable.

## Acceptance

- No bridge-top-level `.gitignore`, redundant license among the six, tracked `yarn.lock`, or tracked `package-lock.json` remains.
- Positive and negative Git ignore probes agree with their pre-change results in every bridge and in unrelated directories.
- Current instructions and CI produce reproducible builds with frozen pnpm installs. Rust stays on Cargo; existing bridge-specific pnpm pins and update ownership remain intact.
- All six replacement license links resolve to identical bytes. No existing distributed notice disappears. No public MQTT, configuration, release naming, or deployment behavior changes.

Historical verification reports, archived specs, dependency metadata, downloaded packages, and upstream vendored content are not active contributor instructions.
