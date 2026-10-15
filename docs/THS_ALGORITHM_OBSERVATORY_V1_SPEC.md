# THS Algorithm Observatory 1.0 — Evidence-Based Platform Learning

**Specification status:** Owner-approved additive direction (2026-10-15), recorded in repository documentation. **Capability status:** NOT admitted for implementation, implemented, released/deployed, or outcome-validated by this specification. A merged documentation PR does not imply merged implementation.
**Parent:** [THS-MASTER-P0 source-recovery directive](THS_MASTER_P0_DIRECTIVE_RECOVERY.md), especially §§32–33 (measurement), §36 (retention experiments), §§49–51 (distribution / attribution), §§53–62 (implementation governance).
**Existing foundations:** [EvidenceMotion R8.10 learning flywheel](evidencemotion-r810-flywheel.md), [THS Publisher v0.1](ths-publisher-v0.1.md), SocialOS / THS Observer, durable experiment learning (#4414), and governed outcome ingestion (#4407).
**Authority:** [AGENTS.md](../AGENTS.md), [CURRENT_SPRINT.md](CURRENT_SPRINT.md), [MASTER_BACKLOG.md](MASTER_BACKLOG.md), [DECISIONS.md](DECISIONS.md), claim/source/editorial approval, required CI, protected merge controller and verified deployment. This extension does **not** amend the historical verbatim owner directive or renumber its original/reconstructed 150 tasks.

## 1. Goal and scientific premise

Build a black-box **system-identification and creative-experiment** capability that infers useful, audience-specific relationships between published creative choices and observed TikTok/YouTube outcomes. The goal is **better factual science communication to real audiences**, not access to proprietary ranking weights or guaranteed virality. Model outputs are hypotheses/predictions with uncertainty, never statements that THS recovered platform code or proved an undisclosed algorithm.

This is an **additive learning layer** on the existing EvidenceMotion → SocialOS → Publisher → Observer → Experiment Registry workflow. Do not create a competing video engine, publication registry, source database, rule version, prioritization score, or paid service. Platform-specific models, schemas and authorization boundaries stay explicit.

## 2. Input/output boundaries and identity

1. **Source of publishing truth:** Reuse the canonical `publication_id → experiment_id → artifact_sha256 → platform → intended_time → provider receipts` and verified `PUBLISHED` state. An uploaded/draft/scheduled asset is **not** a published observation. Resolve manual native uploads to an authenticated/owner-attested receipt; never duplicate a post on ambiguous provider response.
2. **Creative DNA:** Read-only manifest/provenance projection of the *exact published* creative: full video/master hash; exact narration WAV and word timings where verified; study/citation/approved-claim identities; topic/outcome; hook pattern and actual first-three-second spoken words; length; scene grammar; beat order; visual modes; caption structure; voice pace; primary platform; title/caption/cover; version and consent-bound experiment cohort. Missing features are `Unknown`, not guessed from plans.
3. **Observations:** Append-only platform-specific performance snapshots with platform post ID, `publication_id`, provider/API/manual provenance, UTC `observed_at`, metric definitions, `window_start/end`, units/denominators, visibility/permissions, metric availability, and immutable snapshot/source hashes. Preserve native denominators, estimates and gaps. Incompatible platform metrics must **never** be relabeled as directly equivalent.
4. **Sources:** Prefer authorized official platform APIs where rights and metrics exist; permit clearly labeled owner-entered exports/manual observations as fallback. Avoid unofficial scraping, account automation outside platform permissions, synthetic engagement, bots, purchased views, credential sharing and policies designed to manipulate platforms.
5. **Privacy:** Default to aggregate content-level performance; no viewer-level identity/profiling or private audience records. Honor consent/region controls, data retention, access controls and secrets isolation. Do not commit private performance ledgers or API credentials to the public repository. Use low/no-cost local processing; provider integration requires separate approved scopes.
6. **Output:** Source-linked human-inspectable experiment reports, uncertainty-scored candidate production recommendations and future-only creative template proposals. Learning never silently edits published videos, approved safety copy, narration, scientific grades, or publication permissions.

## 3. Five interoperating capabilities

### A. Performance Collector
Normalize *what is measured*, not misleadingly the metric itself. Capture views/plays and published-post exposure when available, average view duration, watch-through/completion, retention-curve checkpoints, likes, shares, comments, follows/subscribes, and legitimate consented site journeys where the platform permits. Distinguish zero from `Unknown`; capture delayed availability, revisions and window differences. Reconcile repeated reads idempotently into append-only snapshots, not cumulative double counts.

### B. Creative DNA Analyzer
Extract deterministic scene/script/metadata features only from actual governed artifacts, including exact source/hash linkage and versioned extraction code. Group audience questions and formats without inferring unsupported clinical relationships. Unknown or disputed audio/visual alignment is recorded as such. Standardize human-readable feature explanations (e.g., “question-first hook,” “diagram within first 3 seconds”) and expose the source timecode/manifest field.

### C. Controlled Experiment Engine
Register explicit hypotheses, variants, primary outcome, guardrails and stopping/exposure rules **before** viewing results. Compare within platform, similar publication windows and topics/audience exposure; where possible rotate/randomize creative treatment assignment *without duplicate spam or unauthorized A/B testing*. Track seasonality, account baseline, topic newsworthiness, posting cadence, attribution and sample selection. Separate observational associations from causal inferences; report small sample/underpowered tests as inconclusive. Reuse #4414's durable experiment history and the existing positive-performance minimum-exposure rule; no new scoring formula.

### D. Predictive Model
Start with transparent, simple baselines and calibration (stratified medians/robust regression), not opaque high-complexity ML without enough data. Only train on source-authenticated, consent/permission-safe observations. Use time-based validation, topic/platform holdouts, uncertainty intervals, drift checks and explicit model/version/data lineage. Report baseline-relative prediction error and subgroup failure modes; abstain when features are missing, cohorts too small or platform behavior drifts. Predictions are estimates, never promises of reach.

### E. EvidenceMotion Optimizer
Rank **proposals** for hooks, visual grammars, natural pacing, narration readability and topics based on reproducible platform/cohort evidence. Bind every recommendation to exact observations, mechanism hypothesis, confidence, expected trade-offs and reviewer disposition; route to existing creative template proposal/approval/version workflow. Human/owner and editorial quality gates or any adopted deterministic autonomous QC gates still govern actual release. No automatic scientific copy promotion, sensationalized uncertainty, missing caveats, clickbait deception, or autonomous cross-platform publication.

## 4. Evaluation: what success means

Primary user-value outcome is **measured comprehension/trust-safe attention** to approved factual science, operationalized with measurable proxies (e.g. completion/watch time under comparable denominator) plus available comprehension/quality review; platform reach alone is insufficient. Track per-platform:

- Native retention/watch-time quality with precise definitions and exposure denominator; qualified account actions, non-bot comments, real followers/subscribers, and consented on-site qualified visits when verified.
- Exact science/safety fidelity, no lost qualifiers, no manipulated hype, beginner comprehensibility, audio-visual/phone quality, and publication authenticity.
- Experiment coverage, matched-cohort sufficiency, uncertainty/calibration, abstention rate, drift, reproducibility, and incremental cost per *verified* useful outcome.
- Never state measured lift from a synthetic fixture, proposal or missing GA4/platform receipt; unavailable external data remains **Unknown**.

## 5. Dependencies and phased implementation (candidate only)

**Phase 0 audit (2026-10-15):** [Repository source-owner mapping and authorized Metricool/API metric-coverage investigation](algorithm-observatory-phase0-audit-2026-10-15.md). This is an **inspection/research artifact**, not evidence that a Publisher-to-flywheel bridge exists, the full code/test suite passed, or real performance lift was validated. Proposed first gated implementation owner: [#6810](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6810).



**Phase 0 — Audit/reuse:** Reconcile live GitHub/production state of R8.10 flywheel, SocialOS Publisher/Observer, #4414 experiment history, #4407 outcomes, EvidenceMotion creative manifests and availability of authorized platform metrics. Enumerate overlap and source ownership; record missing coverage.

**Phase 1 — Minimal instrumented vertical slice:** For **one verified published video**, reconcile canonical ID/hash with a timestamped source-proven performance snapshot and extracted creative features; produce a local inspectable report. A fixture alone is test coverage, not completion or real metrics.

**Phase 2 — Cross-platform taxonomy:** Specify TikTok and YouTube independent measurement adapters, missingness/definition maps, authorized access, provenance/permissions and append-only revision tests. Owner-export/manual fallback stays viable.

**Phase 3 — Registered experiment pilot:** Create and review one narrow matched/cohort comparison (e.g., hook style) without changing scientific claims or producing unauthorized duplicate uploads; explicitly measure confounders and report inconclusive results when exposure is inadequate.

**Phase 4 — Calibrated recommendations:** Implement the smallest interpretable, separately evaluated predictor; evidence-backed future-only creative suggestions; explanation/abstention; provenance-linked approval receipts.

**Phase 5 — Safe flywheel evaluation:** Show repeated reproducible improvements versus a declared baseline, with no safety/quality regression, trustworthy attribution and documented failures. Automation beyond recommendations requires independent permission and gates.

**Scheduling priority:** Do not divert implementation capacity from closing the existing **EvidenceMotion 46-item checklist and excellent-first-render quality goals**. Phase 0/read-only contract preparation can coexist when governance permits; implementation must be scored/admitted via the existing D/R/A queue with a WIP slot, distinct owner and non-overlapping issue/PR. Treat any added capability as a new future specification, **not** automatic EvidenceMotion checklist credit.

## 6. Acceptance criteria and negative tests

- [ ] **AO-01 Existing-owner audit:** identify actual reusable code and accepted owner paths; no parallel publisher, experiment registry, evidence graph or scoring system.
- [ ] **AO-02 Canonical identity:** published-only observations trace to exact `publication_id`, media hash and approved creative provenance; unverified/draft jobs rejected.
- [ ] **AO-03 Revisions and denominators:** append-only timestamped windowed snapshots are idempotent; different windows/denominators/platforms cannot be silently pooled.
- [ ] **AO-04 Missingness:** `Unknown`/null is not 0, and synthetic test inputs never appear as production outcomes.
- [ ] **AO-05 Metrics entitlement:** no data acquired beyond platform authorization; manual imports labeled and verified; provider outage leads to explicit `Unknown`.
- [ ] **AO-06 Feature reproducibility:** same verified video/manifests yield byte-identical versioned creative-DNA features, with human-readable evidence pointers.
- [ ] **AO-07 Study identity:** registered primary outcome/variant and analysis plan prevent post hoc “winner” selection, contaminated cohorts and duplicate tests without a retest rationale.
- [ ] **AO-08 Statistical restraint:** low-exposure, confounded or shifted cohorts produce an *inconclusive/abstain* verdict; no causal/platform-algorithm claims without appropriate evidence.
- [ ] **AO-09 Holdout and drift:** predictor compared to naive baseline on time/topic/platform-aware holdouts; error, calibration and drift reported; no fabricated uplift.
- [ ] **AO-10 Scientific firewall:** optimizer cannot edit/change/circumvent approved facts, citations, safety language, corrections or scientific-review/publication authority.
- [ ] **AO-11 Creative safety:** no spam, synthetic engagement, manipulation, privacy breach, platform bypass or hidden autonomous uploads; existing review/master/phone gates retained.
- [ ] **AO-12 Inspectable handoff:** one report explains exact videos/variants/metrics, timestamps, confounders, interpretation, confidence and proposed next *future-only* template decision.
- [ ] **AO-13 Real field demonstration:** at least one verified published post with real observation and creative extraction, followed by a genuinely compared multi-video pilot and decision (including an honest inconclusive verdict if necessary).
- [ ] **AO-14 Protected delivery:** scoped ticket, exact-head tests/security/science/SEO/a11y/build checks as applicable, sole-controller authorized merge, deployment receipt where runtime changes ship, and separate observable field validation; no status inflation.

**Explicit counterexamples to test:** a scheduled-but-unpublished post; duplicate provider ID; changed MP4 without new source/hash; API read with 403 or revoked scope; retention metrics with incompatible definitions; revised stats under an identical timestamp; zero-valued metrics vs missing export; low-view viral outlier; topic-specific apparent lift; fabricated synthetic views; hook that strips a scientific caveat; suggestion that would mutate an approved in-flight render; predictor evaluated on leaked training videos; unconsented viewer-level records.

## 7. Definition of done and reporting

**Specification accepted** means this owner-directed scope was recorded. It does **not** mean the component exists.
**Implementation complete** needs all relevant AO criteria supported by exact artifacts and passes, not checkbox declarations.
**Operational success** needs legitimate published/video-level field observations and independently reproducible experiment/quality review. Report `planned / branch / PR / merged / deployed / observed` separately, alongside `Unknown` and exact evidence receipts.

**Non-goals:** extraction of proprietary TikTok/YouTube source code, certainty about ranking weights, guaranteed virality, synthetic engagement, algorithm evasion, mass auto-publishing, replacement of scientific editorial authority, or vendor/credit-funded production.
