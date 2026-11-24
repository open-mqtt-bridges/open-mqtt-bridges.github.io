# File and consumer inventory

There is no persisted data or schema migration. Paths below are relative to `bridges/`.

| File to remove | Existing consumer or replacement |
| --- | --- |
| `homeconnect/src/types/config/home-connect.ts` | 6 production and test imports |
| `landroid/src/types/config/landroid.ts` | 1 production import |
| `philips-hue/src/types/config/hue.ts` | 1 production import |
| `roborock/src/types/config/roborock.ts` | 4 production and test imports |
| `wled/src/types/config/wled.ts` | 1 production import |
| `roborock/src/util/object.ts` | No consumer; no replacement |
| `display/package.json` | Empty scripts; Cargo owns the bridge version |
| `display/pnpm-lock.yaml` | Empty importer; no replacement |
| `display/pnpm-workspace.yaml` | Settings apply only to the retired Display pnpm project |

Redirect all 13 type imports to their own bridge's `~/config/config`, preserving the imported names.
