# Guide hosting handoff

The organization site's Pages artifact contains `/<slug>/` for each active bridge. GitHub Pages may continue routing that path to the original repository's project site while its Pages configuration is active. A successful organization-site build alone does not prove that public readers receive the new guide.

1. Build and check the full Pages artifact. Open each guide and an existing deep link in preview; confirm the edit link targets `open-mqtt-bridges.github.io/edit/main/docs/bridges/<slug>/`.
2. After the organization site is deployed, probe the same public URLs and inspect the edit link to identify the serving version. Record the old project's Pages configuration, last deployment and guide revision for rollback.
3. If a project site still serves the old guide, coordinate a separate operator-approved Pages handoff for that slug. Confirm the public landing page, a deep bookmark, an image and the new edit link before proceeding to another guide.
4. On failure, restore the previous project site's settings and deployment, then recheck the same URLs. Do not archive or remove old downloads as part of a guide handoff.
