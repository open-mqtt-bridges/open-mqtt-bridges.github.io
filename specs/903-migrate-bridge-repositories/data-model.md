# Phase 1: Migration inventory

Use a machine-readable manifest and a verification report. No runtime database is needed. Publish only approved metadata; store recovery material and backups separately.

| Record | Required fields and relationships |
|---|---|
| Source | Repository, slug, active/archive status, remote URL, object format, snapshot time, default ref and full object ID (OID), target prefix, inventory sources, and owner confirmation. |
| Ref mapping | Source, original ref or discovery location, type (branch/tag/PR head/PR merge/gitlink/local), original object OID, resolved commit OID if applicable, and unique destination ref. Preserve distinct local tips even when names match. |
| Object inventory | Sorted unique expected commit IDs per source, count and checksum of that list, tag objects, any LFS OIDs or submodule pins, and a verified backup. |
| Import | Snapshot, target base, source tip, source tree OID, import commit, target prefix, observed target tree OID, and independent clone result. Multiple sources may contain the same original commits. |
| Public contract | Manifest that owns the version, build context, test commands, package/image names, architectures, tagging rules, documentation URLs and anchors, historical assets, previous publisher, and rollback point. |
| Package ownership | Registry, package name and namespace owner, visibility, linked source repository before and after, inherited and explicit Actions grants, designated publisher, known-good digest, evidence of the new association and test publish, and restoration settings. |
| Cutover | Bridge, previous and new write owner, pre-freeze snapshot, final reconciliation, test evidence, approvals, timing, and rollback status. |

Lifecycle: **inventoried → backed up → imported → verified from a fresh clone → switched over → observed → archived**. A failed gate leaves the bridge in its last verified state. A changed source snapshot invalidates the affected checks. Repeating an already verified import with the same snapshot is a no-op; conflicting target refs or prefixes must not be overwritten.
