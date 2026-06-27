# Active-Compounds Tier 1 Expansion Impact (25-herb sample)

- Date: 2026-04-01
- Evaluation run (expanded sample): `run_01KN5JBCQ05H205RT6MMA2YNQ7`
- Prior baseline run (small sample): `run_01KN5GN422BKASQJJZTKFW4DDW`
- Strictness: unchanged (default evidence-acquisition-engine settings; no `--include-low-confidence`, no threshold or normalization overrides)
- Command used: `node scripts/enrichment/evidence-acquisition-engine.mjs --max-herbs=25 --focus-field=activeCompounds`

## Summary

The 25-herb activeCompounds-focused run produced **9 accepted fills** and **3 rejected attempts** across 25 selected herbs, with all accepted rows classified as Tier 1. This is a materially larger accepted evidence volume than the prior 5-herb baseline run (1 accepted, 0 rejected), while preserving strict gating. Newly added structured Tier 1 sources did contribute accepted values (PubChem = 1 accepted).

## Required Metrics

### Expanded run (25 herbs)

- selected herbs: 25
- accepted fills: 9
- rejected attempts: 3
- acceptedTierCounts: `{ "tier1": 9 }`
- accepted source hosts:
  - `pubmed.ncbi.nlm.nih.gov`: 5
  - `www.ncbi.nlm.nih.gov`: 3
  - `pubchem.ncbi.nlm.nih.gov`: 1
- normalized rejection reason counts:
  - `no_high_quality_source_found`: 1
  - `other/unknown`: 2

### Baseline run (5 herbs)

- selected herbs: 5
- accepted fills: 1
- rejected attempts: 0
- acceptedTierCounts: `{ "tier1": 1 }`
- accepted source hosts:
  - `www.ncbi.nlm.nih.gov`: 1
- normalized rejection reason counts:
  - `no_high_quality_source_found`: 0

## Source Contribution Breakdown (accepted activeCompounds only)

### Expanded 25-herb run

- PubMed / NCBI: 8
- Europe PMC: 0
- PubChem: 1
- ChEMBL: 0
- KEGG: 0
- DrugBank: 0
- USDA Phytochem: 0
- Other Tier 1 domains: 0

### Baseline 5-herb run

- PubMed / NCBI: 1
- Europe PMC: 0
- PubChem: 0
- ChEMBL: 0
- KEGG: 0
- DrugBank: 0
- USDA Phytochem: 0
- Other Tier 1 domains: 0

## Yield Analysis (25-herb sample)

- Attempted fills (accepted + rejected): 12
- Acceptance rate: 75.00% (9/12)
- Rejection rate: 25.00% (3/12)
- Herbs with at least one accepted activeCompounds fill: 9 of 25 (36.00%)
- Newly added structured source contribution: **Yes** (PubChem contributed 1 accepted fill)

## Before/After Impact (measurable)

- Accepted fills increased from 1 (5-herb baseline) to 9 (25-herb run).
- Accepted fills per selected herb improved from 0.20 (1/5) to 0.36 (9/25).
- Source diversity among accepted fills increased from 1 host to 3 hosts.
- Structured Tier 1 contribution appeared in the expanded sample (PubChem: 1 accepted), which was absent in baseline.

## Recommendation

Keep the current Tier 1 expansion as-is, and prioritize adding/improving **direct structured fetchers for currently classified-but-underused Tier 1 domains** (notably Europe PMC, ChEMBL, KEGG, DrugBank, USDA phytochemical endpoints) to raise non-NCBI share and source diversity in accepted activeCompounds fills.
