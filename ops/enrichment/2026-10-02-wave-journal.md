# Research enrichment waves — 2026-10-02

This journal records the batch-first enrichment pass requested for The Hippie Scientist. Repository-wide verification is intentionally deferred until after Wave 50; source boundaries, null findings, uncertainty, formulation identity, and population limits were captured during authoring.

## Completed waves

- Wave 01 — magnesium, L-theanine, saffron current evidence refresh
- Waves 02–11 — stress/sleep/cognition core: ashwagandha, valerian, chamomile, creatine, lavender/Silexan, lion's mane, gotu kola, American ginseng, bacopa, rhodiola
- Waves 12–21 — safety/interactions + high-interest evidence: holy basil, kava, passionflower, St. John's wort, ginkgo, psyllium, zinc, selenium, citicoline/phosphatidylserine, CoQ10
- Waves 22–31 — performance/metabolic/cardiovascular: citrulline malate, vitamin D, beetroot nitrate, astaxanthin, spirulina, curcumin, garlic, aged garlic, ginger, olive leaf
- Waves 32–41 — longevity/metabolic/women's health/GI: NMN, resveratrol, omega-3, alpha-lipoic acid, acetyl-L-carnitine, pomegranate, peppermint oil, black cohosh, red clover, soy
- Waves 42–50 — menopause, osteoarthritis, glycemia, cognition-null, safety and final calibrations: evening primrose, Boswellia, aloe vera, taurine, cacao, saffron safety, ashwagandha glucose, garlic glycemic, curcumin OA

## Consolidated state

- Waves completed: **50 / 50**
- Canonical consolidated ledger: `data-sources/runtime-enrichment/2026-10-02-enrichment-waves-01-50.json`
- Unique evidence records after last-revision dedupe: **123**
- Unique source records after PMID/source-ID dedupe: **95**
- Duplicate retry revisions removed during consolidation: **17**
- New entity-context rows: 0
- New relationship rows: 0
- Governance/indexing/recommendation/monetization fields changed by the ledger: 0
- Full repository verification: **deferred until the final consolidated pass**

## Batch rule

No consumer dose recommendations are inferred from trial exposures. Combination products remain combination evidence. Biomarkers and surrogate outcomes remain distinct from clinical outcomes. Safety and null findings stay first-class records. Species, formulation, extract, age group, disease population, route, and retraction boundaries are preserved where relevant.

## Next step

Run the final consolidation verification once: manifest integrity, canonical entity resolution, evidence/source dedupe against the workbook, source-of-truth guard, schema/data validation, focused enrichment tests, then the normal CI/build/site-health gates. Do not re-expand into per-wave verification.
