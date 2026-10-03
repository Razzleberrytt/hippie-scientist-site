# Research enrichment Waves 51–100 — 2026-10-02

This is the next batch-first enrichment pass after merged PR #6199 (Waves 1–50).

## Selection rule

- Reuse already-vetted reconciliation research before spending fresh-search budget.
- Preserve negative/null findings, formulation/species identity, population limits, prevention-vs-treatment boundaries, surrogate-vs-clinical outcomes, and safety/interaction context.
- Do not infer consumer dosing from studied exposures.
- No entity creation, publishing/indexing promotion, recommendation promotion, monetization change, or governance override.
- Expensive repository-wide validation remains deferred until the 50-wave batch is consolidated.

## Dedupe adjustments

The source batch contained a second Saw Palmetto receipt pointing to the same PMID `17556649`; that duplicate receipt was not admitted as a separate wave.
Elderberry PMID `30670267` is already present in `public/data/claims.json`, so it was excluded from this batch.
Those two slots were replaced with already-vetted Sage human-evidence receipts PMID `24836739` and PMID `18350281`. During canonical entity validation, Pelargonium PMID `19435703` was also removed because `pelargonium-sidoides` is not an Entity_Master slug accepted by runtime enrichment; vetted Rhodiola endurance PMID `41080184` replaced that wave.

## Waves

- Wave 51 — **st-johns-wort** — PMID `18254000` — major depression; Cochrane review; preserve comparator, quality and standardized-preparation boundaries.
- Wave 52 — **st-johns-wort** — PMID `20166070` — depression meta-analysis; preserve heterogeneity and product-standardization limits.
- Wave 53 — **st-johns-wort** — PMID `16728550` — drug-interaction review; CYP/P-gp induction is first-class safety evidence.
- Wave 54 — **saw-palmetto** — PMID `17556649` — BPH systematic review; limited clinically important urinary benefit; preparation-specific.
- Wave 55 — **sage** — PMID `24836739` — systematic review of human Salvia cognition studies; preserve species/preparation heterogeneity.
- Wave 56 — **black-cohosh** — PMID `22526720` — menopausal vasomotor symptoms; mixed randomized evidence and preparation variability.
- Wave 57 — **black-cohosh** — PMID `18996653` — menopause review; inconsistent efficacy; keep liver-safety evidence separate.
- Wave 58 — **evening-primrose** — PMID `12614179` — atopic eczema systematic review; insufficient benefit; retain as null/counterweight.
- Wave 59 — **evening-primrose** — PMID `18343326` — cyclical mastalgia review; limited indication-specific evidence.
- Wave 60 — **cranberry** — PMID `37025731` — recurrent UTI prevention Cochrane review; population/formulation/adherence specific; not active-UTI treatment.
- Wave 61 — **cranberry** — PMID `17636757` — older UTI-prevention review; heterogeneous preventive effects; preserve historical uncertainty.
- Wave 62 — **d-mannose** — PMID `38587814` — recurrent UTI prevention systematic review; limited and heterogeneous evidence.
- Wave 63 — **d-mannose** — PMID `31860221` — randomized prevention evidence; possible benefit but small studies/comparator differences.
- Wave 64 — **echinacea** — PMID `25106650` — common-cold systematic review; inconsistent across species/preparations/outcomes.
- Wave 65 — **echinacea** — PMID `17044450` — respiratory randomized evidence; keep prevention, incidence and symptom duration separate.
- Wave 66 — **rhodiola** — PMID `41080184` — endurance/exercise performance RCT meta-analysis; preserve athletic context and distinguish performance endpoints from biomarkers.
- Wave 67 — **andrographis-paniculata** — PMID `18425900` — upper respiratory infection systematic review; preparation and method heterogeneity.
- Wave 68 — **andrographis-paniculata** — PMID `22419337` — common-cold randomized review; limited certainty; no chronic-disease generalization.
- Wave 69 — **elderberry** — PMID `31452297` — upper-respiratory symptom systematic review; possible duration benefit; limited high-quality trials.
- Wave 70 — **sage** — PMID `18350281` — randomized double-blind crossover human cognition trial; preparation/population/endpoint specific.
- Wave 71 — **licorice** — PMID `17944136` — deglycyrrhizinated licorice GI review; mixed evidence; DGL distinct from glycyrrhizin-containing licorice.
- Wave 72 — **licorice** — PMID `21511308` — blood-pressure/hypokalemia/fluid-retention safety evidence; dose/formulation dependent.
- Wave 73 — **ginkgo-biloba** — PMID `21649643` — dementia systematic review; uncertain clinical benefit; standardized-extract boundary.
- Wave 74 — **ginkgo-biloba** — PMID `21508585` — cognitive-impairment evidence; do not transfer to healthy-nootropic claims.
- Wave 75 — **ginkgo-biloba** — PMID `19548453` — tinnitus systematic review; insufficient meaningful benefit.
- Wave 76 — **panax-ginseng** — PMID `15235891` — acute cognition randomized evidence; domain-specific and short-term.
- Wave 77 — **panax-ginseng** — PMID `17617791` — glycemic systematic review; heterogeneous species/preparations/metabolic status.
- Wave 78 — **rhodiola** — PMID `20420942` — fatigue systematic review; small heterogeneous trials.
- Wave 79 — **rhodiola** — PMID `23270713` — exercise-performance randomized evidence; mixed; separate performance from subjective fatigue.
- Wave 80 — **maca** — PMID `19933124` — sexual-function systematic review; limited evidence and small samples.
- Wave 81 — **maca** — PMID `21116021` — menopause randomized evidence; limited; do not generalize sexual-function evidence.
- Wave 82 — **tribulus-terrestris** — PMID `25753475` — systematic review; insufficient support for testosterone/erectile-function claims.
- Wave 83 — **fenugreek** — PMID `23712493` — lactation systematic review; limited evidence and methodological weaknesses.
- Wave 84 — **fenugreek** — PMID `23483826` — glycemic systematic review; possible endpoint changes but variable quality/preparation.
- Wave 85 — **moringa** — PMID `32891299` — glycemic systematic review; limited human evidence; separate animal/mechanistic findings.
- Wave 86 — **moringa** — PMID `34217503` — lipid/metabolic human evidence; limited and heterogeneous.
- Wave 87 — **nigella-sativa** — PMID `31548990` — type-2-diabetes meta-analysis; some glycemic signals; heterogeneous interventions.
- Wave 88 — **nigella-sativa** — PMID `28673472` — metabolic-syndrome randomized evidence; small studies; surrogate outcomes.
- Wave 89 — **nigella-sativa** — PMID `25248694` — blood-pressure synthesis; possible reductions with substantial heterogeneity.
- Wave 90 — **grape-seed-extract** — PMID `23196448` — blood-pressure meta-analysis; modest endpoint-specific effects.
- Wave 91 — **pycnogenol** — PMID `19577412` — endothelial/cardiovascular biomarker randomized evidence; surrogate outcomes only.
- Wave 92 — **grape-seed-extract** — PMID `29205182` — metabolic systematic review; mixed biomarker effects.
- Wave 93 — **hibiscus-sabdariffa** — PMID `19877098` — hypertension randomized evidence; modest BP signal; preparation-specific.
- Wave 94 — **hibiscus-sabdariffa** — PMID `24617892` — cardiometabolic human evidence; variable populations/preparations.
- Wave 95 — **green-tea-extract** — PMID `21479771` — weight meta-analysis; small heterogeneous effects; reject fat-burner framing.
- Wave 96 — **green-tea-extract** — PMID `28417035` — hepatotoxicity systematic review; concentrated-extract safety warning distinct from brewed tea.
- Wave 97 — **curcumin** — PMID `30309580` — knee-OA systematic review/meta-analysis; formulation-sensitive symptom evidence.
- Wave 98 — **curcumin** — PMID `30709537` — inflammatory-marker meta-analysis; surrogate outcomes and heterogeneous formulations.
- Wave 99 — **boswellia-serrata** — PMID `25705405` — osteoarthritis randomized evidence; possible pain/function benefit; standardized-extract boundary.
- Wave 100 — **devils-claw** — PMID `17348898` — OA/low-back-pain systematic review; some pain evidence with trial-quality/extract limitations.

## Current state

- Waves selected and deduped: **50 / 50**
- Candidate PMIDs: **50 unique**
- Cheap canonical-claims dedupe: **complete**
- Runtime ledger materialization: **next**
- Full admission/build/site-health/Atomic/CI verification: **deferred until consolidation**
- Primary provenance: `ops/enrichment-submissions/reconciliation/2026-09-10-enrichment-batch-23.md`
- Replacement provenance: `ops/enrichment-submissions/reconciliation/2026-09-06-full-corpus-inventory.md`
