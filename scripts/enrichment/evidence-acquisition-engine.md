# Evidence Acquisition Engine

Single-purpose enrichment module for source-backed field acquisition.

## Scope

Input: herb records with missing values in:
- `activeCompounds`
- `effects`
- `mechanism`
- `contraindications`
- `traditionalUse`

Output:
- structured extraction records with source + evidence + confidence
- normalization trace (`before` vs `after`) per extracted field value
- accepted vs rejected extraction sets
- patch files in existing patch shape (staged in `ops/evidence-acquisition/patches`)

## Run

```bash
npm run enrichment:evidence:acquire -- --max-herbs=5
```

or target explicit herbs:

```bash
node scripts/enrichment/evidence-acquisition-engine.mjs --herbs=aconitum-ferox,aloe-vera,allium-sativum --max-herbs=3
```

## Confidence policy

- `high`: direct field-term support in a primary source (PubMed/NIH)
- `medium`: source-backed normalized extraction with weaker directness
- `low`: rejected from patch output unless `--include-low-confidence`

Low-confidence rows are emitted under `rejected[]` and intended for manual review queue intake.
Rows that cannot be normalized into clean schema-ready values are also rejected.

## Integration path

1. Run acquisition engine to produce staged patch artifacts under `ops/evidence-acquisition/patches`.
2. Human review of accepted/rejected rows.
3. Promote selected patch files into `patches/`.
4. Run existing pipeline checks unchanged:
   - `node scripts/enrichment/validate-schema.mjs`
   - `node scripts/enrichment/validate-domain.mjs`
   - `node scripts/enrichment/apply-patches.mjs`

Notes:
- No existing pipeline scripts are modified.
- Validation standards are not relaxed.
