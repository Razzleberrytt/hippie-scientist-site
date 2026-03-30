# Source registry entry rules (contractor guide)

The reusable source registry lives at:

- `public/data/source-registry.json`

Validate it with:

- `node scripts/validate-source-registry.mjs`

Generate inventory summary with:

- `node scripts/report-source-registry.mjs`

## Source classes and when to use them

- `randomized-human-trial`: use for RCTs in humans.
- `non-randomized-human-study`: use for intervention studies without randomization.
- `observational-human-evidence`: use for cohort/case-control/cross-sectional human evidence.
- `systematic-review-meta-analysis`: use for pooled evidence summaries.
- `preclinical-mechanistic-study`: use for in vitro/in vivo animal mechanistic work.
- `traditional-use-monograph`: use for pharmacopeia/traditional textual monographs.
- `regulatory-agency-monograph-guidance`: use for agency monographs and formal guidance.
- `reference-database-authority`: use for structured authority databases used for normalization/context.

## Minimum required fields by source family

All source rows require:

- `sourceId`, `title`, `sourceType`, `sourceClass`, `evidenceClass`
- `language`, `publicationStatus`, `reliabilityTier`
- `reviewer`, `reviewedAt`, `active`

Scientific/clinical style rows should usually include:

- `authors[]`, `publicationYear`, `citationText`
- one or more of `doi`, `pmid`, `canonicalUrl`

Monograph/regulatory rows can use organization-style citation metadata instead of journal metadata:

- `organization`, `title`, `publicationYear`
- one of `monographId` or `isbn`
- `canonicalUrl` strongly recommended

## Consistency rules enforced in validation

- `sourceClass` determines allowed `sourceType` values.
- `sourceClass` determines allowed `evidenceClass` value.
- `pmid` is only allowed for classes where PubMed-style indexing is applicable.
- Every source needs at least one citation anchor: `canonicalUrl`, `doi`, or `pmid`.

## Mapping into enrichment claims

In `researchEnrichment` objects (`public/data/*-detail/*.json`):

1. Add the source IDs used by the entity to `sourceRegistryIds[]`.
2. For each claim, include one or more IDs in `sourceRefIds[]`.
3. Optionally add claim extraction notes in `sourceRefs[]` keyed by `sourceId`.

This keeps source metadata centralized while preserving claim-level traceability.
