# Verification

1. Run config and MQTT service tests before the extraction. Compare fixture inputs for environment vs CLI precedence, defaults, missing files, malformed YAML, schema violations and valid examples. Capture the MQTT.js options with a test double, including explicit and generated IDs.
2. From a clean checkout, use each affected bridge's pinned pnpm and frozen lockfile. Run lint, typecheck, production bundle and tests; include PocketBase coverage and WLED availability. Test the new packages' public entry points independently.
3. Build the CI/release-equivalent images with shared libraries present only in the build context. Start the compiled containers with their example configuration and check health and version. Exercise the documented Compose/build path.
4. Verify changes to `libs/` select all intended consumers while a single bridge change still selects only its owner. Release selection must remain tag-driven. Do not publish any packages or images to validate this feature.
