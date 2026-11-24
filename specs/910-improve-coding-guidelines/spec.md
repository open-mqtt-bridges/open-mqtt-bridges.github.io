# Feature Specification: Improve Coding Guidelines

**Feature Branch**: `69-improve-coding-guidelines-and-refresh-repository-dependencies`

**Created**: 2026-11-24

**Status**: Draft

**Input**: Improve the project's coding guidelines, update dependencies across the repository, and process open Dependabot pull requests.

## User Scenarios & Testing

### User Story 1 - Find the right checks (Priority: P1)

As a contributor, I can start at the repository README and find which checks apply to my change, where to run them, and whether they modify files.

**Independent Test**: Follow the README for changes to the website, shared libraries, a pnpm bridge, AdGuard Home, a Rust bridge, and the documentation.

**Acceptance Scenarios**:

1. **Given** a change in one of these areas, **When** I consult the guidelines, **Then** I can identify the owning toolchain, working directory, and applicable verification commands.
2. **Given** overlapping root and package checks, **When** I read the check scope, **Then** I can tell what each check covers, what it excludes, and what CI runs separately.

### User Story 2 - Review against actual project policy (Priority: P2)

As a reviewer, I can distinguish existing automated rules, manual review obligations, and baseline practices the project has not adopted.

**Independent Test**: Review a Vue template, a changed public contract, and a private helper against the published rules.

**Acceptance Scenarios**:

1. **Given** a Vue template, **When** I review its format and ordering, **Then** I know which conventions the formatter owns and which ordering rules lint enforces.
2. **Given** a changed public contract or private helper, **When** I review its documentation, **Then** I can distinguish current expectations from the broader baseline and know that a passing style check does not prove documentation coverage.

### User Story 3 - Bring dependencies up to date (Priority: P1)

As a maintainer, I can see which dependencies are current, which can be updated, and which need a compatibility decision. Existing Dependabot pull requests are reused rather than duplicated.

**Independent Test**: Reconcile the dependency inventory with the final manifests and lockfiles and with the disposition of each open Dependabot pull request.

**Acceptance Scenarios**:

1. **Given** an update candidate, **When** it is selected for delivery, **Then** its compatible target, owning directory, affected checks, and release impact are recorded.
2. **Given** an open Dependabot pull request, **When** it reaches a decision, **Then** it is either merged after explicit approval and passing required checks, superseded with evidence, or reported as blocked with a concrete reason.

### Edge Cases

- Root and bridge checks do not necessarily discover the same files.
- Bridge-specific pins and exceptions must not be treated as repository-wide policy.
- Generated, vendored, and archived files must not become targets for routine cleanup.
- If pending package-manager work lands before implementation, instructions must reflect the actual base rather than historical commands.
- Independently green pull requests can conflict in a shared lockfile or fail in combination.
- A breaking update or a pinned toolchain boundary requires an explicit compatibility decision, not a forced install or relaxed checks.

## Requirements

### Functional Requirements

- **FR-001**: Provide one canonical, discoverable en-US guide for coding conventions, linked from the contributor entry point.
- **FR-002**: Document applicable formatting, naming, structure, import, type, and documentation conventions, distinguishing enforced rules from conventions and verified exceptions.
- **FR-003**: Trace verification and fix instructions to the owning configuration, manifest, or CI step. Describe directory, scope, exclusions, and any CI-only checks or known coverage gaps.
- **FR-004**: Preserve existing rules and behavior. Do not introduce broader documentation obligations, stricter Vue layout, new tooling, or mass reformatting as part of this update.
- **FR-005**: Preserve public contracts and the ownership of generated and third-party code.
- **FR-006**: Inventory all declared dependencies, relevant resolved transitive updates, runtime and image pins, and CI dependencies. Apply all compatible updates within agreed constraints and explicitly record unresolved or deferred candidates.
- **FR-007**: Review every in-scope Dependabot PR against current head and base, required checks, reviews, and affected consumers before seeking merge approval. Do not merge failed, conflicted, obsolete, or unapproved PRs.

### Key Entities

- **Rule entry**: Scope, convention, enforcement status, source, and exception if applicable.
- **Check entry**: Scope, working directory, command, mutation status, and local or CI ownership.
- **Dependency candidate**: Owner, current and target versions, compatibility, linked PR, validation, and disposition.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All six contributor scenarios in the independent test lead from the README to the applicable instructions without a conflicting second source of rules.
- **SC-002**: Every documented verification command is supported by current configuration or CI, and the guide distinguishes checks from fixes.
- **SC-003**: The Vue layout and documentation sections explicitly distinguish existing project policy from the unadopted baseline.
- **SC-004**: The guidelines delivery is independently reviewable. Dependency delivery changes only its approved graph and necessary compatibility fixes, without changing public contracts or weakening validation.
- **SC-005**: Each inventory row and open Dependabot PR has a final status and evidence. Each merged update passes the affected checks and uses reproducible resolutions.

## Assumptions

- The guidelines track improves documentation and evidence for existing standards; adopting conflicting standards is a separate decision. The dependency track preserves existing rules.
- Existing contribution and Spec Kit guidance remains in place. Pending package-manager work is not a dependency, but its effect on the current base must be checked.
