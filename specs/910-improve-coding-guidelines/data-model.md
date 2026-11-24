# Data Model: Coding Guideline Entries

No persisted application data. Planning and delivery evidence uses these entries:

- **Convention**: Scope, rule or expectation, evidence source, whether it is enforced or reviewed manually, and any package exception. Do not make an observed habit a mandatory rule without agreement.
- **Check**: Scope, working directory, command, mutation status, and local or CI applicability. Note exclusions and gaps accurately; a passing check proves only its documented scope.
- **Dependency candidate**: Owner, declared and resolved versions, candidate version, compatibility constraints, PR and check evidence, and disposition. A candidate becomes merged only after the host confirms the approved PR was merged; otherwise record current, superseded, blocked, or deferred with a reason.

Entries reference the owning configuration or guide rather than duplicating package-specific pins or release policy.
