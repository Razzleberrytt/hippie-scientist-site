# Safety enrichment authoring (contractor guide)

This guide defines how to author structured safety entries in the normalized enrichment pipeline.

## Scope

Safety enrichment covers these distinct topics (do not merge into one warning bucket):

- `interaction`
- `contraindication`
- `adverse_effect`
- `pregnancy_note`
- `lactation_note`
- `pediatric_note`
- `geriatric_note`
- `condition_caution`
- `surgery_caution`
- `medication_class_caution`

## Required fields for safety entries

Safety rows are normal normalized enrichment rows with additional required safety fields:

- `enrichmentId` (`enr_*`)
- `entityType` (`herb` | `compound`)
- `entitySlug`
- `sourceId` (must resolve in source registry)
- `topicType` (one of the safety topics above)
- `claimType` (`safety_risk` for direct safety claims)
- `evidenceClass` (must match source registry row)
- `findingTextShort`
- `findingTextNormalized`
- `targetType` (`drug` | `drug_class` | `herb` | `condition` | `population`)
- `targetName`
- `severityLabel` (`none_known` | `low` | `moderate` | `high` | `severe` | `contraindicated`)
- `urgencyLabel` (`routine` | `caution` | `prompt_review` | `urgent`)
- `mechanismKnown` (`true` | `false`)
- `reviewer`
- `reviewedAt`
- `editorialStatus`
- `active`

Optional but recommended:

- `safetyEntryId` (`senr_*`)
- `populationContext`
- `medicationClassContext` (required when `topicType=medication_class_caution`)
- `uncertaintyNote`
- `conflictNote`

## Deterministic safety validation rules

The safety layer enforces:

1. source linkage by `sourceId` only (no duplicated source metadata in entries)
2. `evidenceClass` must match the referenced source registry evidence class
3. target-type rules per topic:
   - `interaction` → `drug|drug_class|herb`
   - `medication_class_caution` → `drug_class`
   - `pregnancy_note` / `lactation_note` → `population`
4. contradictory severity detection for the same entity/topic/target
5. duplicate and near-duplicate claim detection
6. preclinical/traditional safety claims require explicit `uncertaintyNote`

## Rollup output

`node scripts/enrichment/normalize-enrichment-entries.mjs` emits structured safety rollups under:

- `researchEnrichment.safetyProfile.safetyEntries[]`
- `researchEnrichment.safetyProfile.summary`

Safety entries remain source-backed with `sourceId` and include evidence class + uncertainty/conflict fields.

## Reporting output

The pipeline also writes:

- `ops/reports/safety-enrichment-summary.json`

This report includes counts by:

- entity
- safety topic type
- target type
- severity
- evidence class
- conflict state
