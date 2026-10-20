# Deep enrichment 10 — ten bounded investigations (2026-10-11)

**Label:** owner-authorized AI scientific editorial review  
**Review status:** RESEARCH-ONLY / editorial intake; **not** V_VERIFIED and **not** independently signed off.  
**Scope:** Ten source-grounded claim audits across interactions, formulation identity, efficacy, and contradictory trials. Primary article records and PubMed abstracts inspected on 2026-10-11. This is **not** a systematic literature review, not ten automatically admitted runtime evidence rows, and not authorization to publish clinical claims.  
**Exclusions:** No changes to medical recommendations, canonical IDs, reader-visible clinical safety copy, product recommendations, affiliate rankings, doses, publishing/indexing/SEO, or governance. Historical research/source rows remain immutable. Existing source identities are **reused** after canonical reconciliation rather than counted as novel.

## Intake summary

| ID | Subject and target claim | Evidence class | Disposition | Priority |
| --- | --- | --- | --- | --- |
| DE10-01 | St John's wort + oral contraceptive interactions are extract dependent but real | Human PK/clinical trials | Safety-review candidate, not publication-ready | P0 |
| DE10-02 | Licorice + thiazides may compound potassium depletion | Human randomized open crossover / controlled exposure | Safety-review candidate | P0 |
| DE10-03 | Kelp iodine content is extremely variable; food ≠ supplement assay | Analytical chemistry / label survey | Identity/quality firewall | P0 |
| DE10-04 | Red yeast rice can contain lovastatin-equivalent monacolin K in unpredictable quantities | Product-assay studies | Identity/safety firewall | P0 |
| DE10-05 | Saw palmetto lacks clinically useful LUTS/BPH effect in two large trials | Human RCT | Efficacy correction candidate | P1 |
| DE10-06 | Rhodiola antidepressant claims exceed evidence in small three-arm trial | Human phase-II RCT | Null-efficacy correction candidate | P1 |
| DE10-07 | Lion's mane positive MCI result does not imply acute healthy-adult cognition benefit | Human RCTs, different populations/extracts | Mixed/identity firewall | P1 |
| DE10-08 | L-theanine: small trials, placebo response, branded product limits | Human RCTs | Precision/certainty correction | P1 |
| DE10-09 | Psyllium lowers LDL modestly in adjunct-to-diet trials; no clinical-outcome demonstration | Human RCTs | Quantified efficacy candidate | P1 |
| DE10-10 | Cranberry juice prevention trials conflict by outcome definition and population | Human RCTs | Mixed-results correction candidate | P1 |

## DE10-01 — St John's wort × hormonal contraception

**Question:** Does *Hypericum perforatum* exposure alter combined-pill metabolism or contraceptive efficacy, and can results from one formulation be generalized?  
**Primary evidence:** Hall et al. (2003), human PK trial in 12 pill users, [PMID 14663455](https://pubmed.ncbi.nlm.nih.gov/14663455/): norethindrone oral clearance increased, ethinyl estradiol half-life decreased, and breakthrough bleeding occurred in 7/12 during co-use vs 2/12 in control; gonadotropin/progesterone measures were not significantly different. Pfrunder et al. (2003), human randomized clinical/PK study, [PMID 14616430](https://pubmed.ncbi.nlm.nih.gov/14616430/): more breakthrough bleeding and lower 3-ketodesogestrel exposure, **without observed ovulation** in the studied cycles. Will-Shahab et al. (2009), human PK study of **low-hyperforin Ze 117** in 16 volunteers, [PMID 19015839](https://pubmed.ncbi.nlm.nih.gov/19015839/): no clinically important PK interaction with the particular pill/extract combination studied.  
**Synthesis:** Evidence of interaction is clinically relevant but not equivalent to an observed pregnancy rate. Low-hyperforin PK null is an extract-specific result, **not** a class-wide safety exemption or proof of contraceptive protection.  
**Prohibited inference:** All preparations cause documented pregnancies; all low-hyperforin products are proven compatible with contraceptives; absence of measured ovulation in one short trial establishes no risk.  
**Potential edit after review:** Pair the clinical interaction warning with explicit extract and measured-outcome qualifiers; clinician/pharmacist review of possible contraceptive interactions, without generic dosing advice.  
**Status:** P0 candidate; source identity already represented in repository for PMID 14663455, so reconcile before any ledger admission.

## DE10-02 — Licorice and potassium-losing diuretics

**Question:** Can licorice intensify thiazide-associated potassium loss?  
**Primary evidence:** A human randomized, **open-label crossover** study of 10 healthy volunteers compared licorice alone with licorice plus hydrochlorothiazide over two-week exposures, [PMID 19562574](https://pubmed.ncbi.nlm.nih.gov/19562574/). Potassium did **not** significantly change in the licorice-only phase; the combination reduced plasma potassium by 0.32 mmol/L, and 2/10 developed hypokalemia during the combined phase. Separate controlled exposure in adults with/without essential hypertension, [PMID 12574791](https://pubmed.ncbi.nlm.nih.gov/12574791/), found greater mean blood-pressure responses among those with hypertension; this was **not** a randomized placebo-controlled outcome trial.  
**Synthesis:** A small human physiological interaction signal with a clinically meaningful hypokalemia event; evidence does not yield a population incidence estimate or a universal amount of licorice that is safe. Exposure amount and glycyrrhizin content matter.  
**Null/caveat:** Licorice-alone null within 10-person crossover; lack of long-term outcome data.  
**Potential edit:** Explicit potassium-losing diuretic interaction and hypertension-risk note, separated from mechanistic pseudoaldosteronism explanation.  
**Status:** P0 safety-review candidate; no patient-level action or dosing recommendations.

## DE10-03 — Kelp iodine variability

**Question:** Do source species and processing materially affect iodine exposure?  
**Primary evidence:** Teas et al. (2004), **analytical study, not a clinical trial**, assayed 12 dietary seaweed species and preparations, [PMID 15588380](https://pubmed.ncbi.nlm.nih.gov/15588380/). Reported iodine levels ranged from about 16 micrograms/g (nori) to above 8,165 micrograms/g in a particular processed kelp-granule sample. A U.S. multivitamin **label survey**, [PMID 30266075](https://pubmed.ncbi.nlm.nih.gov/30266075/), documented that kelp was used as iodine source for some prenatal products; this survey read labels and **did not chemically verify actual contents**.  
**Synthesis:** The botanical group, preparation, serving mass, and processing create an exposure-identification problem. The seaweed-food assay **cannot** be misrepresented as a measured distribution across current kelp supplement bottles.  
**Null/gap:** Neither study establishes thyroid-disease incidence from a specific commercial product or measured versus labeled content in that product.  
**Potential edit:** Add species/product/lot verification gate and avoid generic kelp-to-iodine conversion or uniform per-serving amounts.  
**Status:** P0 product/identity hold; require current product laboratory evidence for numeric label-accuracy claims.

## DE10-04 — Red yeast rice strength and contamination

**Question:** Can “red yeast rice 1200 mg” be treated as a reproducible lovastatin-equivalent exposure?  
**Primary evidence:** Cohen et al. (2017), **analytical study, not an RCT**, [PMID 28641460](https://pubmed.ncbi.nlm.nih.gov/28641460/): among 28 U.S. brands, monacolin K was undetectable in 2, and the other 26 varied more than 60-fold per 1,200 mg. Gordon et al. (2010), **product assay**, [PMID 20975018](https://pubmed.ncbi.nlm.nih.gov/20975018/): monacolin K varied substantially across 12 commercial preparations; four samples had elevated citrinin.  
**Synthesis:** Monacolin K is chemically identical to lovastatin, but measured potency is product/lot specific; labeled rice mass does not establish pharmacologically equivalent dose. Historical assay prevalence **must not** be portrayed as the current prevalence of citrinin contamination.  
**Null/gap:** No cardiovascular event, harm-incidence, or product-specific safety inference can be drawn from these cross-sectional assays.  
**Potential edit:** Flag statin-like pharmacology and variable strength alongside separate citrinin quality concern; require precise product claims to be lot-tested.  
**Status:** P0 risk + product-identity hold. Not a product endorsement.

## DE10-05 — Saw palmetto for BPH/LUTS

**Question:** Does *Serenoa repens* improve urinary symptoms beyond placebo, including at higher exposure?  
**Primary evidence:** Bent et al. (2006), double-blind RCT of 225 men followed for one year, [PMID 16467543](https://pubmed.ncbi.nlm.nih.gov/16467543/): **no significant difference** in symptom score, urinary flow, prostate size, or related outcomes. Barry et al. (2011), multicenter double-blind RCT of 369 men up to 72 weeks with escalating extract exposures, [PMID 21954478](https://pubmed.ncbi.nlm.nih.gov/21954478/): mean urinary symptom improvement **was not superior to placebo**, including secondary endpoints.  
**Synthesis:** For these tested extracts and participant groups, robust null findings outweigh generic “clinically proven prostate relief” claims.  
**Limit:** Does not establish that every formulation or every endpoint in every population is identical.  
**Potential edit:** Prominently state placebo-controlled null results; separate traditional-use claims from clinically observed efficacy.  
**Status:** P1 candidate. PMID 21954478 already occurs in repository; no new-source claim until deduped.

## DE10-06 — Rhodiola for depressive symptoms

**Question:** Does the trial justify equivalence to sertraline, or a demonstrated antidepressant effect?  
**Primary evidence:** Mao et al. (2015), 12-week **phase-II three-arm randomized placebo-controlled trial**, n=57, [PMID 25837277](https://pubmed.ncbi.nlm.nih.gov/25837277/). HAM-D, BDI, and clinician global change comparisons were **not significantly different across groups** (p=0.79, 0.28, 0.17 respectively). Adverse events were reported by 63.2% of sertraline recipients, 30.0% of rhodiola recipients, and 16.7% of placebo recipients.  
**Synthesis:** Fewer reported adverse events in a small trial cannot support a generalized claim of equivalent antidepressant efficacy or a proven favorable real-world benefit-risk profile. Non-significant between-group efficacy is an essential headline, not a footnote.  
**Null/gap:** Not powered as a noninferiority/equivalence study; one trial cannot establish replacement for prescription treatment.  
**Potential edit:** Correct overly positive depression claims; keep adverse-event observations explicitly trial-specific.  
**Status:** P1 source-reuse candidate: PMID 25837277 appears in pre-existing reconciliation/index materials.

## DE10-07 — Lion's mane cognition and population transfer

**Question:** Can a positive mild cognitive impairment (MCI) study support promises of instant focus for healthy young adults?  
**Primary evidence:** Mori et al. (2009), double-blind placebo RCT, **30 older adults with MCI**, [PMID 18844328](https://pubmed.ncbi.nlm.nih.gov/18844328/): cognition-scale scores improved vs placebo during a 16-week trial; small sample and population restriction apply. Surendran et al. (2025), **acute crossover RCT of 18 healthy adults aged 18–35**, [PMID 40276537](https://pubmed.ncbi.nlm.nih.gov/40276537/): **no significant effect on global cognitive or mood composite** after acute fruiting-body extract; a single pegboard-task result was positive.  
**Synthesis:** Longer-term MCI and acute young-adult studies differ in population, extract, duration and outcomes. “Proven instant mental clarity” is unsupported.  
**Null/gap:** No adequate clinical evidence from these two studies for ADHD treatment or neurological disease modification.  
**Potential edit:** Keep small-MCI positive finding beside younger-healthy acute null, with explicit route/extract identity.  
**Status:** P1; PMID 18844328 is already mentioned in repository materials, reuse rather than re-count.

## DE10-08 — L-theanine stress and cognitive endpoints

**Question:** Which improvements were measured, and were they better than placebo?  
**Primary evidence:** Hidese et al. (2019), double-blind randomized crossover trial of 30 healthy adults after four weeks, [PMID 31623400](https://pubmed.ncbi.nlm.nih.gov/31623400/): several stress, sleep, and executive measures improved, but comparisons must distinguish **within-arm changes from between-condition differences**; investigators included employees of the material supplier. Moulin et al. (2024), branded-product 28-day double-blind RCT with **15 participants per arm**, [PMID 38758503](https://pubmed.ncbi.nlm.nih.gov/38758503/): both placebo and active groups improved in perceived stress; **between-group salivary cortisol change was nonsignificant**; there were selected task/sleep signals, product-specific and small.  
**Synthesis:** These are small, short-duration studies; broad anxiety-disorder treatment and generalizable cognitive enhancement remain unestablished.  
**Null/gap:** Do not present within-arm PSS improvement as a proven active-versus-placebo benefit; no hard functional outcomes established.  
**Potential edit:** Differentiate outcome-specific signals, placebo response, conflicts, and brand/generic formulation.  
**Status:** P1; 2019 PMID already cited on live article and guide routes; correct claim framing, not duplicate source identity.

## DE10-09 — Psyllium and LDL cholesterol

**Question:** How large is the randomized LDL change and what is the outcome ceiling?  
**Primary evidence:** Anderson et al. (2000), multicenter 26-week randomized cellulose-placebo comparison adjunct to a controlled diet, [PMID 10837282](https://pubmed.ncbi.nlm.nih.gov/10837282/): LDL **6.7% lower than placebo** at 24–26 weeks; other reported outcomes did not significantly differ. Davidson et al. (1998), 24-week randomized double-blind study of foods containing psyllium among **286 adults**, [PMID 9497178](https://pubmed.ncbi.nlm.nih.gov/9497178/): highest intervention group had LDL 5.3% below control at week 24; no significant HDL or triglyceride benefit.  
**Synthesis:** These studies support a modest **surrogate lipid marker** change in hypercholesterolemic adults under study conditions, not prevention of cardiovascular events or interchangeability with therapy.  
**Null/gap:** HDL/triglyceride null; no clinical-event endpoint in these studies.  
**Potential edit:** Express LDL delta with comparator and duration; avoid generic “protects your heart” as an endpoint claim.  
**Status:** P1 efficacy-precision candidate.

## DE10-10 — Cranberry prevention: contradictory RCT outcomes

**Question:** Does cranberry juice consistently prevent recurrent UTI in women?  
**Primary evidence:** Barbosa-Cesnik et al. (2011), placebo-controlled RCT of **319 college women** with acute UTI, [PMID 21148516](https://pubmed.ncbi.nlm.nih.gov/21148516/): **no prevention benefit**, recurrence 20% cranberry versus 14% placebo. Stapleton et al. (2012), placebo-controlled RCT of **176 premenopausal women**, [PMID 22305026](https://pubmed.ncbi.nlm.nih.gov/22305026/): adjusted UTI hazard ratio 0.68 (95% CI 0.33–1.39; p=.29), **not significant**. Maki et al. (2016), 24-week randomized placebo-controlled trial with **373 women** and a specified beverage, [PMID 27251185](https://pubmed.ncbi.nlm.nih.gov/27251185/): investigator-diagnosed clinical UTI episodes 39 vs 67; adjusted rate ratio 0.61 (95% CI 0.41–0.91), but **time to culture-positive UTI did not significantly differ** (HR 0.97, p=.914). The Maki study had beverage-manufacturer support.  
**Synthesis:** Mixed trial results; distinguish clinically diagnosed episode counts, time to culture-verified UTI, studied populations and beverage identities. Preventive findings are **not treatment** for active infections.  
**Null/gap:** No inference that a generic retail capsule matches any studied juice; do not assert equivalence across cranberry PAC standardizations.  
**Potential edit:** A balanced prevention-only review with both positive and null trials, upfront outcome definitions.  
**Status:** P1 mixed-evidence candidate.

## Dedupe, publication and validation gates

- **Ten completed topic syntheses, not ten guaranteed novel PMIDs or ten production additions.** Original repo PMID spot checks found prior instances of: 14663455, 21954478, 25837277, 18844328, 31623400. Those are candidate **source reuses**; full canonical workbook and runtime source-key reconciliation is still required.
- **Evidence type is always labeled.** Product laboratory analyses, label surveys and controlled nonrandomized observations are **not** human efficacy RCTs; studies with randomization are scoped by extract, subject population, endpoint and duration.
- **Null results preserved.** In particular: no BPH benefit in two trials, no between-group significant depression change in the rhodiola trial, no acute global cognition or mood benefit in young-adult lion's mane trial, no cortisol group difference in the branded L-theanine trial, no consistent cranberry UTI benefit, and no established clinical-event benefits from psyllium trials.
- **Do not create automatic evidence-runtime ledgers or publish safety updates** from this intake. Independent scientific editorial confirmation, exact PubMed/DOI/title checks, duplicate-source reconciliation, product/formulation identity mapping, and relevant safety/approval gates are required before promotion. Historical waves are immutable; no reopening of quarantined records.
- **Follow-on acceptance tests:** source identity exact-match (PMID/title/year/DOI); target slug/entity existence; duplicate-source detection; extraction-vs-citation fidelity; formulation/route/outcome/null checks; independent approval; repository validation and green CI at exact PR head; after merge, production source/claim spot checks only if anything is promoted to public pages.
- **No synthetic ROI:** The dossier improves research precision but does not establish traffic, clicks, conversions, health outcomes, or deployed-site improvement. No clinical or commercial performance claim is authorized by this document.
