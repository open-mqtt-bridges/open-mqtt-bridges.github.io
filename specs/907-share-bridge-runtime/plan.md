# Plan: share bridge runtime

Base: `main`, `4486bba`. See [findings](research.md) and [compatibility checks](quickstart.md).

1. Capture baseline behavior with the existing config and MQTT suites. Add two private packages, `libs/config` and `libs/mqtt`, and wire Home Connect and Philips Hue as the first consumers. No framework dependency: the connection factory returns the MQTT.js client; bridge-owned services register their own listeners.
2. Use package dependencies rather than source imports that escape `src/`. Prefer local `file:../../libs/...` dependencies with a package entry usable by Node, Jest and ncc, and peer dependencies matching the consumer's YAML/Zod/MQTT versions. Preserve separate pinned lockfiles, including PocketBase's distinct pnpm major. Confirm clean installs do not depend on the root `node_modules`. Do not add a public registry publish step.
3. Make the libs available to Docker without enlarging runtime images: use a named build context containing only `libs/`, reproduce the consumer-to-libs path in the build stage, and keep final stages copying their compiled bundle. Wire CI, release, documented local builds and Compose consumers wherever they build from source. Changes to a library must select its consumers for CI, not for publication.
4. Move the remaining four Nest consumers in small groups, reusing the loader where applicable and mapping PocketBase's env-sourced MQTT settings explicitly. Run the existing per-bridge suites and container checks. Keep device logic and externally visible configuration local.
5. Document library APIs, ownership and how to add a consumer. Existing package identifiers, licensing notices and release policy remain in force; check license compatibility before moving code. Use per-owner release metadata. No cross-language adapter or forced lockfile migration.

Constitution check: internal extraction only; no external contract, publisher, TLS policy or toolchain changes. Back out a consumer together with its manifest, lockfile and build configuration if its compatibility checks fail.
