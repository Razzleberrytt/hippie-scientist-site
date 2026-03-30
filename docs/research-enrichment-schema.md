# Research enrichment schema and provenance model

This document defines the structured `researchEnrichment` object used for both herb and compound detail records.

## Why this model exists

The model is designed so contractors can add research notes without mixing unlike evidence classes.

Two explicit guardrails:

1. **Scientific/clinical evidence is separate from traditional-use evidence** via `evidenceClass` on every claim and every source.
2. **Every substantive claim is traceable** via `sourceRefIds[]` that must map to entries in `sourceRefs[]`.

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
      { "claim": "...", "evidenceClass": "human-clinical", "sourceRefIds": ["src-1"] }
    ],
    "unsupportedOrUnclearUses": [],
    "mechanisms": [],
    "constituents": [],
    "interactions": [],
    "contraindications": [],
    "adverseEffects": [],
    "dosageContextNotes": [],
    "populationSpecificNotes": [],
    "conflictNotes": [],
    "researchGaps": [],
    "sourceRefs": [
      {
        "sourceId": "src-1",
        "sourceType": "rct",
        "title": "...",
        "url": "https://...",
        "evidenceClass": "human-clinical",
        "extractConfidence": "high",
        "reviewer": "initials-or-name"
      }
    ],
    "lastReviewedAt": "2026-03-30T00:00:00.000Z",
    "reviewedBy": "editorial-team",
    "editorialStatus": "in-review"
  }
}
```

## Field-by-field guidance

- `evidenceSummary`: Short non-hype summary of what is known and uncertain.
- `evidenceTier`: Overall confidence bucket for this entity (`tier-1-strong` to `tier-4-insufficient`).
- `evidenceClassesPresent[]`: Which evidence classes appear in this entry.
- Claim arrays (`supportedUses`, `mechanisms`, `interactions`, etc.): structured, claim-level statements with required provenance links.
- `sourceRefs[]`: bibliographic/provenance records used by claims.
- `lastReviewedAt`, `reviewedBy`, `editorialStatus`: editorial freshness and status controls.
- `relatedEntities[]` (optional): future herb↔compound mapping notes.

## Allowed evidence classes

- `human-clinical`
- `human-observational`
- `preclinical-mechanistic`
- `traditional-use`
- `regulatory-monograph`

> Do not infer that a traditional-use source is clinical efficacy evidence. Keep these classes explicit.

## Source reference requirements

Each `sourceRefs[]` item must include:

- `sourceId`
- `sourceType`
- `title`
- `evidenceClass`
- `extractConfidence`
- `reviewer`
- at least one of: `url` or `citationKey`

## Claim requirements

Each claim item must include:

- `claim`
- `evidenceClass`
- `sourceRefIds[]` (minimum one ID)

## Validation

- JSON Schema: `schemas/research-enrichment.schema.json`
- Scripted validation: `node scripts/validate-research-enrichment.mjs`
  - Validates shape for every detail file that includes `researchEnrichment`.
  - Validates claim provenance links (`sourceRefIds`) resolve to `sourceRefs.sourceId`.

## Notes for contractors

- Keep claims specific and atomic; avoid dense paragraph blobs.
- Use `unsupportedOrUnclearUses` when evidence is negative, weak, or conflicting.
- Use `conflictNotes` when source conclusions disagree.
- Use `researchGaps` to document missing populations, small samples, or absent replication.
- Do not backfill entire catalog in one pass; this model is designed for incremental enrichment.
