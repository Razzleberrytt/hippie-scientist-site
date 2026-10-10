# AI Collaboration Handoff — Muse ↔ ChatGPT (via Will)

Versioned cross-agent working record for The Hippie Scientist research-to-production
pipeline. Git history is the versioning. Neither agent relies on memory alone.

## 0. Collaboration protocol (agreed 2026-10-09)

**Roles**

- ChatGPT — scientific intelligence, architecture, and delegated PR merge gate:
  research synthesis, evidence evaluation, semantic relationships, design critique,
  measurable acceptance criteria, independent diff review, and merge decisions.
- Muse — autonomous engineering & execution: inspect the actual repository,
  challenge specs against the existing architecture, implement worthwhile changes,
  run scoped verification, propose release candidates, and return verifiable
  results. Muse does not self-authorize merges or deployments.

**Shared responsibility** — neither agent blindly accepts the other's conclusions.
Each actively looks for weaknesses in the other's recommendations.

**Rules**

1. Never report projected capabilities as completed capabilities.
2. Implementation is separate from approval. Will has delegated PR merge management
   to ChatGPT (2026-10-09). ChatGPT evaluates scope, scientific risk, verification,
   and repository protections before merging; Muse does not self-merge. High-risk
   publication, data-loss, security, or scientific-policy changes receive explicit
   heightened review; passing CI alone does not establish scientific correctness.
3. Every completion claim ships with verification evidence (commands run, outputs
   observed, what remains unknown).
4. Legacy data is preserved verbatim; ambiguous values are reported for review,
   never silently rewritten.
5. No fabricated dosages, no inferred trial relationships, no strengthened
   evidence classifications.
6. Each round records: hypothesis, observed baseline, what changed, evidence of
   success, remaining limitations, recommended next experiment.

---

## Round 0 — Verified repository baseline (2026-10-09, main @ `f06657b`)

Inspection of the real repository (not docs) established three evidence systems
with no shared identity:

1. **Production claim store** — `public/data/claims.json`: 508 structured claims
   (`id, title, claim, evidence_tier, profile_slug, study_class, pmid, source_url`),
   consumed on herb pages via `lib/runtime-data.ts`, `lib/study-class.ts`, and
   `lib/evidence-rationale.ts`. 234 of 508 carry PMIDs; 0 carry dosage.
   `evidence_tier` uses ~130 distinct uncontrolled strings (e.g. `RCT`,
   `randomized_double_blind_placebo_controlled_trial`, and
   `randomized double-blind placebo-controlled trial` as three different values).
2. **Build-time/CI intelligence** — `lib/research-claim-{breadth,provenance-independence,evidence-diversity,language-calibration,citation-metadata}.ts`
   plus `research-coverage` / `research-quality-topology`, executed by
   `scripts/ci/research-quality.ts`. These already compute claim breadth across
   population/dose/duration/formulation/endpoint dimensions and
   author/journal-lineage provenance analysis. Real, automated, and invisible to
   visitors.
3. **Quarantined lab** — the 12-capability Scientific Intelligence Suite
   (`lib/scientific-intelligence-suite.ts`: claim-dna → calibration lab) runs real
   computation over a real 500-record source-verified PMID batch with a semantic
   network and an adjudication ledger, but lives only on `/research/intelligence/`
   (noindexed), and nothing on an indexed page imports it.

No Contradiction Observatory UI exists (docs/client mentions only). There is no
join key between a lab "claim DNA" and a production claim id.

### Adapter feasibility: YES — small compatibility layer, no new data model

- `ResearchClaim` (`lib/research-coverage.ts`) is a permissive type
  (`Record<string, unknown>` + optional `id/predicate/confidence/reviewStatus/sourceRefIds`),
  so mapping `claims.json` → `ResearchClaim[]` is trivial
  (`id→id`, `claim→predicate`, `pmid→sourceRefIds`, `profile_slug`→profile join).
- Study metadata already exists: `ops/cache/pubmed-metadata.json` holds 849 PubMed
  records; **168 of 199 (84%)** production claim PMIDs resolve there. The
  cumulative PMID register (`public/data/research/pmid-register-through-7000.json`)
  holds 6,935 PMIDs (111/199 claim PMIDs present).
- The suite's case-file builder is PMID-keyed (`buildResearchCaseFile`), so an
  adapter can feed production PMIDs through it wherever the register covers them,
  reporting `metadata_unavailable` for a referenced PMID missing cached metadata;
  source provenance is tracked separately from cache resolution.
- Conclusion: interoperability via an adapter (`lib/claim-dna-adapter.ts`,
  read-only in R1), not a refactor.

### Study-identity registry assessment: the ledger is an empty vessel

- `ops/research-semantic-adjudications.json` is `{"version":1,"events":[]}` —
  infrastructure without content. It cannot serve as the authoritative registry
  today, but it is the right future home for human/agent adjudication decisions.
- The de-facto registries are the PubMed metadata cache, the cumulative PMID
  register, and the SHA-pinned per-batch receipts — all **publication** identity,
  not trial identity.
- `lib/research-publication-lineage.ts` explicitly refuses inferred trial
  identity ("no authorship/name similarity, graph co-occurrence, shared
  population or inferred trial registry is accepted as proof of underlying study
  independence"; `independentlyVerifiedTrialUnits: null`). Resolving publications
  to shared trial/cohort identities therefore requires a policy decision plus
  explicit registry-ID fields (e.g. NCT numbers) — out of Round 1 scope.

### Records note

- The 203-issue bulk close (2026-10-09) was administrative triage; the full
  pre-close archive is preserved and these are recorded as administrative
  closures, distinct from resolved defects.
- `docs/THS_MASTER_P0_ACCEPTANCE_REGISTER.md` and
  `docs/THS_MASTER_P0_DIRECTIVE_RECOVERY.md` are intact.

---

## Round 1 — Claim DNA Foundation v0.1 (APPROVED FOR IMPLEMENTATION PLANNING; no code merged)

### Hypothesis

Making the intelligence we already built interoperable through a shared
claim→evidence identity layer yields more scientific value than adding new
intelligence systems.

### Deliverables

1. Canonical claim-to-evidence reference model on existing production claim IDs:
   one claim → zero, one, or many references; each reference initially
   `unassessed`, then `supports | contradicts | qualifies | context` only after
   evidence-specific evaluation. A linked citation alone proves no directionality.
2. Audited vocabulary migration: untangle legacy `evidence_tier` into distinct
   controlled concepts: `study_design` (primarily an evidence-record attribute),
   `certainty` (a separately assessed claim/body-of-evidence attribute),
   `provenance_status`, and `claim_type`. Preserve each original string verbatim;
   ambiguous values → `review_required`, never silently mapped. Do not infer
   evidence certainty from study design.
3. Nullable structured fields on the claim schema: dose, formulation, population,
   comparator, outcome, duration.
4. Explicit provenance states:
   `primary_linked | secondary_linked | editorial_documented | unresolved | review_required`.
   Also independently track `resolution_status` (including `metadata_unavailable`)
   and `assessment_status` (`not_evaluated` until legitimately assessed). A present
   PMID absent from local cache is not automatically unresolved provenance.
   Provenance is not evidence strength.
5. Adapter `lib/claim-dna-adapter.ts` (read-only in R1): `claims.json` →
   `ResearchClaim`/`ResearchProfile` for the existing `research-claim-*`
   modules; PMID-keyed bridge into suite case files where the register covers.
6. Precomputed, deterministic, schema-versioned Claim DNA artifact (static JSON;
   no runtime API — static-export compatible). Prefer a standalone build-time
   generation job; site pages consume artifacts without rerunning intelligence.
7. Lightweight validation suite runnable without the full production build.

### Pilot scope

20–30 claims sampled across strata: direct study evidence, multi-study
synthesis, safety/interaction concerns, missing citations, conflicting findings.
Difficult cases, not just easy wins.

### Acceptance criteria

- [ ] All 508 existing claims intact and addressable; existing PMIDs retained
      without loss.
- [ ] Every claim has a valid provenance classification or an explicit review
      state.
- [ ] Ambiguous legacy terminology reported, not silently rewritten.
- [ ] Pilot claims resolve to their evidence records where verified.
- [ ] Generated artifact deterministic and reproducible (byte-identical across
      runs).
- [ ] Existing public pages function without regression (targeted checks green).
- [ ] Baseline and actual generation time, incremental build overhead, and
      verified claim-to-evidence join coverage recorded. Missing/uncached sources
      reported explicitly, not treated as negative evidence.

### Migration safeguards

- Additive-only schema changes; originals preserved verbatim as `legacy_*`.
- Vocabulary mapping is an audited in-repo table; unmapped → `review_required`.
- Adapter is read-only over `claims.json` in R1 (no production data writes).
- No fabricated dosages/populations; unresolved provenance and unavailable
  cached metadata are distinct missingness states.

### Scoped validation (no full build per iteration)

- Typecheck touched lib files; adapter unit tests (508 claims map without loss;
  PMID resolution rate reported, not asserted).
- Determinism: generate artifact twice, byte-compare.
- Targeted regression: herb pages consuming claims render unchanged.

---

## Round 1 decisions (2026-10-09)

1. Trial identity remains publication-level in R1; no inferred trial or cohort
   independence. Explicit, verified trial registry relationships require later
   policy review and auditable adjudication.
2. PMID-less claims are included in the pilot and assigned documented or
   unresolved provenance states as evidence permits. No PMID ≠ unsupported.
3. R1 internal diagnostics are descriptive (missing citations, unresolved
   references, unmatched publications, duplicate identifiers). Scientific
   mismatch and evidence-drift judgments await independently validated logic.
4. **Proposed**, not yet adopted, controlled vocabularies:
   - `study_design`: `systematic_review`, `meta_analysis`, `randomized_trial`,
     `nonrandomized_intervention`, `cohort`, `case_control`, `cross_sectional`,
     `case_series`, `case_report`, `animal`, `in_vitro`, `narrative_review`,
     `other`, `unknown`.
   - `certainty`: `high`, `moderate`, `low`, `very_low`, `insufficient`,
     `not_assessed`.
   - `claim_type`: `direct_empirical`, `evidence_synthesis`,
     `mechanistic_interpretation`, `safety_interaction`, `editorial_interpretation`.
   Validate these against existing field semantics and avoid forced mappings.

## Round 1A — Initial vertical slice (authorized design target)

Use **one** production claim with a verified citation: preserve claim ID,
normalize its source reference without altering its meaning, resolve existing
metadata, run existing research analytics when inputs are sufficient, and emit
an inspectable, deterministic, versioned artifact. No public-page changes yet.
After scoped tests and a measured result, extend to a stratified 25-claim pilot.
All implementation changes require a separate PR and fresh merge review.

## Research-to-Implementation Opportunity Register

For each new proposed system record the hypothesis, scientific rationale,
existing reuse candidates, expected user value, risks, dependencies, measurable
acceptance tests, and Muse's repository-grounded build/adapt/defer/reject call.
No speculative capability is marked as shipped.

## Parked for Round 2

- Evidence Integrity Diagnostics as user-visible features (R1: internal signals).
- Trial/cohort identity resolution (needs explicit registry-ID fields + policy).
- Surfacing CI intelligence output on herb/compound pages.
