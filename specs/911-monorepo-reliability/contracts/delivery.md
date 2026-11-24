# Delivery Compatibility

## Check coverage and merge policy

`bridge-checks` always reports on selection and affected checks. Missing, duplicate, and unknown assignments are errors even if the current change affects no bridge. Known unaffected jobs may skip. The Pages gate retains generated-output checks and adds browser acceptance before artifact upload. Verify the exact GitHub check names before making them required. Actual `main` rule changes require administrator approval and an approved recovery path.

## Release candidate and aliases

- A release must use the exact image built and smoked from the reviewed revision. Image ID and archive checksum must match the recorded candidate when loaded for publication. Test failures block all publish paths, including `handoff-test`.
- `dry-run` makes no registry or GitHub release writes. It may use local alias fixtures and existing read-only registry evidence. `handoff-test` is expressly not a read-only rehearsal.
- The planner distinguishes absent aliases from inaccessible or unverified aliases. For an existing alias, compare the proposed stable version to the immutable version proved by the alias's current target. Reject backward or unprovable moves before the first push. Keep bare and `v`-prefixed tag conventions, `latest`, Display's minor-series alias, and Modbus's `master` and `sha-*` conventions. Never overwrite an existing immutable tag. Preserve the Modbus archive layout, filename, and SHA-256 sidecar.
- Capture partial results and reconcile remaining steps only after confirming the published digest matches the tested candidate. Do not rebuild and replace the published version. Keep registry permissions scoped to the selected package and preserve the existing publish allowlist.

## Public distribution and website

Track user-facing image refs separately from publisher targets and preserve old refs until a verified and approved handoff. A blocked anonymous lookup is not sufficient proof that a target is missing. Ping remains build-only. The generated website must keep its native link and card behavior with scripts off and must support search and focus recovery on narrow screens with scripts on.
