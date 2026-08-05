# Evidence Graph Identity Registry

## Purpose

The identity registry gives every herb, compound, and scientifically meaningful substance form a stable identifier before claims and relationships are extracted from the workbook.

This is a parallel foundation. It does not replace the existing workbook importer or the generated files in `public/data`.

## Current canonical source

The current workbook stores herb and compound identities together in `Entity_Master` and distinguishes them with `entity_type`.

The importer also supports older workbook layouts that used separate identity sheets:

- `Herb Master V3`
- `Herb Monographs`
- `Site Export Herbs`
- `Compound Master V3`
- `Site Export Compounds`

When both layouts exist, the split sheets remain preferred for backward compatibility. When they are absent, the importer reads herb and compound rows from `Entity_Master`.

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

The generated validation report lives at:

```text
data/graph/identity/identity-validation-report.json
```

The human-editable collision queue lives at:

```text
data/graph/identity/identity-collision-review.csv
```

## Import commands

```bash
node scripts/evidence-graph/build-identity-registry.mjs
node scripts/evidence-graph/build-identity-collision-review.mjs
```

The commands are read-only with respect to the workbook and write only graph identity outputs.

## Collision handling

The importer never merges identities automatically.

It detects:

- duplicate stable IDs
- duplicate canonical slugs
- duplicate canonical names
- aliases that collide with other aliases, names, or slugs

Each collision receives:

- a classification
- a severity
- a recommended editorial action
- the involved record IDs and workbook provenance

Records involved in collisions are marked `duplicate-candidate` and receive review flags. Scientifically meaningful forms remain separate until a reviewer explicitly assigns a parent identity or alias resolution.

The CSV review queue contains blank editorial columns for:

- resolution status
- chosen canonical record ID
- resolution notes

This keeps automated detection separate from human identity decisions.

## Current baseline

The validated `Entity_Master` import currently produces:

- 881 registry records
- 293 herbs
- 588 compounds
- 0 invalid records
- 0 missing stable IDs
- 43 collision groups
- 88 duplicate-candidate records
- 77 additional form-sensitive review records
- 165 total records in the identity review queue

These counts are a workbook baseline, not permanent acceptance thresholds. CI validates structural consistency rather than freezing the exact totals.

## Continuous validation

The focused GitHub Actions workflow runs:

1. identity unit tests
2. registry generation from the workbook
3. collision-review CSV generation
4. output consistency checks
5. artifact upload for all three generated outputs

Workflow file:

```text
.github/workflows/evidence-graph-identity-check.yml
```

## Publication rule

The registry is internal graph infrastructure. It must not change live routes or overwrite `public/data` until the pilot graph passes validation and review.

## Next implementation step

Resolve the highest-severity identity collisions first, beginning with:

1. stable-ID or canonical-slug collisions, if any appear
2. same-type canonical-name duplicates
3. cross-type name conflicts
4. alias duplicates
5. parent-form assignments for extract, salt, species, and plant-part identities

After the collision queue is reviewed, the registry can safely anchor claim, study, safety, and relationship imports.
