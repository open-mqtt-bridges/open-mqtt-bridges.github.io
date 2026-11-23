# Feature Specification: Centralize Bridge Documentation

**Feature Branch**: `15-centralize-bridge-documentation-and-github-pages`

**Created**: 2026-11-23

**Status**: Draft

**Input**: Publish all bridge documentation from the existing organization website, keep active bridge documentation in each bridge repository, update repository links and READMEs, and make the guides consistent and useful to non-developers.

## User Scenarios & Testing

### User Story 1 - Find every bridge guide in one place (Priority: P1)

A visitor opens the organization website, finds their bridge, and opens its guide without navigating through source code.

**Why this priority**: The organization website is the single public entry point.

**Independent Test**: Open the catalog and follow each of its eleven documentation entries.

**Acceptance Scenarios**:

1. **Given** the website, **when** a visitor chooses any active bridge, **then** its guide opens on the same domain and links back to the catalog.
2. **Given** IDM Energy in the catalog, **when** a visitor opens its guide, **then** they see an archive notice, not active setup or support claims.

### User Story 2 - Set up a bridge without reading code (Priority: P2)

A reader checks prerequisites, follows a recommended setup, verifies operation, and uses symptom-based troubleshooting if needed.

**Why this priority**: Consolidation alone does not make the documentation easier to use.

**Independent Test**: Review a guide from prerequisites through its first verification step without using a source checkout.

**Acceptance Scenarios**:

1. **Given** any active guide, **when** a reader starts setup, **then** required accounts, hardware and software appear before numbered instructions, along with expected results and an explanation of unfamiliar terms.
2. **Given** a reader diagnosing a problem, **when** they open troubleshooting, **then** they can find a symptom, a check and a next action. Protocol details and contributor notes are separate from the beginner path.

### User Story 3 - Follow existing entry points after migration (Priority: P3)

A reader reaches the correct guide from a GitHub README, repository Website link or bookmarked Pages URL.

**Why this priority**: Consolidation must not break existing entry points.

**Independent Test**: Follow repository links and sample old deep links after the local cutover rehearsal and again after deployment.

**Acceptance Scenarios**:

1. **Given** an active bridge repository, **when** a reader opens the README or its Website link, **then** both point to the central guide without changing the repository URL.
2. **Given** an existing Pages bookmark, **when** a reader opens it after migration, **then** the central deployment serves the equivalent content directly or provides a compatibility route.

### Edge Cases

- A moved page or renamed heading has existing inbound links.
- An active bridge has no published documentation yet, or has unpublished local work that must not be overwritten.
- An archive has no current maintainer or supported installation path.
- A source revision or asset is missing; a partial site must not replace the working site.

## Requirements

### Functional Requirements

- **FR-001**: Publish all bridge documentation through one deployment at `https://open-mqtt-bridges.github.io/`.
- **FR-002**: Keep the versioned `docs/` source for each active bridge in its own repository. Build all ten active guides, including Ping and AdGuard Home, from those sources.
- **FR-003**: Publish an IDM Energy archive page centrally without modifying or reopening its archived repository.
- **FR-004**: Use the same ordering and navigation for all active guides: Overview, Getting started, Configuration, Using the bridge, Troubleshooting, then Reference. Include only applicable bridge-specific detail.
- **FR-005**: Use plain English, explain MQTT and other relevant terms at first use, and provide realistic examples with safe placeholders. Verify setup steps and preserve actual product behavior.
- **FR-006**: Update each active bridge README and repository Website link, plus the organization profile and website catalog, to point to the central guides. Remove duplicate README instructions where the guide supersedes them.
- **FR-007**: Preserve existing public documentation paths and meaningful anchors. Verify the central equivalents before stopping individual Pages publication.
- **FR-008**: Make source revision updates reviewable. A missing source, unsupported build, broken local link or route collision must prevent publishing incomplete output.

### Key Entities

- **Bridge catalog entry**: Slug, name, status, source repository and public guide.
- **Guide**: Bridge-owned documentation with consistent navigation and bridge-specific content.
- **Compatibility route**: Previously public page path or anchor with a central equivalent.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All eleven catalog entries open a guide on the organization domain, and the final state has one Pages deployment.
- **SC-002**: All ten active guides follow the common navigation and pass a content review against their verified setup, configuration and troubleshooting paths.
- **SC-003**: All ten active GitHub READMEs and Website links resolve to the right central guide; the organization profile links to the same destinations.
- **SC-004**: Every inventoried legacy page resolves to the intended content. Tracked section anchors, local links and assets work; representative mobile and keyboard flows pass.

## Assumptions

- The active repositories are AdGuard Home, Display, Home Connect, Landroid, Modbus, Philips Hue, Ping, PocketBase, Roborock and WLED.
- The existing website repository is the documentation publisher; there is no separate documentation repository.
- Documentation stays in en-US. MQTT behavior, supported devices, runtime configuration and published artifacts do not change.
- GitHub repository URLs continue to open the repositories; their Website fields and READMEs point to the new guides.
