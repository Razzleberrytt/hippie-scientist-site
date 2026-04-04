# Data Audit Report

- Generated: 2026-04-04T02:38:41.986Z
- Herb list records: 698
- Herb detail records: 676
- Compound records: 390
- Errors: 3333
- Warnings: 6324
- Herb hard-required gaps: 0
- Herb recommended gaps: 4190
- Herb research-backlog gaps: 2134

## Dataset coverage

- `public/data/herbs.json`: 698 records
- `public/data/herbs-detail/*.json`: 676 files
- `public/data/compounds.json`: 390 records

## Issue counts by code

- missing-recommended-field: 4190
- missing-research-backlog-field: 2134
- missing-required-field: 1671
- invalid-field-type: 1597
- placeholder-value: 26
- herb-list-detail-mismatch: 23
- unresolved-active-compound-reference: 10
- duplicate-name: 4
- duplicate-slug: 2

## Issue counts by dataset

- compound: 2061
- herb-detail: 3808
- herb-list: 3788

## Herb missing-field tiers

- HARD_REQUIRED: 0
- RECOMMENDED: 4190
- RESEARCH_BACKLOG: 2134

### HARD_REQUIRED
- No gaps.

### RECOMMENDED
- sources: 3768
- contraindications: 422

### RESEARCH_BACKLOG
- class: 1108
- activeCompounds: 1026

## Tier rationale (from completeness + recoverability triage)

- Recoverability evidence snapshot: 7789 prior missing-required issues, with 7696 genuinely missing and 5 recoverable.
- Completeness evidence snapshot (top weighted missing fields): sourcesUrl (missing 693, genuinely absent 693); interactions (missing 559, genuinely absent 557); activeCompounds (missing 515, genuinely absent 515); class (missing 556, genuinely absent 556); safetyNotes (missing 142, genuinely absent 142).
- Moved to **HARD_REQUIRED**: `slug`, `name`, `latin`, `description`, `effects`, `lastUpdated` because they anchor identity integrity, baseline end-user usefulness, and stable rendering contracts.
- Moved to **RECOMMENDED**: `contraindications`, `sources` (+ `sources.title` / `sources.url` subfield checks) because these are high user-value trust/safety fields that should stay visible without failing the full dataset.
- Moved to **RESEARCH_BACKLOG**: `class`, `activeCompounds` because triage shows these are predominantly genuinely absent and not reliably recoverable from internal data.
- Future cleanup phases should prioritize RECOMMENDED gaps on high-traffic/core herbs first, while tracking RESEARCH_BACKLOG as explicit editorial/research debt.

## Before/after missing-field comparison

- Previous model missing-required-field count (legacy herb required set): 3045
- Current model hard-required gap count: 0
- Reduction in hard-fail missing-field load: 3045

## Sample findings

- [warning] herb-list acacia-confusa (sources): Source entry 0 is missing a url.
- [warning] herb-list acacia-confusa (sources): Source entry 1 is missing a url.
- [warning] herb-list acacia-confusa (sources): Source entry 2 is missing a url.
- [warning] herb-list acacia-maidenii (sources): Source entry 0 is missing a url.
- [warning] herb-list acacia-maidenii (sources): Source entry 1 is missing a url.
- [warning] herb-list acacia-maidenii (sources): Source entry 2 is missing a url.
- [warning] herb-list acacia-nilotica (sources): Missing recommended field 'sources'.
- [warning] herb-list acacia-nilotica (sources): Field 'sources' must not be empty.
- [warning] herb-list acacia-phlebophylla (sources): Source entry 0 is missing a url.
- [warning] herb-list acacia-phlebophylla (sources): Source entry 1 is missing a title.
- [warning] herb-list acacia-phlebophylla (sources): Source entry 1 is missing a url.
- [warning] herb-list acmella-oleracea (sources): Source entry 0 is missing a url.
- [warning] herb-list acmella-oleracea (sources): Source entry 1 is missing a url.
- [warning] herb-list acmella-oleracea (sources): Source entry 2 is missing a url.
- [warning] herb-list acmella-oleracea (sources): Source entry 3 is missing a url.
- [warning] herb-list acmella-oleracea (sources): Source entry 4 is missing a title.
- [warning] herb-list acmella-oleracea (sources): Source entry 4 is missing a url.
- [warning] herb-list aconitum-ferox (contraindications): Missing recommended field 'contraindications'.
- [warning] herb-list aconitum-ferox (class): Missing research_backlog field 'class'.
- [warning] herb-list aconitum-ferox (activeCompounds): Missing research_backlog field 'activeCompounds'.
- [error] herb-list aconitum-ferox (class): Field 'class' must be a string, received null.
- [warning] herb-list aconitum-ferox (sources): Source entry 0 is missing a url.
- [warning] herb-list aconitum-ferox (sources): Source entry 1 is missing a title.
- [warning] herb-list aconitum-ferox (sources): Source entry 1 is missing a url.
- [warning] herb-list aconitum-napellus (sources): Source entry 0 is missing a url.
- [warning] herb-list aconitum-napellus (sources): Source entry 1 is missing a title.
- [warning] herb-list aconitum-napellus (sources): Source entry 1 is missing a url.
- [warning] herb-list acorus-americanus (sources): Missing recommended field 'sources'.
- [warning] herb-list acorus-americanus (class): Missing research_backlog field 'class'.
- [error] herb-list acorus-americanus (class): Field 'class' must be a string, received null.
- [error] herb-list acorus-americanus (legalStatus): Field 'legalStatus' must be a string, received null.
- [warning] herb-list acorus-americanus (sources): Field 'sources' must not be empty.
- [warning] herb-list acorus-calamus (sources): Source entry 0 is missing a url.
- [warning] herb-list acorus-calamus (sources): Source entry 1 is missing a url.
- [warning] herb-list acorus-calamus (sources): Source entry 2 is missing a url.
- [warning] herb-list acorus-calamus (sources): Source entry 3 is missing a url.
- [warning] herb-list acorus-calamus (sources): Source entry 4 is missing a title.
- [warning] herb-list acorus-calamus (sources): Source entry 4 is missing a url.
- [warning] herb-list acorus-calamus-var-angustatus (sources): Missing recommended field 'sources'.
- [warning] herb-list acorus-calamus-var-angustatus (class): Missing research_backlog field 'class'.
