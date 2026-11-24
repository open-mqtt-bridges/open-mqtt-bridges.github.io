# Development

## Toolchain and checks

The manifest, owning lockfile and existing CI define the toolchain. Use the pinned `pnpm@11.28.9`. Preserve the established formatter/linter configuration; do not edit generated or vendored code. Run these commands from `bridges/adguardhome/`:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm bundle`

`pnpm dev` uses nodemon and tsx to execute TypeScript without the removed TypeScript compiler JavaScript API. Run `pnpm build` for compiler diagnostics; tsx does not type-check. The test gate also exercises the configured development runner on an isolated typed fixture.

`pnpm test` builds the service and runs Node's transport regression tests. OpenSSL must be available on the development machine; the Docker build stage installs it. Tests generate temporary CA/server certificates and private keys, start loopback-only MQTT servers, and load the actual compiled service in isolated child processes with synthetic credentials. They verify rejection of untrusted issuers and hostname mismatches, explicit private-CA trust, and plain MQTT connectivity. No certificate/private-key fixtures or real `.env` files are used.

Document changed public behavior and declaration contracts at their owning boundary, including inputs, outputs, errors and side effects where they are not obvious. Existing lint/type checks do not prove documentation coverage. Keep imports, comments and intentional formatting conventions intact; scope fixes to the task.

## Spec Kit

Use the [monorepo development guide](https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/blob/main/docs/development.md) for the active Spec Kit installation and feature selection.

## Contributions and security

Follow the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) and any local security policy. Never commit `.env`, runtime configuration, tokens or sessions. Use documented example placeholders. Preserve MQTT topics, payloads, command retention and existing deployment identifiers. A dependency upgrade, release, merge or deployment is a separate action from a Spec Kit step.
