# Herb Indexability Batch 01

## Scope
Top 10 herbs from the indexability evidence-gap audit by promotable-source coverage were targeted.

## Completed enrichments (8)
- mandrake
- hyoscyamus-niger
- ipomoea-tricolor
- cbd
- ashwagandha
- chamomile
- kava
- withania-somnifera

For each completed herb:
- Added schema-valid `researchEnrichment` in `public/data/herbs-detail/<slug>.json`
- Replaced placeholder/NAN-style top-level narrative fields in `public/data/herbs.json` only where supported by linked source registry IDs
- Added claim-level provenance links to `researchEnrichment.sourceRegistryIds`

## Blockers (2)
1. `african-dream-root`
   - No approved candidates and no herb-scoped registry coverage in provided inputs, so schema-valid enrichment with real source IDs was not possible.
2. `acorus-calamus-var-angustatus`
   - Candidate wave did not provide clearly herb-scoped approved source mapping for claim-level provenance in this batch.

## Source promotions
No new promotions were required in this batch because approved candidates in `ops/source-candidates.json` were already present in `public/data/source-registry.json`.
