# Constituents and mechanisms enrichment authoring

Use this guide when creating normalized rows for constituent presence, herb↔compound links, and mechanism claims.

## Required relationship fields

For these `topicType` values, include relationship fields:

- `constituent`
- `constituent_relationship`
- `mechanism`
- `pathway`
- `receptor_activity`
- `enzyme_interaction`
- `transporter_interaction`
- `herb_compound_link`
- `compound_origin_note`

Required fields in addition to the base normalized entry shape:

- `relationType`
- `targetType`
- `targetName`

Recommended:

- `mechanismEntryId` (`menr_*`)
- `topicTypeDetail`
- `biologicalContext`
- `constituentRoleContext`
- `mechanismStrengthLabel`
- `uncertaintyNote`
- `conflictNote`

## Topic-specific constraints

- `receptor_activity` must target `receptor`.
- `enzyme_interaction` must target `enzyme`.
- `transporter_interaction` must target `transporter`.
- `pathway` must target `pathway` or `biological_process`.
- `herb_compound_link` requires internal cross-entity linking:
  - Herb rows must target `compound`.
  - Compound rows must target `herb`.
  - Include `targetSlug` pointing to an existing detail record.
- `compound_origin_note` targets `herb` and should include `targetSlug`.

## Evidence handling rules

- Every row references one `sourceId` from the source registry.
- `evidenceClass` must exactly match that source registry row.
- Do not duplicate title/authors/journal metadata inline in normalized rows.
- Use `uncertaintyNote` for tentative constituent presence or mechanistic ambiguity.
- Use `conflictNote` when sources disagree on constituent presence or mechanism direction.

## Duplicate control

The validator rejects:

- exact duplicates for same entity/source/topic/relation/target/finding
- near-duplicate mechanism statements for same entity/source/topic/relation/target

Keep claims concise and specific to a single relationship statement.

## Reporting

Running `node scripts/enrichment/normalize-enrichment-entries.mjs` now generates:

- `ops/reports/mechanism-enrichment-summary.json`

This report provides counts by entity, topic type, relation type, target type, evidence class, and conflict state for mechanism/constituent-focused topics.
