# P0 — Generational Engineering and Integration Readiness

**Decision date:** 2026-10-08 · **Owner:** project control / architecture · **Tracking:** [#6431](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6431) · **Execution window:** 2026-10-12 through 2026-10-16 (America/New_York).

**Status:** Accepted operating direction; THIS DOCUMENT IS A PLAN, NOT DEPLOYMENT PROOF. Current GitHub PR/check state and authoritative sprint/admission records override a dated inventory snapshot.

**Machine-readable companion:** [14-package dependency and acceptance manifest](GENERATIONAL_ENGINEERING_14_PACKAGES.json) — proposed, unadmitted packages with explicit Unknowns, dependency order and hard release gates. This is a supporting plan, not a second execution queue.

## 1. Objective and unit of optimization

Develop a coherent generation of THS capabilities as one architectural program while **implementing and reviewing it through small scoped tickets**. Optimize for elapsed time to an evidence-safe, integrated, deployed, measurable capability—not number of feature proposals, PRs, citations, scheduled jobs, or unvalidated changes. Eliminate repeated architectural discovery and avoid duplicate expensive checks; never relax a required check simply because it is expensive.

A generation consists of (a) a bounded target architecture, (b) versioned shared contracts, (c) a dependency graph, (d) vertical integration slices, (e) tiered verification and an exact-artifact release record, and (f) field learning. Specification breadth and implementation concurrency are deliberately different.

**Success:** Another agent can pick the next *admitted* ticket from the authoritative sprint, know the producer/consumer boundaries, build a useful end-to-end slice, reproduce required checks on the exact intended head, and report observable outcomes or Unknown without inventing data.

## 2. Constraints and authorities

- **Repository rules win:** [AGENTS.md](../AGENTS.md) and [DOCS_INDEX.md](DOCS_INDEX.md). Read the charter, current state, roadmap, sprint, backlog, decisions, scoreboard and integration ledger in required order. The WIP ceiling is **3 implementation tickets total, at most 1 per Discovery/SEO, Revenue/Conversion, Authority/Content**; Operations is *not* a fourth slot. Documentation/preparation does not self-admit future work.
- **One scoring model only:** Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence / Effort, with the existing freshness and unlock rules in [MASTER_BACKLOG.md](MASTER_BACKLOG.md). P0 is an execution-methodology priority and prerequisite; it is not a new competing numeric rank.
- **Scientific authority is separate from discovery:** exact PubMed publication/source verification ≠ independent review ≠ approved finding/claim ≠ publishable guidance. No text co-occurrence, inferred graph edge, matched DOI, model response, number of publications or passing test may silently promote evidence. Correctness, caveats, contrary findings, harm-reduction/safety, consent/privacy, and public disclosure remain blocking.
- **Static deployment:** Next.js static export / Cloudflare Pages. No implicit server runtime, continuous background cognition, automatic retrieval, credentials, paid hosted model, D1/KV, webhook or cross-provider publishing integration until separately approved and proved. Existing local/static work is the default.
- **Release discipline:** small atomic PRs, exact-head/base checks, reviewed source ownership, immutable artifacts, controller-owned merge, main production build and deployment receipt. **No blanket CI bypass, no green-from-another-SHA, no "passed earlier" unless exact-tree reuse is verified.** A failed or missing required check stays blocking.
- **No fake milestones:** candidate, drafted, coded, PR-open, merged, deployed, human-reviewed, and proven useful are distinct statuses. Analytics ROI/field effects are **Unknown** without instrumented observations.

## 3. Audited foundation and unsettled work (snapshot 2026-10-08)

Source-of-truth files inspected: current sprint/backlog, roadmap, current-state, decisions, AGENTS, main-branch CI and autonomous merge controller, semantic and science version documentation, research intake runbook. Current state at time of this planning snapshot:

| Surface | Evidence / existing owner | Current status / next boundary |
| --- | --- | --- |
| Source register | [PR #6400](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6400); 7,435 PubMed identities | Merged source register; **not** 7,435 independently reviewed clinical findings |
| 500-source case cohort | Waves 7001–7500 [PR #6395](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6395); scientific studio 1.01–1.07 | Source-exact study/case/navigation/relay foundations merged; cohort is source-verified, not automatic clinical authority |
| Original eight instruments | [1.04](research-intelligence-1.04.md), [1.05](research-intelligence-1.05.md), [1.06](research-intelligence-1.06-relay.md) | Study DNA, Contradiction Observatory, Knowledge Frontier, Evidence Time Machine, Voyages, Interaction Matrix, Ask Evidence, Content Reactor. Existing exact PMID, signatures, reviewed-citation restrictions remain required |
| Twelve advanced scientific projections | [#6427](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6427), [PR #6428](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6428), [implementation](scientific-intelligence-1.08-1.14.md) | PR merged when inspected; still require **current main exact-SHA deployment receipt and mobile/manual verification** before claiming production-visible capabilities |
| Publication-to-editorial review | [1.07](semantic-fabric-1.07.md) | Exact-DOI and reviewed claim/source IDs, **review-only**; no authority to edit/publish |
| Next 500 research records | [PR #6397](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6397) | Source verified; pending independent scientific/semantic review and merge |
| Rolling lane intake | [PR #6426](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6426), [PR #6429](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6429); [runbook](../ops/research-intake/README.md) | Open repairs; retain five 1–25-per-run lanes, global reservations, frozen 500 review and serialized merge |
| Social/video stack | [PR #6388](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6388) merged; [PR #6399](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6399) open | Video R8.08 method merged; exact-master narration/publisher proofs unresolved. Manual native publishing remains the zero-credit fallback |
| Release system | [CI](../.github/workflows/ci.yml), [merge controller](../.github/workflows/autonomous-merge-controller.yml), [impact classifier](../scripts/ci/classify-release-impact.mjs) | Existing validation delegation/reuse paths are present. Do not add an unrelated orchestrator before measuring their behavior |
| Revenue and usage | [SCOREBOARD.md](SCOREBOARD.md) | Production GA4/affiliate aligned receipt unavailable; field ROI, user benefit and elapsed workflow savings **Unknown** |

**Snapshot caveat:** GitHub can change between reads. At the beginning of each execution day reconcile all listed PRs/issues against exact state, CI, main SHA, deployment, and the authoritative control documents. Existing historical planning records contain stale "in review" statuses; do not treat their text as proof that an already merged PR is still open.

## 4. Target architecture — reused, not duplicated

Research intake (NCBI PMIDs, five independently owned lanes) → global deduplicated reservation / frozen 500 research-only batch → source identity and source register → independent semantic/claim review → **read-only** semantic network → eight-instrument exact-PMID case workspace → twelve bounded research projections → review-only editorial/distribution candidates → human-approved factual source-of-truth → authorized static page or media artifact → manual/native or permissioned platform publisher → platform/artifact receipt → consent-governed usage observation → existing prioritization and experiment ledger.

Cross-cutting infrastructure:

1. **Identity and provenance:** canonical PMID, normalized DOI and publication identity (NOT trial identity), source text witnesses, source signature, separately adjudicated claim IDs, content/media revision and immutable artifact hash.
2. **Typed interoperability:** producer emits an allowlisted immutable envelope; consumers validate exact identifiers, version and disposition before using it. Do not produce an alternative mutable clinical facts database.
3. **Policy:** evidence/medical authority, safety/contraindications, allowed downstream actions, user disclosure, source freshness and authorization travel with the claim or artifact; downstream can narrow permission but never broaden it.
4. **Control plane:** existing GitHub ticket/admission, workstream owner, reservation/merge controllers, PR checks, issue contracts, gate receipts and rollback.
5. **Observability:** event/trace correlation across one research source, review candidate, generated artifact, human approval, attempted publication and available outcome. Unknown is valid; no tracking of identifiable persons without authorized privacy governance.

### Contract candidates for implementation (NOT claimed live)

| Contract | Required identity | Allowed state transition | Refusal tests |
| --- | --- | --- | --- |
| \`ResearchSourceRef.v1\` | PMID + pinned source signature + optional exact DOI + witness span | source verified → research navigation only | unknown PMID, forged signature, alias collision, DOI mismatch |
| \`ReviewedClaimRef.v1\` | stable findingClaimId + primarySourceId + reviewed citation crosswalk + version | independently reviewed → editorial review candidate | title/keyword fuzzy claim join, mechanisms treated as human effects, missing reviewer |
| \`InstrumentHandoff.v1\` | same exact PMID + signature + explicit concept IDs and reviewed ID constraints | one research instrument → another, read-only | foreign concept, stale signature, different PMID, inferred efficacy |
| \`EditorialImpact.v1\` | exact matched primary DOI + reviewed claim/source IDs + canonical local target | review requested → human decision | DOI-only "claim approved", unreviewed source, silent publication |
| \`PublicationReceipt.v1\` | content hash + approved claim revision + platform + idempotency key + provider/manual receipt | approved asset → queued/published/failed/verified, never presumed | duplicate publish, stale artifact, missing permission, missing platform receipt |
| \`GenerationRelease.v1\` | issue, PR, exact head/base SHA, commit, tests, artifacts, main/deployment SHA, approver | verified candidate → release only on policy gates | stale CI, base drift, unreviewed science, unsupported runtime |
| \`ObservationRef.v1\` | publication/artifact identity + metric definition + time window + consent scope | measured event → attributable learning | unsourced dashboard totals, non-comparable periods, missing consent |

All these contracts are **proposed shape/names**. Review actual data schemas and migrate compatibly; do not declare them existing implementations or fork established type definitions. Document owners per producer and downstream consumer before a coding ticket.

### Event envelope candidates

Every cross-system event should carry schema/version, producer, source/revision identity, correlation ID, previous hash (where append-only), event time, immutable payload hash, evidence status, allowed consumer actions, idempotency key and explicit error/Unknown disposition. Consumer behavior: reject unknown schema or insufficient authority; never rewrite canonical evidence; allow deterministic replay only against the same immutable inputs. Rollback removes or disables derived consumers/artifacts, not history or underlying evidence.

**Critical failure examples:** paper A and B co-mention ingredient X → NOT effect equivalence; 2 publications from one registered trial → NOT two independent trials; same DOI in content metadata → NOT validation of the specific finding; a passing deterministic adversarial check → NOT external peer review; source verified intake → NOT dosing, efficacy or recommendations.

## 5. Capability landscape — integration lanes

A candidate is not "ready" merely because the idea is valuable. Each row must graduate through interface audit, authority/owner, upstream proof, dependency, risk, audience value and acceptance criteria.

| Domain | Build on (reuse) | Candidate generational integration | Dependency / guard | Priority |
| --- | --- | --- | --- | --- |
| Source lifecycle | PubMed intake, dedup, 500 waves | evidence version diff, source corrections watch, cohort lineage review | access to authoritative correction/registry feeds, reviewer, fail-closed | P0 foundation; external feed P1 |
| Evidence graph | source register, exact semantic case | immutable cross-study lineage, claim-centric graph, contradiction adjudication | no title-only causal links; independent trial mapping | P0 exact bridge; substantive trial P1 |
| Twenty instruments | eight source-focused + twelve bounded | common case/version context, normalized research hypotheses, review queues, UI receipts | only source-bounded deterministic leads; human scientific review | P0 integration |
| Editorial | 1.07 downstream review fabric | read-only case → exact reviewed claim → affected page and review task | no automatically rewritten findings | P0 slice |
| Consumer experience | research intelligence UI, mobile nav | topic-to-PMID-to-case journey, accessible uncertainty, canonical source cards | static export; screen-reader and mobile test | P0 slice/P1 enhancement |
| Content/SEO | evidence pages, guides, monographs, internal linking | only independently reviewed claim changes update page candidates, link impact map | canonical route/noindex/SEO safeguards | P1 |
| Social production | R8.08, local EvidenceMotion/voice workflow | exact-claim asset dependency graph, consistent visuals/audio, run receipts, manual-first upload | human media QA, rights/disclosures, no premium credits required | P1 |
| Publication | THS Publisher / manual native | state machine + exact-master hash + idempotency + verified platform receipt | provider permission; no duplicate posting | P1 |
| Observability | consent-gated analytics, scoreboard, experiment history | cohort-scoped proof of funnel and research utility; operator dashboard | GA4/GSC or approved transport; unknown if missing | P0 design; P1 activation |
| Execution intelligence | existing backlog + atomic CI + merge controller | dependency-aware generation ledger, impact-scope CI proof reuse, failure clustering | preserve existing controller and full risk gates | P0 process |
| Advanced scientific discovery | hypotheses/counterfactuals/adversarial rules | registry-backed trial lineage, full text, correction feeds, falsification evaluation | source licensing, validation and human domain review | P2 after proof |

## 6. Validation and verification — cost reduction without gate erosion

**Tier 0 (seconds/minutes, every local change):** static diff classification, formatting, schema/version tests, exact identifier invariants, deterministic unit/fixture tests and no generated-content mutation. Fail fast before expensive jobs. This is a *proposed workflow policy*, not an observed runtime promise.

**Tier 1 (subsystem boundary):** consumer/producer cross-contract tests, 8×8 handoff matrix where relevant, 12 science receipts with immutable PMID, 500 pinned PMID dataset invariants where relevant, false-positive adversarial tests, a11y/component tests, reproducible output hashes. Run for each changed subsystem before asking CI to build the world.

**Tier 2 (mandatory exact head/base):** current repository-required CI (typecheck, lint, research/source/claim validators, production build, static output, SEO/indexability, a11y/security, atomic issue, peer review) on each merge candidate; run all additional triggered/required checks. If the impact classifier authoritatively permits scoped checks, follow the **existing** path; never invent an exception for semantic or clinical surfaces.

**Tier 3 (main/release):** merge-controller exact-head validated receipt, main-branch build/deployment workflow, SHA-correlated Cloudflare production receipt, one mobile/desktop case journey and user-facing claim/safety verification. Platform publication additionally requires an exact artifact and destination receipt. A green GitHub PR alone is not an active deployment.

### Batching policy

- **Batch design, schema negotiation and Tier 0/Tier 1 test writing** within one generation; use a dependency graph and common fixtures so the integrated effect is visible early.
- **Do not batch mutable PR heads into one combined permission to merge.** Each WIP ticket retains an atomic PR and exact-head gates. Stacked PRs document base/head dependencies and are rebased/reverified in merge order.
- **Cache evidence, not trust.** Reuse only proven exact-identity tests and artifacts permitted by existing CI; track baseline, reused artifacts, invalidated evidence and reasons for reruns.
- CI failure triage must first distinguish stale base, infrastructure/flaky failure, real regression, human review defect and external access; only the accountable owner applies a change. Unknown remains fail-closed when required.
- Freeze an integration candidate only when schema changes are locked, dependency proofs are satisfied, all owners have handed off and no known P1/P0 scientific/security/UX defect remains.

## 7. Release-train governance

**Preflight → contract freeze → vertical slice → component integration → release candidate → required exact-head verification → merge controller → deployed smoke test → observation/retro.**

Entry gate: approved issue, owner/workstream, dependency state, measurable acceptance, exact downstream consumers, no duplicate active PR, WIP slot and non-overlapping data ownership.

Exit gate: linked issue and PR, generated artifact/source provenance, explicit Unknowns, required CI results, review approvals, main/deployment receipts, rollback instruction, scorecard update. Failure or mismatch means "blocked" and return to the smallest affected ticket—not wholesale generation rollback unless necessary.

Rollback: use revert/feature-disabled static build of the affected code; never delete reviewed evidence ledger history, mutate source IDs or conceal shipped publication receipts. For publishing, reconcile provider state before retrying to avoid duplicates.

## 8. Week-one execution schedule (October 12–16, 2026)

**These are proposed dependency stages, not unattended scheduled tasks or pre-authorized additional WIP.** Each start requires a current sprint/admission transaction, owner and gate proof.

| Day | Proposed smallest deliverable | Entry prerequisites | Evidence to collect |
| --- | --- | --- | --- |
| Mon Oct 12 | P0.1 inventory and release-state reconciliation; capture CI stage timing and root causes | check #6428, #6429, #6426, #6397, #6399, current main/deploy SHA; reconcile stale docs | PR truth table, exact-SHA inventory, CI cost baseline incl. Unknown |
| Tue Oct 13 | P0.2 freeze shared source/claim/handoff interface + adversarial fixture set | main contains intended eight/twelve instruments; reviewed vs source-only distinctions agreed | typed schema diff and negative identity/authority tests |
| Wed Oct 14 | P0.3 minimum vertical **read-only** source → 20-tool case → human editorial impact candidate | P0.2 contract plus approved ticket owner and evidence fixtures | one exact PMID trace, safe negative cases, mobile/desktop case capture |
| Thu Oct 15 | P0.4 integrate deployment/release receipt and lossless audit trail; scope targeted validation efficiency | exact-head CI for slice, no critical open review defects | terminal CI matrix, artifact hashes, deployment/Unknown and rollback |
| Fri Oct 16 | P0.5 generation audit and next release backlog; measure overhead and field evidence if available | reconcile all PRs/ownership/receipts | throughput, unnecessary reruns and causes, trust failures, next candidates |

**Parallelism:** Design discussions and unrelated Tier 0 fixtures may proceed in parallel, but only admitted D/R/A tickets consume implementation WIP; no two branches write the same canonical data, merge-controller or code-owner surface. If Monday finds missing scientific source/review or real main deployment proof, prioritize repairs before new expansion. Run only the smallest *verified* safe vertical slice; do not force the calendar.

### Ready-for-admission ticket specifications (not yet individual active issues)

- **P0.1 Current truth and validation baseline (D or A owner by admission):** classify each existing PR, exact main/deploy SHA, 8+12 UI/case status, five lanes, no-double-count data registry, stage timing and retry causes. PASS if every status has evidence/reference and no "unknown → done" substitution.
- **P0.2 Shared lineage and handoff contract (A):** reuse existing PMID/source signature/reviewed claim identifiers; define and test only currently missing consumer-enforced invariants. PASS if unknown/foreign IDs and clinical promotion are rejected without breaking baseline source journeys.
- **P0.3 Read-only vertical integration (R or D based on actual destination):** preserve exact source through study case, research instruments and editorial review candidate; do not promote claim automatically. PASS if one positive case and all negative adversarial cases are reproducible and accessible.
- **P0.4 Tiered verification attribution (D, only after no overlap):** audit duplicate build triggers/reruns; adjust only redundant work proven equivalent with unchanged risk. PASS if mandatory gates retain exact-head proof, before/after CI minutes and no check removals outside explicit governing authority.
- **P0.5 Release evidence and retro (project control, not extra WIP):** validate main/deploy receipt, versioned integration record, known gaps and rollback. PASS if "merged" and "deployed" are never conflated.

## 9. Measurement and stopping rules

Capture, per accepted generation: PRs planned/accepted/merged/deployed, median/p95 elapsed from first ready code to exact deploy, cumulative CI wall-minutes and runner-minutes where accessible, number of full builds and invalidations, source-identity failures, reviewer rework, defects escaped to production, time spent on architecture rediscovery, case handoff success, mobile accessibility, user adoption and consented qualified outcome. Baseline starts **Unknown** pending reproducible GitHub Actions extraction; the user's observed ~30-minute checks are an anecdotal hypothesis, not a verified measured mean.

No claimed percentage efficiency gain, revenue uplift, medical accuracy or platform "exponential" effect until controlled before/after data. Prefer denominator of *safely deployed, usable capabilities*, not raw PR count. A 0 clinical promotion count is a safety invariant, not evidence that review or utility improved.

Stop and repair when: clinical authority boundary can be bypassed; outdated source or artifact can publish; exact-head CI is missing/stale; static export breaks; public claims lose limitation/context; secret/consent/security is violated; integrated UX makes studies appear to prove what they do not; unresolved CI conflicts cannot be isolated. A too-large branch that prevents review must be split even if this adds validation time.

## 10. Future horizon and decision points

- **Generation A (now):** integrate *existing* deterministic research/source tools with source-identity trust, editorial review and visible mobile proof.
- **Generation B (after A has receipts):** evidence change-impact graph, reviewed claim-to-page propagation, corrections queue, first-party social artifact lifecycle, selective feedback loops.
- **Generation C (after source contracts + observed needs):** genuinely independent trial-lineage matching, full-text extraction with rights and scientific review, appropriate correction/retraction feeds, hypothesis evaluation and longitudinal research questions.
- **Not in scope:** autonomous clinical recommendations, unreviewed dosing decisions, arbitrary network crawlers, unsupervised publishing or heavy new paid infrastructure.

**Operational handoff:** start next week by reading #6431, the authoritative sprint/backlog and this document; refresh GitHub evidence, admit the smallest unblocked ticket, and keep the whole generation architecture visible without expanding one ticket's review surface into a giant PR.
