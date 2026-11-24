# Feature Specification: Remove redundant bridge files

## User Scenarios & Testing

### User Story 1 - Maintain bridge configuration in one place (P1)

A contributor can follow a configuration type from a bridge or its tests to the file that defines it. Given the five bridges with type-forwarding files, changes to those types must still be checked for every existing consumer after the forwarding files are removed. Roborock's unused helper can disappear without removing the corresponding behavior from other bridges.

### User Story 2 - Build Display with the tools it needs (P2)

A Display contributor following the development guide can build and test the bridge without installing an unused package manager. Maintainers still receive updates for the dependencies used by Display, and can select its existing release image by version.

### Edge Cases

- A reference used only by tests still counts as a consumer.
- Referring to a configuration type must not cause a configuration file to be read earlier.
- Historical records of successful documentation builds describe the past; they are not current installation instructions.

## Requirements

- **FR-01:** Remove the five forwarding files and preserve all configuration types used by Home Connect, Landroid, Philips Hue, Roborock, and WLED.
- **FR-02:** Remove only the unused Roborock helper; keep helpers used by other bridges.
- **FR-03:** Remove the three files left from Display's retired documentation toolchain and align current contributor and dependency-update instructions.
- **FR-04:** Preserve bridge configuration, messages, startup behavior, independent builds, release selection, and central documentation.

## Success Criteria

- All nine identified files are absent, with no live references to the deleted source paths.
- All five affected bridge suites and builds still pass. Display can still be built and tested using its documented development steps.
- Display's active guide has no obsolete installation step, and its release version still selects the same image and tags.

## Assumptions

This cleanup does not consolidate formatter settings, change dependency versions, or rewrite archived specifications.
