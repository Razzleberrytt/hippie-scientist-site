# Enrichment Source Policy (Canonical)

This document is the canonical source-evidence policy for all future herb and compound enrichment runs in this repository.

## Scope and intent

- Applies to future enrichment prompts and enrichment execution for herb and compound records.
- Defines the default evidence hierarchy and how source quality maps to field-level updates.
- Standardizes source usage so runs are reproducible and comparable across operators.

## Evidence hierarchy

### Tier 1 — default primary sources

Use these first for core factual enrichment whenever applicable:

1. NCCIH Herbs at a Glance
2. NCCIH Herb-Drug Interactions
3. NIH ODS fact sheets
4. PubMed
5. PubChem
6. Kew Plants of the World Online
7. NCBI Taxonomy
8. EMA herbal monographs
9. LiverTox
10. FDA dietary supplement pages

### Tier 2 — supporting sources

Use to corroborate, fill structured context, and refine details when Tier 1 is incomplete:

1. DSLD
2. DailyMed
3. Drugs@FDA
4. ClinicalTrials.gov
5. Europe PMC
6. WHO medicinal plant monographs
7. MedlinePlus (secondary cross-check only)

### Tier 3 — conditional sources

Use only when directly relevant to a record or claim:

1. FDA ingredient-specific pages
2. FDA Orange Book

## Field-to-source guidance

### Plant identity

Prioritize:

- Kew Plants of the World Online
- NCBI Taxonomy
- NCCIH Herbs at a Glance (common-name and usage context support)

Use for:

- Accepted scientific name
- Synonym and taxonomy disambiguation
- Common-name cross-checking when tied to authoritative taxonomy

### Compound identity

Prioritize:

- PubChem
- PubMed (for compound-specific literature context)
- NCBI Taxonomy or Kew only when botanical-source linkage is required

Use for:

- Compound naming/identity normalization
- Structural/classification metadata
- Plant-compound association support when explicitly evidenced

### Evidence and mechanism

Prioritize:

- PubMed
- Europe PMC
- NIH ODS fact sheets
- NCCIH Herbs at a Glance

Use for:

- Mechanistic hypotheses and pathway-level framing
- Distinguishing preclinical vs. clinical evidence
- Capturing strength/limits of evidence and study-type context

### Safety and interactions

Prioritize:

- NCCIH Herb-Drug Interactions
- LiverTox
- EMA herbal monographs
- FDA dietary supplement pages
- DailyMed (supporting labeling context)

Use for:

- Interaction cautions
- Hepatotoxicity/safety signals
- Contraindications and adverse-effect cautions
- Human-relevant risk framing and uncertainty notes

### Regulatory and label context

Prioritize:

- FDA dietary supplement pages
- Drugs@FDA
- DailyMed
- EMA herbal monographs
- FDA ingredient-specific pages (Tier 3 conditional)
- FDA Orange Book (Tier 3 conditional)

Use for:

- Regulatory posture context
- Labeling and approved-product context (where relevant)
- Distinguishing supplement context vs. drug approval context

## Enrichment rules

- Do not use vendor blogs, SEO health pages, forums, Reddit, or unsourced wellness content as primary sources.
- Do not invent missing values.
- Only enrich fields supported by sources actually found.
- Preserve uncertainty when evidence is limited or mixed.
- Separate taxonomy facts, chemistry facts, mechanism hypotheses, human evidence, safety cautions, and regulatory status.

## Operational rule (required)

- For all future full-index enrichment work, use this source hierarchy first and update each enriched record’s sources/title/url fields with the exact references actually used during that run.

## Prompt Header for Future Enrichment Runs

Use or inline this block at the top of future enrichment prompts:

```md
### Source Policy Header (Required)
Use `ops/enrichment-source-policy.md` as the canonical source-evidence policy for this run.

Follow its tiered hierarchy:
- Tier 1 default primary sources first
- Tier 2 supporting sources for corroboration and structured gaps
- Tier 3 conditional sources only when directly relevant

Hard rules:
- Do not use vendor blogs, SEO health pages, forums, Reddit, or unsourced wellness content as primary sources.
- Do not invent missing values.
- Only enrich fields supported by sources actually found.
- Preserve uncertainty when evidence is limited or mixed.
- Keep taxonomy facts, chemistry facts, mechanism hypotheses, human evidence, safety cautions, and regulatory status clearly separated.

For all future full-index enrichment work, use this source hierarchy first and update each enriched record’s sources/title/url fields with the exact references actually used during that run.
```

## Usage for future prompts

Future enrichment prompts should reference this file explicitly, for example:

- "Apply `ops/enrichment-source-policy.md` as the canonical source policy for this run."

If prompt constraints conflict with this policy, treat this policy as the default baseline unless explicit human instructions override it.
