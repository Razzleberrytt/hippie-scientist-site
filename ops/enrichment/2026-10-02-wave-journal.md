# Research enrichment waves — 2026-10-02

This journal records the batch-first enrichment pass requested for The Hippie Scientist. Expensive repository-wide verification is intentionally deferred until after Wave 50; source boundaries, null findings, uncertainty, formulation identity, and population limits were captured during authoring.

## Completed waves

- Wave 01 — magnesium, L-theanine, saffron current evidence refresh
- Waves 02–11 — stress/sleep/cognition core: ashwagandha, valerian, chamomile, creatine, lavender/Silexan, lion's mane, gotu kola, American ginseng, bacopa, rhodiola
- Waves 12–21 — safety/interactions + high-interest evidence: holy basil, kava, passionflower, St. John's wort, ginkgo, psyllium, zinc, selenium, citicoline/phosphatidylserine, CoQ10
- Waves 22–31 — performance/metabolic/cardiovascular: citrulline malate, vitamin D, beetroot nitrate, astaxanthin, spirulina, curcumin, garlic, aged garlic, ginger, olive leaf
- Waves 32–41 — longevity/metabolic/women's health/GI: NMN, resveratrol, omega-3, alpha-lipoic acid, acetyl-L-carnitine, pomegranate, peppermint oil, black cohosh, red clover, soy
- Waves 42–50 — menopause, osteoarthritis, glycemia, cognition-null, safety and final calibrations: evening primrose, Boswellia, aloe vera, taurine, cacao, saffron safety, ashwagandha glucose, garlic glycemic, curcumin OA

## Current staged totals

- Wave 01 ledger: 4 evidence rows + 4 source rows
- Waves 02–50 bulk ledger: 122 evidence rows + 122 source rows
- Total staged enrichment: **126 evidence rows + 126 source rows**
- New entity-context rows: 0
- New relationship rows: 0
- Governance/indexing/recommendation/monetization fields changed by evidence ledgers: 0

## Batch rule

No consumer dose recommendations are inferred from trial exposures. Combination products remain combination evidence. Biomarkers and surrogate outcomes remain distinct from clinical outcomes. Safety and null findings stay first-class records. Species, formulation, extract, age group, disease population, and route boundaries are preserved where relevant.

## Consolidation plan

Before reopening the PR, consolidate the bulk ledger under one manifest, deduplicate source identities deterministically, ensure every evidence row maps to an existing canonical entity, reconcile the magnesium citation-integrity defect tracked separately, and then run one final repository-wide validation/CI pass.
