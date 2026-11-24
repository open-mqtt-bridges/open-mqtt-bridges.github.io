# Shared bridge runtime

A contributor should be able to fix a config loader or change the internal MQTT connection setup once and exercise every affected bridge. An operator upgrading a bridge should not need to edit its configuration or reconfigure subscribers.

- Six Nest bridges consume shared file loading and connection construction from private libraries under `libs/`. Start with Home Connect and Philips Hue; complete Landroid, Roborock, WLED and PocketBase after the pilot builds.
- Existing precedence, accepted/rejected input, defaults, generated vs explicit client IDs, broker settings, lifecycle, topic contracts and container entry points stay compatible. Keep integration-specific schemas, subscriptions, health, availability and event handlers in each bridge.
- A fresh checkout can build and test each consumer with its pinned toolchain and build a self-contained image. CI checks all consumers on shared changes without triggering a release. Independent version streams remain intact.
- Record the decision for every bridge. Do not force the env-only AdGuard Home bridge or the three Rust bridges into a JavaScript/YAML contract.
