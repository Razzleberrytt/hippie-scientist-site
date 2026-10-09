# THS-MASTER-P0 — Reconstructed 150-Item Acceptance Register

**Version:** reconstruction candidate 1.2 (audits 001–002) · **Reconstructed:** 2026-10-09 · **Owner:** P0 program #6431

> **Not the recovered original.** The exact October 8 thirteen-section/150-item checklist could not be located in current GitHub records or accessible prior artifacts. This is a replacement acceptance *proposal* informed by the original THS-MASTER-P0 scope, AGENTS.md, the current authoritatives, the generational plan and observed GitHub releases. Do not represent these as verbatim original tasks or silently transplant the old progress count.

## Accounting and execution guardrails

- **Original historical progress:** `10/150` as reported in #6431. **Original individual task-to-proof allocation:** unavailable. Keep legacy progress separate from the reconstructed register.
- **Reconstructed item-level proof count:** `4/150 verified accepted after audit 001` (plus five evidence candidates among nine audited). This is **not** a claim that no underlying features exist: previous releases are candidate evidence below, not yet independently mapped against all acceptance clauses.
- Do not add the 10 legacy tasks to reconstructed verified items, or call candidate PRs completed checklist items. Recount only after explicit item-by-item review. Keep historical and reconstructed denominators distinct until signed-off migration.
- This document is a **candidate acceptance inventory, not an implementation queue**, WIP admission, scientific approval, merge authorization, deployment proof or observed business outcome. `docs/CURRENT_SPRINT.md`, `docs/MASTER_BACKLOG.md`, `AGENTS.md`, the existing score, and the sole merge controller govern actual work.
- For each item, use the status vocabulary `Not audited`, `Evidence candidate`, `Verified accepted`, `Blocked`, `Rejected`, with verification date, exact artifact SHA/CI/production or external observation as applicable. A merged PR alone is insufficient for a visitor-facing deployment item.
- Completion requires **all** of the stated pass conditions, appropriate negative fixtures, existing mandatory checks and an auditable artifact. Browser receipts, clinical-review receipts, provider permission and actual revenue are separate where specified. Unknown is not PASS.
- Preserve scientific source→human review firewall; research-only intake cannot promote medical claims or dosing. Preserve source/claim identity, privacy, accessibility, honest disclosures, stable routes, static export and rollback.

## Audit 002 — CI evidence, production route and recovery ordering (2026-10-09)

**Promoted to Verified accepted:** P0-026, P0-029, P0-100, P0-131, P0-140. **Result:** 9/150 accepted on reconstructed criteria, 3 Evidence candidates (P0-030, P0-124, P0-134), 138 Not audited. **Do not add** these to the missing original checklist's 10/150 historical checkpoint.

| Item | Decisive acceptance evidence | Remaining limitation, not included in scope |
|---|---|---|
| **P0-026 — Isolate malformed candidates** | Later [exact-head full CI run 37920905280](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37920905280) on PR #6484 included `scripts/research/prepare-lane-intake.test.mjs` in **35 native node:test suites** (validation job `113788324302`). Logs show subtests **135–139 all PASS**, including invalid-candidate quarantine, 27 accepted/3 rejected over bounded 25+2 manifests, and CLI 2 accepted/1 malformed with `preflight-report.txt` excluded from the reservation `*.json` glob. [PR #6426](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6426) merged, production run 37922725823 verified later main containing source. | This tests preflight; not a claim that every live intake candidate or hourly replay was processed. Earlier jobless failed status from PR event is not relied on. |
| **P0-029 — Preserve frozen recovery order** | On main, `.github/workflows/research-lane-intake.yml` retains scheduled `recover` before `replay-committed-intakes`. Native test `keeps frozen-batch recovery ahead of optional replay` passed as subtest 147 in [full CI 37920905280](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37920905280); later production-origin [run 37922725823](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37922725823) matched deployed main. Unsafe replay-first [PR #6481](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6481) remained closed unmerged. | Hourly missed-seed replay acceptance is separately P0-030, still unverified in the field. |
| **P0-100 — Release public Terms of Service** | [PR #6484](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6484), exact main `f77a9319be01872bbb9df90a15ef9831d520d38a`; [Cloudflare run 37922725823](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37922725823) verified production-origin SHA in job log `113794286858` and generated `out/info/terms/index.html`. Full [CI 37920905280](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37920905280) validated build/output/SEO; `app/info/terms/page.tsx`, sitemap, Info index and footer have contract tests. **Independent 2026-10-09 site retrieval**: live `/info/` showed Terms navigation and footer links, and clicking Terms served readable `/info/terms/` with October 9 effective date. | Does not validate legal advice or external TikTok approval. Direct web `open` was initially blocked, but on-site navigation `click` succeeded; live sitemap XML direct retrieval not available, though static sitemap inclusion and full SEO gate are verified. |
| **P0-131 — Preserve static-export compatibility** | `next.config.mjs` current `main` explicitly configures `output: 'export'`. [CI 37920905280](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37920905280) **passed** `Validate static export compatibility` in both validation and build jobs, followed by `Build application`, `Verify build output`, `Validate route SEO coverage`; Cloudflare [37922725823](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37922725823) deployed that output successfully. | This validates shipped build compatibility, not any future change or hypothetical runtime API. |
| **P0-140 — Verify Cloudflare production identity** | Cloudflare [run 37922725823](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37922725823), job `113794286858`, logged **`Production receipt verified at https://thehippiescientist.net/.well-known/deployment.json: f77a9319be01872bbb9df90a15ef9831d520d38a`** matching merged main. Additional positive origin receipts for #6471 and #6399 in [runs 37875021598](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37875021598) and [37880086813](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37880086813). | Web retrieval of the raw well-known JSON endpoint returned an access error; direct exact-origin verification is a GitHub deployment-job observation, not a personal browser fetch. |

**Method:** reviewed saved main files, GitHub run metadata, named step outcomes and raw CI/deployment job logs. The audit did **not** trigger fresh CI executions or alter production. It cross-validated source present on merged main against later full checks and origin receipts; real scheduler recovery, narrated video approval and saved CI runner minutes remain Unknown.

## Audit 001 — Nine reconstructed criteria reconciled (2026-10-09)

**Count:** 4 verified accepted / 150 reconstructed; 5 evidence candidates; 141 not audited. **Historical original count remains 10/150** (unallocated; **do not add 4+10**). Acceptance judgments apply only to the newly reconstructed criteria.

| Item | Status | Proof (code/tests/merge/deploy) | Open boundary |
|---|---|---|---|
| P0-026 | Evidence candidate | [#6426](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6426) merged; main has malformed-candidate isolation and CLI test for 2 valid + 1 rejected, report `.txt` cannot enter `.json` reservation glob | Require real exact-head validation receipt for original merged head and operator CLI smoke; first PR-triggered CI attempt was zero-job/failed and is not a valid test outcome |
| P0-030 | Evidence candidate | [#6480](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6480) merged; [CI](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37876214716) success; [deploy](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37878438302) success | Observed hourly missed-seed replay receipt, and no duplicate reservations in field, still Unknown; push-triggered intake is not proof |
| P0-047 | Verified accepted | [#6437](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6437) eight-instrument source-bound coordinator; [exact-head CI](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37847833816) success with exact PMID/signature and zero promotion negative tests; present on main and later [deployed](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37875021598) | No human clinical review, research truth, adoption or ROI inferred |
| P0-048 | Verified accepted | Same #6437 source-bound integration; CI fixtures require 12 capabilities, zero calibration failures, no clinical approvals; source survives in main and was later deployed with #6471 | Deterministic projections do not prove independent external science |
| P0-059 | Verified accepted | [#6471](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6471) exact-source packet merged; [full CI](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37871073298) success including altered PMID/DOI/signature/claim and forged-publication refusal; [production](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37875021598) exact-origin success | Human editorial approval, claim promotion and publishing remain unauthorized |
| P0-100 | Evidence candidate | [#6484](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6484) Terms page and footer/Info/sitemap contract merged; [Cloudflare](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37922725823) exact-origin success, artifact `out/info/terms/index.html` | Independent live `/info/terms/` request could not be retrieved; web-crawled `/info/` did not yet show Terms. Require uncached visitor/browser and sitemap proof |
| P0-124 | Evidence candidate | [#6399](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6399) local Kokoro waveform/hash workflow merged; [Cloudflare](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37880086813) deployed | Human audition of actual approved narration master, synced final video and native upload are not verified |
| P0-134 | Evidence candidate | [#6460](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6460) controller defers eight consumers behind one governed CI producer; [CI](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37867253807) and [production](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37869304990) success | Real zero-job recovery canary and measured duplicate-build savings remain Unknown; do not claim improved ROI |
| P0-137 | Verified accepted | [#6455](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6455) tests narrow known unresolved-review 405 classification and rejection of unrelated HTTP/auth/transport failures; current main retains implementation/tests; [CI](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37863385085) and [Cloudflare](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37865211337) success | Real occurrence of 405 remains Unknown; tested logic accepted, not field-frequency claim |

Four accepted items have source implementations surviving in `main`, negative contract fixtures, relevant passing GitHub Actions checks and a later production-origin deployment receipt. This is **not** independent re-execution of their tests during this documentation-only audit. Five other items have genuine shipped components but their own stated acceptance still lacks sufficient proof. Any later correction to these states must cite the precise failed or successful contract and preserve the audit history. Historical original completion is not reallocated.

## Legacy evidence reconciliation — candidates only

| Item(s) to inspect | Evidence already in GitHub | Remaining item-level proof |
|---|---|---|
| P0-026 | [#6426](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6426) merged `2a8a5f9294e0a4a40d9b28f299388a31859f6961` | Reproduce malformed-preflight contract and confirm production run coverage |
| P0-030 | [#6480](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6480) merged `968893ddff10c0c7e034d7a20e54bb80c274310f` | Observe real hourly replay and no duplicate reservations |
| P0-047, P0-048 | [#6437](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6437) merged `70ab83d450f8b949b267d977f68950aecfc8e4fb` | Verify each tool and exact-source visitor-facing release separately |
| P0-059 | [#6471](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6471) merged `bfbfeea3c15acfa5cc171bffd38714a1e1228c4c` | Exercise reviewer acceptance/rejection and output path on current main |
| P0-100 | [#6484](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6484) merged `f77a9319be01872bbb9df90a15ef9831d520d38a`; production receipt in [#6431](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6431) | Verify live `/info/terms/` and footer/sitemap behavior, not just deployment job |
| P0-124 | [#6399](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6399) merged `9d2c649e54f2e1bc35181a5a32526be835f700d9` | Human audition of exact narration master and playback/production receipt |
| P0-134 | [#6460](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6460) merged `0d7635a6918ccacc391f5ead8832ffbc6de86368` | Measure immutable producer fanout with adversarial risk-change checks |
| P0-137 | [#6455](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6455) merged per #6431 checkpoint | Real governance-hold canary and unrelated-error negative fixtures |

## Thirteen sections · 150 independently checkable outcomes

### Section 0. Baseline, scope and governance — 10 items

- [ ] **P0-001 — Freeze program scope.** **PASS when:** A versioned THS-MASTER-P0 scope and exclusions are linked to issue #6431. **Initial status:** Not audited.
- [ ] **P0-002 — Reconcile deployed baseline.** **PASS when:** Current main SHA, production deployment SHA, sampled live routes and differences are recorded with dates. **Initial status:** Not audited.
- [ ] **P0-003 — Inventory existing systems.** **PASS when:** Each relevant system has a canonical code owner, surface, interface and shipped/proposed distinction. **Initial status:** Not audited.
- [ ] **P0-004 — Map active implementation.** **PASS when:** Every active implementation has an issue, first-owner PR, workstream and admission proof; duplicates are flagged. **Initial status:** Not audited.
- [ ] **P0-005 — Enforce workstream capacity.** **PASS when:** No more than three normal tickets are active and no workstream owns more than one. **Initial status:** Not audited.
- [ ] **P0-006 — Establish evidence states.** **PASS when:** Definitions distinguish source verified, independently reviewed, approved, merged, deployed and field validated. **Initial status:** Not audited.
- [ ] **P0-007 — Capture external blockers.** **PASS when:** Provider access, scientific reviewer, analytics and publisher permissions have documented owners and Unknown states. **Initial status:** Not audited.
- [ ] **P0-008 — Preserve historical progress.** **PASS when:** Original 10/150 is stored as unallocated legacy count rather than asserted on reconstructed items. **Initial status:** Not audited.
- [ ] **P0-009 — Create proof ledger.** **PASS when:** Every completed item links a source artifact, acceptance check and, where applicable, exact deployment receipt. **Initial status:** Not audited.
- [ ] **P0-010 — Prioritize next safe slice.** **PASS when:** Next ticket follows current sprint, existing score, dependency proof, owner and WIP admission. **Initial status:** Not audited.

### Section 1. Shared architecture and canonical contracts — 12 items

- [ ] **P0-011 — Define canonical entity identity.** **PASS when:** Herb, compound, alias and source namespaces have unambiguous stable ID contracts and collision fixtures. **Initial status:** Not audited.
- [ ] **P0-012 — Normalize PMID identity.** **PASS when:** PMID parser rejects malformed, missing and ambiguous values and preserves original source identifiers. **Initial status:** Not audited.
- [ ] **P0-013 — Normalize DOI identity.** **PASS when:** DOI normalization is deterministic and rejects collisions or false joins in negative fixtures. **Initial status:** Not audited.
- [ ] **P0-014 — Pin source signatures.** **PASS when:** Downstream research artifacts carry immutable source identity, revision and content signature. **Initial status:** Not audited.
- [ ] **P0-015 — Separate source and claim IDs.** **PASS when:** Tests prove source counts or claim-like tokens cannot self-authorize clinical conclusions. **Initial status:** Not audited.
- [ ] **P0-016 — Version typed claim envelope.** **PASS when:** Typed claim records specify outcome, population, intervention, comparator, duration, provenance and uncertainty. **Initial status:** Not audited.
- [ ] **P0-017 — Version review envelope.** **PASS when:** Every reviewer decision records reviewer authority, immutable revision, timestamp and rationale. **Initial status:** Not audited.
- [ ] **P0-018 — Define event idempotency.** **PASS when:** The same event is replay-safe; conflicting payloads using one ID fail closed. **Initial status:** Not audited.
- [ ] **P0-019 — Document producer/consumer map.** **PASS when:** Each boundary has one canonical owner, read/write policy and explicit schema compatibility rule. **Initial status:** Not audited.
- [ ] **P0-020 — Implement schema downgrade safety.** **PASS when:** Old or unrecognized envelope versions are quarantined or handled explicitly, never silently upgraded. **Initial status:** Not audited.
- [ ] **P0-021 — Define retention and correction.** **PASS when:** Corrections, tombstones and supersession retain prior evidence identity and auditability. **Initial status:** Not audited.
- [ ] **P0-022 — Trace one complete source identity.** **PASS when:** A test follows the same PMID/DOI/source revision through all existing allowed consumers. **Initial status:** Not audited.

### Section 2. Research intake and enrichment reliability — 12 items

- [ ] **P0-023 — Validate intake input schema.** **PASS when:** Missing PMID, malformed record and unexpected property fixtures produce a fail-closed preflight result. **Initial status:** Not audited.
- [ ] **P0-024 — Deduplicate across intake lanes.** **PASS when:** Two concurrent lanes cannot reserve the same canonical PMID or DOI. **Initial status:** Not audited.
- [ ] **P0-025 — Bound intake manifests.** **PASS when:** Each reservation produces an authenticated/reproducible manifest of at most 25 accepted source entries. **Initial status:** Not audited.
- [x] **P0-026 — Isolate malformed candidates.** **PASS when:** Rejected records never become JSON intake manifests or prevent valid candidates from proceeding. **Current status:** Verified accepted (audit 002). **Evidence:** audits 001–002.
- [ ] **P0-027 — Verify source metadata.** **PASS when:** Any fetched PubMed title/abstract has an exact source receipt; absent metadata remains absent. **Initial status:** Not audited.
- [ ] **P0-028 — Detect DOI/title collisions.** **PASS when:** Global collision check catches canonical DOI and normalized-title duplicates before reservation. **Initial status:** Not audited.
- [x] **P0-029 — Preserve frozen recovery order.** **PASS when:** Existing frozen-batch recovery precedes new committed-seed replay; adversarial test prevents regression. **Current status:** Verified accepted (audit 002). **Evidence:** audit 002 below.
- [ ] **P0-030 — Recover missed scheduled seeds.** **PASS when:** Exact-SHA scheduled replay reserves previously missed committed seeds without duplicating reservations. **Current status:** Evidence candidate (audit 001). **Evidence:** audit 001 below.
- [ ] **P0-031 — Handle retries idempotently.** **PASS when:** Retries and concurrent scheduler runs cannot reserve a batch twice or silently corrupt state. **Initial status:** Not audited.
- [ ] **P0-032 — Quarantine questionable sources.** **PASS when:** Retracted, corrected, malformed or off-domain candidates retain reason-coded review-only states. **Initial status:** Not audited.
- [ ] **P0-033 — Keep intake research-only.** **PASS when:** Tests prove source-only records never automatically become clinical ratings, recommendations or public claims. **Initial status:** Not audited.
- [ ] **P0-034 — Publish intake observability.** **PASS when:** Each run reports accepted, rejected, duplicated, held and retried counts with links to real receipts. **Initial status:** Not audited.

### Section 3. Evidence appraisal, safety and independence — 12 items

- [ ] **P0-035 — Track trial lineage.** **PASS when:** Multiple papers from one trial/cohort are grouped when independently supported; unknown lineage stays Unknown. **Initial status:** Not audited.
- [ ] **P0-036 — Capture studied populations.** **PASS when:** Human claims include eligibility, baseline condition, subgroup and directness limits. **Initial status:** Not audited.
- [ ] **P0-037 — Capture intervention details.** **PASS when:** Dose, formulation, extract identity, route, comparator and study duration remain study context. **Initial status:** Not audited.
- [ ] **P0-038 — Make outcomes non-interchangeable.** **PASS when:** Tests prevent symptom, biomarker, acute effect and long-term outcome substitution. **Initial status:** Not audited.
- [ ] **P0-039 — Apply reproducible evidence grading.** **PASS when:** Grades store criteria, reviewer rationale, evidence links and revision history. **Initial status:** Not audited.
- [ ] **P0-040 — Include neutral and negative results.** **PASS when:** Eligible relevant null, adverse and contradictory findings are assessed, not discarded. **Initial status:** Not audited.
- [ ] **P0-041 — Record study limitations.** **PASS when:** Risk of bias, precision, indirectness and missing data are exposed alongside conclusions. **Initial status:** Not audited.
- [ ] **P0-042 — Disclose meaningful conflicts.** **PASS when:** Funding and author conflicts are recorded and surfaced when material to interpretation. **Initial status:** Not audited.
- [ ] **P0-043 — Maintain risk/interaction review.** **PASS when:** Safety statements and interaction claims require source-linked human review distinct from mechanistic inference. **Initial status:** Not audited.
- [ ] **P0-044 — Verify citation authenticity.** **PASS when:** Every material claim links a matching real source; no fabricated PMID, DOI or abstract survives validation. **Initial status:** Not audited.
- [ ] **P0-045 — Handle correction/retraction events.** **PASS when:** Affected claims are queued for review; published decisions are never silently rewritten. **Initial status:** Not audited.
- [ ] **P0-046 — Require independent approval.** **PASS when:** Unreviewed imports, graph signals and agent drafts cannot create an approved treatment or dosing claim. **Initial status:** Not audited.

### Section 4. Semantic research intelligence and interoperability — 12 items

- [x] **P0-047 — Integrate eight research instruments.** **PASS when:** All eight existing instruments consume the same exact source-bound case without creating a second evidence authority. **Current status:** Verified accepted (audit 001). **Evidence:** audit 001 below.
- [x] **P0-048 — Integrate twelve scientific projections.** **PASS when:** Twelve bounded analysis capabilities produce inspectable source-linked receipts without clinical promotion. **Current status:** Verified accepted (audit 001). **Evidence:** audit 001 below.
- [ ] **P0-049 — Expose Study DNA.** **PASS when:** Study fingerprints show intervention, population, methods, outcomes, qualifiers and unavailable fields accurately. **Initial status:** Not audited.
- [ ] **P0-050 — Expose contradiction candidates.** **PASS when:** Potential disagreements cite exact witnesses and explain comparability uncertainty rather than declaring facts. **Initial status:** Not audited.
- [ ] **P0-051 — Expose knowledge gaps.** **PASS when:** Gap views distinguish local coverage scarcity from global evidence absence. **Initial status:** Not audited.
- [ ] **P0-052 — Expose evidence evolution.** **PASS when:** Time-machine views use real recorded revisions and do not invent historical grade changes. **Initial status:** Not audited.
- [ ] **P0-053 — Enable traceable semantic voyages.** **PASS when:** Cross-concept paths require at least two witnessed concepts and source-backed non-method links. **Initial status:** Not audited.
- [ ] **P0-054 — Provide comparability controls.** **PASS when:** Cross-study comparisons identify mismatched population, intervention, outcome and design before synthesis. **Initial status:** Not audited.
- [ ] **P0-055 — Separate hypotheses from findings.** **PASS when:** Hypothesis/counterfactual tools label untested ideas and forbid efficacy or safety promotion. **Initial status:** Not audited.
- [ ] **P0-056 — Exercise adversarial calibration.** **PASS when:** Negative fixtures test alias traps, DOI ambiguity, false trial independence and unsupported conclusions. **Initial status:** Not audited.
- [ ] **P0-057 — Connect safety research views.** **PASS when:** Safety-literature relationships remain separate from proven interaction or causation claims. **Initial status:** Not audited.
- [ ] **P0-058 — Provide understandable tool navigation.** **PASS when:** Research users can inspect original citations, exact joins, uncertainty and next permissible review step. **Initial status:** Not audited.

### Section 5. Editorial bridge, knowledge publication and controls — 12 items

- [x] **P0-059 — Generate review-only editorial packet.** **PASS when:** Source-bound case generates a typed reviewer request with source IDs, unknowns and immutable status. **Current status:** Verified accepted (audit 001). **Evidence:** audit 001 below.
- [ ] **P0-060 — Prohibit automatic publish handoff.** **PASS when:** Unapproved editorial packets never become indexed articles, recommendations or live social assets. **Initial status:** Not audited.
- [ ] **P0-061 — Support explicit reviewer rejection.** **PASS when:** Rejected or disputed drafts retain rationale and cannot pass downstream release checks. **Initial status:** Not audited.
- [ ] **P0-062 — Version editorial revisions.** **PASS when:** Any substantive claim revision requires re-review of affected source/claim relationships. **Initial status:** Not audited.
- [ ] **P0-063 — Trace published claim provenance.** **PASS when:** A sampled public claim maps to approved source, reviewer decision and published artifact revision. **Initial status:** Not audited.
- [ ] **P0-064 — Standardize monograph template.** **PASS when:** Required identity, evidence, safety, gaps, citations and update context render for eligible profiles. **Initial status:** Not audited.
- [ ] **P0-065 — Standardize withdrawal/recovery guides.** **PASS when:** High-risk articles explain acute safety, withdrawal evidence, support and uncertainty with primary references. **Initial status:** Not audited.
- [ ] **P0-066 — Validate interaction language.** **PASS when:** Combination cautions distinguish established clinical risk, plausible mechanism and evidence absence. **Initial status:** Not audited.
- [ ] **P0-067 — Prevent false dose instructions.** **PASS when:** Study doses are not silently converted into personal dosing or medical treatment protocols. **Initial status:** Not audited.
- [ ] **P0-068 — Protect editorial independence.** **PASS when:** Ranking order is evidence-first and is not mechanically changed by product commission. **Initial status:** Not audited.
- [ ] **P0-069 — Audit corrections and complaints.** **PASS when:** Visible correction route and documented triage exist for important factual/safety errors. **Initial status:** Not audited.
- [ ] **P0-070 — Verify public publication parity.** **PASS when:** Approved content is checked against generated output, routes, citations and policy before deployment. **Initial status:** Not audited.

### Section 6. Visitor experience, discovery and accessibility — 12 items

- [ ] **P0-071 — Unify five primary destinations.** **PASS when:** Goals, Guides, Ingredients, Safety and Research have consistent navigation and route ownership. **Initial status:** Not audited.
- [ ] **P0-072 — Deliver mobile-first hierarchy.** **PASS when:** Representative mobile landing, guide, profile and research pages expose a clear first answer and next action. **Initial status:** Not audited.
- [ ] **P0-073 — Apply progressive disclosure.** **PASS when:** Summary, caveats, evidence depth and raw sources have deliberate hierarchy without hiding safety-critical context. **Initial status:** Not audited.
- [ ] **P0-074 — Implement universal entity search.** **PASS when:** Canonical substances and aliases are searchable; misspellings and ambiguous results are disambiguated. **Initial status:** Not audited.
- [ ] **P0-075 — Build contextual relationships.** **PASS when:** Profile links to studied uses, compounds, relevant comparisons, cautions and sources resolve correctly. **Initial status:** Not audited.
- [ ] **P0-076 — Make comparisons usable.** **PASS when:** Readers can compare evidence, form, safety and tradeoffs without promotional bias or false equivalence. **Initial status:** Not audited.
- [ ] **P0-077 — Keep safety visible.** **PASS when:** Contraindications, serious interactions and evidence limits remain legible on small screens. **Initial status:** Not audited.
- [ ] **P0-078 — Improve directory filtering.** **PASS when:** Large herb/compound directories have effective search/filter states and useful empty-state behavior. **Initial status:** Not audited.
- [ ] **P0-079 — Align breadcrumbs and page roles.** **PASS when:** Shared navigation chrome follows declared page role and avoids redundant cognitive load. **Initial status:** Not audited.
- [ ] **P0-080 — Pass keyboard and screen reader QA.** **PASS when:** Critical navigation and interactive content pass focus, semantics, labels and keyboard testing. **Initial status:** Not audited.
- [ ] **P0-081 — Respect reduced motion and themes.** **PASS when:** Both themes, zoom and reduced-motion preferences work on high-traffic templates. **Initial status:** Not audited.
- [ ] **P0-082 — Meet mobile performance budget.** **PASS when:** Representative routes pass documented measured bundle/image and CWV/performance budgets with reproducible tools. **Initial status:** Not audited.

### Section 7. Technical SEO, indexing and demand coverage — 12 items

- [ ] **P0-083 — Align canonical and sitemap.** **PASS when:** Every eligible public route has one correct canonical and sitemap state across generated output. **Initial status:** Not audited.
- [ ] **P0-084 — Guard noindex research surfaces.** **PASS when:** Research-only candidate and internal review routes are never accidentally exposed or indexable. **Initial status:** Not audited.
- [ ] **P0-085 — Preserve stable redirects.** **PASS when:** Moved or retired URLs have valid redirect, internal-link updates and regression tests. **Initial status:** Not audited.
- [ ] **P0-086 — Validate structured data.** **PASS when:** Eligible pages emit truthful schema with no invented ratings, reviews, studies or offers. **Initial status:** Not audited.
- [ ] **P0-087 — Map intent to landing pages.** **PASS when:** High-value search intentions map to distinct useful entry/decision pages and evidence depth routes. **Initial status:** Not audited.
- [ ] **P0-088 — Audit duplicate intent.** **PASS when:** Overlapping guides and comparisons are consolidated only with intent evidence and redirects. **Initial status:** Not audited.
- [ ] **P0-089 — Improve contextual internal links.** **PASS when:** Entry, comparison, monograph and evidence pages offer source-relevant navigable links. **Initial status:** Not audited.
- [ ] **P0-090 — Make search snippets accurate.** **PASS when:** Titles/descriptions reflect page outcomes and qualifications without exaggerated benefit claims. **Initial status:** Not audited.
- [ ] **P0-091 — Verify public crawlability.** **PASS when:** Robots, response, URL and rendered HTML checks identify indexability drift on production. **Initial status:** Not audited.
- [ ] **P0-092 — Implement evidence freshness labels.** **PASS when:** Visible update date reflects actual substantive revision and sources, not synthetic freshness. **Initial status:** Not audited.
- [ ] **P0-093 — Track GSC search outcomes.** **PASS when:** Real impressions, clicks, coverage and affected routes are recorded by comparable date windows. **Initial status:** Not audited.
- [ ] **P0-094 — Gate SEO in release pipeline.** **PASS when:** Changed content/site maps/routes pass required exact-head SEO and publication-parity checks. **Initial status:** Not audited.

### Section 8. Commercial journeys, disclosures and legal readiness — 12 items

- [ ] **P0-095 — Map high-intent decision journeys.** **PASS when:** Qualified entry pages lead to relevant evidence, alternatives and optional next actions. **Initial status:** Not audited.
- [ ] **P0-096 — Make CTA placement contextual.** **PASS when:** CTAs follow useful content and never obscure evidence limits or safety guidance. **Initial status:** Not audited.
- [ ] **P0-097 — Use governed affiliate config.** **PASS when:** Affiliate URLs are generated from canonical config and correct destination/product context. **Initial status:** Not audited.
- [ ] **P0-098 — Display affiliate disclosure.** **PASS when:** Disclosure is clear before or alongside the first relevant affiliate link, mobile and desktop. **Initial status:** Not audited.
- [ ] **P0-099 — Make comparisons commission-independent.** **PASS when:** Paid availability does not determine rankings and unmatched options remain represented. **Initial status:** Not audited.
- [x] **P0-100 — Release public Terms of Service.** **PASS when:** Terms route is generated, linked, sitemap-eligible and reachable on verified production origin. **Current status:** Verified accepted (audit 002). **Evidence:** audits 001–002.
- [ ] **P0-101 — Audit privacy/consent documentation.** **PASS when:** Published policy matches actual analytics, cookies, provider transport and contact behavior. **Initial status:** Not audited.
- [ ] **P0-102 — Document monetization eligibility.** **PASS when:** Each revenue channel has account/eligibility and prohibited-claim requirements, with blockers explicit. **Initial status:** Not audited.
- [ ] **P0-103 — Keep unsafe offers excluded.** **PASS when:** Restricted or unsafe product categories and unapproved health claims cannot enter commercial recommendations. **Initial status:** Not audited.
- [ ] **P0-104 — Create honest retention invitation.** **PASS when:** Email/return features express clear user benefit and respect consent and unsubscribe requirements. **Initial status:** Not audited.
- [ ] **P0-105 — Design an ethical conversion experiment.** **PASS when:** Predeclared exposure, outcome and safety checks are recorded without altering evidence rankings. **Initial status:** Not audited.
- [ ] **P0-106 — Reconcile actual earnings.** **PASS when:** Only network-reported orders/commissions count as revenue; missing statements are Unknown. **Initial status:** Not audited.

### Section 9. Analytics, learning and outcome measurement — 12 items

- [ ] **P0-107 — Prove consent-gated transport.** **PASS when:** Live opted-in test event reaches approved analytics endpoint without firing before consent. **Initial status:** Not audited.
- [ ] **P0-108 — Prove GA4 or approved alternative.** **PASS when:** A real receiving property confirms one attributable page event with timestamp and source. **Initial status:** Not audited.
- [ ] **P0-109 — Preserve source tagging.** **PASS when:** UTM and social attribution survive the intended on-site journey without inventing visitors. **Initial status:** Not audited.
- [ ] **P0-110 — Import search measurement.** **PASS when:** GSC properties/date windows and landing URL identities are reconciled with site canonicals. **Initial status:** Not audited.
- [ ] **P0-111 — Import affiliate measurements.** **PASS when:** Network order/click/revenue exports are scoped, dated and reconciled without person-level leakage. **Initial status:** Not audited.
- [ ] **P0-112 — Define metric dictionary.** **PASS when:** Sessions, engaged outcomes, qualified actions, conversion and RPM have explicit formulas and data coverage. **Initial status:** Not audited.
- [ ] **P0-113 — Trace one conversion funnel.** **PASS when:** Observed path from discovery through decision to permitted action has auditable event IDs. **Initial status:** Not audited.
- [ ] **P0-114 — Compare consistent windows.** **PASS when:** Baseline and experiment results use matching windows and disclose known confounders. **Initial status:** Not audited.
- [ ] **P0-115 — Publish uncertainty dashboard.** **PASS when:** Missing transport/coverage and low sample sizes display Unknown, not zero or a fabricated trend. **Initial status:** Not audited.
- [ ] **P0-116 — Measure resource efficiency.** **PASS when:** Actual workflow/CI time, production lead time and operator cost are measured from source logs. **Initial status:** Not audited.
- [ ] **P0-117 — Maintain experiment history.** **PASS when:** Hypothesis, versions, outcome, confidence and retest conditions survive each completed experiment. **Initial status:** Not audited.
- [ ] **P0-118 — Apply stop-and-scale gates.** **PASS when:** Promotion or retirement decisions use measured usefulness, safety and sustainability not assumed ROI. **Initial status:** Not audited.

### Section 10. Social evidence production and publishing — 12 items

- [ ] **P0-119 — Maintain SocialOS canonical queue.** **PASS when:** Platform jobs have durable IDs, hashed assets, state, schedule, retry and authorization context. **Initial status:** Not audited.
- [ ] **P0-120 — Prevent topic duplication.** **PASS when:** Series planner records prior teaching, audience angle, next question and repeat exceptions. **Initial status:** Not audited.
- [ ] **P0-121 — Bind scripts to evidence.** **PASS when:** Every substantive media claim matches source-verified editorial copy with qualifiers intact. **Initial status:** Not audited.
- [ ] **P0-122 — Enforce first-second clarity.** **PASS when:** Covers, first frames and opening lines agree and communicate one readable promise. **Initial status:** Not audited.
- [ ] **P0-123 — Make muted playback complete.** **PASS when:** Core explanations and limitations remain readable without audio on phone preview. **Initial status:** Not audited.
- [ ] **P0-124 — Render sovereign voice assets.** **PASS when:** Locally generated narration is reproducible and independent of paid credits or Metricool. **Current status:** Evidence candidate (audit 001). **Evidence:** audit 001 below.
- [ ] **P0-125 — Synchronize narration with video.** **PASS when:** Exact approved WAV, subtitles, scene timings and MP4 pass audible synchronization review. **Initial status:** Not audited.
- [ ] **P0-126 — Run perceptual QA.** **PASS when:** Human/automated checks assess safe areas, pacing, readability, pronunciation and source fidelity. **Initial status:** Not audited.
- [ ] **P0-127 — Version final creative artifacts.** **PASS when:** Asset hash, script hash, dimensions, runtime, evidence provenance and reviewer decision are recorded. **Initial status:** Not audited.
- [ ] **P0-128 — Support native TikTok handoff.** **PASS when:** Operator can obtain a valid final upload file and instructions without fictitious API auto-posting. **Initial status:** Not audited.
- [ ] **P0-129 — Capture real platform receipt.** **PASS when:** Publication state changes only with manual or provider-confirmed post ID and platform acceptance. **Initial status:** Not audited.
- [ ] **P0-130 — Feed outcome learning back.** **PASS when:** Actual views, retention, saves, visits and identified limitations inform future creative experiments. **Initial status:** Not audited.

### Section 11. CI/CD, deployment and security resilience — 12 items

- [x] **P0-131 — Preserve static-export compatibility.** **PASS when:** No runtime-only Next APIs or secret-dependent server behavior enters the static Cloudflare export. **Current status:** Verified accepted (audit 002). **Evidence:** audit 002 below.
- [ ] **P0-132 — Pin exact-head required CI.** **PASS when:** Required tests, security, science, content, SEO and accessibility checks validate intended head/base/tree. **Initial status:** Not audited.
- [ ] **P0-133 — Implement cheap local preflight.** **PASS when:** Unit/schema/negative fixtures fail quickly without substituting for required full checks. **Initial status:** Not audited.
- [ ] **P0-134 — Share immutable build output.** **PASS when:** One verified export producer serves equivalent downstream consumers only when hash/scope rules match. **Current status:** Evidence candidate (audit 001). **Evidence:** audit 001 below.
- [ ] **P0-135 — Avoid stale validator reuse.** **PASS when:** Risk-changing or SHA/base-changing edits force required checks to rerun, proven by negative fixtures. **Initial status:** Not audited.
- [ ] **P0-136 — Constrain merge authority.** **PASS when:** Only the existing controller merges and unresolved review/safety holds cannot be overridden. **Initial status:** Not audited.
- [x] **P0-137 — Distinguish governance HTTP errors.** **PASS when:** Known unresolved-review 405 is classified correctly; unrelated auth, network and HTTP errors stay fatal. **Current status:** Verified accepted (audit 001). **Evidence:** audit 001 below.
- [ ] **P0-138 — Keep secrets outside repository.** **PASS when:** Sensitive keys, tokens, signing material and provider credentials are never committed or printed in logs. **Initial status:** Not audited.
- [ ] **P0-139 — Provide reproducible rollback.** **PASS when:** Release artifact and reversible change procedure can restore last known-good approved state. **Initial status:** Not audited.
- [x] **P0-140 — Verify Cloudflare production identity.** **PASS when:** Production-origin deployment receipt exposes the actual expected merged main SHA. **Current status:** Verified accepted (audit 002). **Evidence:** audit 002 below.
- [ ] **P0-141 — Smoke-test critical routes.** **PASS when:** Post-deploy requests and representative mobile/desktop UI checks verify real visitor surfaces. **Initial status:** Not audited.
- [ ] **P0-142 — Expose release failures clearly.** **PASS when:** Failed, pending and skipped jobs have useful logs and cannot be misreported as successful deployment. **Initial status:** Not audited.

### Section 12. Release adoption, governance and ongoing quality — 8 items

- [ ] **P0-143 — Admit next ticket through current sprint.** **PASS when:** New work is scored, dependency-checked, owner-assigned and WIP-admitted before implementation. **Initial status:** Not audited.
- [ ] **P0-144 — Execute a small vertical slice.** **PASS when:** Source to reviewed editor packet to authorized outcome is traced with immutable receipts and rejection tests. **Initial status:** Not audited.
- [ ] **P0-145 — Validate a real visitor journey.** **PASS when:** One high-intent mobile visitor path is exercised on production including evidence and optional CTA. **Initial status:** Not audited.
- [ ] **P0-146 — Run scheduled safety checks.** **PASS when:** Source freshness, corrections, job failures and key route health generate actionable owner-visible notices. **Initial status:** Not audited.
- [ ] **P0-147 — Conduct independent science audit.** **PASS when:** Sampled clinical claims receive documented source/reviewer audit with corrections tracked to closure. **Initial status:** Not audited.
- [ ] **P0-148 — Audit accessibility/security regression.** **PASS when:** Quarterly or release-triggered checks retain failures and remediation evidence. **Initial status:** Not audited.
- [ ] **P0-149 — Maintain the 150-item evidence register.** **PASS when:** Item status changes only after direct acceptance mapping and independent proof, with dated changelog. **Initial status:** Not audited.
- [ ] **P0-150 — Close milestone with outcome audit.** **PASS when:** M0–M6 exit conditions, production artifacts, measured outcomes, Unknowns and next release decisions are documented. **Initial status:** Not audited.

## Reconciliation protocol

1. For each ID, locate canonical implementation and latest GitHub issue/PR, current main artifact and release stage. Record source with last-verified date.
2. Run the listed positive acceptance case and an applicable adversarial/negative case; log required checks and source/reviewer/publisher authority where relevant.
3. If the capability is user-facing, verify the Cloudflare production SHA and live route/smoke; if it is externally contingent, verify real account/provider/analytics receipt. Mark any gap `Blocked` or `Evidence candidate`.
4. Mark `Verified accepted` only on full criterion evidence, record exact proof and audit owner. Retain old 10/150 checkpoint unchanged until a separately documented, signed-off mapping of original task IDs becomes possible.
5. Preserve item count and IDs forever; scope adjustments require a versioned change note without changing the denominator or retroactive credit.

## Known limitations

- The original October 8 checklist text is missing, so section names, item order and wording are reconstructed rather than original.
- At creation, all items were `Not audited`. After audit 002: 9 verified accepted, 3 evidence candidates, and 138 not audited. The original 10/150 legacy count remains separate, unmapped and unchanged.
- This 150-item document is distinct from the separate **25-item generational readiness register** and the older **1,000-ticket master backlog**.
- Dated upstream sprint prose may be stale; live GitHub and origin deployment receipts outrank historical status snapshots.
