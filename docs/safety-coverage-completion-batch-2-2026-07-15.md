# Safety Coverage Completion — Batch 2

Date: 2026-07-15  
Status: Applied  
Branch: `agent/safety-coverage-batch-2`

## Outcome

Batch 2 reviewed the 25 remaining full-public compound profiles that had not been reviewed in Batch 1. It applied 50 workbook changes: 25 contraindication-field decisions and 25 safety-note revisions.

After the two batches, every one of the 50 originally audited full-public profiles has been reviewed. The strict audit now reports zero remaining actionable full-public gaps. Forty-one fields remain empty by design because reliable evidence does not support a specific human contraindication; these are recorded in `data-sources/safety-evidence-limited-exceptions.json` with evidence and reasons.

## Compounds completed

1. `11-keto-beta-boswellic-acid`
2. `acemannan`
3. `acetyl-11-keto-beta-boswellic-acid`
4. `alpha-asarone`
5. `alpha-mangostin`
6. `ashitaba-extract`
7. `atractylenolide-i`
8. `atractylenolide-ii`
9. `atractylenolide-iii`
10. `aucubin`
11. `betaine-hcl`
12. `betaine-nitrate`
13. `boswellia-akba-standardized`
14. `catuaba`
15. `cordyceps-militaris`
16. `diosgenin`
17. `echinacoside`
18. `erinacines`
19. `garcinol`
20. `guggulsterone`
21. `inositol-hexanicotinate`
22. `maca-root-extract`
23. `macamides`
24. `oxyresveratrol`
25. `uc-ii-collagen`

## Structured safety changes

- Cleared 24 unsupported token-only contraindication values.
- Confirmed one already-empty contraindication field as intentionally blank.
- Revised 25 safety narratives with source-specific human findings or explicit evidence limits.
- Removed unsupported claims involving pregnancy, liver or kidney disease, bleeding, hormone effects, and medication interactions where the available evidence was preclinical, multi-ingredient, whole-extract, or formulation-mismatched.
- Added a tracked evidence-limited exception manifest and made the strict audit fail on duplicate or stale exceptions.

## Evidence limitations

The dominant limitation was formulation mismatch. Evidence for whole botanical extracts, multi-herb products, or enriched preparations was not assigned to isolated constituents. Animal-only findings were labeled as preclinical and were not converted into human guidance. Pregnancy, breastfeeding, surgery, organ impairment, and medication-interaction claims remained blank unless supported by reliable human evidence.

Particularly limited profiles include isolated atractylenolides, alpha-mangostin, aucubin, erinacines, garcinol, macamides, oral oxyresveratrol, and the proprietary combination `betaine-nitrate`.

## Audit improvement

| Metric | Before Batch 1 | After Batch 2 |
|---|---:|---:|
| Full-public raw empty/token gaps | 50 | 41 |
| Documented evidence-limited exceptions | 0 | 41 |
| Remaining actionable full-public gaps | 50 | 0 |
| Token-only contraindications across all compounds | 214 | 170 |
| Real-prose contraindications across all compounds | 141 | 150 |

The raw gap count remains 41 because the project intentionally does not manufacture contraindication prose when evidence is unavailable. The actionable count is the completion metric.

## Two-batch completion totals

- Total compounds reviewed: 50
- Total compounds updated: 45
- Total workbook safety cells revised: 89
- Evidence-supported safety entries added or materially improved: 53
  - 9 readable contraindication entries
  - 44 safety-note entries
- Unsupported token-only contraindications removed: 35
- Evidence-limited profiles reviewed without a contraindication entry: 41
- Remaining actionable audited gaps: 0

## Principal evidence

The patch contains complete titles and identifiers. Principal sources include:

- Acemannan trial: DOI `10.1097/00042560-199606010-00008`
- Alpha-asarone toxicology review: DOI `10.1002/jat.4112`
- Alpha-mangostin systematic toxicity review: DOI `10.1016/j.heliyon.2023.e16045`
- Atractylenolides review: DOI `10.1007/s12272-021-01342-6`
- Betaine HCl gastric-pH trial: DOI `10.1007/s11095-019-2693-5`
- Boswellia/AKBA trial: DOI `10.1186/ar2461`
- Cordyceps trials: DOI `10.1038/s41598-024-58742-z` and `10.3389/fpsyt.2021.754921`
- Echinacoside-containing Cistanche EFSA assessment: DOI `10.2903/j.efsa.2021.6346`
- Erinacines preclinical systematic review: DOI `10.3389/fphar.2025.1582081`
- Guggulipid trial: DOI `10.1001/jama.290.6.765`
- Inositol hexanicotinate trial: DOI `10.1016/j.jacl.2012.10.004`
- Maca review: DOI `10.3389/fphar.2024.1360422`
- UC-II trial: DOI `10.1186/s12937-016-0130-8`

## Validation

- Workbook patch validation: passed (50 changes)
- Workbook schema validation: passed (881 rows, 52 columns)
- Workbook round-trip test: passed (22 sheets preserved)
- Core data build: passed
- Strict safety audit: passed, 0 actionable full-public gaps
- TypeScript: passed
- ESLint: passed with zero warnings
- Vitest: passed (96 files, 603 tests)
- Production static-export build: passed (20 deploy steps, 1,187 static pages)

## Recommended next priorities

1. Run the proposed Trust & Completeness Pass on these 50 profiles, using the existing evidence boundaries.
2. Add evidence-strength labels and concise “Who should avoid this?” summaries only where the reviewed sources support them.
3. Re-review evidence-limited exceptions when new human safety studies or exact product formulations become available.
4. Extend the exception-aware audit to other publication tiers without weakening the evidence standard.
