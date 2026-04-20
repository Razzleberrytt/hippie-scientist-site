# Citation Import Plan (Inspection-Only)

## Detected file path

- `data/import/citations.xlsx`

## Workbook structure (headers + first 10 row shapes only)

### Sheet: `Herb Master`

- Headers:
  - `name`, `slug`, `summary`, `description`, `primaryActions`, `mechanisms`, `activeCompounds`, `safetyNotes`, `contraindications`, `interactions`, `preparation`, `traditionalUses`, `evidenceLevel`, `relatedHerbs`, `region`
- First 10 row shapes (summarized):
  - All rows are 15-column rows.
  - Row 1 has 10 populated fields.
  - Rows 2-10 each have 7 populated fields.
  - Most frequently populated fields in first 10 rows: `name`, `slug`, `summary`, `description`, `mechanisms`, `activeCompounds`, `safetyNotes`.

### Sheet: `Compound Master`

- Headers:
  - `name`, `slug`, `summary`, `description`, `compoundClass`, `mechanisms`, `targets`, `pathways`, `foundIn`, `bioavailability`, `safetyNotes`, `evidenceLevel`, `relatedCompounds`
- First 10 row shapes (summarized):
  - All rows are 13-column rows.
  - Rows 1-10 each have 6 populated fields.
  - Most frequently populated fields in first 10 rows: `name`, `slug`, `summary`, `description`, `mechanisms`, `foundIn`.

### Sheet: `Herb Compound Map`

- Headers:
  - `herb_name`, `compound_name`
- First 10 row shapes (summarized):
  - All rows are 2-column rows.
  - Rows 1-10 each have 2 populated fields.

## Column mapping assessment

### Appears to map to herb/compound/entity

- Herb entity identifiers/details:
  - `Herb Master.name`, `Herb Master.slug`
- Compound entity identifiers/details:
  - `Compound Master.name`, `Compound Master.slug`
- Herb-compound relationship:
  - `Herb Compound Map.herb_name`, `Herb Compound Map.compound_name`

### Appears to map to citation/source metadata

- No explicit citation-source metadata columns were detected in inspected headers.
- Missing expected source metadata fields (examples): publication title, DOI/PMID/PMCID, URL, journal, year, study design, source type.

### Appears to map to claims/safety/mechanisms/interactions

- Claim-like narrative fields:
  - `summary`, `description`, `primaryActions`, `traditionalUses`, `evidenceLevel`
- Safety/interactions:
  - `safetyNotes`, `contraindications`, `interactions`
- Mechanism-related:
  - `mechanisms`, `targets`, `pathways`

## Obvious data-quality concerns

1. **File mismatch vs citation intent**: the workbook appears to be an entity master workbook, not a citation table.
2. **No citation keys**: no unique citation IDs or resolvable source identifiers (DOI/PMID/URL) are present.
3. **Narrative aggregation risk**: large free-text in `description` appears to aggregate multiple assertions and source-like statements, which cannot be safely split into citation-level facts without manual/source-grounded parsing.
4. **Sparse optional fields in sample**: many columns are blank in first 10 rows, which increases import ambiguity.
5. **Join reliability risk**: `Herb Compound Map` relies on names, not stable IDs, which can increase normalization/linking errors.

## Smallest safe citation ingestion path (proposed)

1. **Inspection gate only (this step)**
   - Detect file + inspect sheets/headers/sample row shapes without writing to any production data files.
2. **Require a citation-ready tabular schema before ingestion**
   - Ask for/derive a dedicated citation table (CSV/XLSX tab) with explicit citation identifiers and source metadata.
3. **Add a dry-run normalizer**
   - Build a script that maps rows into normalized JSON objects and reports validation errors only (no writes to herb/compound datasets yet).
4. **Introduce schema validation**
   - Validate normalized records against explicit `Citation`, `Claim`, and `ClaimCitationLink` schemas.
5. **Manual review checkpoint**
   - Review unresolved links (entity not found, missing source IDs, ambiguous claims) before any apply step.

This path keeps existing herb/compound data untouched and reduces risk of introducing unverifiable citations.

## Proposed normalized schema

### 1) Citation

```json
{
  "id": "cit:pmid:12345678",
  "sourceType": "journal_article",
  "title": "string",
  "authors": ["string"],
  "journal": "string",
  "year": 2024,
  "datePublished": "2024-05-17",
  "doi": "10.1000/xyz123",
  "pmid": "12345678",
  "pmcid": "PMC1234567",
  "url": "https://...",
  "abstract": "string",
  "studyDesign": "rct|systematic_review|meta_analysis|cohort|case_control|in_vitro|animal|other",
  "population": "string",
  "sampleSize": 120,
  "qualitySignals": {
    "peerReviewed": true,
    "riskOfBias": "low|moderate|high|unknown"
  },
  "ingestMeta": {
    "sourceFile": "data/import/citations.xlsx",
    "sourceSheet": "Citations",
    "sourceRow": 42,
    "ingestedAt": "2026-04-20T00:00:00Z"
  }
}
```

### 2) Claim

```json
{
  "id": "clm:ashwagandha:stress-support:001",
  "entityType": "herb|compound|formula|other",
  "entityRef": {
    "slug": "ashwagandha",
    "name": "Ashwagandha"
  },
  "domain": "efficacy|safety|interaction|mechanism",
  "claimType": "supports|associated_with|may_reduce|contraindicated_with|interacts_with|modulates",
  "claimText": "Ashwagandha may support stress response.",
  "mechanisms": ["HPA-axis modulation"],
  "interactionTargets": ["sedatives"],
  "safetyTags": ["pregnancy_caution"],
  "evidenceGrade": "A|B|C|D|insufficient",
  "status": "draft|reviewed|approved",
  "ingestMeta": {
    "sourceFile": "data/import/citations.xlsx",
    "sourceSheet": "Herb Master",
    "sourceRow": 2
  }
}
```

### 3) ClaimCitationLink

```json
{
  "id": "lnk:clm:ashwagandha:stress-support:001:cit:pmid:12345678",
  "claimId": "clm:ashwagandha:stress-support:001",
  "citationId": "cit:pmid:12345678",
  "relation": "supports|context|conflicts|safety_signal",
  "quotedEvidence": "Optional short excerpt",
  "evidenceLocation": {
    "section": "Results",
    "page": "5",
    "table": "Table 2"
  },
  "confidence": 0.84,
  "reviewStatus": "unreviewed|reviewed",
  "reviewedBy": "string",
  "reviewedAt": "2026-04-20T00:00:00Z"
}
```

## Notes

- No full import was performed.
- No herb or compound source data was rewritten.
