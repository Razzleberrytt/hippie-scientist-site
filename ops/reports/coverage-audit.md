# Master Coverage Audit

Generated at: 2026-04-03T18:19:26.424Z

- Herbs audited: **698**
- Compounds audited: **390**
- Herb records missing sources: **0**
- Compound records missing sources: **0**
- Herb records with missing related links: **7**
- Compound records with missing related links: **0**
- Worse-shape dataset (scoring basis in JSON): **herb**

## Top 10 gaps

| Rank | Type | Field | Missing | Null-like / placeholder |
| --- | --- | --- | ---: | ---: |
| 1 | herb | interactions | 547 | 547 |
| 2 | herb | therapeuticUses | 543 | 543 |
| 3 | herb | contraindications | 528 | 528 |
| 4 | herb | activeCompounds | 519 | 519 |
| 5 | herb | sideEffects | 405 | 405 |
| 6 | compound | activeCompounds | 390 | 390 |
| 7 | compound | dosage | 390 | 390 |
| 8 | compound | duration | 390 | 390 |
| 9 | compound | legalStatus | 390 | 390 |
| 10 | compound | preparation | 390 | 390 |

## Priority backlog (first fixes)

- Backfill explicit slug fields and enforce slug uniqueness checks for both herbs and compounds.
- Enforce required source presence for every record; block records with missing or placeholder source arrays.
- Repair cross-link integrity: herb.activeCompounds should resolve to canonical compounds and compound.herbs should resolve to canonical herbs.
- Prioritize Tier A narrative and safety baseline completion (description, effects, contraindications/interactions where applicable).
- Normalize placeholder values (unknown/tbd/n/a/none) into true missing states before enrichment passes.

## Immediate validation rules

- Require non-empty Tier A fields: name, slug, description, effects, sources, and required relation field (herb.activeCompounds or compound.herbs).
- Reject null-like placeholders in Tier A fields (unknown, tbd, n/a, none, null, undefined, placeholder, coming soon).
- Require canonical slug formatting and uniqueness across each entity collection.
- Require all related-entity links to resolve to existing entity slugs.

See `ops/reports/coverage-audit.json` for complete machine-readable detail.
