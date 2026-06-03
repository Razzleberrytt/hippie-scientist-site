# Research enrichment schema and provenance model

This document defines the structured `researchEnrichment` object used for both herb and compound detail records.

## Why this model exists

The model is designed so contractors can add research notes without mixing unlike evidence classes.

Two explicit guardrails:

1. **Scientific/clinical evidence is separate from traditional-use evidence** via `evidenceClass` on every claim.
2. **Every substantive claim is traceable** via `sourceRefIds[]` that must map to a source ID in `sourceRegistryIds[]` (and ultimately in `public/data/source-registry.json`).

## Where to store it

- `public/data/herbs-detail/<slug>.json` under `researchEnrichment`
- `public/data/compounds-detail/<slug>.json` under `researchEnrichment`

## Core shape

```json
{
  "researchEnrichment": {
    "evidenceSummary": "...",
    "evidenceTier": "tier-2-moderate",
    "evidenceClassesPresent": ["human-clinical", "traditional-use"],
    "supportedUses": [
      { "claim": "...", "evidenceClass": "human-clinical", "sourceRefIds": ["src_pubmed-clinical-template"] }
    ],
    "unsupportedOrUnclearUses": [],
    "mechanisms": [],
    "constituents": [],
    "interactions": [],
    "contraindications": [],
    "adverseEffects": [],
    "dosageContextNotes": [],
    "populationSpecificNotes": [],
    "safetyProfile": {
      "safetyEntries": [],
      "summary": { "total": 0, "byTopicType": {}, "bySeverity": {} }
    },
    "conflictNotes": [],
    "researchGaps": [],
    "sourceRegistryIds": ["src_pubmed-clinical-template"],
    "sourceRefs": [
      {
        "sourceId": "src_pubmed-clinical-template",
        "extractConfidence": "high",
        "reviewer": "initials-or-name",
        "notes": "Optional claim extraction notes"
      }
    ],
    "lastReviewedAt": "2026-03-30T00:00:00.000Z",
    "reviewedBy": "editorial-team",
    "editorialStatus": "in-review"
  }
}
```

## Field-by-field guidance

- `sourceRegistryIds[]`: required registry source IDs used by this entity.
- `sourceRefs[]`: optional local extraction annotations only (confidence/reviewer/notes), keyed by `sourceId`.
- `sourceRefIds[]` in every claim: IDs that must resolve through `sourceRegistryIds[]`.
- `safetyProfile.safetyEntries[]`: structured safety rows for interactions/contraindications/adverse effects/population cautions with deterministic severity + uncertainty metadata.

## Allowed evidence classes

- `human-clinical`
- `human-observational`
- `preclinical-mechanistic`
- `traditional-use`
- `regulatory-monograph`

> Do not infer that a traditional-use source is clinical efficacy evidence. Keep these classes explicit.

## Validation

- JSON Schema: `schemas/research-enrichment.schema.json`
- Scripted validation: `node scripts/validate-research-enrichment.mjs`
  - Validates shape for every detail file that includes `researchEnrichment`.
  - Validates `sourceRegistryIds` against the source registry.
  - Validates claim provenance links (`sourceRefIds`) resolve to declared source IDs.


## Normalized extraction pipeline (Prompt 28)

To keep contractor extraction deterministic and source-backed before direct entity patching, use normalized entries:

- Input: `public/data/enrichment-normalized.jsonl`
- Entry schema: `schemas/normalized-enrichment-entry.schema.json`
- Validation: `node scripts/enrichment/validate-normalized-enrichment.mjs`
- Normalize + rollup preview: `node scripts/enrichment/normalize-enrichment-entries.mjs`
- Canonical public runtime artifact (governed, publish-gated): `public/data/enrichment-governed.json`

This pipeline enforces:

- `sourceId` registry linkage (no duplicated source metadata in entries)
- `evidenceClass` consistency with source registry classification
- strict topic and claim normalization
- duplicate and near-duplicate rejection
- reviewer/date/editorial-state requirements before rollup
- topic-specific safety normalization (target type, severity, urgency, mechanism-known flags)
- structured constituent/mechanism relationship normalization (`relationType`, `targetType`, `targetName`, optional `targetSlug`)
- deterministic herb↔compound link validation for relationship topics
