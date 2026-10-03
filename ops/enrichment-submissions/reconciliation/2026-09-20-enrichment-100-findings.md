# 2026-09-20 — 100-finding enrichment reconciliation

Research-only reconciliation for GitHub issues #5692, #5693, #5694, and #5695. **No canonical/public scientific mutation is authorized by this file.**

## Block summary

- 100 claim-level findings reviewed.
- 23 unique new PMID/DOI source identities.
- 0 exact source duplicates across the four passes.
- 1 pre-existing live citation is now retracted: PMID 41461240.
- Semantic overlap exists in probiotics/depression, ginseng/cognition, and NAC/SUD; these sources are complementary and must be synthesized rather than counted as independent “votes.”

## Source disposition ledger

| PMID | DOI | Evidence family | Reconciliation disposition | Required boundary |
|---|---|---|---|---|
| 41764841 | 10.1016/j.tjpad.2026.100518 | Healthy aging/MCI nutrient NMA | context/formulation-locked | Domain-specific cognition; preserve multi-nutrient combinations and monotherapy strata |
| 41750826 | 10.3390/foods15040634 | Taurine/SCAA cognition review | direct candidate | Acute-only; mostly null/inconsistent; caffeine combinations cannot establish taurine-alone efficacy |
| 39655146 | 10.7759/cureus.73350 | Vitamin B12 cognition/depression MA | direct counter-evidence | General-population nulls; do not apply to correction of documented deficiency |
| 40833470 | 10.1007/s00228-025-03904-9 | CoQ10 depression/anxiety MA | direct mixed candidate | MADRS positive; BDI and anxiety null; small trials |
| 41128676 | 10.1002/npr2.70066 | NAC AUD RCT | direct counter-evidence | Very small/short AUD trial; cognition and measured neurometabolites null |
| 39309000 | 10.3389/fphar.2024.1462612 | NAC SUD MA | direct mixed candidate | Craving signal weak/high heterogeneity; withdrawal null; short-term AE comparison only |
| 42374951 | 10.12809/eaap2643 | Probiotics/MDD MA | synthesis candidate | MDD population; strain/regimen heterogeneity unresolved |
| 41605120 | 10.1016/j.clnu.2025.106554 | Probiotics/depression + biomarkers MA | synthesis candidate | Symptom signal with IL-6/TNF-α null; no proven anti-inflammatory causal mechanism |
| 41863264 | 10.2174/011570159X415818251222083130 | Ginseng MCI/AD MA | synthesis candidate | Statistically positive but modest/non-clinically-significant magnitude |
| 40774237 | 10.1159/000547543 | Ginseng cognitive impairment MA | synthesis candidate | Population-specific; duration/dose uncertainty; no generic nootropic claim |
| 41640686 | 10.3389/fphar.2025.1672171 | Plant-active cognition NMA | context-only | SUCRA is indirect ranking, not head-to-head superiority |
| 40289957 | 10.3390/nu17060940 | Rhodiola short RCT | direct counter-calibration | Mental fatigue/cognition mostly trivial-to-small; selective strength signal |
| 41194549 | 10.1177/02698811251381261 | Scutellaria/Crataegus + Mg/Cr | formulation-locked | Mixed sleep result; stress-context cognition; A.Vogel provenance |
| 41540766 | 10.1002/brb3.71193 | Restake mushroom blend RCT | formulation-locked | Proprietary blend; Nexus Wise provenance; biomarkers not causal proof |
| 40006090 | 10.3390/ph18020278 | Aframomum/Vanizem RCT | formulation-locked | Two-day trial; exact extract; Nektium provenance; in-vitro mechanism not clinical causation |
| 41582693 | 10.1111/dom.70444 | Nutrition + mental health in diabetes | context/population-locked | T2D-dominant review; stress null; dietary composition result not isolated supplement efficacy |
| 40325976 | 10.1002/ptr.8509 | Olive leaf BP MA | direct mixed candidate | SBP signal; global DBP CI crosses zero; only three studies |
| 40636535 | 10.1002/hsr2.70979 | Q-actin cucumber RCT | formulation-locked counter-evidence | Treatment×time interaction null governs favorable descriptive trends |
| 42451042 | 10.3390/nu18132037 | Non-soy menopause herb SR | context-only | 19 interventions; black cohosh and dong quai nulls; class heterogeneity |
| 41782777 | 10.1177/20451253261415706 | Zensera lemon balm RCT | formulation-locked counter-evidence | Primary calmness endpoint null; secondary signals; Givaudan provenance |
| 42294065 | 10.1002/fsn3.72001 | Ginkgo + phosphatidylserine RCTs | formulation-locked | Exploratory combination evidence; Indena provenance |
| 41838185 | 10.1007/s00520-026-10398-3 | Panax ginseng cancer-related fatigue RCT | direct population-locked | GI-cancer survivors; not generic fatigue/energy evidence |
| 42469048 | 10.1016/j.jad.2026.122090 | Retraction notice | quarantine/context only | Notice is not efficacy evidence; governs withdrawal of PMID 41461240 |

## Retraction action

**Retracted article:** PMID 41461240 / DOI 10.1016/j.jad.2025.121055.

Repository search on the reconciliation date finds this PMID live in:

- `app/guides/anxiety/best-supplements-for-stress/page.tsx`

It is not present by exact PMID search in the canonical source registry, normalized enrichment ledger, or governed enrichment artifact. The required follow-up is therefore a source-integrity/public-ledger repair: append the retracted PMID and its notice to the existing quarantine authority, remove the retracted reference from the stress guide, renumber/update source counts, and preserve the remaining omega-3 uncertainty language without replacing it with an unsupported positive claim.

## Semantic synthesis rules

### Probiotics/depression
PMID 42374951 and PMID 41605120 should be treated as one synthesis family. The combined interpretation is: a depressive-symptom signal exists in diagnosed depression, while strain/regimen/population heterogeneity remains unresolved and pooled IL-6/TNF-α results do not support claiming that anti-inflammatory action caused the symptom change.

### Ginseng/cognition
PMID 41863264 and PMID 40774237 should be treated as one synthesis family. The combined interpretation is: small statistically positive changes on cognitive scales occur in impaired-cognition populations, but clinical significance, heterogeneity, dose, duration, and preparation uncertainty prevent a generic cognitive-enhancement claim.

### NAC/SUD
PMID 41128676 and PMID 39309000 should be treated as one synthesis family. The combined interpretation is: a broader SUD meta-analysis reports a weak/high-heterogeneity craving signal, while withdrawal is null and a small AUD RCT is null for measured cognitive and neurometabolite outcomes.

## Admission priority

1. **P0 source integrity:** PMID 41461240 retraction quarantine/removal.
2. **Counter-evidence calibration:** vitamin B12, CoQ10, NAC, Rhodiola, Q-actin, Zensera.
3. **Paired syntheses:** probiotics/depression; ginseng/cognition.
4. **Population-bounded efficacy:** olive leaf blood pressure; Panax ginseng cancer-related fatigue.
5. **Formulation/context evidence:** proprietary combinations and network meta-analyses.

## Non-negotiable boundaries

- Primary/null outcomes outrank favorable secondary or exploratory outcomes.
- Review/meta-analysis evidence remains review-level evidence.
- Combination/product results do not transfer to component ingredients.
- Population labels remain attached to every clinical claim.
- Biomarker and in-vitro findings do not establish clinical mechanism.
- Studied doses remain study context, not consumer recommendations.
- Sponsor/manufacturer relationships travel with the evidence.
- Short-term absence of serious adverse events is short-term tolerability only.
- Semantic overlap is synthesized, not vote-counted.
- Canonical promotion still requires normal source admission, semantic attestation, governor/lease authority where applicable, exact-head validation, and required CI/governance gates.

## Next governed work

This ledger closes the accumulation phase for the 100-finding block. The next legal work is not another research batch; it is bounded promotion through the existing governor, beginning with the retraction/source-integrity repair and then the counter-evidence packages above.
