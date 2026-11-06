# D-mannose evidence article — first governed public-content release candidate

**Date:** 2026-10-12
**Article path:** `content/articles/d-mannose-uti-prevention-evidence.md`
**Intended route:** `/articles/d-mannose-uti-prevention-evidence/` (route verification required)
**Status:** `OWNER_PUBLICATION_APPROVAL_PENDING` · `INDEPENDENT_SCIENTIFIC_REVIEW_PENDING` · `CANONICAL_SOURCE_RECONCILIATION_PENDING` · `PRODUCTION_NOT_DEPLOYED`
**AI scientific editor label:** owner-authorized AI scientific editorial review. **Not V_VERIFIED**.

## What was improved beyond the internal staging draft

- Exact human study outcome denominators and percentages maintained for Hayward 2024 (598 randomized, 583 with primary endpoint; 150/294 versus 161/289; -5 percentage-point risk difference, 95% CI -13 to +3, p=.26). No claim of proven superiority, no interpretation of medically-attended *suspected* UTI as all culture-confirmed.
- Added an **at-a-glance comparison** that distinguishes measured clinical outcomes, older comparator design, clinical guidelines, and unresolved questions.
- Added the **American Urological Association's 2025 update**, which advises against D-mannose in isolation for routine recurrent-UTI prophylaxis because placebo-controlled evidence does not demonstrate benefit. [AUA News, Oct 2025](https://auanews.net/issues/articles/2025/october-2025/updates-to-the-aua/cua/sufu-guideline-on-recurrent-uncomplicated-urinary-tract-infections-in-women)
- Preserved **NICE's older 2018 self-care wording** and its explicit note that the 2024 amendment was language-inclusive and did not update the 2018 evidence summary. [NICE recommendations](https://www.nice.org.uk/guidance/ng112/chapter/recommendations) · [NICE evidence summary](https://www.nice.org.uk/guidance/ng112/chapter/Summary-of-the-evidence)
- Included an additional 2025 RCT meta-analysis: [PMID 41004704](https://pubmed.ncbi.nlm.nih.gov/41004704/) DOI `10.1590/2175-8239-JBN-2025-0169en`, six RCTs and 1,167 participants. Its **published abstract p-values show an apparent inconsistency with its null-spanning 95% CIs**; no numerical p-value from this paper is repeated in consumer text pending independent adjudication. It is a review of previously studied cohorts, not six additional experimental replications.
- Kept Cochrane review 2022 [PMID 36041061](https://pubmed.ncbi.nlm.nih.gov/36041061/); 2014 trial [PMID 23633128](https://pubmed.ncbi.nlm.nih.gov/23633128/); 2024 direct placebo trial [PMID 38587819](https://pubmed.ncbi.nlm.nih.gov/38587819/); 2025 synthesis [PMID 41195062](https://pubmed.ncbi.nlm.nih.gov/41195062/); 2026 synthesis [PMID 41942398](https://pubmed.ncbi.nlm.nih.gov/41942398/). Overlapping trials are explicitly not counted twice.
- The existing `public/data/compounds-detail/d-mannose.json` remains **NOINDEX**, with evidence `sourced_pending_review`. This article PR does not silently admit those generated-profile sources, change its indexing, claim-map, dosage, affiliate or workbook.

## Mandatory evidence/adjudication before publication

- [x] AI primary and institutional source spot-check performed against linked PubMed and the AUA/NICE source pages on October 12, 2026.
- [x] Article drafted in **the real public article collection**, but PR is intentionally unmerged until gates pass.
- [x] Large RCT primary endpoint, risk difference, confidence interval, null secondary outcomes and comparator labels preserved.
- [x] Contrary earlier findings and NICE/AUA recommendation dates represented.
- [x] No individual treatment advice, new dose recommendation, product ranking, affiliate copy, or inappropriate escalation of source certainty.
- [ ] Obtain an **independent scientific/editorial reviewer** to examine actual full texts, the additional 2025 review p-value discrepancy, included-trial overlap and clinical safety statements. AI cross-check is **not** independent human review.
- [ ] Reconcile six primary/review PMID IDs against the canonical evidence registry, retraction/correction status and source duplicates. No automatic admission.
- [ ] Confirm slug and content section pass site build/SEO/quality with correct live route, no duplicate query-intent indexed page. Existing compound profile NOINDEX persists until separately governed.
- [ ] Record exact-head verified **repository-owner human publication approval** under `docs/governance/canonical-automatic-publication-approval.md` **after final copy changes**. A generic prior "approve all" message is not SHA-bound and cannot pass the published gate.
- [ ] Confirm all exact-head CI and governance checks succeed, resolve review threads, merge via protected GitHub gate (not force), verify production deployment route + metadata/robots and source links.
- [ ] Observe actual Search Console indexing and AI citation reports before claiming audience/revenue effects; unknown is not zero.

## Publication decision

**Held**. Creating this PR does not publish the article, authorize clinical safety claims or certify source acceptance. Publication requires explicit reviewed evidence plus an authenticated named owner approval on **this final commit**, not on an earlier research-dossier SHA. If there is an edit after approval, the gate must demand approval again.

**PR acceptance definition:** exact-copy approved, canonical source identities reconciled, no unsafe clinical inference, article quality/SEO/CI green, protected GitHub controls enforced for content paths, post-deploy proof recorded. 
