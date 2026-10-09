# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-10-08 (P0 preparation; historical WIP notes below still require GitHub reconciliation)
**Normal WIP limit:** `AGENTS.md` permits Discovery/SEO, Revenue/Conversion, and Authority/Content only, with one active ticket per workstream. Distribution lanes do not independently grant additional Revenue/Conversion slots; Operations is not a fourth normal workstream.
**WIP cap:** 3
**Current admission (verified 2026-10-09):** Normal implementation WIP is **1/3**: Discovery/SEO (D) owns the #6466 typed source-to-editorial review-only handoff after fresh exact-base admission; Revenue/Conversion and Authority/Content remain free. WIP cap is unchanged. No medical review/publication authority, field use, revenue or checklist credit is inferred from this admission.

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406

### P0 source-register and controller review-hold releases verified

**2026-10-08 release:** #6445 / PR #6452 merged on exact main `c71a60cdf2511e6a777659568beeeed3a2e51e51`; deploy run `37861839685` verified the matching production receipt. Real zero-job recovery execution remains **Unknown**. **Completed:** #6451 / PR #6455 implemented the narrow HTTP 405 review-conversation exception path and was verified deployed as `9e192934cfa1e1c285075307455b9622f4e88ef4` via run `37865211337`; real 405 runtime canary remains **Unknown**.

### Existing-owner P0 source-register recovery — #6448 merged, #6445 security follow-up

**2026-10-08 verified:** PR #6450 merged as `b3b0a1a357b97e09158fff516ef0d876d643d3e2`; Cloudflare run `37856454431` passed and verified the exact production receipt. The workflow now has read-only dispatch and preserves original scientific checks. A real zero-job bot-recovery execution remains **Unknown** until observed. Distinct existing-owner ticket #6445 / superseded older PR #6446 requires stronger explicit PR/base/head recovery preflight and matching merge-controller input routing. Restage security improvements on current main rather than merging the stale workflow-changing PR or relaxing the `NEEDS_CLEAN_RESTAGE` guard. This is a scoped release-control correction, not an added scientific/publishing authority or normal D/R/A slot. Acceptance: exact same-repository open PR, branch, base, and full head proof before checkout; targeted and full exact-head CI; sole-controller merge; actual recovery and production evidence separately.

## P0 program — Generational Engineering readiness (#6431)

**New cross-cutting P0 operating priority (2026-10-08):** Prepare a coherent generation of THS intelligence and evidence-to-distribution capabilities before implementation. [Architecture and October 12–16 release stages](GENERATIONAL_ENGINEERING_P0.md) · [25-item integration readiness registry](GENERATIONAL_ENGINEERING_READINESS.md). This is **planning and contract-readiness work**, not authorization to add WIP or bypass the current admission/control plane.

**This week's immediate preparation:** reconcile existing open research/intake/social PRs, freeze canonical source/claim/handoff boundaries, map dependencies, write negative fixtures and risk-tiered validation gates, baseline actual CI durations and specify one review-only source-to-editorial vertical slice. **Next week's proposed order:** P0.1 actual-state/CI baseline → P0.2 shared provenance contracts → P0.3 human-review-only integration → P0.4 exact-head release proof/targeted CI optimization → P0.5 retrospective. Reconcile GitHub state and existing WIP reservations before any start.

**Guardrail:** 3 total allowed workstreams, one admitted ticket each; one scoring formula, one merge controller, one science authority. No new clinical, content or social publishing permissions, no duplicate evidence datasets, no paid critical-path dependencies, no skipped security/science/CI/deployment proofs. This P0 supersedes *methodological priority*, not the existing sprint's evidence-first business objective or milestone exit criteria.
## Sprint objective

Finish the smallest trustworthy Evidence → Distribution loop that can produce a governed asset, preserve exact factual provenance through presentation/rendering, move it through an idempotent dry-run publishing lifecycle, and accept attributable outcome observations for deterministic feedback.

At the same time, finish the smallest control-plane hardening needed to keep autonomous execution trustworthy as throughput increases: changed-file-relevant merge gates first (#4410/#4411), then machine reconciliation of GitHub state against the planning docs (#4412). Freshness/unlock-aware prioritization (#4413), durable experiment memory (#4414), and marginal-resource economics (#4415) are merged. Their implementation is not ready work; using them with real observations remains subject to evidence and admission gates.

This sprint is an **acceleration track inside M1**, not a declaration that the Revenue Foundation is complete. GA4/GSC/affiliate alignment and production analytics receipt remain blocked by authorized external access. Those blockers stay visible, but they do not freeze unrelated governed distribution work.

The sprint does **not** authorize broad/high-volume auto-posting, scientific rewriting, evidence-grade mutation, invented safety language, consumer-dose directives, a second factual dataset, speculative content volume, a second prioritization formula, or milestone completion without proof.

## Execution rules

**Execution efficiency:** Batch multiple dependent acceptance criteria inside one reviewable ticket/PR when source ownership, safety, and rollback are coherent. Perform T0/T1 tests before opening the PR; reuse immutable same-head CI artifact receipts for T2 consumers; preserve every existing triggered exact-head check, controller merge authority, and T3 deployment evidence. Never invent checklist credit or measured CI savings.


- Start only tickets listed under `Active` or `Ready next` below, and only when a real WIP slot exists. Merged control-hardening implementations are history, not admission candidates.
- GitHub issue/PR state outranks stale document wording.
- When a ticket merges/closes, remove it from `Active` on the next control sync.
- The normal WIP cap remains three. A temporary incident/control overflow must be explicitly documented and blocks admission of further work until active WIP is below the cap.
- One lane may not edit another lane's source-of-truth surface merely to move faster.
- L1 owns rendering/media infrastructure; L2 factual/provenance; L3 opportunity/measurement; L4 presentation/experiments; L5 lifecycle/publishing. These surface owners do not override the one-ticket-per-workstream limit.
- Canonical research objects and governed upstream evidence remain factual authority.
- Every distribution asset must retain canonical source URL/content hash and the exact approved factual/limitation boundary.
- Missing production/external metrics remain `Unknown`, never zero and never inferred success.
- Positive performance feedback must preserve the existing minimum-exposure threshold and may re-rank only already-eligible opportunities.
- The backlog keeps exactly one score formula. Dependency-unlock value belongs inside Strategic Leverage; stale external assumptions reduce Confidence or force revalidation before promotion.
- Externally contingent work must expose a current `last_verified` date/scope at promotion time under merged #4413; stale hypotheses may not remain perpetually `Ready` by inertia.
- Before repeating a governed experiment using merged #4414, check durable experiment history; a materially equivalent prior test requires a named changed assumption/retest condition.
- When comparable resource observations exist, scale based on marginal qualified outcomes per incremental resource, not gross output alone. Missing resource/outcome data remains `Unknown`.
- Deterministic failures found inside scope are repaired before merge. Merge only on exact intended head when required gates are green and no blocking review/governance defect remains.

## Milestone projection

| Milestone | Status |
|---|---|
| M0 | In progress |
| M1 | In progress |
| M2 | Blocked |
| M3 | Not started |
| M4 | Not started |
| M5 | Not started |
| M6 | Not started |

## Active / in review — implementation WIP 1/3

**Scientific Intelligence #6427 / PR #6428 — In review (2026-10-08):** Twelve exact-source research capabilities are stacked after #6422: Claim DNA, Trial Lineage, Comparability, Integrity Radar, Hypothesis Forge, Counterfactuals, bounded local Research Missions, Citation Constellations, Mechanism/Human boundary, Living Review, rule-based Adversarial Review, and Calibration Lab. The release must keep all 12 receipts source-bound and fail-closed for unverified clinical effects. This entry documents an existing user-requested implementation/review, does not raise the normal WIP cap or invent an admission transaction, and does not claim deployment. The upstream full-text, registry, correction-feed and external autonomous research dependencies remain blocked/Unknown. Exact-head CI and production receipt are required.

**Research Intelligence #6420 / PR #6422 — In review (2026-10-08):** Source-verified Semantic Intelligence 1.06 adds exact-PMID navigation junctions between the eight original research instruments, a title-backed two-concept Voyages eligibility gate, and a separate independently reviewed annotation lane. The branch also carries the exact DOI publication-to-editorial/distribution review map from 1.07 (#6423/#6424). The 1.05 foundation has merged via #6419. These are read-only research-infrastructure changes; clinical promotions, automated publications, and proof of deployment are **not** authorized. The normal D/R/A WIP cap remains 3; this status entry does not silently change machine-managed reservations or grant another implementation slot. Merge requires latest-head CI, closed review threads and production verification.



**Creative-quality control #6382:** Active — implement R8.05 Attention-First Story Architecture & Semantic AV Lock after a real TikTok field failure exposed that scientific correctness, clean visuals and a good local narrator can still produce weak social content. Scope is bounded to premise selection and audiovisual temporal coherence: premise-interest, one-mental-job, payoff-before-method, natural-duration, narration-first beat mapping, semantic clip ownership, cut-on-meaning, internal-motion synchronization, cognitive-load ceiling, whole-piece cohesion, and a one-macro-rebuild rescue limit. R8.04 zero-credit sovereignty remains mandatory.


**Research-only admission #6349 / PR #6350:** In review — exact-verified deep research enrichment Waves 4001–4500. This governed research-only staging is admitted outside normal D/R/A implementation WIP, remains fail-closed from entity creation/runtime publication/recommendation/dose inference, and may merge only after repository validation and review are green.

| Workstream | Ticket / owning PR | Scope | Status | Priority | Score | Freshness |
|---|---|---|---|---|---:|---|
| D | #6466 | Typed source-to-editorial review-only handoff and identity guards | Active — admitted | P0 | 60.0 | 2026-10-09 |



**Control maintenance #6131:** In review — reconcile closed owners and make the active roster readable by the existing reconciler. The gate now requires authenticated proof that added roster owners already had unique open PRs before the fixed base; normal admission remains unchanged. This control repair grants no normal implementation slot.

**Security follow-up #5456:** Open — permanent MDX/TOML dependency-chain removal remains unresolved. Temporary build-tool containment expires 2026-10-07; no extension is authorized by this reconciliation.

**Authority prerequisite #5081:** Blocked on a fresh non-overlapping governor lease. Authority/Content is free; that does not waive #5081's prerequisite.

Research-only enrichment staging is not canonical implementation admission. #6338 / PR #6339 is completed; no new work may overlap an active normal-lane owner.

### Verified completion refresh — 2026-10-06

- **#6356 / PR #6357 — completed:** THS Publisher v0.1 merged to `main` as `fc0d0fee90a027cb13e2f6b77071d8632ee99b35`. Canonical `publication_id` identity, D1-backed publication state, governed TikTok draft-upload transport, Observer/reconciliation semantics, owner `/publish-ths` entry point, provider-neutral media staging, and hard-frozen Metricool publication paths are implemented. Exact-head CI, full tests/data/security, Fast UI, Site Health, Atomic, Build Quality, Research Distribution, Project Control, and production build/output passed before merge. Cloudflare D1/KV bindings, server secrets, TikTok app approval, and creator authorization remain external production setup; no live TikTok publication receipt is claimed yet.

- **#6258 / PR #6257 — completed:** RC/NPS consolidated closeout merged at `6151f17759b09bd0b9a73a605b58b70b813e8dda` from exact source `17ea07e9ca2ecd45bbaf60fdd125c71fcfb6f055` on 2026-10-05T12:37:53Z. Includes #6249 / #6253; duplicate PRs #6252/#6254 are closed with their source incorporated. The 92-route inventory, all 45 candidate dispositions, source corrections, recovery/support normalization, tests and evidence limitations are recorded in `docs/content/rc-nps-completion-2026-10-05.md`. Sparse-compound evidence gaps, unverified global legal status and external outcomes remain explicit.

- **#6338 / PR #6339 — completed:** live GitHub merge receipt is `c5179df73b0ad472149b13f595a279ec60af49d5`, merged 2026-10-05T03:41:40Z. Retirement reconciles ownership only; it does not assert measured traffic, revenue, or a new deployment receipt.

- **#6021 / PR #6195 — completed:** merged as `a1463e8010cfb2c30126bd06671451e23b19b703`; the focus-cluster breadcrumb now points to Guides and exposes an accessible breadcrumb name. Discovery/SEO ownership is retired; external engagement/business impact remains **Unknown**.

- **#6185 / PR #6190 — completed:** merged as `0657391a3bb73916f18bd0df42542363dcdc07d3`; bounded UI-contract changes now fail stale source/copy contracts before broad validation, exact-head governed static exports are reused by Build Check, Lighthouse, Production Content Lint, and P0 Visual Proof, fallback rebuilds remain fail-closed on artifact miss/mismatch, and P0 is required whenever its retained path trigger applies (including low-risk visual-path tests). Exact-head full Vitest/a11y, native node tests, canonical data, workbook/runtime-trust/security, production build/output/SEO, Build Quality, Atomic, Site Health, governed consumer reuse, Lighthouse, P0 visual proof, and review resolution passed. External traffic, conversion, ranking, and revenue impact remain **Unknown**.

- **#6181 / PR #6184 — completed:** merged as `31e2f7b1b07ba01ab7e9e99831ac807b33d7061a`; Research now presents three primary tasks—search citations, look up evidence, and inspect the Evidence Report—while Methodology and recent evidence changes remain secondary trust/update paths. Stable routes, source samples, external databases, downloads, scientific content, evidence grading, safety language, canonical metadata, and monetization behavior were preserved. Exact-head CI, full Vitest/a11y, production build/output/SEO, Fast UI, P0 visual proof, Experience contract, Atomic, Site Health, Build Quality, and review resolution passed. External engagement, search, conversion, and revenue impact remain **Unknown** until observed.

- **#6174 / PR #6177 — completed:** merged as `c80d1f736c87040ae85ea33bae16bf642dd8b7dd`; herb and compound profile intros now keep decision-critical verdict/routing content ahead of supporting monograph art in narrow-screen reading order while preserving the desktop two-column intro. A review-found light-theme styling collision was repaired by scoping generic hero rounded-card treatment to the identity/quick-facts header, preserving verdict/safety semantic colors. Exact-head CI, Fast UI/accessibility, P0 visual proof, Experience contract, Atomic, Site Health, Build Quality, crawl/content guards, production build/output/SEO, and review resolution passed. External engagement, search, conversion, and revenue impact remain **Unknown** until observed.

- **#6115 / PR #6116 — completed:** merged as `4a398dbb821ca3dd7ae975682e18eec3a002b302`; the mitragynine-adjacent citation cluster is now on `main`, preserving evidence/safety boundaries while adding the four missing compound reviews and refreshed cluster links/schema. External search/citation/business impact remains **Unknown** until observed.

- **#5758 / PR #6126 — completed:** merged as `32dda28c8cd84e32b6df2458dcff6da66328e935`; the sleep flagship search title/meta description now match proven query wording more closely while preserving the canonical URL, H1, body, citations, safety language, and evidence conclusions. External CTR improvement remains **Unknown** until post-change search data exists.

- **#6145 / PR #6154 — completed:** merged as `c8ff86010e4fa7e9030b3744a13dc565e621db38`; the built-output affiliate audit now fails closed on malformed/non-HTTPS Amazon destinations and invalid Associates tag structure while preserving the existing production tag authority. Product availability, clicks, orders, conversion, and revenue remain **Unknown** until separately observed.

- **#6134 / PR #6137 — completed:** merged 2026-10-01 as `fd9ea3ea079c868453e364b479fff54fa7b152d2`. The bounded social-attribution bridge now preserves consent-gated experiment identity across page/journey events, keeps platform link clicks separate from first-party `qualifiedVisits`, and leaves incomplete provider observations waiting rather than fabricating zero. Production event receipt, actual qualified visits, downstream journey rates, traffic lift, conversion, and revenue remain **Unknown** until separately observed.
- **#6051 — completed:** GitHub closed the mobile overhaul on 2026-10-01 at 02:06:39 UTC after its acceptance checklist was checked. PR #6106 remains the hosted visual-proof/desktop-menu repair receipt. This retires its Discovery/SEO reservation; external engagement/business impact remains Unknown.
- **#6112 / PR #6113 — completed:** merged 2026-09-30 as `8b9635eb6d1145ba0ecc6698c1ee188cc4193a3c`; obsolete producer fan-out repair no longer owns a control exception.
- **#6128 / PR #6129 — completed:** merged as `27fa47bf16bed5306ed5bd84bb0914a4717e548a`. Exact-merge CI `36853489382`, content lint `36854691768`, invariants `36854694901`, Lighthouse `36854689068`, and production deployment `36854756177` passed. Fifteen article-quality failures were repaired; business impact and realized quota savings remain Unknown.

### Recently completed refill cycle

- **#4989 / PR #6060 — Authority/Content:** merged 2026-09-28; curated-index policy now has one canonical authority consumed by runtime/governance/audit readers, with legacy bypass semantics preserved and no new scientific approvals created.

- **#4987 / PR #6057 — Authority/Content:** merged 2026-09-28 after exact-head CI, Atomic, Project Control, Site Health, and Build Quality passed. Claim IDs can no longer inflate source counts; stale counts and dangling/inactive source identities cannot self-attest evidence; generic scientific approval/recommendation now requires an approved claim linked to an approved source. Curated indexing remains a separate discoverability policy.

- **#6047 / PR #6050 — Discovery/SEO:** retired with this merge; Home, Start, Library, and primary navigation now share the canonical Goals / Guides / Ingredients / Safety / Research architecture. Home keeps direct search and a compact trust/metrics block, Start is a lightweight five-destination router, Library remains exhaustive under the same five groups plus Site Information, and narrow-phone metric cards can shrink without horizontal overflow. Retained homepage regression contracts were updated to protect the replacement architecture. Exact-head CI, full tests/a11y, production build/output/SEO, Fast UI, Atomic, Site Health, Build Quality, project-control reconciliation, content lint/invariants, schema/media, crawl, Technical SEO, Build Check, and Lighthouse all passed; external engagement/business impact remains `Unknown`.

- **#6041 / PR #6044 — Discovery/SEO:** merged as `245f76d2856bf5ee622180faf668b90c8a172441`; Safety Checker, evidence-gated interaction guides, interaction education, and the supplement safety checklist now share one coherent Safety flow. Guide-detail pages preserve the Safety-family visual context without falsely marking the parent index as the exact current page. Exact-head CI, Fast UI/accessibility, Project Control, Atomic, Site Health, Build Quality, link/output/SEO, data, and security gates passed; external engagement/business impact remains `Unknown`.

- **#6035 / PR #6038 — Discovery/SEO:** merged as `1c9277714cce080f3f85ba1586b9f626beca7fd1`; Herbs, Compounds, Search, and Evidence Lookup now share a coherent lookup flow, paginated ingredient indexes keep the same navigation, Search accurately reflects its indexed content, and exact-head CI/Fast UI/Project Control/Atomic/Site Health/Build Quality/link/output/SEO gates passed. External engagement/business impact remains `Unknown`.

- **#6031 / PR #6033 — Discovery/SEO:** merged as `6ab7cc95800a14f0dc3df159ac298c6a2c752f8c`; Guides, Learn, and Articles now form one editorial family with shared local navigation, distinct decision/concept/reading roles, a collapsed complete Learn index, normalized article categories, and preserved stable routes. Exact-head CI, Fast UI, Project Control, Atomic, Site Health, Build Quality, AI-search, internal-link, output, and SEO checks passed; external behavior/business impact remains `Unknown`.

- **#6024 / PR #6028 — Discovery/SEO:** merged as `01613f5f4bf209e5ebd733f79517e3eed066d601`; established five primary destinations, deterministic route ownership, role-aware global chrome, a task-first Research hub, and consistent paginated ingredient-index behavior while preserving stable URLs and scientific/evidence/safety/publication boundaries.

- **#6011 / PR #6019 — Discovery/SEO:** merged as `c59d169b5b6e0616ebb2619fb6750e87cb9f9548`; five guide hubs now label their breadcrumb navigation landmark and the ticket is closed/retired from active Discovery/SEO WIP.
- **#6002 / PR #6010 — Discovery/SEO:** merged as `81665250fe00c7c910d6301b7a128d95a5627dd8`; removed nested `<main>` landmarks from 42 verified production app/shared sources, preserved `/research/` visual treatment through `.research-page-content`, and added a source-level regression rule leaving `app/layout.tsx` as the sole production main-landmark owner. Exact-head CI, Fast UI, Atomic, Site Health, Build Quality, internal-link/SEO verification, and all seven governed export consumers passed. External traffic, engagement, ranking, conversion, and revenue effects remain `Unknown`.
- **#6000 / PR #6001 — Discovery/SEO:** merged as `a862b97068e3aaf1a0916590b1e0bf2be7044ef7`; aligned footer/breadcrumb vocabulary with the current five-job navigation, moved Turmeric vs Curcumin discovery into the Comparisons hub, fixed the footer Research target to `/research/`, and passed exact-head CI, Fast UI, Atomic, Site Health, Build Quality, internal-link/SEO verification, plus all seven governed export consumers. External traffic, engagement, ranking, conversion, and revenue effects remain `Unknown`.

- **#5989 / PR #5990 — Discovery/SEO:** merged as `9240bc1fe32c3985dbe068678fb2b94c647e0317`; simplified global navigation, established `/guides/` as the primary topic-discovery hub, preserved published-library and Botanical Activity Atlas semantics, and passed exact-head Project Control, Experience, Atomic, Site Health, Build Quality, Fast UI, full Vitest/a11y, production build/output, link, sitemap, and SEO verification. External traffic, engagement, ranking, conversion, and revenue effects remain `Unknown`.

- **#5706 / PR #5971 — Authority/Content:** merged as `381bbe6029bdeaf604314aa1e9f67757b1fa37bd`; consolidated CoQ10 evidence/runtime ownership onto `compound:coenzyme-q10`, preserved endpoint discordance and fail-closed public/runtime policy, and retired #5706 from active implementation ownership.

- **#5703 / PR #5961 — Authority/Content:** merged as `6bd7b57a633c8f88a70edb688d969ee19e7de8ad`; terminally promoted five cobalamin findings, repaired source-admission identity/schema drift and staged-closure seeding, failed the public cobalamin profile closed for recommendation/monetization/indexing pending broader review, and restored the clean-checkout regression fixture; all repository-owned exact-head validation, build, Lighthouse, evidence, governor, Atomic, Site Health, and parallel-safety gates passed. External Cloudflare preview status remained stuck across successive superseded heads and was not a protected merge requirement.
- **#5698 / PR #5701 — Authority/Content P0:** merged as `1727c68cbb5dfc865e4be7c02af6e0fb7d867d75`; retracted PMID 41461240 / DOI 10.1016/j.jad.2025.121055 is quarantined against PMID- or DOI-only re-entry, stress-guide source usage was repaired, focused regressions were added, and exact-head CI/Site Health/Crawl/Technical SEO/Schema/Content Invariants/Atomic gates passed. This is source-integrity repair, not business-impact proof.
- **#5681 / PR #5684 — Revenue/Conversion:** merged as `cc5c960aa00350c1eb64ee6cf4e6028c627bb289`; `AffiliateProductBox` now presents its affiliate disclosure before any product links, preserving existing page-level disclosures, product URLs/order/copy, click/impression tracking, rel attributes, and scientific content; exact-head CI/UI/schema/crawl/SEO/content/build gates passed; observed conversion/revenue impact remains `Unknown`.
- **#5675 / PR #5678 — Revenue/Conversion:** merged as `53f7bbfc3013eb9d45e81c332756ef1857c3b22d`; newsletter/email signup surfaces now declare page-owned vs contextual-global ownership, the root ContextualLeadMagnet fails closed when main content owns signup, delayed article experiments reserve page ownership before hydration/portal placement, and a MutationObserver catches later ownership mounts; all exact-head CI/UI/accessibility/SEO/schema/crawl/content gates passed; observed signup/conversion/revenue impact remains `Unknown`.
- **#5669 / PR #5672 — Revenue/Conversion:** merged as `b4474aba917784d1959f84a25ee28fcd138e9a0a`; Glycine for Sleep now has one page-owned evidence-first newsletter action after the verdict and before product sourcing, while the route-specific global ContextualLeadMagnet is suppressed to prevent a duplicate email path; the 12-source scientific ledger and affiliate disclosure boundary remain unchanged; observed conversion/revenue impact remains `Unknown`.
- **#5665 / PR #5668 — Authority/Content:** merged as `896292ff5eb6167e177455aae1a140f3a0390cd3`; Glycine for Sleep now has a 12-source ledger, Sept. 19 review provenance, the September 2026 scoping-review evidence ceiling of three supplemental-glycine sleep trials, and explicit collagen-directness regressions while preserving the cautious efficacy, 3 g research-dose, safety, and insomnia-treatment boundaries; observed search/conversion/revenue impact remains `Unknown`.
- **#5631 / PR #5663 — Authority/Content:** merged as `8a499f987f834f19ec211c74638f4ab4741c6787`; supplement-stacking safety now uses refreshed clinically relevant interaction evidence with focused regressions while preserving documented-interaction vs plausible-mechanism vs unknown/unreported boundaries and avoiding stack recipes, timing hacks, or medication-changing advice; observed search/citation/conversion/revenue impact remains `Unknown`.
- **#5602 / PR #5661 — Authority/Content:** merged; Best Herbs for Anxiety now has a 22-source ledger, Sept. 19 review provenance, newer systematic evidence, and methodology visibility while preserving ranking and safety/negative-trial boundaries; observed search/citation/conversion impact remains `Unknown`.
- **#5647 / PR #5657 — Revenue/Conversion:** merged; Valerian Root now has one downstream evidence-first newsletter action after the complete answer/FAQ/references journey, with the 18-source scientific content unchanged and observed conversion impact still `Unknown`.
- **#5629 / PR #5650 — Discovery/SEO:** merged; Kava article, broad herb guide, and depth monograph now have explicit distinct reader-job ownership, self-consistent canonical/sitemap/link-map routing, and unchanged evidence/safety conclusions; observed search/citation impact remains `Unknown`.
- **#5630 / PR #5646 — Revenue/Conversion:** merged; Best Herbs for Anxiety now has one downstream newsletter action, with evidence/safety unchanged and conversion impact still `Unknown`.

- **#5638 / PR #5639 — Discovery/SEO control:** merged; search governance now consumes the canonical metadata experiment ledger and protects proposed/running/winning metadata experiments from competing rewrites.
- **#5637 / PR #5636 — Discovery/SEO control:** merged; fresh dated search opportunity is primary, citation-only holds are non-actionable, and AI citations remain a bounded authority/confidence overlay.
- **#5610 / PR #5625 — Discovery/SEO:** reciprocal magnesium general-vs-sleep intent routing plus sleep-shortlist handoff; completion becomes authoritative when this PR merges.
- **#5611 / PR #5622 — Revenue/Conversion:** merged; one trust-preserving protein post-answer action on the shared next-action shell.
- **#5612 / PR #5624 — Authority/Content:** merged; valerian evidence/safety refresh preserving monotherapy, null-outcome, preparation and safety boundaries.

## Ready next — strict dependency order

Discovery/SEO, Revenue/Conversion, and Authority/Content are free. Normal WIP is 0/3. No candidate becomes executable merely because slots are free; further work still requires a separate scored, fresh, non-overlapping admission transaction. Evidence, experiment, scientific, canonical, governance, and external-access gates remain unchanged.

### Blocked or deferred candidates

| Candidate | Workstream | Admission state | Proof required before implementation |
|---|---|---|---|
| #5081 | Authority/Content / L2 | Blocked — fresh governor lease required | Acquire and merge a non-overlapping lease bound to exact current main before any canonical Sage evidence mutation; the free Authority slot does not waive this prerequisite. |

## Control hardening — merged implementation, observed use still gated

#4413 / PR #4469, #4414 / PR #4490, and #4415 / PR #4492 are merged and retired below. Do not recreate them from an older queue.

- Consult the durable experiment-learning ledger before repeating an equivalent experiment; a retest requires a changed assumption and fresh evidence. Ledger capability does not prove that every producer already emits history.
- The economics contract derives ratios from named observations; missing values remain Unknown. Comparable metric definitions, scope, attribution boundary and window duration are required.
- Positive scale eligibility requires explicit attribution/quality-debt observations and source-bound exposure at the unchanged 250-view floor in both periods. Estimates and merged-code throughput cannot authorize scaling; other domain-specific sufficiency policies are not invented.
- Real CI/resource and attributable growth ratios remain waiting until their supplying observations exist. Neither merge advances M1/M2 or proves business impact.

## External blockers preserved from M0/M1

| ID | Blocker | Current truth | Next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | Code readiness merged; production GA4/Ahrefs configuration/event receipt remains Unknown | Obtain authorized environment/property/network/DebugView evidence without exposing secrets |
| SEO-004 | 28-day GSC baseline | No authorized fixed-window export in repo | Supply authorized Search Console access/export and record exact dates |
| REV-002 | Aligned funnel/revenue baseline | Cross-source baseline incomplete | Reconcile GA4/GSC/Amazon/Mailchimp once source access exists; partial source-level observations remain explicitly partial |
| #4014 | `main` branch protection/ruleset | GitHub currently reports provider-side protection disabled | Apply/verify required settings with authorized repository-settings access; documentation alone is not enforcement |
| #4341 | Recurring Cloudflare production failure class | Repository-side checks do not expose root-cause logs | Inspect failed production deployment logs; repair only if a deterministic repository/config cause is identified |

## Additional fallback work when every named candidate above is blocked

Promote only after checking overlap, current exact-main state, source freshness, and the canonical governor/lease/provenance contract.

No fallback ticket is currently promoted. #5076, #4532 / PR #5510, #5237 / PR #5513, #5026 / PR #5511, #5540 / PR #5544, and #5296 / PR #5552 are completed or retired. #5081 / PR #5556 remains pending and does not own Authority/Content until a fresh non-overlapping governor lease exists.

## Sprint exit conditions

The sprint exits only when all of the following are true or have a precise external blocker:

- PRs #4388, #4401, and #4405 are merged or explicitly blocked with exact failing proof; no stale active status remains in control docs.
- PR #4411 / #4410 is merged or explicitly blocked, and active implementation WIP is within the normal three-ticket cap.
- #4412 has proven machine reconciliation and merged; known stale active state must still be reconciled rather than suppressed.
- The governed research object → validated pack → lossless creative plan → deterministic rendered asset chain is reproducible and provenance-bound.
- #4406 has proven an idempotent dry-run lifecycle with stale-asset rejection, durable receipts, retry safety, and rollback/stop semantics.
- #4407 proves deterministic attributable observation ingestion, Unknown handling, replay, cross-platform isolation, and the existing minimum-exposure guard.
- A bounded pilot package can be generated end-to-end and is measurement-ready; live publication is optional only if a supported/authorized provider path exists.
- #4413/#4414/#4415 implementations are merged, and their single-formula/freshness, experiment-memory, and marginal-efficiency boundaries remain preserved in actual use; their merges do not substitute for distribution MVP or observed-outcome proof.
- No broad auto-publishing or high-volume scheduling is enabled merely because the technical chain exists.
- Revenue/GSC/analytics blockers remain honestly labeled and do not silently satisfy M1/M2 exits.
- Backlog and sprint agree with current GitHub state: no completed issue or merged PR occupies an active slot.
- Required scientific, provenance, safety, accessibility, release, and exact-head validation gates remain intact.

## Recently retired from this sprint

- **#5505 / PR #5506:** merged as `90bf695bd4c7f1e006159078d26afd4869149cdd`; phone-homepage-only polish removes the floating scroll-to-top control, decorative goal arrows, comparison numbering, and repeated footer onboarding while preserving global/desktop behavior. Production run #7308 is still in progress, so no production receipt is claimed yet. Traffic, engagement, conversion, and revenue effects remain `Unknown`.
- **#5502 / PR #5504:** merged and production-deployed as `99dd55269206e983c9d34bece0f358a9f932f270`; phone homepage hierarchy now uses one dark research anchor, compact goals, flattened comparison navigation, a supporting Research Standard section, and corrected footer spacing. Exact production receipt verified. Traffic, engagement, conversion, and revenue effects remain `Unknown`.
- **#5031 / PR #5090:** merged as `7b110d7a19c51e08de3d3b112ac36e96824bfd27`; explicit newsletter capture titles remove the duplicated `research` trust defect while preserving provider, tag, privacy, analytics and scientific boundaries. Exact-main deployment verification completed. Conversion lift remains `Unknown` until attributable observations exist.
- **#5021 / PR #5028:** merged as `27613f9fba936c78cb024d1381811d2b2da159c9`; five Vitamin B6 findings were governed promoted and one was governed non-promoted, with neuropathy dose/duration boundaries retained, generic dose placeholders removed, recommendation/monetization/indexing fail-closed, and post-merge deployment verification completed. This is scientific-governance throughput, not traffic or revenue proof.
- **PR #5084:** merged as `70ba137cbfec444557ad8c8b7ff0656f35651b61`; AI-citation asset-identity protection is on main. The ledger intentionally remains awaiting fresh page-level telemetry rather than inventing winner URLs from partial query exports.
- **#4992 / PR #5016 / PR #5020:** Propionate closure merged as `523ba9323dd3506e51f2d1aaab53b6d0a2e49aa5`; post-merge Session E bootstrap proved 4 findings terminal/promoted with 0 pending, and verified state-only lease release merged as `4461ac4c59aa48bafca85125f86e4a37e6ee4610`. No generic efficacy, consumer-dose, or business outcome is inferred.
- **#4266 / PR #4972:** merged as `8aba655daae2aba8d07cd2ba6f32ed52f8f3b498`; registered PMID 41943502 / DOI 10.1002/ptr.70315, added three formulation- and population-bounded KSM-66 safety records, regenerated the governed rollup, and added exact regression coverage without creating an efficacy or general-dose claim. All required exact-head checks passed; PR #4976 subsequently released the governed lease. The optional Cloudflare preview remained in progress at merge and no production outcome is inferred.
- **#4949 / #4951 / PR #4952:** merged as `0c667ca7bd9bf49279594e7df79a806cb4c1237a`; restored direct comparison-hub discovery for the caffeine/L-theanine route, aligned canonical `/evidence/` and `/info/` hubs with sitemap and redirect ownership, and preserved historical audit exports with canonical-source tombstones. Exact-head and post-merge required checks, Cloudflare Pages, and deploy passed. This proves deterministic crawl/release recovery, not traffic, ranking, indexing, analytics, or revenue outcomes.
- **#4731 / PR #4947:** merged as `6e32a773d908495f08fa297fc51da1cea6fb2659`; the factual-copy validator closes the scoped unbound dose-unit, onset/duration, and comparative-efficacy label bypasses with focused rejection/nonfactual controls. The separate Discovery/SEO incident later exposed by post-merge output verification is retired above.
- **#4730 / PR #4858:** merged as `44b019fa1f67ead0538076944224243a098dbfde`; stale published or paused-but-live assets retain a governed withdrawal path and receipt while stale non-live assets remain terminal-invalid. The reopened issue is closed complete.
- **#4784 / PR #4813:** merged as `1e8fae58a3499c9f6a79b4338e636244620ec629`; the least-privilege persistent governor transaction capability is on main. Capability does not equal an acquired lease, and current queue state has none.
- **#4732 / PR #4734:** merged as `4d26d1cfacb5fb577f9216b7fa116e006e7b0a0d`; the bounded Metricool adapter is repository capability only. Provider credentials/configuration, live scheduling, publication confirmation, and public/business outcomes remain externally gated or Unknown.
- **AUTH-001 / #4800 / PR #4803:** current content-audit diagnostic run `33316024891` completed successfully and explicitly printed `AUTH_DUPLICATE_COUNT=0`. PR #4803 closed unmerged because it only added a temporary diagnostic workflow; the historical four duplicate-intent pairs are stale and no redirect/consolidation work was manufactured.
- **SEO-003 / #4795 / PR #4796:** exact-current Schema and Media Governance run `33315511238` passed shared schema regressions, production static export, structured-data completeness, first-party identity/safety policy, and media checks. PR #4796 closed unmerged because its only change was a diagnostic comment; the historical 38-identity failure is stale.
- **#4719 / PR #4720:** merged as `90e2be7233f460919e3341f1aefd0053b1867df2`; governed static-export receipts now bind and restore producer-generated verification state plus the build manifest. Exact-head Build Check, Production Content Lint, and Lighthouse consumers passed; no validation gate was weakened.
- **#4717 / PR #4718:** merged as `97c877513da12137ba666451fff5f6c4f691c483`; accessible vertical-video motion is bounded to calm allowlisted transitions with an explicit zero-motion fallback. This is not live video publication or completion of the deferred encoding boundary.
- **#4715 / PR #4716:** merged as `f06b1d400b465c3997121e2af49b7d3eafc3b503`; the first provenance-bound carousel pilot completes dry-run scheduling only. Live publication remains unauthorized and the future 28-day observation window/value remain null/Unknown.
- **#4651 / PR #4673:** merged as `058326df0f27685072047c465a7b86729bb51b2d`; Session F staging added six append-only research fragments and made zero canonical/public scientific mutations.
- **PR #4631:** merged as `13d80681e32ff95a919651f1d0a4068fc972edee`; it staged the research boundaries later reviewed and promoted through completed #4266 / PR #4972.

- **#4227 / PR #4523:** merged as `9f1a4fe26e7a6caab56de07c5a0f25b2f39c6f15`; exact-head governed static-export reuse is complete and no longer a fallback candidate.
- **#4415 / PR #4492:** merged as `23dc2485720ff6b31043413b2b9295c4886944cb`. Final-head CI passed 2,866 tests across 593 files, real production build/output/SEO, and 42 focused economics regressions ([CI proof](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33193431644), [focused proof](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33193431712)). Repaired files verified on main; four review findings resolved after evidence review. Real efficiency observations remain Unknown.
- **#4414 / PR #4490:** merged as `2e67f9e55f4d96dc7d82a683a829a29b4e2298f1`; durable experiment-learning capability is no longer queued. Recorded outcomes and producer integration require their own evidence.
- **#4477 / PR #4478:** merged as `2b25ae9beed63afe1e6c045491828e3f096037e4`; the template catalog no longer active.
- **PR #4491:** merged as `d726f81bc5ababbb024b86782da2e94fbc15989e`; governed safety-line preservation is no longer active.

- **#4407 / PR #4484:** merged as `6fba155c6f241af7cee38981c413bde710d56c1b`; attributable outcome ingestion is no longer ready work. Final-head checks passed; this is implementation proof, not evidence of real observed performance or an executed pilot.

- **#4413 / PR #4469:** merged as `d0936fbe7d41c84c753a8374f2a7b25047322339`; freshness/unlock-aware prioritization no longer occupies active WIP.
- **#4476 / PR #4475:** merged as `65605fd2f4e9cfd85af63c14bd2a583471551bf2`; canonical evidence-grade binding no longer occupies active WIP.
- **#4482 / PR #4481:** research draft staging merged as `d6934eacff95b4b9dc1c3c5be2f0c8a91e9bc4a1`; this is not approval for scientific promotion and does not resolve the recorded source-registry blocker.

- **PR #4457:** completed/merged as `95ec9ba285f06c947f2844a2f81abce031b9e437`; complete canonical safety-warning preservation no longer occupies active WIP.

- **#4412 / PR #4446:** completed/merged as `96a07976dee22cf7b91c337c820cc83ff7e6b860`; machine reconciliation is on main and no longer occupies active WIP. Final-head hosted CI passed all 18 reconciliation cases and 2,785 tests across 587 files; production build/output/SEO passed in [run 33148069222](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33148069222). Both review findings are verified/resolved. This is implementation proof, not a claim that later planning snapshots or business outcomes are healthy.
- **#4463:** completed/merged as `f300e0e8f3ef8b9a485f0cbd8c0993725bd425b1`; trust-safe thumbnail variants are on main and no longer occupy active WIP.
- **#4460:** completed/merged as `48bebb81e35c4bd605dedbfc15156cabeb915b06`; duplicate-angle suppression is on main and no longer occupies active WIP.
- **#4406:** completed; the governed ready → publish → measured lifecycle is merged and no longer occupies the ready queue.
- **#4439 / PR #4440:** completed/merged; canonical claim/source binding no longer occupies an active slot.
- **PR #4448:** closed unmerged; vertical MP4 implementation is preserved for later legal reuse and does not occupy active WIP.
- **#4447 / PR #4445:** merged as `692d85d1a496188b4bc48113f8f64b5e94c82098`; the hook trust contract no longer occupies an active slot.
- **#4410 / PR #4411:** merged; scoped changed-file-relevant gates are on main. The temporary overflow exception is retired.
- **PRs #4388, #4401, #4405:** merged; renderer, provenance-receipt, and lossless-presentation implementation no longer active.
- **PR #4408 / #4409:** merged/closed; roadmap, sprint, and master backlog synchronized to exact GitHub state on 2026-08-27.
- **#4182:** closed/completed; five herb/compound identity correction no longer active.
- **#4238:** closed/completed; normalized source-registry baseline/provenance continuation no longer active.
- **AUTH-004 / PR #4145:** merged; visual browse refinement no longer active.
- **SEO-005 / PR #4331:** merged; monitor remains file-fed until a supported Bing AI Performance acquisition path exists.
- **I18N-001 / PR #4332:** merged; Japanese/Korean core locale expansion is live while detailed scientific profiles remain fail-closed.
- **REV-005 / PR #4358:** merged; the validated media-pack foundation is now upstream infrastructure for this sprint.

- **#6384 / PR #6385 — R8.06 Hook Competition, Visual Teaching Objects & Native Delivery:** Merged foundation. Preserve R8.05 runtime/semantic AV lock and R8.04 sovereignty while adding three-angle concept selection, opening convergence, immediate finding/payoff, early visual teaching-object diversity, exact-master native-feel rejection, and opportunistic Metricool→manual fallback. Audience uplift remains Unknown until field-tested.

- **#6386 — R8.07 Visual Authorship, Pattern Interruption & Retention Rhythm:** Active. Preserve R8.06 concept/native-delivery gates and R8.05 runtime while adding recurring semantic motif continuity, composition-family diversity, local authored SVG primitives, a limitation-pivot pattern interrupt, repetition-debt ceilings, and exact-master rhythm QA. Audience uplift remains Unknown until field-tested.
