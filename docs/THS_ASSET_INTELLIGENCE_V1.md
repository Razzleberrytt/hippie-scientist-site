# THS Asset Intelligence & Commercialization 1.0

**Decision:** Owner-approved strategy, 2026-10-15.
**Execution:** Source-linked **documentation baseline only**; future implementation is **not admitted** to `docs/CURRENT_SPRINT.md`.
**Parent:** [THS-MASTER-P0](THS_MASTER_P0_DIRECTIVE_RECOVERY.md) / [#6431](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6431).
**Tracking:** [#6811](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6811).
**Repository baseline:** `main` at `8452640753922ea4d5de7db5c9680d504706a4bf` (2026-10-15); existence/path evidence below is not a CI, deployment, usage, legal-title, or valuation audit.

## Objective and boundaries

Pursue two connected but independently testable objectives: **A. operating value**, where existing systems improve THS outputs, efficiency, trust, qualified acquisition, or attributable revenue; and **B. transferable technology value**, where reusable documented software/data/processes may support later external licensing, services, or a sale if rights, quality, demand, and transferability can be established.

An *asset candidate* here is an inventoried capability, content/data corpus, or brand/distribution surface. This is **not** an accounting determination, a legal opinion, an assertion of exclusive intellectual-property rights, or a market appraisal. Shared subsystems are dependencies, not additional revenue assets counted on top of the parent. Current code presence never proves a commercially ready product.

**Explicit owner scope decision:** Leave the repository `LICENSE` and `ASSETS_LICENSE.md` unchanged in this initiative. Any later rights strategy needs separately authorized review of contributor provenance, upstream licenses, model/voice rights, dataset rights, customer contract terms, and historical grants. Do not infer exclusive rights from code being in THS or mistake third-party/public scientific facts for proprietary data.

## Source-linked portfolio baseline

The paths below have been inspected or found in current default-branch GitHub code/search and project documentation. They are *evidence of an implementation surface*, not proof of finished functionality, IP exclusivity, usage, or economic value. These families are **not additive independent company valuations**.

| ID | Asset family and exact evidence anchors | Observed maturity / boundary | Candidate economic pathway | Unverified proof needed |
| --- | --- | --- | --- | --- |
| THS-01 | Consumer publishing brand/site: [site application](../app/), [content](../content/), [canonical data contract](../docs/enrichment-pipeline.md) | Repository site and content exist; external audience/revenue measurements not established by this audit | Qualified traffic, affiliate conversion, future subscription; brand recognition | Reliable consented analytics, valid affiliate receipts, real revenue/costs, brand rights |
| THS-02 | Governed evidence corpus: [canonical workbook contract](enrichment-pipeline.md), [claim DNA orchestration](../scripts/claim-dna/run-1a.ts), [research studio route](../app/research/intelligence/page.tsx) | Code and canonical-source governance are present; no assertion that every paper/claim is verified or licensable | Faster evidence-backed content/research; later permitted data products | Dataset coverage and freshness, trial deduplication, claims review, legal data/source rights, paid demand |
| THS-03 | Enrichment and safety research pipeline: [pipeline documentation](enrichment-pipeline.md), [CLI](../scripts/enrichment-pipeline/cli.mjs), [persistent research governor](../ops/enrichment-governor/README.md) | Implemented source-backed workflows with candidate/review boundary; completed reliable end-to-end throughput not independently measured here | Internal cost avoidance; potentially licensed research workflow | Cohort-level accepted outputs, actual minutes/cost per accepted result, error rate, independent reusability |
| THS-04 | Semantic/research intelligence: [source-grounded context](../lib/research-intelligence-context.ts), [read-only opportunity compiler](../research/insight-foundry/src/opportunity-compiler.mjs), [application adapter](../lib/research-semantic-opportunity-compiler.ts) | Source-oriented code exists; compiler explicitly research-only and not clinical/publication authority | Internal discovery and editorial routing; later research-service product | Live source-chain revalidation, quality benchmark, demand, standalone packaging and rights |
| THS-05 | EvidenceMotion and creative production: [production flywheel code](../scripts/distribution/evidencemotion-flywheel.mjs), [production documentation](evidencemotion-r811-production.md), [asset reuse library](../scripts/distribution/r811-asset-library.mjs) | Components and pilots exist; **finished premium first-render quality and transferable product readiness not proved** by this audit | Internal video-production efficiency; future creative-production software | Final decoded phone-quality review, reliable first-render outcomes, resource benchmark, original audio/model/asset rights |
| THS-06 | SocialOS / Publisher / Observer: [architecture and identity contract](ths-publisher-v0.1.md), [publication identity code](../scripts/distribution/social-publisher-core.mjs), [runtime](../functions/_shared/social-publisher-runtime.ts) | Canonical publishing workflow code exists; provider permissions, delivery and cross-account portability not audited | Lower distribution labor/error; eventually publishing-operations tooling | Real authorized publish and observe receipts, provider compliance, per-post operating cost/time, independent customer need |
| THS-07 | Distribution experimentation / feedback: [EvidenceMotion first-class learning flywheel](evidencemotion-r810-flywheel.md), [publisher evidence chain](ths-publisher-v0.1.md), [Algorithm Observatory candidate](THS_ALGORITHM_OBSERVATORY_V1_SPEC.md) | Existing experiment/receipt concepts and code surfaces; Algorithm Observatory is **future spec**, not a deployed algorithm service | Better source-safe content allocation, stronger qualified outcomes | Published matched cohorts with verified platform metrics, enough exposure, causality caveats, measured improvement |

### Non-additivity and dependencies

- `THS-02`, `THS-03`, and `THS-04` share source identity, canonical studies, and claim-integrity machinery; count benefits only once per qualifying output.
- `THS-05`, `THS-06`, and `THS-07` share video/package IDs, experiments, media rights, publication receipts and outcomes; an improvement in one video's economics belongs to the end-to-end chain, not to every component independently.
- Unverified candidates (e.g., the Algorithm Observatory) are **opportunities**, not sellable software or completed implementations. Preserve the existing EvidenceMotion 46-item tracker as the sole authority for its completion percentage.

## What an evidence-bearing asset register must record

For each family record stable `asset_id`, `name`, `family/dependencies`, `repo_ref`, `source_paths`, `owner_of_record` (if known), `rights_status` (`unknown|review_required|verified`), `implementation_state` (`concept|code_present|tested|merged|deployed|verified_in_use`), `proof_urls_and_sha`, `source_licenses`, `data_use_limits`, `external_dependencies`, `productization_blockers`, `date_verified`, and `next_test`.

**Separate economic evidence fields**: measured `manual_minutes_per_qualified_output`, `automated_minutes_per_qualified_output`, `review_rework_minutes`, `resource_cost_per_output`, `qualified_output_count`, `verified_incremental_revenue`, `attributable_conversions`, `subscription_or_license_revenue`, `customer_paid_intent`, `maintenance_cost`, `comparable_transactions`, `replacement_cost_evidence`. Missing values are **Unknown / null**, never imputed as zero. Do not put personal/customer or secret tokens in this public repository.

**Current valuation state for THS-01 through THS-07:** Operating savings **Unknown**; standalone product revenue **Unknown**; market valuation **Unknown**; recognized balance-sheet value **not determined**. No dollar estimates are approved by this source/path baseline.

## Phase gates — evidence before prices

1. **A0 — Portfolio completeness:** each candidate mapped to canonical owned source, known dependencies, historical development evidence, rights limitations, and stable identifier; reconcile duplicates. This document provides an initial family-level baseline only.
2. **A1 — Internal utility:** one existing, already authorized production workflow is timed against a reproducible manual baseline, including QA/rework, compute, source-access and maintenance costs. Measure *qualified* output and errors, not generated file counts or number of checks. Never lower science, media, security or publishing requirements.
3. **A2 — Product separation:** establish technically reproducible self-contained installation, documentation, support burden, dependency rights, meaningful differentiated benefit and a second real environment. This is not automatic SaaS admission.
4. **A3 — Real customer signal:** documented unsolicited demand or a permissioned pilot with objective acceptance, effort and price/retention evidence. No invented interviews, prospective license fees or arbitrary market multiples.
5. **A4 — Commercial decision:** only once provenance, legal transferability, verified field utility and economics exist, compare keep-internal vs service vs licensing vs spinout/asset sale using the existing THS business approval process.

## First low-cost measurement candidate (not admitted)

Choose **one** current governed research-to-content or video-production job with accepted source/quality gates and compare against an equivalent manual workflow. Record start/finish, labor minutes, paid spend, external failure, rejected outputs, successful accepted outputs and receipts. For video, preserve the actual original narration, final decoded MP4 evidence, human/phone/comprehension requirements where still needed, and exact science/provenance gates. For research, preserve DOI/PMID identity and editor acceptance. Produce a `before / after / limitations` receipt. If no reliable baseline exists, mark **Unknown** rather than turning assumptions into savings.

Use the one existing prioritization formula in [MASTER_BACKLOG](MASTER_BACKLOG.md); this initiative is a **future candidate**, not a fourth D/R/A lane or a newly scheduled task. EvidenceMotion first-render quality, scientific integrity, normal release governance and currently admitted work retain priority.

## Later acceptance and negative tests

- A missing or stale source proof cannot become `verified_in_use`; every positive claim has source URL/commit/run ID and date.
- A repeated dependency or the same video/research result cannot generate double-counted asset value.
- Null revenue/savings/rights fields remain Unknown; missing metrics must not be interpolated into valuation.
- A merged PR alone cannot establish Cloudflare deployment, publication, platform performance, real customer adoption or commercial readiness.
- Science references and publicly available facts do not become exclusive data merely by indexing them; third-party model, code, media and contributor restrictions remain separate checks.
- No conversion, licensing or commercial priority can revise scientific evidence grades, suppress harm-reduction warnings, promote research-only medical claims or bypass explicit publication authority.
- Any executable asset-register ingest/report service requires a separately scored sprint ticket, security/privacy handling, fixtures, exact-head CI, static-export/build compatibility and protected merge/deployment receipts.

## Status as of this baseline

**Documentation inventory proposed; no portfolio valuation calculated, no paid offering launched, no license modified, no runtime code deployed, no EvidenceMotion checklist items credited, and no extra WIP reserved.** The next engineering action must be admitted through the existing project-control process, not by this document.
