# Pages Migration Baseline

Inventory captured 2026-11-23. Production origin: `https://open-mqtt-bridges.github.io`. The Pages API reported workflow publishing for the website and eight bridge repositories. The latest listed `github-pages` deployment was successful in each of those repositories:

| Repository | Source branch | Deployment ID | Published revision |
| --- | --- | --- | --- |
| open-mqtt-bridges.github.io | main | 7657432069 | `f2a8875e6fbbd36593af932dfdf96c65605ca3b5` |
| display | main | 7657392070 | `e57054d0f9c36fadf87c65c0257f9528f22a00a0` |
| homeconnect | main | 7831852196 | `a04cbe2171c9e56a98e6a4dd532a07ec0b742980` |
| landroid | main | 7831854247 | `602d07e792de3f86da4bba683d47feb4dda0afaa` |
| modbus | master | 7655961824 | `5f131471c53004c029b59f111e1b6ea0ff988a6b` |
| philips-hue | main | 7831853838 | `355461e21e99545d0b7ec5a7885cc7a6b3ec4b44` |
| pocketbase | main | 7831851474 | `d1c36da62fbfe3591b071e638588583c53191d7d` |
| roborock | main | 7873732602 | `ae5f2503bd45f759699b9a7e86c8ab71324bfb5f` |
| wled | main | 7873519964 | `54df219363a8058bff0786134c4b0644f043353c` |

Each of these eight bridge repositories sets its GitHub Website link to `/<slug>/` on the production origin. AdGuard Home, Ping and IDM Energy had no Website link and no Pages site returned by the API. IDM Energy remains archived. Ping's checkout initially contained local documentation edits; at implementation start its checkout was clean and the upstream `docs/` directory was present (`06d14a9594469e81fcb1026778a8495d533a8232` locally). No local Ping edits were overwritten.

## Live URL Inventory

Each listed suffix returned HTTP 200 under its bridge's `/<slug>/` base, including the base itself. The first rendered heading anchor per page was sampled; common anchors include `#configuration`, `#getting-started`, `#troubleshooting`, `#development` and `#readiness-verification`. Recheck these plus all anchors on changed pages during the compatibility pass before cutover.

- **Display**: configuration, deployment, development, getting-started, hardware, mqtt, troubleshooting, verification. Track `/#built-for-local-display-automation`, `hardware#hardware-requirements` and `mqtt#mqtt-contract`.
- **Home Connect**: authentication, configuration, deployment, development, getting-started, mqtt, troubleshooting, verification. Track `authentication#authentication` and `deployment#docker-deployment`.
- **Landroid**: authentication, configuration, deployment, development, getting-started, mqtt, troubleshooting, verification. Track `/#built-for-deliberate-mower-automation`.
- **Modbus**: architecture, concepts, configuration, deployment, development, getting-started, operations, recipes, topic-contract, troubleshooting, verification. Track `/#quick-links`, `topic-contract#topic-contract` and `operations#operations`.
- **Philips Hue**: authentication, configuration, deployment, development, getting-started, mqtt, troubleshooting, verification. Track `authentication#authentication`.
- **PocketBase**: beszel, configuration, deployment, development, getting-started, mqtt, troubleshooting, verification. Track `/#pocketbase-mqtt-bridge` and `beszel#beszel`.
- **Roborock**: authentication, configuration, deployment, development, enum-values, getting-started, mqtt, troubleshooting, verification. Track `enum-values#enum-values`.
- **WLED**: authentication, configuration, deployment, development, getting-started, migration, mqtt, troubleshooting, verification. Track `migration#migrating-from-the-rust-bridge`.

## Rollback Preparation

Refresh this baseline immediately before an approved cutover. Keep the recorded workflows and source revisions reachable and confirm an operator can restore workflow-mode Pages and its deployment permissions. If a probe fails after a bridge is retired, stop the sequence, restore its Pages settings and workflow, redeploy the last known-good source, and recheck the failed URL. If central output caused the failure, redeploy the prior website revision and revert changed repository metadata and landing links as needed. The inventory is not proof that rollback has been rehearsed.
