# Enrichment source policy (canonical)

This document is the canonical source policy for herb and compound enrichment in The Hippie Scientist. Future enrichment prompts should reference this file directly.

## Source hierarchy

Use sources in this order of preference, and cite the strongest available tier that supports each field.

### Tier 1 (default primary sources)

- NCCIH Herbs at a Glance
- NCCIH Herb-Drug Interactions
- NIH Office of Dietary Supplements (ODS) fact sheets
- PubMed
- PubChem
- Kew Plants of the World Online (POWO)
- NCBI Taxonomy
- European Medicines Agency (EMA) herbal monographs
- LiverTox
- FDA dietary supplement pages

### Tier 2 (supporting sources)

- Dietary Supplement Label Database (DSLD)
- DailyMed
- Drugs@FDA
- ClinicalTrials.gov
- Europe PMC
- WHO medicinal plant monographs
- MedlinePlus (**secondary cross-check only; not primary evidence**)

### Tier 3 (conditional sources)

Use only when directly relevant to the field being enriched.

- FDA ingredient-specific pages
- FDA Orange Book

## Field-to-source guidance

Map enrichment fields to the source types below.

### Plant identity

Primary targets:

- Kew POWO for accepted scientific name and synonym handling.
- NCBI Taxonomy for taxonomy lineage and identifiers.
- NCCIH and NIH ODS to align common names used in U.S. public health context.

### Compound identity

Primary targets:

- PubChem for compound identity, synonyms, structural identifiers, and basic properties.
- PubMed / Europe PMC for corroborating identity usage in literature.
- DailyMed / Drugs@FDA when compound identity must be cross-checked against approved labeling context.

### Evidence and mechanism

Primary targets:

- PubMed as the default evidence backbone.
- Europe PMC as supporting discovery and cross-check.
- NIH ODS / NCCIH / EMA monographs for high-level evidence framing and mechanism summaries.
- ClinicalTrials.gov for human trial existence/status.

### Safety and interactions

Primary targets:

- NCCIH Herb-Drug Interactions.
- LiverTox for hepatotoxicity context.
- EMA monographs for safety constraints and cautions.
- NIH ODS and NCCIH pages for clinical safety framing.
- DailyMed / FDA pages for labeling-level warnings when applicable.

### Regulatory and label context

Primary targets:

- FDA dietary supplement pages for U.S. supplement regulatory framing.
- Drugs@FDA and DailyMed for approved product/label context where applicable.
- FDA ingredient-specific pages and FDA Orange Book only when the record explicitly requires this context.

## Required enrichment rules

1. Do **not** use vendor blogs, SEO health pages, forums, Reddit, or unsourced wellness content as primary sources.
2. Do **not** invent missing values.
3. Only enrich fields that are supported by sources actually found.
4. Preserve uncertainty when evidence is limited, weak, or mixed.
5. Keep these categories separate in authoring and output:
   - taxonomy facts
   - chemistry facts
   - mechanism hypotheses
   - human evidence
   - safety cautions
   - regulatory status

## Prompt Header for Future Enrichment Runs

Use or inline this block in future prompts:

```md
### Canonical Source Policy (Required)
Follow `docs/enrichment-source-policy.md` as the governing evidence policy for this run.

- Prioritize Tier 1 sources first, Tier 2 as supporting, Tier 3 only when conditionally relevant.
- Do not use vendor blogs, SEO pages, forums, Reddit, or unsourced wellness content as primary evidence.
- Do not invent missing values.
- Enrich only fields directly supported by located sources.
- Preserve uncertainty where evidence is limited or mixed.
- Keep taxonomy, chemistry, mechanism, human evidence, safety, and regulatory facts explicitly separated.

If sources are insufficient for a requested field, leave the field unchanged and document the gap.
```

## Usage note

For all new herb/compound enrichment tasks, include a direct reference to this policy file in the prompt instructions before field-level requirements.
