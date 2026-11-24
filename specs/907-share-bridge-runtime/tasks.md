# Tasks: shared bridge runtime

- [x] T001 Capture existing config and broker behavior; implement private `libs/config` and `libs/mqtt` with focused contract tests and usage docs. Prove package resolution with the pilot toolchain before changing production consumers.
- [x] T002 Adopt both packages in Home Connect and Philips Hue; include owning lockfiles, Docker contexts for local/CI/release builds and consumer-aware CI selection with tests. Verify both bridges' bundles and containers.
- [x] T003 Extend adoption to Landroid, Roborock and WLED with their existing runtime schemas and service lifecycles. Exercise bridge suites and WLED availability. Include the corresponding container and CI wiring in this increment.
- [x] T004 Adopt both packages in PocketBase with its existing environment-to-broker mapping and collection-specific YAML schema. Preserve its pinned pnpm version and coverage gate. Verify its bundle and container.
- [ ] T005 Verify all six consumers, unaffected CI routing, independent release selection and contributor build instructions from clean inputs; record evidence and generate the applicable bridge-owned release metadata.

Run in order. Each completed task has its own reviewed diff, validation and commit. Publishing and changes to AdGuard Home or Rust runtime behavior are out of scope.
