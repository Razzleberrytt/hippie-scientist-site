# P0 — Generational Engineering & Integration Readiness

**Decision date:** 2026-10-08 (America/New_York) · **Planning:** Oct 8–9 · **Execution:** Oct 12–16, 2026.
**Owner:** Project control / governed integration · **Atomic issue:** [#6431](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6431).
**Priority:** P0 methodology and readiness. **State:** planning specification; not proof of implementation, deployment, a WIP reservation, or ROI.
**Canonical authority:** [AGENTS.md](../AGENTS.md), [CURRENT_SPRINT.md](CURRENT_SPRINT.md), [MASTER_BACKLOG.md](MASTER_BACKLOG.md), [ROADMAP.md](ROADMAP.md), [DECISIONS.md](DECISIONS.md); GitHub's live PR/issue/CI state outranks stale snapshots.

## 1. North star

Create one interoperable, evidence-constrained scientific intelligence and distribution platform by designing whole **capability generations** before implementing their isolated features. Reduce duplicated architecture work and redundant full validation rounds while retaining **independently checkable atomic changes** and all mandatory release gates.

**Optimization target:** time from approved idea to **integrated, production-verified, reviewable user value**, not raw PR count, model-generated code, candidate count, or claimed exponential improvement. The idea that validation currently takes roughly 30 minutes is a user-observed problem statement; collect actual workflow/job durations rather than treating that estimate as measurement.

Method: **landscape → shared contracts → dependency DAG → small slices on short-lived branches → cheap per-slice targeted tests → full exact-head candidate validation → controlled merge → production receipt → learn**.

This replaces feature-at-a-time planning, **not** the requirement to work on one scoped ticket per agent or the existing three-workstream WIP cap. Do not use one unreviewable megabranch merely to suppress required checks.

## 2. Current implementation inventory (snapshot, revalidate at kickoff)

| Surface | What exists / authority | Snapshot and missing proof |
| --- | --- | --- |
| Canonical evidence/content | Workbook-driven build; independently reviewed claim/citation records; generated public runtime data | Existing authority; no replacement or silent data migration |
| Research intake | Five independently owned 1–25 PMID lanes, global reservations, rolling 500 frozen review batch, dedupe by PMID/DOI/title | `ops/research-intake/README.md`; PR [#6429](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6429) seed hydration and [#6426](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6426) failure isolation were open when prepared; recheck |
| Research source register | 7,435 PubMed source identities registered for navigation; independent editorial firewall | [#6400](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6400) merged; source identity count is **not** an approved finding/claim count |
| Semantic Science Atlas | Source-bound study cases, eight existing research instruments, exact publication identity and governed semantic handoffs | Research 1.05, 1.06 relay and 1.07 reviewed downstream bridge merged; production receipt, real utility and quality must be separately verified |
| Twelve scientific tools | Claim DNA, trial/publication lineage, comparability, integrity radar, hypothesis/questions, source sensitivity, bounded missions, citations, mechanism/human boundary, review compiler, deterministic adversarial checks, calibration | [#6428](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6428) merged as of this planning snapshot; bounded static research projections **not** independent peer review or verified clinical insight |
| Waves 7501–8000 | 500 source-verified draft intake items | [#6397](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6397) awaits independent semantic/scientific review; do not inflate approved corpus |
| Editorial/distribution | Review-only exact DOI + existing source/claim ID join, idempotent dry-run publishing lifecycle and separate downstream objects | Does not authorize content change, clinical recommendation or automatic posting |
| SocialOS / media | R8.08 creative contracts and native/manual publishing baseline | R8.08 merged; Kokoro narration [#6399](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6399) was open; actual narrated videos and field outcomes remain unverified |
| CI and control | Release impact classifier, docs/validation-only and bounded UI paths, exact-head CI, security/a11y/SEO/build tests, autonomous merge controller | Fast paths already exist; measure their effectiveness before altering classifiers or reducing build scope |
| Cloudflare/static output | Next.js static export and Cloudflare Pages deployment process | Merges are not deployment evidence; runtime services/provider access need separate authorization and proof |
| Business/learning | Scored single canonical backlog; field-experiment learning and consent-constrained analytics | GA4/attributed outcomes, efficiency improvements and commercial ROI are **Unknown** without trustworthy receipts |

**Do not equate:** proposed ≠ coded ≠ merged ≠ exported ≠ deployed ≠ field-proven. Status must be evaluated at run time against GitHub, production and authoritative ledgers, not copied from this snapshot.

## 3. Capability landscape: coordinate these packages, do not fork systems

The following are **integration candidates**, not a claim that every system below exists or is authorized for implementation. Extend owners already present in the repository. Each candidate must become one scoped, scored, admitted ticket **only** after dependencies and proof are identified.

| ID | Generation package | Shared contract / proposed integration | First safe deliverable | Blocker or trust boundary |
| --- | --- | --- | --- | --- |
| G0 | State reconciliation & release governance | Canonical PR/issue/branch/base matrix + one WIP ledger | machine-auditable readiness snapshot | live state may change |
| G1 | Identity & study lineage | PMID + DOI + source signature + separately reviewed citation ID + claim IDs | fail-closed identity adapter / adversarial joins | DOI identity does **not** establish trial independence |
| G2 | Source/review event fabric | Versioned append-only provenance event + exact owner + authorized sink | read-only, idempotent replay of source→case→editorial **review target** | no automatic claim approval |
| G3 | Eight + twelve intelligence interoperability | Typed case context, version signatures, missingness, source witnesses | one PMID trace through instruments with cross-checkable evidence | no inferred efficacy, effect sizes, clinical causation |
| G4 | Evidence comparability & uncertainty | Study design, intervention/formulation, population, outcome, controls and confidence | verified comparability limitations and question candidates | cannot extract missing full text as fact |
| G5 | Integrity and corrections | Registry/correction ingestion interfaces, provenance and dated refresh receipts | manual-review import contract, fail closed if feed unavailable | external access/source licensing; no claim of live monitoring |
| G6 | Scientific review and correction | Revision-keyed human review, approval, retraction and consumer dependency map | trace **possible** affected pages/assets without mutating them | editorial sign-off and safety gate |
| G7 | Content/entity graph + search UX | Canonical entity/alias IDs, graph snapshots and noindex/SEO requirements | navigable source-exact entity discovery with audit trail | avoid second editorial source of truth |
| G8 | Distribution/publication handoff | Existing claim/source IDs + article ID + asset hash + producer/owner consent | review-only trace to existing distribution object | live publish requires platform authorization |
| G9 | Media/Voice/Publisher integration | Exact evidence bundle + beat map + master audio/video hashes + receipt | synchronized local-first rendered artifact + human QA + native fallback | no paid credits or silent voice substitution |
| G10 | Field feedback and analytics | Release_id, content hash, consent, publication receipt, qualified outcome | attributable telemetry audit and feedback to experiment ledger | unavailable metrics stay Unknown |
| G11 | Performance & validation economics | Risk/surface classification, workflow signature, measured duration, artifact hashes | baseline report of wasted/reused checks and slowest jobs | never weaken required tests |
| G12 | Experience, accessibility and trust | Shared evidence limitation text, mobile interaction, responsive proof | mobile/desktop user proof on integrated workflow | a11y, claim drift, crawl/sitemap must pass |
| G13 | Security/deployment/operations | Least privilege, authenticated providers, rollbacks and readiness/incident receipts | rehearsed dry-run/rollback and exact production verification | account access and provider capabilities may block |

### Forward-looking, research-gated extensions (not Week 1 implementation commitments)

- Full-text study-feature extraction with licensed/source-permitted provenance and human verification.
- ClinicalTrials.gov / protocol registry cohort lineage and overlapping participant detection.
- Publisher/Crossmark/PubMed correction and retraction feed, independently reviewed impact propagation.
- Temporal evidence snapshots and before/after reviewed claim explanations.
- Provenance-first contradiction triage and evidence comparability matrices.
- Scientific hypothesis queues prioritized by uncertainty, value and falsifiability; *questions, not findings*.
- Explicit confidence calibration against independently judged cases, not internally generated agreement alone.
- Reader-controlled semantic voyages and saved research views, with privacy/accessibility constraints.
- Public education views separating what we know / suspect / cannot infer / safety.
- Verified autonomous local investigations; defer external research/background actions until authorized and auditable.
- Editorial bridge to social-video topic selection and revised content without auto-publishing.
- Self-hosted or manual platform publishing adapters with idempotent receipts and no credit-dependent core.

### Cross-system dependency rules

1. No feature invents its own copy of the source corpus, authoritatively mutates workbook/generated runtime output, or bypasses the existing claim approval authority.
2. Every edge has `producer`, `consumer`, `schemaVersion`, canonical source identity, state, authorization, error strategy and test. No name/similarity match is sufficient to promote authority.
3. Navigation joins and research suggestions stay *research-only*; reviewed evidence joins require independent exact citation/claim records.
4. Publishing requires approved asset and provider/manual receipt. Analytics requires lawful consent and corroborated collection.
5. The system reports `Unknown`, `blocked`, or `requires-review` explicitly rather than producing invented or optimistic outputs.

## 4. Shared integration envelope — design contract (not yet runtime code)

Proposed generic envelope for review, subject to G1/G2 approval:

```json
{
  "schemaVersion": "ths.generational.event.v1",
  "eventId": "<stable-idempotency-key>",
  "eventKind": "research.case.review-target",
  "producer": "research-intelligence",
  "consumer": "editorial-review",
  "source": {
    "pmid": "<exact-validated-pmid>",
    "sourceSignature": "<pinned-source-signature>",
    "doi": "<normalized-doi-or-null>"
  },
  "review": {
    "independentCitationId": null,
    "findingClaimId": null,
    "status": "requires-review",
    "publicationAllowed": false
  },
  "artifact": {
    "version": "<producer-version>",
    "contentHash": "<real-content-hash>",
    "baseCommit": "<exact-base-sha>"
  },
  "requestedAt": "<ISO-8601>",
  "provenance": "<durable-source-record-uri>"
}
```

**Semantics:** example fields are placeholders, not valid production IDs or a schema migration. Exact identity must be rechecked by consumer; event ID deduplicates retries, schema/version mismatches fail closed, audit history is append-only and authoritative reviewed records remain upstream. Define allowed event kinds, redaction, retention, authorized reviewer action and rollback per destination before implementing any writer. A source update creates a new revision; never rewrite prior signed evidence receipts. Clinical publication and automatic action default false.

**First two explicit integration paths:**

- **Research-only vertical trace:** source register → exact PMID case → eight-tool handoff → twelve bounded source projections → reviewed-citation **candidate only** → editorial review queue. Tests: forged PMID, title-only DOI, stale signature, same PMID different DOI, negative/null conclusion, unreviewed citation, zero matching downstream targets.
- **Post-review distribution trace:** independently approved claim ID → canonical page/asset hash → THS EvidenceBridge/source pack → local Voice/Video hash → Publisher/manual approval → provider receipt → consent-bounded telemetry → FieldLab. Tests: failed voice, stale evidence, changed script, duplicated publish retry, provider unavailable, incompatible aspect/audio, unattributable event. Missing stages stay blocked; no deceptive SUCCESS.

## 5. Verification architecture (do not confuse lower cost with fewer safety gates)

| Tier | When | Representative proof | Scope |
| --- | --- | --- | --- |
| **T0—during each change** | every coding pass | format/schema, focused unit tests, synthetic adversarial fixtures, content hashes and git diff checks | seconds/minutes target, actual time measured |
| **T1—subsystem checkpoint** | after related interface cluster | real internal producer→consumer contract tests, case identity, failure and idempotent replay, a11y/claim-boundary assertions | changed + affected dependency surfaces |
| **T2—release candidate** | **every governed PR as existing policy requires** | existing exact-head required GitHub checks including build, tests, source integrity, security, SEO/structured data, accessibility, claims/atomic gate; independent science review where applicable | full risk-relevant suite; no forced green |
| **T3—release & field** | merged main/deployment | same-SHA release receipt, static export, Cloudflare production receipt, mobile/desktop smoke, rollback/read-only fallback, field telemetry when authorized | production truth |

**CI optimization policy:**
- First measure existing workflow job durations and duplication on representative PRs. No claimed time savings before measurement.
- Keep existing `scripts/ci/classify-release-impact.mjs` as authority. Propose classifier changes only under a distinct ticket with adversarial fixtures (false-negative release-sensitive classification must be zero).
- Cache immutable dependencies and artifacts only with exact hash, environment, source and version validity. Do not reuse old base/head security/claim approvals.
- Aggregate *independent cheap validations*, parallelize safe jobs, and factor duplicated full-build execution where source-identical; preserve mandatory workflow check names for branch protection/merge policy.
- A 500-paper intake freeze or a 20-capability research generation is **not** one unchecked merge: introduce checkpoints and a deterministic freeze/review step.
- Track `T0/T1/T2/T3` durations, queued time, canceled/retried jobs, missing receipts, and which gate was truly necessary. Use 3-run/5-run same-class sample if available before changing timeouts.
- If a required check cannot run, report **blocked**, not SUCCESS; schedule/trigger only with existing authorized tools.

## 6. Release-train operating rules

- Every generation has a small **manifest** (see companion `ops/generational-engineering/p0-release-train-2026-10-12.json`) listing work packages, authoritative producer, dependencies, evidence, status, priority and stop conditions.
- One canonical owner per write surface; one scored acceptance ticket per independently reviewable scope. Do not open a replacement PR for an existing in-flight owner repair.
- Limit normal implementation to **3 concurrent tickets total** (Discovery/SEO, Revenue/Conversion, Authority/Content; one each), per `AGENTS.md`. Integration coordination is not a fourth independent coding stream. Research data reservations retain separate review/merge governance.
- Prefer early read-only adapters and fixtures, then governed event writers, then downstream sinks, then production UI and instrumentation. Freeze shared interfaces after the first integration checkpoint.
- Before merge: check exact head/base, ownership, contract fixtures, reviewed claims, matching CI requirements, all blocking reviews, output and rollback. Existing merge controller remains sole executor.
- After merge: inspect main build and deployment receipt. Failed or unverified deploy does not become a deployed capability.
- A broken predecessor blocks dependent promotion. Rebase/revalidate exact head rather than mass-merge behind failures.
- Two checkpoints per generation: **integration** (all affected contracts/failures exercised) and **release** (T2/T3 proven). This is release-train batching, not a promise that GitHub Actions jobs all finish in one run.

## 7. Week-one dependency DAG and execution schedule

**Oct 8–9: readiness only.** Freeze this program, build the status/owner matrix and cheap fixtures design, identify blockers, inspect existing CI durations, establish baseline and confirm PR #6428 exact merged state. Do not mark implementation/deploy verified from planning.

| Day | Planned objective | First governed acceptance evidence |
| --- | --- | --- |
| **Mon Oct 12 — G0** | Reconcile live PR state, merge/deploy evidence, workstream WIP; select highest-leverage **unblocked** existing P0/incident ticket; measure workflow durations | one current-source truth table, backlog admission transaction, CI baseline and incident list |
| **Tue Oct 13 — G1/G2** | Implement source-exact identity/event *read-only* contract and adversarial test fixtures, without authorizing medical claims | invalid DOI/PMID/signature rejected; provenance and version preserved across two owners |
| **Wed Oct 14 — G3/G6/G8** | Complete one research→instrument→editorial review-target vertical slice, repair integration failures | replayable exact-source workbench→review trace; no automatic clinical promotion or publication |
| **Thu Oct 15 — G9/G10/G11** | Connect eligible governed asset→local media/manual publisher receipt and consent-bounded measurement, plus CI economics probe; skip externally blocked writers | hash-bound asset and dry-run/real manual receipt where authorized, explicit Unknown attribution, risk-relevant CI observation |
| **Fri Oct 16 — Release** | Controlled exact-head validation/merges/deploy where all gates permit; review mobile/desktop end to end; capture metrics and next-generation backlog | green required workflows, human science signoff as applicable, matching production receipt, failure log/rollback test, new decisions |

**These are intended checkpoints, not automatic background actions or a commitment to ship regardless of failed CI.** Missing external permissions, upstream reviewed sources or approvals can turn a day's objective into a verified blocker with the smallest safe alternate slice. No scope inflation to compensate for a blocked gate.

### Week 1 priority order (within existing single scoring formula)

1. **P0-G0 control truth**: eliminate stale active PR entries and reconcile source/review/deploy evidence; this unlocks safe admission.
2. **P0-G1/G2 exact lineage**: one authority-aware typed cross-system handoff with idempotent versioning and negative fixtures.
3. **P0-G3/G6 review-only trace**: eight+12 research instruments to scoped editorial target, human sign-off retained.
4. **P0-G11 validation economics**: instrument existing CI bottlenecks and duplicate work; optimize only with evidence and no safety regression.
5. **P0-G9/G10 social/distribution trace**: existing safe local/manual path and accountable measurement, subject to blockers.
6. **G4/G5/G7/G12/G13**: expand in later generations after G0–G3 are proven, except safety/incident repairs.

Do not invent a second priority score. Rank executable tickets with `(Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort` from `MASTER_BACKLOG.md`; dependency unlock belongs under Strategic Leverage. Missing measurement reduces Confidence and external assumptions require `last_verified`.

## 8. Exit criteria and stop conditions

**Readiness exit (before Monday execution):**
- [ ] P0 issue and canonical cross-links merged; current status refreshed.
- [ ] Capability inventory and dependency graph reviewed; one owner for each authoritative surface.
- [ ] One interface envelope, at least six intentionally invalid cross-source examples, and a no-promotion policy documented.
- [ ] Release and rollback checklists anchored to existing workflows; no new hidden fast path.
- [ ] Initial CI runtime and rerun baseline measured or honestly marked Unknown; scopes and timestamps recorded.
- [ ] At most three admitted workstream tickets and no duplicate open implementation PR.
- [ ] GitHub PR, build, review and deployment state checked immediately before execution.

**Generation 1 release exit:**
- Exact source-to-review trace demonstrated end to end on real governed sources, including missing/forged tests.
- No speculative claims, no unreviewed evidence promotion, no unapproved publication, no unrelated page changes.
- Signed/hashed provenance survives every authorized hop; replay and rollback documented.
- Exact-head/full required CI green, independent review where applicable, main production receipt, accessible mobile smoke proof.
- Baseline and after metrics report lead time, duplicate validations, failed/retried checks, integration failures and field/qualified outcomes. No invented ROI.
- Unfulfilled packages remain explicit **Blocked / Proposed / Unknown** rather than declared done.

**Immediate STOP:** mismatched source identity; unreviewed source promoted into clinical advice; loss of source/limitation text; unauthorized external action; missing security/claim/a11y gate; failed required workflow; head/base drift; unverifiable production status; WIP overflow; competing authority registry.

## 9. Ownership, outputs and next generation

Project control owns issue/backlog/sprint truth. Existing research intake owns source verification and reservation; science/evidence governance owns reviewed claims; editorial owns approved publications; SocialOS and its provider adapters own exact media/publishing receipts; CI/security/release governance owns required checks and deployment. A new adapter must **not** become a rival owner.

One week-one review should classify every candidate as `KEEP / EXTEND / INTEGRATE / BLOCK / RETIRE` with explicit migration owner and proof. Future generations may add authenticated corrections, deeper full-text semantics, comparative evidence, knowledge-frontier missions, reader-facing research experiences and governed feedback loops **after** independently verified source/claim boundaries are in place.

**Success looks like the next set of capabilities being easier to build, safer to connect, faster to validate, and more useful to readers.** Code output is only an intermediate result; measured user value and scientific trust are the final outcomes.
