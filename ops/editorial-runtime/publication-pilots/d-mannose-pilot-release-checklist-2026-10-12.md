# Pilot publication release checklist — D-mannose for recurrent UTI (2026-10-12)

**Status:** PREPUBLICATION EDITORIAL PILOT. Not V_VERIFIED. Not clinically/human approved. **DO NOT MERGE INTO `content/articles/` OR PUBLISH without exact claim-level human review.** Under `docs/editorial-review-workflow.md`, clinical safety and interpretation of conflicting evidence require prior explicit human approval. Relevant open incidents: [#6672](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6672) and [#6600](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6600).

## What has been completed

- [x] Source-linked, long-form draft staged in `ops/editorial-runtime/publication-pilots/d-mannose-uti-prevention-evidence-2026-10-12.md`, **outside** the consumer-facing `content/articles/` build collection.
- [x] Human randomized 2024 trial checked against original PubMed and JAMA article for population, primary denominator, six-month outcome, risk difference/95% CI, p-value, and non-significant secondary outcomes. [PMID 38587819](https://pubmed.ncbi.nlm.nih.gov/38587819/)
- [x] Older positive comparator trial characterized correctly as **D-mannose vs no prophylaxis**, not blinded matched placebo, [PMID 23633128](https://pubmed.ncbi.nlm.nih.gov/23633128/).
- [x] Cochrane 2022 review dated by search horizon; does not automatically encompass the 2024 RCT, [PMID 36041061](https://pubmed.ncbi.nlm.nih.gov/36041061/).
- [x] 2025 RCT-only pooled result characterized as not significant and heterogeneous, [PMID 41195062](https://pubmed.ncbi.nlm.nih.gov/41195062/).
- [x] 2026 mixed-study meta-analysis characterized as pooled non-significant and heterogeneous; includes observational studies, **not five independent RCTs**, [PMID 41942398](https://pubmed.ncbi.nlm.nih.gov/41942398/).
- [x] Site currently has generated `public/data/compounds-detail/d-mannose.json` as `NOINDEX` with `sourced_pending_review` research evidence, not a reason to auto-switch the profile to indexable.
- [x] Avoided unverified treatment, disease-cure, broad safety, product-strength, affiliate, brand and universal dose claims.
- [x] Research/closure queue includes DE11-08 with state `PILOT_DRAFT_STAGED_HUMAN_APPROVAL_REQUIRED` and preserves every other investigation as uncompleted audit.

## Release blockers (must be evidenced, not assumed)

- [ ] Independent scientific claim review: verify 2024 full article, 2014 primary paper, 2025 and 2026 review cohort overlap, possible retractions/corrections, and relevant practice changes. **Model self-check ≠ independent review.**
- [ ] Named human owner approves **this exact version** of safety/medical/conflicting-evidence language in a durable, timestamped, PR-linked receipt; owner editorial approval is not an accredited clinical credential.
- [ ] Resolve whether open [#6672](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6672) requires a new enforced human-safety approval gate for this publication class. Do not repeat the safety-claim approval timing incident.
- [ ] Reconcile PMID/DOI/title identities with canonical workbook/source registry; no auto admission of research-only sources. Verify generated d-mannose profile remains governed/noindex until separately approved.
- [ ] Check competing search intent: new article `/articles/d-mannose-uti-prevention-evidence/` must not duplicate an existing indexed route, and should link only to related pages that are permitted and currently canonical.
- [ ] Human review of the NICE timing note; 2024 guideline editorial update preserved 2018 evidence wording, not necessarily a modern assessment of Hayward 2024.
- [ ] Transfer **exact approved** copy to `content/articles/d-mannose-uti-prevention-evidence.md` in a **separate, reviewable implementation PR** (not by merely merging this intake PR). Keep public build, SEO and affiliate gates unchanged.
- [ ] Run article-quality, citation identity, content collections, safety, SEO/static export/accessibility checks and full exact-head required CI; resolve all failures instead of using skipped checks as passing.
- [ ] Confirm production Cloudflare deployment receipt / live canonical article route, metadata, sitemap/indexability choice and linked source render after merge. Indexing in Google/AI citations still requires observation; never count a sitemap entry as an impression.
- [ ] Log next refresh date, reviewer, actual canonical URL and 28-day Search Console/AI citation observations (Unknown when unavailable).

## Future intake cadence (not a new automatic publication authorization)

- Research continues in parallel. For every accepted dossier choose one terminal disposition: **governed article/profile upgrade; new governed page; citation correction; explicit quarantine/no publication**.
- Prioritize closure for already reviewed/approved research instead of treating merged research-only PRs as output shipped to users.
- Preserve exact study-level null, contradictory, safety and formulation boundaries. A systemic review does not independently replicate its component trials.
- Use `ops/editorial-runtime/publication-pilots/deep-enrichment-10-13-closure-queue.json` for the **40 identified investigation cases**, not as a canonical evidence source. The queue's `NOT_VERIFIED` and `NOT_DOCUMENTED` fields must be changed only with receipts. The 15 P0 tags are **review priorities**, not proven content defects.
- Publishing guard stays fail-closed under `docs/MASTER_BACKLOG.md` and `docs/CURRENT_SPRINT.md` limits. No WIP/admission slot is claimed by this research intake.
