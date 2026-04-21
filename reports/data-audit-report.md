# Data Audit Report

- Generated: 2026-04-21T02:47:12.141Z
- Herb list records: 849
- Herb detail records: 681
- Compound records: 407
- Structural-hard issues: 12
- Enrichment-soft issues: 8776
- Herb hard-required gaps: 2
- Herb recommended gaps: 4155
- Herb research-backlog gaps: 2165

## Dataset coverage

- `public/data/herbs.json`: 849 records
- `public/data/herbs-detail/*.json`: 681 files
- `public/data/compounds.json`: 407 records

## Split rationale

- **STRUCTURAL_HARD** issues break minimum record integrity and fail `validate:data` (identity, slug sanity, shape/type corruption, duplicates, broken references, invalid cross-record contracts).
- **ENRICHMENT_SOFT** issues indicate incomplete depth/completeness and are report-only (missing recommended/backlog enrichment fields).

## Issue counts by code (all)

- missing-recommended-field: 4403
- missing-research-backlog-field: 2165
- invalid-field-type: 1521
- unresolved-active-compound-reference: 458
- herb-list-detail-mismatch: 126
- missing-herb-detail-record: 66
- duplicate-name: 17
- placeholder-value: 15
- missing-herb-list-record: 7
- invalid-slug: 6
- missing-hard-required-field: 2
- duplicate-slug: 2

## STRUCTURAL_HARD breakdown by code

- invalid-slug: 6
- missing-hard-required-field: 2
- placeholder-value: 2
- duplicate-slug: 2

## ENRICHMENT_SOFT breakdown by code

- missing-recommended-field: 4403
- missing-research-backlog-field: 2165
- invalid-field-type: 1521
- unresolved-active-compound-reference: 458
- herb-list-detail-mismatch: 126
- missing-herb-detail-record: 66
- duplicate-name: 17
- placeholder-value: 13
- missing-herb-list-record: 7

## Issue counts by dataset

- compound: 258
- herb-detail: 3321
- herb-list: 5209

## Herb missing-field tiers

- HARD_REQUIRED: 2
- RECOMMENDED: 4155
- RESEARCH_BACKLOG: 2165

### HARD_REQUIRED
- slug: 1
- name: 1

### RECOMMENDED
- sources: 3650
- contraindications: 505

### RESEARCH_BACKLOG
- class: 1260
- activeCompounds: 905

## Tier rationale (from completeness + recoverability triage)

- Recoverability evidence snapshot: 7789 prior missing-required issues, with 7696 genuinely missing and 5 recoverable.
- Completeness evidence snapshot (top weighted missing fields): sourcesUrl (missing 693, genuinely absent 693); interactions (missing 559, genuinely absent 557); activeCompounds (missing 515, genuinely absent 515); class (missing 556, genuinely absent 556); safetyNotes (missing 142, genuinely absent 142).
- Moved to **HARD_REQUIRED**: `slug`, `name`, `latin`, `description`, `effects`, `lastUpdated` because they anchor identity integrity, baseline end-user usefulness, and stable rendering contracts.
- Moved to **RECOMMENDED**: `contraindications`, `sources` (+ `sources.title` / `sources.url` subfield checks) because these are high user-value trust/safety fields that should stay visible without failing the full dataset.
- Moved to **RESEARCH_BACKLOG**: `class`, `activeCompounds` because triage shows these are predominantly genuinely absent and not reliably recoverable from internal data.
- Future cleanup phases should prioritize RECOMMENDED gaps on high-traffic/core herbs first, while tracking RESEARCH_BACKLOG as explicit editorial/research debt.
- `validate:data` gates only on STRUCTURAL_HARD failures. RECOMMENDED and RESEARCH_BACKLOG gaps are reported but do not fail validation.

## Before/after missing-field comparison

- Previous model missing-required-field count (legacy herb required set): 3386
- Current model hard-required gap count: 2
- Reduction in hard-fail missing-field load: 3384

## Sample findings


## Structural status snapshot

- Structurally broken records (at least one STRUCTURAL_HARD issue): 8
- Structurally valid but enrichment-thin records (ENRICHMENT_SOFT only): 1547

- [enrichment-soft] herb-list acacia-nilotica (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acacia-nilotica (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list acacia-nilotica (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list aconitum-ferox (contraindications): Missing recommended field 'contraindications'.
- [enrichment-soft] herb-list aconitum-ferox (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list aconitum-ferox (activeCompounds): Missing research_backlog field 'activeCompounds'.
- [enrichment-soft] herb-list aconitum-ferox (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list aconitum-ferox (safetyNotes): Field 'safetyNotes' must be a string.
- [enrichment-soft] herb-list aconitum-ferox (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list aconitum-ferox (sources): Source entry 1 is missing a title.
- [enrichment-soft] herb-list aconitum-ferox (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list aconitum-napellus (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list aconitum-napellus (contraindications): Field 'contraindications' must be an array of strings.
- [enrichment-soft] herb-list aconitum-napellus (therapeuticUses): Field 'therapeuticUses' must be an array of strings.
- [enrichment-soft] herb-list aconitum-napellus (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list aconitum-napellus (sources): Source entry 1 is missing a title.
- [enrichment-soft] herb-list aconitum-napellus (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list acorus-americanus (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acorus-americanus (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list acorus-americanus (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list acorus-americanus (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (sources): Missing recommended field 'sources'.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (safetyNotes): Field 'safetyNotes' must be a string.
- [enrichment-soft] herb-list acorus-calamus-var-angustatus (sources): Field 'sources' must not be empty.
- [enrichment-soft] herb-list acorus-tatarinowii (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list acorus-tatarinowii (safetyNotes): Field 'safetyNotes' must be a string.
- [enrichment-soft] herb-list acorus-tatarinowii (contraindications): Field 'contraindications' must be an array of strings.
- [enrichment-soft] herb-list acorus-tatarinowii (therapeuticUses): Field 'therapeuticUses' must be an array of strings.
- [enrichment-soft] herb-list acorus-tatarinowii (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list acorus-tatarinowii (sources): Source entry 1 is missing a title.
- [enrichment-soft] herb-list acorus-tatarinowii (sources): Source entry 1 is missing a url.
- [enrichment-soft] herb-list adenium-obesum (contraindications): Missing recommended field 'contraindications'.
- [enrichment-soft] herb-list adenium-obesum (class): Missing research_backlog field 'class'.
- [enrichment-soft] herb-list adenium-obesum (activeCompounds): Missing research_backlog field 'activeCompounds'.
- [enrichment-soft] herb-list adenium-obesum (dosage): Field 'dosage' must be a string.
- [enrichment-soft] herb-list adenium-obesum (safetyNotes): Field 'safetyNotes' must be a string.
- [enrichment-soft] herb-list adenium-obesum (sources): Source entry 0 is missing a url.
- [enrichment-soft] herb-list adenium-obesum (sources): Source entry 1 is missing a title.
