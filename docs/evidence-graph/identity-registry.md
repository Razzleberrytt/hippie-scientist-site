# Evidence Graph Identity Registry

## Purpose

The identity registry gives every herb, compound, and scientifically meaningful substance form a stable identifier before claims and relationships are extracted from the workbook.

This is a parallel foundation. It does not replace the existing workbook importer or the generated files in `public/data`.

## Stable ID formats

- Herb: `herb:{canonical-slug}`
- Compound: `compound:{canonical-slug}`
- Substance form: `form:{canonical-slug}`

Examples:

```text
herb:ashwagandha
compound:magnesium
form:magnesium-glycinate
```

IDs remain stable when display names change. Deprecated IDs must not be reused.

## Identity matching priority

1. Existing stable graph ID
2. Canonical workbook slug
3. Canonical name
4. Scientific name
5. Approved alias
6. Normalized name
7. Manual review

Automatic matching must stop when multiple candidates remain plausible.

## Form-sensitive identities

Do not automatically merge identities when a name contains scientifically meaningful distinctions such as:

- salts and mineral forms
- botanical species
- plant parts
- extracts or standardization
- microbial strains
- stereoisomers
- isolated versus whole-plant preparations
- branded research extracts

A form may link to a parent herb or compound while retaining its own stable identity.

## Registry record

Each registry entry records:

- stable ID
- entity type
- canonical slug
- canonical name
- scientific name when available
- parent entity for forms
- approved aliases
- lifecycle status
- review flags
- workbook provenance

The JSON Schema lives at:

```text
data/graph/identity/substance-registry.schema.json
```

The generated registry target lives at:

```text
data/graph/identity/substance-registry.json
```

## Publication rule

The registry is internal graph infrastructure. It must not change live routes or overwrite `public/data` until the pilot graph passes validation and review.

## Next implementation step

Build a read-only workbook importer that inventories `Herb Master V3` and `Compound Master V3`, generates registry candidates, and reports:

- duplicate stable IDs
- duplicate canonical slugs
- alias collisions
- missing names or slugs
- form-sensitive names requiring review
- parent-form candidates

The importer should write only to `data/graph/identity/` and a validation report under `ops/evidence-graph/`.
