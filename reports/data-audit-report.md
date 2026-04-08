# Data Audit Report

- Generated: 2026-04-08T17:16:34.570Z
- Herb list records: 675
- Herb detail records: 676
- Compound records: 399
- Structural-hard issues: 2559
- Enrichment-soft issues: 5583
- Herb hard-required gaps: 0
- Herb recommended gaps: 3578
- Herb research-backlog gaps: 2005

## Dataset coverage

- `public/data/herbs.json`: 675 records
- `public/data/herbs-detail/*.json`: 676 files
- `public/data/compounds.json`: 399 records

## Split rationale

- **STRUCTURAL_HARD** issues break minimum record integrity and fail `validate:data` (identity, slug sanity, shape/type corruption, duplicates, broken references, invalid cross-record contracts).
- **ENRICHMENT_SOFT** issues indicate incomplete depth/completeness and are report-only (missing recommended/backlog enrichment fields).

## Issue counts by code (all)

- missing-recommended-field: 3578
- missing-research-backlog-field: 2005
- missing-required-field: 1811
- herb-list-detail-mismatch: 463
- unresolved-active-compound-reference: 216
- invalid-field-type: 33
- placeholder-value: 26
- invalid-slug: 5
- duplicate-name: 2
- missing-herb-list-record: 2
- duplicate-slug: 1

## STRUCTURAL_HARD breakdown by code

- missing-required-field: 1811
- herb-list-detail-mismatch: 463
- unresolved-active-compound-reference: 216
- invalid-field-type: 33
- placeholder-value: 26
- invalid-slug: 5
- duplicate-name: 2
- missing-herb-list-record: 2
- duplicate-slug: 1

## ENRICHMENT_SOFT breakdown by code

- missing-recommended-field: 3578
- missing-research-backlog-field: 2005

## Issue counts by dataset

- compound: 1832
- herb-detail: 3568
- herb-list: 2742

## Herb missing-field tiers

- HARD_REQUIRED: 0
- RECOMMENDED: 3578
- RESEARCH_BACKLOG: 2005

### HARD_REQUIRED
- No gaps.

### RECOMMENDED
- sources: 3159
- contraindications: 419

### RESEARCH_BACKLOG
- class: 1107
- activeCompounds: 898

## Tier rationale (from completeness + recoverability triage)

- Recoverability evidence snapshot: 7789 prior missing-required issues, with 7696 genuinely missing and 5 recoverable.
- Completeness evidence snapshot (top weighted missing fields): sourcesUrl (missing 693, genuinely absent 693); interactions (missing 559, genuinely absent 557); activeCompounds (missing 515, genuinely absent 515); class (missing 556, genuinely absent 556); safetyNotes (missing 142, genuinely absent 142).
- Moved to **HARD_REQUIRED**: `slug`, `name`, `latin`, `description`, `effects`, `lastUpdated` because they anchor identity integrity, baseline end-user usefulness, and stable rendering contracts.
- Moved to **RECOMMENDED**: `contraindications`, `sources` (+ `sources.title` / `sources.url` subfield checks) because these are high user-value trust/safety fields that should stay visible without failing the full dataset.
- Moved to **RESEARCH_BACKLOG**: `class`, `activeCompounds` because triage shows these are predominantly genuinely absent and not reliably recoverable from internal data.
- Future cleanup phases should prioritize RECOMMENDED gaps on high-traffic/core herbs first, while tracking RESEARCH_BACKLOG as explicit editorial/research debt.
- `validate:data` gates only on STRUCTURAL_HARD failures. RECOMMENDED and RESEARCH_BACKLOG gaps are reported but do not fail validation.

## Before/after missing-field comparison

- Previous model missing-required-field count (legacy herb required set): 3215
- Current model hard-required gap count: 0
- Reduction in hard-fail missing-field load: 3215

## Sample findings


## Structural status snapshot

- Structurally broken records (at least one STRUCTURAL_HARD issue): 584
- Structurally valid but enrichment-thin records (ENRICHMENT_SOFT only): 1165

- [enrichment-soft] herb-list acacia-confusa (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list acacia-confusa (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list acacia-confusa (sources): Source entry 2 is missing a url.
- [enrichment-soft] herb-list acacia-maidenii (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list acacia-maidenii (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list acacia-maidenii (sources): Source entry 2 is missing a url.
- [enrichment-soft] herb-list acacia-nilotica (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acacia-nilotica (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acacia-phlebophylla (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acacia-phlebophylla (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acmella-oleracea (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list acmella-oleracea (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list acmella-oleracea (sources): Source entry 2 is missing a url.
- [enrichment-soft] herb-list aconitum-ferox (contraindications): Missing recommended field 'contraindications'.
- [enrichment-soft] herb-list aconitum-ferox (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list aconitum-ferox (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list aconitum-ferox (activeCompounds): Missing research_backlog field 'activeCompounds'.
- [enrichment-soft] herb-list aconitum-ferox (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list aconitum-napellus (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list aconitum-napellus (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acorus-americanus (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acorus-americanus (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list acorus-americanus (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acorus-calamus (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list acorus-calamus (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list acorus-calamus (sources): Source entry 2 is missing a url.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acorus-gramineus (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list acorus-tatarinowii (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acorus-tatarinowii (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list adenium-obesum (contraindications): Missing recommended field 'contraindications'.
- [enrichment-soft] herb-list adenium-obesum (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list adenium-obesum (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list adenium-obesum (activeCompounds): Missing research_backlog field 'activeCompounds'.
- [enrichment-soft] herb-list adenium-obesum (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list adenostoma-fasciculatum (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list adenostoma-fasciculatum (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list adhatoda-vasica (sources): Missing recommended field 'sources'.
