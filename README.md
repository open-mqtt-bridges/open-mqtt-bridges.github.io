# Open MQTT Bridges website

Static source for [open-mqtt-bridges.github.io](https://open-mqtt-bridges.github.io/). The first deployment remains pending approval and merge of the feature PR.

## Local development

Use Node.js 26.13.0 or the supported 26.x range in `package.json`. No package installation is needed.

```bash
node --run build
node --run check
node --run test
node --run preview
```

Preview at `http://localhost:4173`. The HTML contains all bridge links without JavaScript; JavaScript only enables local search. No analytics, backend, external fonts or runtime dependencies are used. System/light/dark color modes follow the visual direction of Crateview and Repovio while retaining the organization’s turquoise branding. The optional color preference is stored locally; storage failures do not block the page.

## Catalog and organization profile

`bridges.json` is the authoritative catalog. Keep entries alphabetic by repository slug and mark archived projects. README-only documentation is labeled explicitly. After changing the catalog, regenerate the organization profile and verify both copies:

```bash
node scripts/build.mjs --profile-root ../.github
node scripts/check.mjs --profile-root ../.github
```

The explicit `--profile-root` option updates only the bridge-table markers in the sibling `.github/README.md` and `.github/profile/README.md`; normal builds never edit another repository. CI validates deterministic HTML, catalog policies, local assets and meaningful catalog rejection cases. A local cross-repository check verifies both profile lists before review.

## Deployment

The Pages workflow builds and checks pull requests. Deployment runs only from `main`, including manual dispatch on that branch, using the GitHub Actions Pages source. Approve and merge the PR before expecting the public URL to reflect these sources. Verify direct URLs and CSS/JS/icon assets after deployment.

See [development and Spec Kit](docs/development.md), the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) and [brand assets](assets/README.md). Source and original branding are MIT licensed.
