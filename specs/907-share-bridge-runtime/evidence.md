# Verification

- Clean source export: frozen installation, lint, types, ncc build and tests in each of the six consumers. Home Connect: 44 tests; Philips Hue: 12; Landroid: 14; Roborock: 31 (including the optional test rerun with a local Mosquitto broker); WLED: 43; PocketBase: 51. PocketBase and WLED passed their unchanged coverage thresholds.
- WLED's separate broker availability suite passed, including broker restart, late subscribers and non-retained commands. Roborock's permission-sensitive map test used the CI-style umask `0022`.
- Built all six images using the additional `bridge-libs` context and frozen bridge lockfiles. Ran each as its default non-root user with its packaged example; each returned healthy. Five returned the manifest version; PocketBase's existing endpoint returns only status. PocketBase Compose resolves the additional context.
- The clean root workspace passed frozen install, lint, typecheck, formatting, 12 tests, static build and link checks on 89 guide pages. CI routing covers both libraries and all six consumers alongside a directly changed Rust bridge. Release tags and registry mappings were not changed. No publishing or versioning commands were run.
