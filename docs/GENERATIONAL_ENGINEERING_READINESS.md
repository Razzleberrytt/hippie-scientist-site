# P0 Integration Readiness Register

**Owner:** project control / architecture · **Prepared:** 2026-10-08 · **Initiative:** [#6431](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6431) · **Companion:** [Generational Engineering P0](GENERATIONAL_ENGINEERING_P0.md).

This is the **candidate and dependency register**, not a second execution queue. [CURRENT_SPRINT.md](CURRENT_SPRINT.md) alone authorizes admitted implementation work; facts here are snapshots and must be reconciled with GitHub CI/deployment next week.

**Package interface:** [14-package machine-readable dependency and acceptance manifest](GENERATIONAL_ENGINEERING_14_PACKAGES.json), with all statuses explicitly **unadmitted / Unknown until verified**. The 25 capability candidates below remain distinct from the 14 integration work packages and the authoritative execution backlog.

**Verified historical prerequisites (GitHub, not deployment proof):** semantic relay PR [#6422](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6422) merged as `a18dfcfc2f17c67f5470d801f7e151107790958f`; twelve bounded reasoning projections PR [#6428](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6428) merged as `b5e2c7a0a85247a3d016a48aa998fac88885fea4`. Neither remains an active *unmerged* implementation prerequisite. Current main deployment, user-facing usability and scientific review still require their own receipts.

## Definitions

- **Existing:** an inspected implementation; not necessarily live or complete.
- **Merged:** GitHub reports merged; does not prove production.
- **Review:** PR exists, not yet merged.
- **Source-only:** PubMed source identity validated, independent scientific review incomplete.
- **Proposed:** architecture design, not code.
- **External:** source feed, provider, permission, scientific reviewer or analytics needed.
- **Proof missing:** code may be merged but required deploy, UI or outcome proof unavailable.
- **Admitted:** scored and accepted under normal maximum-three / one-per-workstream WIP.
- **Deployed:** exact source/main/deployment artifacts and user-facing smoke proof.

## Dependency chain

**Research ingestion → deduplicated PMID identity → independent reviewed evidence → exact semantic case → eight research instruments → twelve bounded scientific projections → human editorial review → authorized reviewed claim/artifact → publisher/manual operator → provider receipt → consent-based learning.**

The chain is architecture, not evidence that every arrow is already implemented. Design broad; implement limited atomic units in dependency order. Disallow two sources of truth, scope creep across code owners and bypass of scientific identity or review.

## Capability inventory (refresh current status before implementing)

| ID | Capability | Home / owner surface | Current baseline | Generation / boundary |
| --- | --- | --- | --- | --- |
| R01 | PMID source identity and source register | PR #6400; lib/research-source-register.ts | merged / source-only | A, cannot upgrade to claims |
| R02 | Five lanes, 25 sources each, global reservation | ops/research-intake; PRs #6426, #6429 | repairs in review | A, dedup + review |
| R03 | Rolling 500 source/science audit | #6397, research rolling gate and release | source-only, in review | A, independent review |
| R04 | Independently reviewed claim and evidence roles | reviewed citations, content governance | existing | A, human authority |
| R05 | Same-PMID case, eight research instruments | research-intelligence 1.04–1.06 | merged | A, deployment proof |
| R06 | Exact DOI editorial/distribution impact bridge | semantic-fabric 1.07 | merged | A, review only |
| R07 | Twelve deterministic science projections | scientific-intelligence 1.08–1.14, PR #6428 | merged; production proof missing | A, no inferred results |
| R08 | Source revision and correction impact registry | canonical evidence + 1.07 review fabric | proposed | B, revision authority |
| R09 | Publication vs underlying-trial identity | v1.03, scientific trial detective | limited existing | A/C, registry for independence |
| R10 | Population/comparator-aware contradictions | Contradiction Observatory, comparability | bounded existing | B, independent review |
| R11 | Exact claim-to-article/section lineage | editorial and distribution data | proposed | B, human approval |
| R12 | Live corrections/retraction feeds | Research Integrity Radar is local only | external | C, permissions/freshness |
| R13 | Full-text dose/effect extraction | Study DNA limited source descriptions | external | C, rights and scientific review |
| R14 | Testable questions and local research missions | scientific-intelligence-discovery.ts | merged, local bounded | A, no external autonomy claim |
| R15 | Accepted/rejected investigation decision ledger | existing reviewed/adjudication data | extension proposed | B, reviewer receipts |
| R16 | Accessible mobile source-to-case journey | app/research/intelligence | existing, smoke proof missing | A, a11y/mobile |
| R17 | Alias-aware search and semantic navigation | existing search index, semantic engine | existing | B, no causal promotion |
| R18 | Scientific claim-bound video master | R8.08, EvidenceMotion/voice workflow | existing | B, immutable source/master |
| R19 | Recoverable synchronized local narration | PR #6399; Kokoro work | in review | B, AV inspection |
| R20 | Idempotent publisher/native manual fallback | THS Publisher + manual operation | existing / proof missing | B, remote receipt |
| R21 | Stale-source publication invalidation | evidence revisions/publication registry | proposed | B, no silent re-publish |
| R22 | Consented attribution and conversion reporting | SCOREBOARD, analytics/GA4/GSC | external receipt pending | B, Unknown until linked |
| R23 | Exact-SHA and risk-classified CI reuse | CI, classify-release-impact, merge controller | existing | A, audit actual cost |
| R24 | Generation release/rollback event manifest | existing CI/merge receipts | proposed adapter | A, no duplicate controller |
| R25 | Clinical truth/outcome evaluation | local calibration suite | proposed/external | C, expert/gold set |

**A:** current generation foundation; **B:** subsequent review-safe consumer and publishing flows; **C:** source-dependent scientific extensions. These are candidates, NOT twenty-five authorized PRs.

## Producer/consumer contract matrix

| Producer | Consumer | Allowed identity/flow | Mandatory refusal |
| --- | --- | --- | --- |
| PubMed identity / reservation | source register | exact PMID, DOI, source signature, stable source witness | missing abstract, conflicting normalized title/DOI |
| Independent scientific review | evidence/claim compiler | reviewed finding ID, publication match, qualifiers | co-mention, title-only efficacy, absent reviewer |
| Exact case graph | 8+12 science instruments | exact PMID and signature, research-only | foreign PMID, stale signature, invented citation |
| Instrument outcome | editorial workbench | navigation lead, question or human-review flag | effect/interaction/dose derived from lexical overlap |
| Editorial reviewer | article or media compiler | explicitly authorized claim revision plus caveats | stale approval, missing limitation |
| Asset renderer/narrator | THS Publisher or operator | exact frozen master hash and platform destination | silent/mismatched track, stale render |
| Publication platform/operator | published-artifact registry | platform/idempotency receipt, mutable delivery state | duplicate retry, unknown remote success |
| Analytics with consent | experiment/priority ledger | attributable aggregate, stable time window and denominator | unknown receipt, noncomparable cohorts, inferred ROI |

### Candidate typed envelopes — draft, not shipped API

- ResearchSourceVerified.v1: version, PMID, sourceSignature, DOI, witnessHash, researchOnly=true.
- ReviewedClaimChanged.v1: version, claimId, sourceId, reviewerReceipt, revision, finding/Unknown and permission.
- ResearchReviewRequested.v1: exact casePMID, reviewed claim/source refs, target and human-review-required disposition.
- AssetPublished.v1: publicationId, platform, exactContentHash, provider receipt or manual proof, claimRevision, verifiedAt.
- GenerationReleaseVerified.v1: issue, PR, exactHeadSHA/baseSHA, mainSHA, deploymentSHA/Unknown, required checks, reviews and rollback plan.

Owner must first inspect current types and extend them; never create a second authority or accept unknown versions. The consumer revalidates identity and can restrict but not widen authority. Events are idempotent, immutable where possible, replayable only with same inputs, and audit-coupled to failure disposition.

## Twelve adversarial contracts for first vertical slice

1. Two papers mentioning the same ingredient do NOT imply equal intervention, dose, population or benefit.
2. Two PMIDs from one registered study do NOT count as two independent trials.
3. An exact DOI matched without independently reviewed finding ID does NOT approve a claim.
4. A stale or forged source signature blocks any instrument handoff.
5. A reviewed finding linked to a different PMID cannot enter the chosen case.
6. Abstract-only safety keywords become review questions, not confirmed risk severity.
7. No case-local result must remain explicitly absent, not replaced by a global unrelated list.
8. An artifact hash changed after voice approval invalidates prior QA.
9. Uncertain remote publisher result must be reconciled before retry to prevent double posting.
10. Prior head/base green CI cannot authorize a changed PR head or merge base.
11. 499 reviewed + one unreviewed paper does not qualify as a reviewed 500 batch.
12. Missing external permission or analytics receipt remains Unknown/blocked, never PASS or zero.

## Tiered verification matrix

| Scope | Cheap preflight T0/T1 | Required exact-head T2 | Release T3 |
| --- | --- | --- | --- |
| docs/governance | doc links, no duplicate authority | atomic issue contract + relevant CI | no runtime deployment claim |
| science identity | fixture/dedup/typed source tests, cohort invariants | all triggered source/claim/SEO/security/build/a11y | main deploy + focused study smoke |
| shared 8+12 semantics | 8×8 handoff, 12 receipts, negative identities | all required source, semantic and CI gates | same PMID across mobile/desktop UI |
| article/distribution | qualifiers, canonical, DOI/claim identity | claim drift, static build, a11y/SEO/safety | built page and exact source trace |
| social/publisher | frozen master, voice sync, idempotency | relevant exact-head social/release/security gates | human AV review, provider/manual receipt if authorized |
| CI optimization | impact classifier truth table, negative-risk tests | unchanged required checks on exact head | before/after timing with no lost release proof |

**Optimization hypothesis:** remove true duplication only after measured CI sample. Never introduce a blanket unreviewed high-risk fast path. The existing changed-file classifier, explicit leaf fast path, merge-controller exact-SHA rules and same-tree main validation reuse are already present; extend only after documenting measured waste.

## Monday October 12 preflight

Recheck the exact head/base, open review threads, merge state and required CI of #6429, #6426, #6397, #6399, and production proof for merged #6428. Reconcile dated stale prose in the sprint/backlog/current-state with real GitHub. Collect the latest comparable CI runs, run timings and rerun causes (e.g., 10 samples): queue time, install time, typecheck/tests/build/SEO, cancellations and exact-tree reuse. Record Unknown for data unavailable. User-observed ~30-minute runs are a hypothesis, not validated benchmark.

Before admitting the first coding ticket, record owner and WIP slot, nonoverlap proof, interface and negative fixtures, exact repository checks, main/deploy baseline and rollback. A ticket that would break scientific or publication authority is blocked regardless of expected efficiency gain.

## Day-by-day acceptance sequence (proposed, not an unattended scheduler)

- **Mon 12:** current-truth reconciliation + actual CI baseline (P0.1). Exit: PR/status ledger with exact citations, Unknowns and owner.
- **Tue 13:** shared source/claim/consumer contract freeze + adversarial fixtures (P0.2). Exit: typed contract and negative tests on a real case.
- **Wed 14:** read-only source → 8+12 case → editorial impact candidate (P0.3). Exit: one positive and refusal cases, accessible UI, no clinical promotion.
- **Thu 15:** exact-head build/merge/deployment receipts, conditional CI duplication repair (P0.4). Exit: proof + no skipped safety gates.
- **Fri 16:** integration release review, reproducible timing comparison, next generation ranked backlog (P0.5). Exit: measured or Unknown utility; rollback and blocked work documented.

If an early phase is blocked, preserve the gates and push dependent work rather than assert a calendar success. Report merged vs deployed distinctly. Week one is successful only if the smallest safely integrated slice is actually verified; documentation readiness is not implementation readiness.
