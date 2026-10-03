# Research enrichment waves — 2026-10-02

This journal records the batch-first enrichment pass requested for The Hippie Scientist. Repository-wide verification is intentionally deferred until the active enrichment block is consolidated; source boundaries, null findings, uncertainty, formulation identity, and population limits are captured during authoring.

## Completed waves

- Wave 01 — magnesium, L-theanine, saffron current evidence refresh
- Waves 02–11 — stress/sleep/cognition core: ashwagandha, valerian, chamomile, creatine, lavender/Silexan, lion's mane, gotu kola, American ginseng, bacopa, rhodiola
- Waves 12–21 — safety/interactions + high-interest evidence: holy basil, kava, passionflower, St. John's wort, ginkgo, psyllium, zinc, selenium, citicoline/phosphatidylserine, CoQ10
- Waves 22–31 — performance/metabolic/cardiovascular: citrulline malate, vitamin D, beetroot nitrate, astaxanthin, spirulina, curcumin, garlic, aged garlic, ginger, olive leaf
- Waves 32–41 — longevity/metabolic/women's health/GI: NMN, resveratrol, omega-3, alpha-lipoic acid, acetyl-L-carnitine, pomegranate, peppermint oil, black cohosh, red clover, soy
- Waves 42–50 — menopause, osteoarthritis, glycemia, cognition-null, safety and final calibrations: evening primrose, Boswellia, aloe vera, taurine, cacao, saffron safety, ashwagandha glucose, garlic glycemic, curcumin OA
- Waves 51–60 — under-covered canonical entities and explicit null/attribution evidence: 5-HTP, hops, L-tryptophan, lemon balm, Magnolia officinalis, N-acetylcysteine, oral GABA, spermidine, Nigella sativa, sulforaphane

## Consolidated state

- Waves 01–50: **merged to `main` in PR #6199**
- Waves 51–60: **staged on `data/research-enrichment-2026-10-02-waves-51-100`**
- Waves completed in the continuing program: **60 / 100**
- Waves 01–50 canonical ledger: `data-sources/runtime-enrichment/2026-10-02-enrichment-waves-01-50.json`
- Waves 51–60 staged ledger: `data-sources/runtime-enrichment/2026-10-02-enrichment-waves-51-60.json`
- Waves 51–60 additions: **10 evidence rows + 10 new source identities**
- New entity-context rows in Waves 51–60: 0
- New relationship rows in Waves 51–60: 0
- Governance/indexing/recommendation/monetization fields changed by Waves 51–60: 0
- Full repository verification for the continuation batch: **deferred until Waves 51–100 are consolidated**

## Batch rule

No consumer dose recommendations are inferred from trial exposures. Combination products remain combination evidence. Biomarkers and surrogate outcomes remain distinct from clinical outcomes. Safety and null findings stay first-class records. Species, formulation, extract, age group, disease population, route, and retraction boundaries are preserved where relevant.

## Next step

Continue Waves 61–100 on the same branch, then consolidate the continuation ledger and run the admission audit, manifest integrity, canonical entity resolution, evidence/source dedupe against the workbook, source-of-truth guard, schema/data validation, focused enrichment tests, and normal CI/build/site-health gates once at the end.
