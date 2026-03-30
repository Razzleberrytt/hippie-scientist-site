# Normalized enrichment entry authoring (contractor guide)

Use normalized entries when extracting source-backed findings before final publication rollup.

## Input file formats

- Preferred: `public/data/enrichment-normalized.jsonl` (one JSON object per line).
- Also supported: JSON array files.

Validate:

- `node scripts/enrichment/validate-normalized-enrichment.mjs`

Normalize + rollup preview + summary report:

- `node scripts/enrichment/normalize-enrichment-entries.mjs`

## Required entry shape

Each row must include:

- `enrichmentId` (stable ID, `enr_*`)
- `entityType` (`herb` | `compound`)
- `entitySlug` (must match an existing detail data slug)
- `sourceId` (must exist in `public/data/source-registry.json`)
- `topicType` (normalized enum)
- `claimType` (normalized enum)
- `evidenceClass` (must match source registry evidence class)
- `findingTextShort`
- `findingTextNormalized`
- `reviewer`
- `reviewedAt` (ISO date-time)
- `editorialStatus`
- `active`

Optional context fields:

- `strengthLabel`
- `populationContext`
- `usageContext`
- `safetyContext`
- `mechanismContext`
- `traditionalUseContext`
- `uncertaintyNote`
- `relationType` (required for constituent/mechanism relationship topics)
- `targetType` / `targetName` (required for constituent/mechanism relationship topics)
- `targetSlug` (required when linking to internal herb/compound entities)
- `mechanismEntryId` (`menr_*`, recommended for mechanism/constituent rows)
- `biologicalContext`
- `constituentRoleContext`
- `mechanismStrengthLabel`

## Allowed topic types

- `supported_use`
- `unsupported_or_unclear_use`
- `mechanism`
- `constituent`
- `constituent_relationship`
- `pathway`
- `receptor_activity`
- `enzyme_interaction`
- `transporter_interaction`
- `herb_compound_link`
- `compound_origin_note`
- `interaction`
- `contraindication`
- `adverse_effect`
- `dosage_context`
- `population_specific_note`
- `conflict_note`
- `research_gap`
- `pregnancy_note`
- `lactation_note`
- `pediatric_note`
- `geriatric_note`
- `condition_caution`
- `surgery_caution`
- `medication_class_caution`

## Deterministic validation rules

The validator enforces:

1. `sourceId` exists in source registry.
2. `evidenceClass` equals the referenced source registry `evidenceClass`.
3. `entityType` + `entitySlug` resolves to an existing detail JSON file.
4. review controls are present (`reviewer`, `reviewedAt`, `editorialStatus`).
5. vague/empty findings are rejected (minimum text constraints and vague phrase guardrail).
6. duplicate and near-duplicate claims are rejected per entity/source/topic.
7. constituent/mechanism topic rows must use allowed `relationType` + `targetType` combinations.
8. herb↔compound links must resolve internal `targetSlug` references.
9. common constituent aliases are normalized for deterministic matching (for example `β-caryophyllene` → `beta-caryophyllene`).

## Rollup mapping (Prompt 26 schema)

Approved, active entries are mapped into `researchEnrichment` fields:

- `supported_use` → `supportedUses`
- `unsupported_or_unclear_use` → `unsupportedOrUnclearUses`
- `mechanism` → `mechanisms`
- `constituent` → `constituents`
- `interaction` → `interactions`
- `contraindication` → `contraindications`
- `adverse_effect` → `adverseEffects`
- `pregnancy_note` → `populationSpecificNotes` (+ `safetyProfile`)
- `lactation_note` → `populationSpecificNotes` (+ `safetyProfile`)
- `pediatric_note` → `populationSpecificNotes` (+ `safetyProfile`)
- `geriatric_note` → `populationSpecificNotes` (+ `safetyProfile`)
- `condition_caution` → `populationSpecificNotes` (+ `safetyProfile`)
- `surgery_caution` → `populationSpecificNotes` (+ `safetyProfile`)
- `medication_class_caution` → `populationSpecificNotes` (+ `safetyProfile`)
- `dosage_context` → `dosageContextNotes`
- `population_specific_note` → `populationSpecificNotes`
- `conflict_note` → `conflictNotes`
- `research_gap` → `researchGaps`

Each rolled-up claim keeps evidence class and source traceability:

- claim text from `findingTextNormalized`
- `evidenceClass`
- `sourceRefIds: [sourceId]`

## Generated reports

- `ops/reports/enrichment-normalization-summary.json`
  - counts by entity, topic type, evidence class, editorial status
- `ops/reports/enrichment-rollup-preview.json`
  - entity-level research enrichment preview object
- `ops/reports/safety-enrichment-summary.json`
  - safety counts by entity/topic/target/severity/evidence/conflict
