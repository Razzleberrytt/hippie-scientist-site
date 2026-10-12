# High-risk botanical interaction evidence — approval-ready review matrix

**Created:** 2026-10-12  
**Source status:** Original primary-study PubMed abstracts, exact identities/DOIs, and government safety sources inspected in this work session. AI source spot-check **only**; **NOT V_VERIFIED**, not an independent scientific review, not a medical-professional opinion, and not a recorded human approval.

**Publication state:** Two new **P0 safety candidates** remain as **pre-publication drafts**; no source is promoted into the canonical ledger or published content. This matrix is a reviewer handoff, not a second medical data authority.

## DE10-01 — St. John's wort × hormonal contraceptives

**Staged draft:** `ops/editorial-runtime/publication-pilots/st-johns-wort-contraception-interaction-2026-10-12.md`

| Exact source | Study class and result | Null/limit to preserve | Claim review |
| --- | --- | --- | --- |
| Hall 2003 [PMID 14663455](https://pubmed.ncbi.nlm.nih.gov/14663455/), DOI 10.1016/j.clpt.2003.08.009 | Human pharmacokinetic trial **12** oral contraceptive users; increased norethindrone clearance (8.2→9.5 L/h, p=.042), shortened ethinyl estradiol half-life (23.4→12.2 h, p=.023); breakthrough bleeding **7/12 vs 2/12** in sequential phases. | FSH, LH, progesterone nonsignificant; bleeding is **not a quantified pregnancy failure rate**. | Pending |
| Pfrunder 2003 [PMID 14616430](https://pubmed.ncbi.nlm.nih.gov/14616430/), DOI 10.1046/j.1365-2125.2003.02005.x | Human RCT in **18 women**; lower active desogestrel metabolite exposure and more bleeding with extract. | Follicle maturation/ovarian hormone markers did **not** significantly differ in this study; does not prove no interaction risk. | Pending |
| Murphy 2005 [PMID 15914127](https://pubmed.ncbi.nlm.nih.gov/15914127/) | Human sequential study in **16 women**; lower contraceptive exposure, more breakthrough bleeding, follicular growth and **probable ovulation**. | Probable ovulation is not a directly observed pregnancy rate. | Pending |
| Will-Shahab 2009 [PMID 19015839](https://pubmed.ncbi.nlm.nih.gov/19015839/), DOI 10.1007/s00228-008-0587-2 | Human pharmacokinetic study, **16** volunteers, low-hyperforin **Ze 117** extract: no clinically relevant loss of measured ethinyl estradiol/ketodesogestrel exposure. | **Product- and pill-specific null only**; does not establish contraceptive effectiveness or exemption for all low-hyperforin products. PubMed abstract includes a **corrected** PK direction: preserve correction. | Pending |
| [2016 systematic review, PMID 27444983](https://pubmed.ncbi.nlm.nih.gov/27444983/) | Synthesis of four prior comparative studies with positive interaction findings and conflicting ovarian markers. | Review is **not four new independent RCTs** in addition to the cited primaries. | Pending |
| [MHRA contraception advisory](https://www.gov.uk/drug-safety-update/st-john-s-wort-interaction-with-hormonal-contraceptives-including-implants) / [NCCIH](https://www.nccih.nih.gov/health/st-johns-wort) | Regulator/NIH advisories caution interaction across hormonal methods; surveillance reports include suspected contraceptive failures. | Spontaneous reports have no denominator; do not invent failure percentage, interpret IUD scope carefully. | Pending |

**Existing-site clue:** `public/data/herbs-detail/st-johns-wort.json` has broad interactions, only general displayed sources, `NOINDEX` and no matching targeted `content/articles/st-johns-wort.md`. A new article may be legitimate, but existing canonical/crawl identity and audience-intent overlap remain unverified. Do **not** change the existing noindex decision merely because a draft exists.

**Independent reviewer tasks:**
- [ ] Check exact extracts, comparator order and ovarian-activity findings in full texts, especially Murphy's “probable ovulation” versus Pfrunder's null ovarian endpoints.
- [ ] Confirm MHRA current regulatory position and contraceptive-method nuances with a qualified reviewer; do not recommend method-specific changes or emergency contraception regimens without professional authorization.
- [ ] Confirm any correction/erratum (especially Ze 117 study) and current retraction status; reconcile all primary PMIDs and DOI aliases with canonical registry.
- [ ] Approve or reject exact patient-facing wording with **named human owner, timestamp, PR head and source version**; separate owner's editorial authorization from clinical credentials.
- [ ] Resolve/preserve existing safety-promotion protection requirement [#6672](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6672) before public route implementation.

## DE10-02 — Licorice × diuretics and potassium/blood pressure

**Staged draft:** `ops/editorial-runtime/publication-pilots/licorice-diuretic-hypokalemia-safety-2026-10-12.md`

| Exact source | Study class and result | Null/limit to preserve | Claim review |
| --- | --- | --- | --- |
| Hukkanen et al. 2009 [PMID 19562574](https://pubmed.ncbi.nlm.nih.gov/19562574/), DOI 10.1080/08037050903072515 | **Randomized open crossover**, ten healthy volunteers; **licorice + hydrochlorothiazide** potassium decrease **0.32 mmol/L (p=.0015)**; **2/10** had hypokalemia in combination period, both discontinued early. | Solo-licorice short phase nonsignificant for potassium; not safety proof. **2/10 is not an event incidence estimate for users.** | Pending |
| Sigurjónsdóttir et al. 2003 [PMID 12574791](https://pubmed.ncbi.nlm.nih.gov/12574791/), DOI 10.1038/sj.jhh.1001504 | Human experimental exposure; hypertensive participants had average clinic SBP increase **15.3 mmHg (p=.003)** vs **3.5 mmHg (p<.06)** in normotensives; between-group difference p=.004. | Not a double-blind placebo outcome RCT; not measured cardiovascular-event rates; no general consumer-safe threshold. | Pending |
| [NCCIH licorice](https://www.nccih.nih.gov/health/licorice-root) / [MSKCC licorice](https://www.mskcc.org/cancer-care/integrative-medicine/herbs/licorice) | Expert institutional safety summaries: true glycyrrhizin-containing licorice can lower potassium and raise BP; medication and host risks matter. | Do not assume candy is true licorice, assume DGL is same intervention, or assign the trial's effects to every supplement. | Pending |
| [EMA revised herbal monograph](https://www.ema.europa.eu/en/medicines/herbal/liquiritiae-radix) | Regulatory botanical and preparation context; **2026 revision**, not an efficacy RCT. | Regulatory/adverse-event reports do not establish trial event incidence. | Pending |

**Existing-site clue:** `public/data/herbs-detail/licorice.json` lists limited narrative-review sources and generic hypertension/kidney cautions; its `indexability_status` is `PUBLISH`. Separate `ops/enrichment-submissions/sessions/session-f/2026-08-29-licorice-safety-integrity.json` contains draft-only licorice blood-pressure/potassium evidence. These existing drafts are **not approved runtime rows**. Preferred follow-up may be **precision update to existing licorice profile**, not another overlapping URL.

**Independent reviewer tasks:**
- [ ] Verify the 10-person crossover publication details, experimental product composition, potassium definition, measurement period and early discontinuations.
- [ ] Independently adjudicate relevance of findings to other potassium-lowering diuretics, cardiac disease and high-risk patients; avoid unvalidated incidence/risk guarantees.
- [ ] Resolve `Glycyrrhiza glabra`, generic licorice, `licorice-root`, DGL and product aliases with canonical source/claim identity; do not link incompatible exposures.
- [ ] Inspect generated public licorice route and existing canonical profile; choose surgical correction versus separate question-led safety page after SEO intent review.
- [ ] Record human approval of exact safety statements **before** any promotion or public update and run the protected release pipeline.

## Both cases — outstanding publication contract

1. **Approval receipt:** Human owner signs off exact copy/commit; an AI model cannot substitute for the named human or expert credential. Lack of comment/approval is not implicit consent.
2. **Science:** Verify full texts, primary RCT vs human PK vs observational/crossover vs regulator reporting, correction status, compound identity and source-key dedupe.
3. **Scope:** Reader-facing safety and dosing assertions require explicit approval under `docs/editorial-review-workflow.md`; review-only evidence docs are permitted without clinical publication.
4. **Existing gate:** [#6600](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6600) prohibits automatic admission of unapproved enrichment and [#6672](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6672) tracks the human-approval timing defect.
5. **Separation:** Downstream public implementation must be a distinct, approved PR. No source citation counts, AI mentions, GSC performance or revenue may be claimed from these drafts.
6. **Status:** `SOURCE_CHECKED_BY_AI`; `INDEPENDENT_EDITORIAL_REVIEW_PENDING`; `HUMAN_SAFETY_APPROVAL_NOT_RECORDED`; `NOT_PUBLISHED`.
