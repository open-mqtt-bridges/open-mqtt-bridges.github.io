# Development

## Toolchain and checks

The manifest, owning lockfile and existing CI define the toolchain. Use `pnpm@11.28.9` where applicable. Preserve the established formatter/linter configuration; do not edit generated or vendored code. Run these commands from `bridges/wled/`:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Document changed public behavior and declaration contracts at their owning boundary, including inputs, outputs, errors and side effects where they are not obvious. Existing lint/type checks do not prove documentation coverage. Keep imports, comments and intentional formatting conventions intact; scope fixes to the task.

## Spec Kit

Use the [monorepo development guide](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/blob/main/docs/development.md) for the active Spec Kit installation and feature selection.

## Contributions and security

Follow the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) and any local security policy. Never commit `.env`, runtime configuration, tokens or sessions. Use documented example placeholders. Preserve MQTT topics, payloads, command retention and existing deployment identifiers. A dependency upgrade, release, merge or deployment is a separate action from a Spec Kit step.

## Container health version

The container build derives version.env from package.json and Node loads it at startup. The /health version therefore matches the released package even when the image starts without a package manager. An explicit npm_package_version environment value retains precedence. CI compares the container HTTP health response against the manifest version.
