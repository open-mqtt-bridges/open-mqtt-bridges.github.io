# Main branch protection

This runbook proposes a repository ruleset. Do not apply it without separate administrator approval. On 2026-11-24, the GitHub branch API reported `protected: false` for `main`, and the effective rules endpoint returned no rules.

## Proposed policy

- Target only the default `main` branch. Require changes through a pull request with one approval when a second maintainer is available; confirm reviewer availability before enabling the rule. Do not allow normal direct pushes, force pushes, or deletion.
- Require the GitHub Actions contexts `bridge-checks` and `build`. `bridge-checks` is the aggregate from **Bridge checks**; `build` is from **Website and Pages**. Select the GitHub Actions source in the UI to prevent another integration from satisfying the checks. The individual bridge matrix jobs may legitimately skip. Do not require the Pages `deploy` job.
- Do not require the aggregate `CodeQL` context yet: an ordinary PR can have successful `analyze (javascript-typescript)` and `analyze (rust)` contexts with a neutral aggregate. Verify the per-language contexts on a current PR before deciding whether to require them. Do not apply required-review or strict-branch-update options without verifying they are workable for this repository.
- Keep any emergency bypass narrowly scoped to a named repository administrator or recovery team under organization policy. Record who owns recovery before enforcement; do not grant bypass to an automation token.

## Verify, apply, and recover

1. From a normal PR with the desired CI definitions, confirm the required context names and conclusions in the current commit's check runs. Use `gh pr view <number> --json headRefOid,statusCheckRollup`; also test an affected-only selection that legitimately skips bridge jobs.
2. Record `gh api repos/open-mqtt-bridges/open-mqtt-bridges.github.io/rules/branches/main` and the branch's protection state. Confirm organization-level rules and the recovery owner's administrative access.
3. After approval, have that administrator create a ruleset for `main` in repository settings, then reread effective rules and confirm the repository treats the exact contexts as required. Use the next ordinary PR to verify both a missing-check state and a passing state without merging for the sake of the test.
4. If the rule blocks normal work because contexts or reviewers are unavailable, have the designated administrator restore the recorded pre-change settings or temporarily disable the new ruleset, then verify effective state and record the incident. Do not bypass failed checks to merge.
