# Master Backlog

**Status:** Authoritative ranked backlog
**Updated:** 2026-10-08 (P0 planning priority)
**WIP cap:** 3

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406
**Immediate work:** Only tickets present in [CURRENT_SPRINT.md](CURRENT_SPRINT.md) may be started. Closed/completed work must be removed from active sections on the next control-plane sync. The deep candidate feeder is [SWARM_BACKLOG.md](SWARM_BACKLOG.md); candidates there are not executable until revalidated and promoted here and into the sprint.

### P0 control-plane review-hold reliability — #6451 (completed)

**Dependency satisfied 2026-10-08:** PR #6452 deployed at `c71a60cdf2511e6a777659568beeeed3a2e51e51` and Cloudflare run `37861839685` verified the production receipt. #6451 / PR #6455 is now merged and production receipt verified for `9e192934cfa1e1c285075307455b9622f4e88ef4` (run `37865211337`); WIP now 0/3. Restrict implementation to the known GitHub 405 unresolved-review conversation blocker; unrelated HTTP/auth/transport failures stay fatal and no controller merge gates change. Runtime review-hold canary still **Unknown**.

### Release-control security continuation — #6445 (existing owner)

**Verified 2026-10-08:** #6448 / PR #6450 merged as `b3b0a1a357b97e09158fff516ef0d876d643d3e2` and Cloudflare deployment `37856454431` verified the production SHA. Remaining scoped gap: stale PR #6446 contains fail-closed exact PR/base/branch/head inputs and a pre-check absent from the merged minimal dispatch trigger. Preserve this distinct hardening through a clean current-main restage under #6445; do not merge a behind workflow-changing branch or bypass `NEEDS_CLEAN_RESTAGE`. A real zero-job recovery dispatch is still **Unknown**. Issue #6451 has since been implemented and deployed; natural production 405 review-hold canary still Unknown. Business impact, CI savings and revenue **Unknown**.

## P0 — Cross-cutting generational engineering (#6431)

**Priority decision (2026-10-08):** first define the next generation's connected capability topology, shared provenance contracts, dependency DAG, verification tiers, release proof and October 12–16 execution sequence. [P0 operating plan](GENERATIONAL_ENGINEERING_P0.md) · [candidate/readiness register](GENERATIONAL_ENGINEERING_READINESS.md). The 25 candidates are **not 25 admitted tickets**. Normal execution continues to require an authoritative sprint entry, one scored admission through the existing formula, owner, dependency proof and WIP slot; P0 planning does not fabricate an extra Operations slot.

**Next gated candidates, not yet admitted:** P0.1 GitHub/CI/current production truth; P0.2 source/claim/handoff contract; P0.3 bounded exact-source → 8+12 case → editorial review-only trace; P0.4 risk-preserving duplicated-CI analysis; P0.5 release proof/retrospective. Repair/close existing owner PRs before considering replacement implementations. Outcome and time-saving ROI **Unknown** until measured.
## Scoring and gates

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Business impact, user value, traffic potential, strategic leverage, and effort use 1–5. Confidence is 0.50, 0.75, or 1.00. Higher is better; effort is the denominator. Dependencies and evidence/safety/provenance/disclosure/accessibility/security/release gates override numeric score.

The formula remains singular. **Strategic Leverage explicitly includes dependency-unlock value**: shared infrastructure, recurring throughput unlocked, and the number/importance of otherwise blocked high-value items may raise that existing input. **Confidence is freshness-sensitive**: when a ranked item's score depends on external demand, production state, analytics, platform behavior, or an unresolved technical assumption, the item must carry a current `last_verified` date/scope before promotion. Stale assumptions lower Confidence or force revalidation; they do not receive a hidden bonus or a second score. Safety, scientific correctness, production incidents, accessibility blockers, and other hard gates are never weakened by freshness mechanics.

Normal workstreams under `AGENTS.md` are **D** Discovery/SEO, **R** Revenue/Conversion, and **A** Authority/Content, with one active ticket per workstream. **O** Operations remains a classification, not a fourth normal workstream. The Evidence → Distribution surfaces—**L1 rendering/media infrastructure, L2 factual/provenance, L3 opportunity/measurement, L4 presentation/experiments, L5 lifecycle/publishing**—describe ownership, not permission for concurrent Revenue/Conversion tickets.

### Backlog hygiene rules

**Execution efficiency:** Batch multiple dependent acceptance criteria inside one reviewable ticket/PR when source ownership, safety, and rollback are coherent. Perform T0/T1 tests before opening the PR; reuse immutable same-head CI artifact receipts for T2 consumers; preserve every existing triggered exact-head check, controller merge authority, and T3 deployment evidence. Never invent checklist credit or measured CI savings.


- GitHub issue/PR state outranks stale prose in this file.
- A merged/closed item may remain only in a completed/history section, never in `Now`.
- An open PR that already owns a problem outranks creating a duplicate ticket.
- The normal sprint WIP cap is three implementation tickets. If an urgent control/incident repair temporarily causes overflow, the exception must be explicit and **admission freezes until active WIP falls below the cap**; temporary overflow never silently raises the permanent limit.
- External-access blockers stay explicit; they do not become fake PASS states and do not freeze unrelated legal work.
- Externally contingent ranked work must expose a current `last_verified` scope/date before promotion. Stale evidence lowers Confidence or requires revalidation.
- Strategic Leverage may reflect dependency-unlock value; no separate unlock score is permitted.
- Before promoting an experiment, check the durable experiment-learning history from merged #4414. A materially equivalent prior test requires an explicit changed assumption/retest condition.
- Observed attributable outcomes may update Business Impact, Traffic Potential, Strategic Leverage, or Confidence; they do not create a second scoring formula.
- Scale decisions should prefer **marginal qualified outcome per incremental resource** over gross output when the required observations exist. Missing effort/cost/outcome data remains `Unknown`, never invented.
- Safety/scientific correctness, publication integrity, production incidents, security, accessibility blockers, and crawl/indexing regressions may override numeric ordering.
- No broad auto-publishing is authorized until factual fidelity, attribution, lifecycle receipts, rollback, measurement quality, and channel-policy checks are proven.

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

## Now — active exact work

**#6427 / PR #6428 — Scientific Intelligence 1.08–1.14, in review (2026-10-08):** Build twelve source-bound analysis/review instruments on the existing exact PMID research graph and eight-instrument relay after #6420. Acceptance: 12 distinct inspectable receipts, valid source identity, 13 calibration invariants on 500 verified intake PMIDs, 0 automatic medical promotions/publications, stable route, static export and UI/CI gates. Available source data cannot prove underlying trial independence, live correction status or full-text efficacy. Consumer/scientific performance impact and revenue ROI remain **Unknown**. This in-review entry does not grant another WIP slot or override machine-managed admission.

**#6420 / PR #6422 — Research Intelligence 1.06/1.07, in review (2026-10-08):** Exact source identity is preserved across all eight existing instruments; explicit semantic handoffs require real title-backed traceable concept pairs. The 1.07 downstream review fabric uses exact DOI and claim/source IDs and cannot publish. Prerequisite #6419 (1.05) merged. #6423/#6424's review-only fabric is included on #6422's head, not yet a separate main-branch release. Continue required PR checks and resolve P1/P2 review threads before merge. Value: safer source navigation/editorial audit; business ROI, retention and time savings **Unknown**. No additional normal D/R/A WIP admission implied.



**#6382 — R8.05 creative-quality control, active:** make attention and audiovisual coherence release gates rather than optional polish. Acceptance requires pre-render premise-interest and one-mental-job gates, payoff-before-method, natural-duration editing, narration-first semantic beat mapping, semantic clip ownership, cut-on-meaning, internal-motion synchronization, cognitive-load ceiling, whole-piece cohesion, and a one-macro-rebuild rescue limit. Preserve all R8.04 zero-credit sovereignty and R8.03 evidence/trust invariants.


**Research-only admitted work #6349 / PR #6350:** In review — deep research enrichment Waves 4001–4500. This does not consume a normal implementation WIP slot; it is research-only, fail-closed from runtime/publication/recommendation/dose promotion, and merge remains contingent on repository validation and review.

| ID / owning PR | Scope | WS | Status | Priority | BI/UV/TP/SL/C/E | Score | Freshness |
|---|---|---|---|---|---|---:|---|



**Current admission (verified 2026-10-09):** Normal implementation WIP is **0/3** after closing deployed #6447 / PR #6460; Discovery/SEO, Revenue/Conversion and Authority/Content have no newly admitted normal ticket. Cloudflare run `37869304990` verified production receipt for `0d7635a6918ccacc391f5ead8832ffbc6de86368`. Candidate #6461 is **ready-next only**, pending a separate fresh exact-base admission; bot recovery gains and revenue impact remain **Unknown**.

**Control maintenance #6131:** In review; reconcile closed owners and machine-readable WIP. Existing-owner reconciliation requires authenticated pre-base PR ownership; this bounded control repair grants no additional normal implementation slot.

**Security follow-up #5456:** Open permanent MDX/TOML dependency-chain removal. Temporary containment expires 2026-10-07; this audit does not extend it.

### Verified completion refresh — 2026-10-06

- **#6356 / PR #6357 — completed:** THS Publisher v0.1 merged to `main` as `fc0d0fee90a027cb13e2f6b77071d8632ee99b35`. First-party publication identity/state, TikTok draft transport, Observer/reconciliation, provider-neutral staging, and Metricool publication freeze are implemented and exact-head validation/build gates passed. External Cloudflare D1/KV bindings, production secrets, TikTok app approval, creator authorization, and live publication receipt remain pending/Unknown.

- **#6258 / PR #6257 — completed:** RC/NPS consolidated closeout merged at `6151f17759b09bd0b9a73a605b58b70b813e8dda` from exact source `17ea07e9ca2ecd45bbaf60fdd125c71fcfb6f055` on 2026-10-05T12:37:53Z. Includes #6249 / #6253; duplicate PRs #6252/#6254 are closed with their source incorporated. The 92-route inventory, all 45 candidate dispositions, source corrections, recovery/support normalization, tests and evidence limitations are recorded in `docs/content/rc-nps-completion-2026-10-05.md`. Sparse-compound evidence gaps, unverified global legal status and external outcomes remain explicit.

- **#6338 / PR #6339 — completed:** live GitHub merge receipt is `c5179df73b0ad472149b13f595a279ec60af49d5`, merged 2026-10-05T03:41:40Z. Retirement reconciles ownership only; it does not assert measured traffic, revenue, or a new deployment receipt.

- **#6021 / PR #6195 — completed:** merged as `a1463e8010cfb2c30126bd06671451e23b19b703`; breadcrumb destination/label and accessibility repair are on `main`. The Discovery/SEO slot is free; external outcomes remain **Unknown**.

- **#6185 / PR #6190 — completed:** merged as `0657391a3bb73916f18bd0df42542363dcdc07d3`; bounded UI-contract drift now fails before broad validation, exact-head governed static exports are reused by downstream build-dependent checks, P0 Visual Proof is required for every retained visual trigger including low-risk visual-path tests, and artifact mismatch/miss still falls back to a full build. Exact-head CI/full tests/a11y/data/security, production build/output/SEO, Build Quality, Atomic, Site Health, Build Check, Production Content Lint, Lighthouse, P0 visual proof, governed export reuse, and review resolution passed. External business impact remains **Unknown**.

- **#6181 / PR #6184 — completed:** merged as `31e2f7b1b07ba01ab7e9e99831ac807b33d7061a`; the Research hub now keeps Citation Explorer, Evidence Checker, and Evidence Report as the three primary tasks, with Methodology and recent evidence changes secondary. Stable routes and scientific/evidence/safety/publication boundaries were preserved; exact-head CI, production output/SEO, Fast UI, P0 visual proof, Experience, Atomic, Site Health, Build Quality, and review resolution passed. External search, engagement, conversion, and revenue impact remain **Unknown**.

- **#6174 / PR #6177 — completed:** merged as `c80d1f736c87040ae85ea33bae16bf642dd8b7dd`; mobile herb/compound profile reading order is now facts → decision layer → supporting art, desktop retains the two-column intro, and light-theme verdict/safety semantic colors are protected from generic hero-shell styling. Exact-head CI, Fast UI/accessibility, P0 visual proof, Experience contract, Atomic, Site Health, Build Quality, crawl/content guards, production build/output/SEO, and review resolution passed. External engagement/business impact remains **Unknown**.

- **#6115 / PR #6116 — completed:** merged as `4a398dbb821ca3dd7ae975682e18eec3a002b302`; the bounded mitragynine-adjacent compound cluster is live on `main`. Search, citation, engagement, conversion, and revenue effects remain **Unknown** until measured.

- **#5758 / PR #6126 — completed:** merged as `32dda28c8cd84e32b6df2458dcff6da66328e935`; the sleep flagship metadata experiment is deployed from a fully green exact-head validation set. Search CTR impact remains **Unknown** until measured after deployment.

- **#6145 / PR #6154 — completed:** merged as `c8ff86010e4fa7e9030b3744a13dc565e621db38`; affiliate-destination integrity is now enforced against built production output. Live product availability, click-through, orders, conversion, and revenue remain **Unknown** until observed.

- **#6134 / PR #6137 — completed:** merged 2026-10-01 as `fd9ea3ea079c868453e364b479fff54fa7b152d2`; social experiment identity is now consent-gated and carried into existing page/journey analytics, platform clicks remain distinct from first-party `qualifiedVisits`, and incomplete provider snapshots remain waiting/Unknown rather than zero. Production attribution and business outcomes remain **Unknown** until observed.
- **#6051 — completed:** GitHub closed the mobile overhaul on 2026-10-01 at 02:06:39 UTC after its acceptance checklist was checked. PR #6106 remains the hosted visual-proof/desktop-menu repair receipt. This retires its Discovery/SEO reservation; external engagement/business impact remains Unknown.
- **#6112 / PR #6113 — completed:** merged 2026-09-30 as `8b9635eb6d1145ba0ecc6698c1ee188cc4193a3c`; obsolete producer fan-out repair no longer owns a control exception.
- **#6128 / PR #6129 — completed:** merged as `27fa47bf16bed5306ed5bd84bb0914a4717e548a`. Exact-merge CI `36853489382`, content lint `36854691768`, invariants `36854694901`, Lighthouse `36854689068`, and production deployment `36854756177` passed. Fifteen article-quality failures were repaired; business impact and realized quota savings remain Unknown.

- **#5706 / PR #5971 — retired 2026-09-26:** merged as `381bbe6029bdeaf604314aa1e9f67757b1fa37bd`; canonical CoQ10 evidence/runtime ownership was consolidated and the closure no longer consumes Authority/Content WIP.

- **#5703 / PR #5961 — retired 2026-09-26:** merged as `6bd7b57a633c8f88a70edb688d969ee19e7de8ad`; five cobalamin findings terminally promoted with source/runtime/governance repair and exact-head validation green. External Cloudflare preview status remained stale and was not a protected merge requirement.
- **#5698 / PR #5701 — retired 2026-09-20:** merged as `1727c68cbb5dfc865e4be7c02af6e0fb7d867d75`; retracted PMID 41461240 / DOI 10.1016/j.jad.2025.121055 is quarantined against identifier re-entry and the stress-guide evidence path is repaired. All required exact-head gates passed; external search/conversion/revenue impact remains `Unknown`.

## Next — ordered dependency queue

Discovery/SEO, Revenue/Conversion, and Authority/Content are free. No candidate is admitted by vacancy alone.

| ID | Title | WS/Lane | Status | Priority | BI/UV/TP/SL/C/E | Score | Dependencies / freshness | Acceptance / proof boundary |
|---|---|---|---|---|---|---:|---|---|
| #5076 | Add reusable post-answer sleep research next-action path | R conversion / L4 | Completed 2026-09-04; retired from actionable queue | — | — | — | Canonical component plus three representative integrations are on `main`; stale fourth-integration PR #5430 closed | Outcomes remain `Unknown`; any further page integration requires a fresh admitted ticket |
| #4987 | Require real evidence receipts for approval and source counts | A / L2 | Completed 2026-09-28; PR #6057 merged | — | — | — | Exact-head CI/Atomic/Project Control/Site Health/Build Quality green | Claim/source namespaces separated; sourceCount cannot self-attest; generic approval/recommendation requires approved claim→source receipt |
| #6056 | Contain legacy Tyrosine citation contamination | A / L2 | Retired — merged in PR #6066 | Scientific integrity | — | — | Completed; no overlap with #6051 | Legacy herb grade/citations/dosing held across public indexes + runtime; compound:l-tyrosine preserved |
| #5081 | Close Sage human evidence and SAGE-718 identity contamination | A / L2 | Blocked — fresh governor lease required | P1 | — | — | Exact current main + no overlapping lease | Acquire and merge a non-overlapping governor lease before canonical evidence mutation; preserve formulation, population, endpoint, null-result, safety, and dosing boundaries |
| DOC-002 | Continuously triage open issues against authoritative queue | O | Continuous reconciliation maintenance | P2 | 3/3/2/5/1/2 | 45.0 | Current GitHub state | Every open issue is current, duplicate, superseded, blocked, historical, or queued; stale closed work never occupies `Now` |

## Blocked — important but not startable

| ID | Title | WS | Status | Score | Blocker / next legal action |
|---|---|---|---|---:|---|
| REV-001 / #4280 | Verify production analytics and governed funnel events | R | Blocked external access | 400.0 | Authorized production environment + GA4/Ahrefs receipt evidence; code readiness already merged, but production receipt remains Unknown |
| SEO-004 | Import aligned 28-day GSC opportunity baseline | D | Blocked external access | 375.0 | Search Console/service-account access or dated export |
| REV-002 | Establish aligned funnel/revenue baseline | R | Blocked external access | 375.0 | REV-001 plus GA4/GSC/Amazon/Mailchimp data; partial source-level observations may still be recorded honestly |
| REV-003 | Select one flagship commercial decision page | R | Blocked | 375.0 | SEO-004 + REV-002 aligned data |
| SEO-002 | Recover reviewed flagship profile source roles | D | Blocked review dependency | 117.2 | Review existing source-role work before duplicating; never force indexability |
| AUTH-003 | Upgrade selected flagship decision page | A | Blocked | 117.2 | REV-003/REV-004 + evidence review |
| REV-004 | Validate flagship disclosure/destinations | R | Blocked | 67.5 | REV-003 selected page |
| AUTH-002 | Strengthen links to selected flagship | A | Blocked | 54.0 | REV-003 selected page |
| #5081 / PR #5556 | Close Sage human evidence and SAGE-718 identity contamination | A/L2 | Blocked on fresh governor lease | — | Acquire and merge a fresh non-overlapping state-only governor lease, then move the ticket into `Now` before scientific implementation |
| #4782 | Canonical bicarbonate → sodium-bicarbonate migration | A/O canonical | Blocked on real governor lease | — | After #4963 is merged, use the owner-authorized bridge to acquire and merge a valid state-only lease transaction before canonical owner migration |
| #4783 | Resolve duplicate CoQ10 generated-data owners | A/O canonical | Blocked on real governor lease | — | After #4963 is merged, use the owner-authorized bridge to acquire and merge a valid state-only lease transaction before canonical owner/data migration |
| #4014 | Enforce `main` branch protection/ruleset | O | Blocked external settings | — | Authorized repository settings action; documentation alone is not enforcement |
| #4341 | Resolve recurring Cloudflare production deployment failure class | O | Blocked external logs | — | Inspect Cloudflare production logs/failed deployment class, then repair only if repository/config root cause is proven |

## Later — only after dependency proof

| ID | Title | WS | Status | Dependency / stop rule |
|---|---|---|---|---|
| DIST-VIDEO-001 | Deterministic 30-second vertical-video renderer | R/L1 | Planned | Accessible motion contract #4717/#4718 is merged; final encoding/rendering still requires a separately admitted provenance-bound implementation and factual narration remains governed |
| DIST-GEN-001 | Optional generative B-roll adapter | R/L1/L4 | Planned | Generated media remains visual-only and non-authoritative; no need to implement before measurable distribution MVP |
| ENGINE-001 | Codify repeatable decision-page qualification/proof | A | Planned | Requires M2 flagship result; avoid template-driven filler |
| CLUSTER-001 | Expand one validated authority cluster | A | Planned | Requires demand + repeatable page engine + positive marginal qualified outcomes |
| AUTO-001 | Automate publication-governance anomaly reporting | O | Planned | Stable truth and known baselines first |
| EMAIL-001 | Validate/optimize email conversion journey | R | Planned | REV-001/002 + Mailchimp access |
| PARTNER-001 | Evidence-safe partnership policy/pilot | R | Planned | Proven decision/growth economics; independence/disclosure safeguards |

## Recently completed / retired from active queue

These are capability proofs, not claims of business impact.

| Item | Verified disposition |
|---|---|
| #6047 / PR #6050 | Retired with this merge; Home, Start, Library, and primary navigation share the canonical five-destination architecture; Home retains direct search plus one compact trust/metrics block; Start uses the same router; Library stays exhaustive under the same five groups plus Site Information. Narrow-phone metric overflow and retained homepage regression contracts were repaired. Exact-head CI, full tests/a11y, production build/output/SEO, Fast UI, Atomic, Site Health, Build Quality, project-control reconciliation, content lint/invariants, schema/media, crawl, Technical SEO, Build Check, and Lighthouse passed. External engagement/business impact remains `Unknown`. |
| #6041 / PR #6044 | Merged as `245f76d2856bf5ee622180faf668b90c8a172441`; Safety Checker, interaction-guide index/details, interactions education, and the safety checklist share one Safety-family flow. The guide-detail accessibility review was fixed so the parent index is visually highlighted without a false `aria-current="page"`. Exact-head CI, Fast UI/accessibility, Project Control, Atomic, Site Health, Build Quality, link/output/SEO, data, and security gates passed; external engagement/business impact remains `Unknown`. |
| #6035 / PR #6038 | Merged as `1c9277714cce080f3f85ba1586b9f626beca7fd1`; ingredient lookup is unified across Herbs, Compounds, Search, and Evidence Lookup, paginated indexes retain lookup navigation, Search copy matches the actual index, and exact-head gates passed. External engagement/business impact remains `Unknown`. |
| #6031 / PR #6033 | Merged as `6ab7cc95800a14f0dc3df159ac298c6a2c752f8c`; Guides, Learn, and Articles now share one editorial-family navigation with distinct decision, concept, and reading roles; the complete Learn route inventory remains discoverable in a collapsed index, equivalent article-category casing is normalized, and stable routes/scientific/evidence/safety/publication semantics are preserved. Exact-head CI, Fast UI, Project Control, Atomic, Site Health, Build Quality, AI-search, internal-link, output, and SEO checks passed; external business impact remains `Unknown`. |
| #6024 / PR #6028 | Merged as `01613f5f4bf209e5ebd733f79517e3eed066d601`; five primary destinations, deterministic route ownership, role-aware global chrome, a lean Research hub, and paginated ingredient-index consistency are on main. Exact-head CI, Fast UI, Project Control, Atomic, Site Health, Build Quality, internal-link, output, and SEO checks passed; external behavior/business impact remains `Unknown`. |
| #6011 / PR #6019 | Merged as `c59d169b5b6e0616ebb2619fb6750e87cb9f9548`; five guide hubs now label their breadcrumb navigation landmark and the ticket is closed/retired from active Discovery/SEO WIP. |
| #6002 / PR #6010 | Merged as `81665250fe00c7c910d6301b7a128d95a5627dd8`; nested main landmarks removed from 42 verified production app/shared sources, `/research/` premium styling preserved via an explicit content hook, and the accessibility-pattern audit now prevents regression. Exact-head CI/Fast UI/Atomic/Site Health/Build Quality/link/SEO and all seven governed export consumers passed; external business impact remains `Unknown`. |
| #6000 / PR #6001 | Merged as `a862b97068e3aaf1a0916590b1e0bf2be7044ef7`; footer/breadcrumb vocabulary now matches the current navigation, Research points to `/research/`, and Turmeric vs Curcumin is owned by the Comparisons hub. Exact-head CI/UI/accessibility/link/SEO and all seven governed export consumers passed; external business impact remains `Unknown`. |
| #5989 / PR #5990 | Merged as `9240bc1fe32c3985dbe068678fb2b94c647e0317`; global navigation was simplified, `/guides/` became the primary topic-discovery hub, existing published-library/Atlas semantics were preserved, and exact-head control, UI/accessibility, tests, production build/output, link, sitemap, and SEO checks passed. External traffic, ranking, conversion, and revenue impact remain `Unknown`. |
| #5630 / PR #5646 | Merged; Best Herbs for Anxiety now uses one downstream newsletter action after evidence/safety. Conversion, traffic, ranking, and revenue impact remain `Unknown`. |
| #5638 / PR #5639 | Merged; search governance now reads the canonical metadata experiment ledger and protects proposed/running/winner states from competing CTR rewrites. No ranking, CTR, traffic, conversion, or revenue lift is inferred. |
| #5637 / PR #5636 | Merged; fresh dated page-level search opportunity is primary, citation-only holds are non-actionable, and AI citations remain a bounded authority/confidence overlay. No ranking, CTR, traffic, conversion, or revenue lift is inferred. |
| #5610 / PR #5625 | Magnesium general-vs-sleep intent separation is implementation-complete; reciprocal routing and the sleep-shortlist handoff land with this merge. Citation, ranking, traffic, and revenue outcomes remain `Unknown`. |
| #5611 / PR #5622 | Merged; protein guide now uses one trust-preserving post-answer action on the shared next-action shell. Conversion impact remains `Unknown`. |
| #5602 / PR #5661 | Merged; Best Herbs for Anxiety has a 22-source ledger, Sept. 19 review provenance, newer systematic evidence, and methodology visibility while preserving the established ranking and safety/negative-trial boundaries. External outcome impact remains `Unknown`. |
| #5647 / PR #5657 | Merged; Valerian Root has one evidence-first post-answer newsletter action after the complete answer/FAQ/references journey, with the 18-source scientific content unchanged and conversion impact still `Unknown`. |
| #5665 / PR #5668 | Merged; Glycine for Sleep now has a 12-source ledger, Sept. 19 review provenance, a current three-trial supplemental-glycine evidence ceiling from PMID 42687500, and explicit collagen-directness regressions while preserving efficacy/dose/safety/insomnia-treatment boundaries; external outcomes remain `Unknown`. |
| #5669 / PR #5672 | Merged; Glycine for Sleep now has one page-owned evidence-first newsletter action after the verdict, with the route-specific global ContextualLeadMagnet suppressed to keep one total email conversion path; the 12-source science and affiliate disclosure boundary remain unchanged; external conversion/revenue outcomes remain `Unknown`. |
| #5675 / PR #5678 | Merged; shared email capture ownership now prevents page-owned signup plus global ContextualLeadMagnet duplication across templates, including delayed article experiment mounts via ownership reservation + MutationObserver; provider/consent/analytics/science/product behavior remains unchanged; external signup/conversion/revenue outcomes remain `Unknown`. |
| #5681 / PR #5684 | Merged; AffiliateProductBox now renders disclosure before product links by construction while preserving all six current page-level disclosures, revenue tracking, rel attributes, URLs, ordering, copy, and science; external conversion/revenue outcomes remain `Unknown`. |
| #5612 / PR #5624 | Merged; valerian evidence/safety refresh preserves monotherapy vs combination evidence, null daytime outcomes, preparation boundaries, and long-term-safety uncertainty. No efficacy upgrade is inferred. |
| #5505 / PR #5506 | Merged as `90bf695bd4c7f1e006159078d26afd4869149cdd`; phone-homepage-only polish removes the floating scroll-to-top control, decorative goal arrows, comparison numbering, and repeated footer onboarding while preserving global/desktop behavior. Cloudflare production run #7308 is still in progress, so no production receipt is claimed yet. Traffic, engagement, conversion, ranking, and revenue effects remain `Unknown`. |
| #5502 / PR #5504 | Merged and production-deployed as `99dd55269206e983c9d34bece0f358a9f932f270`; phone homepage hierarchy now uses one dark research anchor, compact goals, flattened comparison navigation, a supporting Research Standard section, and corrected footer spacing. Exact production receipt passed. Traffic, engagement, conversion, ranking, and revenue effects remain `Unknown`. |
| #5031 / PR #5090 | Merged as `7b110d7a19c51e08de3d3b112ac36e96824bfd27`; explicit newsletter capture titles remove the duplicated `research` trust defect while preserving provider, tag, privacy, analytics and scientific boundaries. Exact-main deployment verification completed. Conversion lift remains `Unknown` until attributable observations exist. |
| #5021 / PR #5028 | Merged as `27613f9fba936c78cb024d1381811d2b2da159c9`; five Vitamin B6 findings were governed promoted and one was governed non-promoted, neuropathy dose/duration boundaries were retained, generic dose placeholders removed, recommendation/monetization/indexing stayed fail-closed, and exact-main production deployment verification completed. No traffic, conversion, ranking, or revenue outcome is inferred. |
| PR #5084 | Merged as `70ba137cbfec444557ad8c8b7ff0656f35651b61`; AI-citation asset-identity protection is on main. The ledger intentionally remains awaiting fresh page-level telemetry rather than inventing winner URLs from partial query exports. No incremental citation, traffic, or revenue gain is inferred. |
| #4992 / PR #5016 / PR #5020 | Propionate closure merged as `523ba9323dd3506e51f2d1aaab53b6d0a2e49aa5`; post-merge Session E bootstrap proved all four staged findings terminal and promoted with 0 pending; verified lease release merged as `4461ac4c59aa48bafca85125f86e4a37e6ee4610`. No generic efficacy, consumer-dose, indexing, monetization, traffic, analytics, or business outcome is inferred. |
| #4260 / PR #4999 | Merged as `754828d80ff0895b40091227d8aa1549a0f1521b`; registered PMID 41789242 / DOI 10.1097/MS9.0000000000004549, added one short-term healthy-adult adverse-effect record preserving the diarrhea estimate and null findings, regenerated governed output, and added an exact no-overclaim regression. All exact-head scientific, build, release, and control checks passed; PR #5001 released the verified lease. No efficacy, general dose, broad or long-term safety, traffic, analytics, or business outcome is inferred. |
| #4266 / PR #4972 | Merged as `8aba655daae2aba8d07cd2ba6f32ed52f8f3b498`; registered PMID 41943502 / DOI 10.1002/ptr.70315, added three formulation- and population-bounded KSM-66 safety records, regenerated governed output, and added an exact no-overclaim regression. All required exact-head checks passed, and PR #4976 released the governed lease; no efficacy, general-dose, traffic, analytics, or business outcome is inferred. |
| #4949 / #4951 / PR #4952 | Merged as `0c667ca7bd9bf49279594e7df79a806cb4c1237a`; restored caffeine/L-theanine comparison discovery, added canonical `/evidence/` and `/info/` sitemap/redirect alignment, preserved historical audit exports with tombstones, and passed exact-head plus post-merge release/deploy checks. No traffic, ranking, indexing, analytics, or revenue outcome is inferred. |
| #4731 / PR #4947 | Merged as `6e32a773d908495f08fa297fc51da1cea6fb2659`; scoped unbound dose-unit, onset/duration, and comparative-efficacy label bypasses are closed with focused regressions. The separate Discovery/SEO incident exposed afterward is retired above. |
| #4730 / PR #4858 | Merged as `44b019fa1f67ead0538076944224243a098dbfde`; stale published or paused-but-live assets preserve the governed withdrawal/receipt path while stale non-live assets remain terminal-invalid. |
| #4784 / PR #4813 | Merged as `1e8fae58a3499c9f6a79b4338e636244620ec629`; persistent least-privilege governor transactions are implemented. Main's queue has no active lease, so downstream canonical work remains gated. |
| #4732 / PR #4734 | Merged as `4d26d1cfacb5fb577f9216b7fa116e006e7b0a0d`; bounded Metricool adapter capability exists, while provider configuration/credentials, live scheduling, publication confirmation, and outcomes remain externally gated or Unknown. |
| AUTH-001 / #4800 / PR #4803 | Current content-audit diagnostic run `33316024891` completed successfully and explicitly printed `AUTH_DUPLICATE_COUNT=0`; PR #4803 closed unmerged because its only change was a temporary diagnostic workflow; historical four-pair finding retired. |
| SEO-003 / #4795 / PR #4796 | Exact-current Schema and Media Governance run `33315511238` passed shared schema regressions, static export, structured-data completeness, first-party identity/safety policy, and media checks. PR #4796 closed unmerged because its only change was diagnostic; historical 38-identity blocker retired. |
| #4719 / PR #4720 | Merged as 90e2be7233f460919e3341f1aefd0053b1867df2 — governed export receipts bind/restore producer public/data and build-manifest state; all three exact-head consumers passed |
| #4717 / PR #4718 | Merged as 97c877513da12137ba666451fff5f6c4f691c483 — accessible vertical-video motion contract with fail-closed primitives and zero-motion fallback; no live publication or completed encoder implied |
| #4715 / PR #4716 | Merged as f06b1d400b465c3997121e2af49b7d3eafc3b503 — first provenance-bound carousel pilot completes dry-run scheduling only; observed dates/value remain null/Unknown |
| #4651 / PR #4673 | Merged as 058326df0f27685072047c465a7b86729bb51b2d — six append-only Session F research fragments; zero canonical/public scientific mutations |
| PR #4631 | Merged as 13d80681e32ff95a919651f1d0a4068fc972edee — research boundaries staged for the later completed #4266 / PR #4972 review and promotion |
| #4227 / PR #4523 | Merged as 9f1a4fe26e7a6caab56de07c5a0f25b2f39c6f15 — exact-head governed static-export reuse; removed from `Next` |
| #4415 / PR #4492 | Merged as 23dc2485720ff6b31043413b2b9295c4886944cb — comparable, explicitly guarded, exposure-bound economics; 42 focused and 2,866 total tests plus real production build/output/SEO passed; actual efficiency observations remain Unknown |
| #4414 / PR #4490 | Merged as 2e67f9e55f4d96dc7d82a683a829a29b4e2298f1 — durable experiment-learning capability; no longer queued; populated history/producer adoption still requires evidence |
| #4477 / PR #4478 | Merged as 2b25ae9beed63afe1e6c045491828e3f096037e4 — creative template catalog; no longer active |
| PR #4491 | Merged as d726f81bc5ababbb024b86782da2e94fbc15989e — governed safety-line preservation; no longer active |
| #4407 / PR #4484 | Merged as 6fba155c6f241af7cee38981c413bde710d56c1b — attributable outcome ingestion; final-head checks passed; real performance observations remain unverified |
| #4413 / PR #4469 | Merged as d0936fbe7d41c84c753a8374f2a7b25047322339 — freshness/unlock-aware prioritization; retired from active ownership |
| #4476 / PR #4475 | Merged as 65605fd2f4e9cfd85af63c14bd2a583471551bf2 — canonical evidence-grade binding; retired from active ownership |
| #4482 / PR #4481 | Research draft staging merged as d6934eacff95b4b9dc1c3c5be2f0c8a91e9bc4a1; not scientific-promotion approval or resolution of its recorded registry blocker |
| PR #4457 | Completed/merged as 95ec9ba285f06c947f2844a2f81abce031b9e437 — complete canonical safety-warning preservation; removed from `Now` |
| #4412 / PR #4446 | Completed/merged as 96a07976dee22cf7b91c337c820cc83ff7e6b860 — machine reconciliation is on main; removed from `Now` |
| #4463 | Completed/merged as f300e0e8f3ef8b9a485f0cbd8c0993725bd425b1 — trust-safe thumbnail variants are on main; removed from `Now` |
| #4460 | Completed/merged as 48bebb81e35c4bd605dedbfc15156cabeb915b06 — duplicate-angle suppression is on main; removed from `Now` |
| #4406 | Completed — governed ready → publish → measured lifecycle merged; removed from `Next` |
| #4439 / PR #4440 | Completed/merged — canonical claim/source binding; removed from `Now` |
| PR #4448 | Closed unmerged — provenance-bound vertical MP4 implementation preserved for later legal reuse and does not occupy active WIP |
| #4447 / PR #4445 | Merged as 692d85d1a496188b4bc48113f8f64b5e94c82098 — opening hook trust contract; no longer active |
| #4410 / PR #4411 | Merged — changed-file-relevant merge gates; temporary overflow exception retired |
| PRs #4388, #4401, #4405 | Merged — renderer, factual receipts, and lossless presentation; implementation no longer active |
| PR #4408 / #4409 | Merged/closed — roadmap, sprint, and master backlog synchronized to exact GitHub state on 2026-08-27 |
| REV-005 / PR #4358 | Merged — governed media-pack contract established |
| PR #4371 | Merged — canonical research-distribution builder emits validated media packs |
| PR #4381 | Merged — claim-safe downstream factual-copy lint |
| PR #4382 | Merged — deterministic governed opportunity-selection MVP |
| PR #4384 | Merged — first governed Ashwagandha research object |
| PR #4387 | Merged — lossless governed-copy pagination |
| PR #4391 | Merged — deterministic attribution/discoverability metadata |
| PR #4394 | Merged — feedback-aware opportunity guardrails |
| PR #4395 | Merged — formulation/duration study context preserved when canonically owned |
| PR #4397 | Merged — trust-preserving creative experiment identity/immutability contract |
| PR #4399 | Merged — positive performance reward requires ≥250 measured views |
| PR #4402 | Merged — roadmap optimized for measured scaling and bounded early distribution pilots |
| #4238 | Closed/completed — normalized source-registry baseline/provenance continuation no longer active |
| #4182 | Closed/completed — five herb/compound identity correction no longer active |
| AUTH-004 / PR #4145 | Merged — canonical visual refinement across Herbs/Compounds browse surfaces |
| SEO-005 / PR #4331 | Merged — Bing AI citation incident monitor; real export remains an operator input |
| I18N-001 / PR #4332 | Merged — Japanese/Korean core locale expansion with detailed profiles still fail-closed |

## Legacy backlog disposition

Historical `backlog/`, `ops/backlog/`, old sprint tickets, and old open issues are discovery inputs, not execution queues. Revalidate the underlying problem against current `main`, current production, current analytics, current experiment history where applicable, and current PR overlap before promoting anything here. A large backlog is useful only if the top is trustworthy.

**#6384 — R8.06 creative-methodology control, active:** Require three materially different concept candidates, selected-angle visual-potential/confusion thresholds, cover→first-frame→first-line convergence, hook→finding→evidence opening order, early teaching-object diversity, exact-master native-feel QA, and optional Metricool with immutable manual fallback. Runtime remains R8.05; audience impact Unknown until measured.

**#6386 — R8.07 visual-authorship control, active:** Add one whole-piece visual thesis, a semantic recurring motif, >=3 core composition families, max-two consecutive family/mode repetition, an earned limitation-pivot pattern interrupt, deterministic local SVG composition primitives, and exact-master passes for visual rhythm, motif continuity, semantic interruption, and repetition-debt rejection. Runtime stays R8.05; R8.06 delivery remains inherited; audience impact Unknown until measured.
