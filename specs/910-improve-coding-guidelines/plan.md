# Implementation Plan: Improve Coding Guidelines

**Branch**: `69-improve-coding-guidelines-and-refresh-repository-dependencies` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

## Summary

Extend `docs/development.md`, already linked from `README.md` and `docs/README.md`, as the canonical coding guideline. Preserve its Spec Kit and contribution sections. Document existing conventions, explain where checks actually run, and identify intentional or current differences from the broader baseline without modifying enforcement.

Coordinate repository-wide dependency maintenance as a separate delivery track. Reuse compatible Dependabot PRs, update remaining candidates by compatibility group, and verify the guide against the final resulting base. See [dependency rollout](dependency-rollout.md) for scope, ordering, and gates.

## Technical Context

- **Languages and platform**: Markdown contributor docs for a GitHub-hosted JS/TS, Nuxt/Vue, and Rust monorepo.
- **Dependencies and tools**: Existing ESLint, Prettier, Nuxt type checking, and Cargo tools. Follow the owning manifests, lockfiles, and CI; add no dependencies.
- **Storage**: Versioned Markdown; no runtime data.
- **Testing**: Effective config and ignore probes, local link and formatting checks, and comparison with the applicable GitHub Actions jobs.
- **Scope and constraints**: One canonical contributor guide and independently reviewable dependency groups across all owning manifests and infrastructure pins. Preserve public behavior, supported runtimes, and current rules. Recheck concurrent package-manager work before updating commands.

## Constitution Check

Pass before research and after design, conditional on compatibility and approval gates. Public MQTT, configuration, deployment, and package contracts remain unchanged. The plan honors existing toolchain and lockfile ownership, improves en-US contributor guidance, and records verification and gaps. Broad maintenance is explicitly requested but is split into focused groups. No automatic tracking, merge, or release action.

## Project Structure

- Planning: `spec.md`, `checklists/requirements.md`, `plan.md`, [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md), [dependency rollout](dependency-rollout.md), and [tasks.md](tasks.md).
- Delivery: `docs/development.md`. `README.md`, `docs/README.md`, and package development guides remain entry points or references, not competing canonical style guides.
- Evidence: root/package manifests and lockfiles, ESLint and Prettier configuration, representative source, and `.github/workflows/{pages,bridge-ci}.yml`.
- Contracts: Not applicable. This documentation-only change introduces no external interface or command behavior.

## Delivery Design

1. Recheck baseline on the implementation branch. Capture the effective rule and ignore decisions for a Vue file, shared JS/TS, one representative file per distinct Node bridge configuration (including PocketBase and AdGuard Home), and the native Rust commands. Check whether concurrent bridge metadata work changed Yarn/npm instructions.
2. Update the existing guide with scoped style and review expectations plus a compact check matrix. Distinguish enforced Vue block/attribute ordering from Prettier-owned layout; state the project documentation requirement and where review is manual. Record only supported conventions and verified checks.
3. Walk the six contributor scenarios from the README. Validate documented checks against manifests and CI, run the applicable local checks in [quickstart.md](quickstart.md), and confirm the diff is docs-only.

No style-rule adoption, CI policy change, or broad cleanup. If dependency updates affect the formatter/linter, verify existing rules and two-pass convergence rather than adopting new conventions. If a stricter Vue policy is approved later, verify valid/invalid fixtures and whitespace/binding behavior in that separate scope. Broader documentation enforcement requires its own selector and coverage validation.
