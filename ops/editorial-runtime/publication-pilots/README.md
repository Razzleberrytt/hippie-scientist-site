# Editorial publication pilots — research staging only

**Status:** Research-only intake, outside the site's public article and generated profile collection. **No drafts in this directory are authorized for public release.**

## How to use this directory

This directory is the handoff between The Hippie Scientist's deep-enrichment research and its governed publication pipeline. A merged file under this path is not a published article, independently verified scientific evidence, a canonical source admission, or a human approval.

1. **Source identity:** Match study title, author, PMID, DOI, cohort, comparators, interventions, exposure, endpoints and correction/retraction state to the original source. Preserve uncertainty, negative findings and source duplication.
2. **Compare existing public coverage:** Update an existing ingredient profile when that is the better public destination. Only create a new page when its audience question, canonical route and source coverage are materially distinct.
3. **Independent clinical/scientific review:** Record substantive scientific adjudication separately from the original AI-assisted source spot-check. In particular, review pregnancy, medication interactions, dosage and contraindications before publication.
4. **Exact human publication approval:** Owner must approve the exact final public-content PR revision under [canonical automatic approval](../../../docs/governance/canonical-automatic-publication-approval.md). A broad "approve all", merged research dossier, or inferred consent is not a valid exact-head receipt.
5. **Separate public content PR:** Release changes through appropriate governed source-of-truth and public-content paths. Require exact-head CI, lint, source admission, merge-control, publication-safety and production-deployment checks.
6. **Publication closure receipt:** Update the queue with its real destination, review evidence, named authorizer, publication date and production proof. If the finding is a duplicate or unsafe/unverifiable, document the no-publish/quarantine outcome. Track SEO/AI citation outcomes only from observed reports.

## Contents (DE10–DE13 initial queue)

| Pilot | Research subject | Blocking publication state |
| --- | --- | --- |
| `d-mannose-uti-prevention-evidence-2026-10-12.md` | D-mannose prevention: 2024 placebo-controlled null, earlier positive control comparison and 2022/2025/2026 systematic syntheses | Independent science and human clinical-editorial approval not recorded |
| `magnesium-for-night-leg-cramps-evidence-2026-10-12.md` | Placebo-controlled magnesium oxide trial and Cochrane synthesis; idiopathic nocturnal cramps | Independent science and human clinical-editorial approval not recorded |
| `st-johns-wort-contraception-interaction-2026-10-12.md` | Botanical interactions with contraception: altered hormone PK, reported breakthrough bleeding and contrary extract study | High-priority drug-interaction review and exact-copy approval not recorded |
| `licorice-diuretic-hypokalemia-safety-2026-10-12.md` | Licorice, hydrochlorothiazide and serum potassium: small crossover human trial | High-priority potassium/cardiovascular-risk review and exact-copy approval not recorded |

Supporting records: `deep-enrichment-10-13-closure-queue.json` (all 40 candidates), `source-review-receipt-2026-10-12.md`, `high-risk-interaction-review-matrix-2026-10-12.md` and `d-mannose-pilot-release-checklist-2026-10-12.md`.

**Operational note:** PR #6703 is eligible only for the canonical `AUTO_STAGING` class. This classification cannot bypass GitHub checks, public medical approval, canonical source verification or indexability constraints. If GitHub creates empty `action_required` workflow records after bot branch refresh, do not count them as successes: recover **real exact-head workflow executions** and merge only when mandatory results are green. Prior tests on a different SHA do not authorize this head.

**Measurement:** Staging completion ≠ public page ≠ indexed page ≠ AI citation ≠ revenue. Record each independently; unavailable measurements remain unknown.
