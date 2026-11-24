# Layout and compatibility contract

- `bridges/<slug>/docs/` → `docs/bridges/<slug>/`; shared configuration and contributor index under root `docs/`.
- `bridges/<slug>/README.md` → keep a package entry point and link to the central guide. Preserve packaging requirements.
- `bridges/<slug>/specs/<feature>/` → `.specify/bridges/<slug>/specs/<feature>/`; include every supporting file.
- `bridges/<slug>/.specify/` → `.specify/bridges/<slug>/.specify/`; preserve tracked relative paths, modes and content as historical material.
- `bridges/<slug>/{.agents,.github,.vscode}/` → root-owned working configuration where needed; no nested copy or duplicate publisher.
- `archive/idm-energy/` → keep the archived tree as imported.

Public guide URLs keep their `/<slug>/` prefixes. Root visitor routes, historical downloads, MQTT behavior and image identifiers retain their existing contracts.
