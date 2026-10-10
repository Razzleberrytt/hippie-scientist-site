# AI Collaboration Handoff — Muse ↔ ChatGPT (via Will)

Versioned cross-agent working record for The Hippie Scientist research-to-production
pipeline. Git history is the versioning. Neither agent relies on memory alone.

## 0. Collaboration protocol (agreed 2026-10-09)

**Roles**

- ChatGPT — scientific intelligence & architecture: research synthesis, evidence
  evaluation, semantic relationships, system design, architectural critique, and
  implementation specifications with measurable acceptance criteria.
- Muse — autonomous engineering & execution: inspect the actual repository,
  challenge specs against the existing architecture, implement worthwhile changes,
  run scoped verification, deploy only on Willie's explicit approval, and return
  verifiable results.

**Shared responsibility** — neither agent blindly accepts the other's conclusions.
Each actively looks for weaknesses in the other's recommendations.

**Rules**

1. Never report projected capabilities as completed capabilities.
2. Implementation is separate from approval. Muse never merges without Willie.
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
  degrading gracefully to `unresolved` elsewhere.
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

## Round 1 — Claim DNA Foundation v0.1 (PROPOSED — pending Willie's approval)

### Hypothesis

Making the intelligence we already built interoperable through a shared
claim→evidence identity layer yields more scientific value than adding new
intelligence systems.

### Deliverables

1. Canonical claim-to-evidence reference model on existing production claim IDs:
   one claim → zero, one, or many references; each reference typed
   `supports | contradicts | qualifies | context`.
2. Audited vocabulary migration: split `evidence_tier` into three controlled
   vocabularies — `study_design`, `certainty`, `provenance_status` — plus
   `claim_type` (direct empirical finding · evidence synthesis · mechanistic
   interpretation · safety/interaction statement · editorial interpretation).
   Every original string preserved verbatim as legacy metadata; ambiguous values
   → `review_required`, never silently mapped.
3. Nullable structured fields on the claim schema: dose, formulation, population,
   comparator, outcome, duration.
4. Explicit provenance states:
   `primary_linked | secondary_linked | editorial_documented | unresolved | review_required`.
   Provenance is not evidence strength.
5. Adapter `lib/claim-dna-adapter.ts` (read-only in R1): `claims.json` →
   `ResearchClaim`/`ResearchProfile` for the existing `research-claim-*`
   modules; PMID-keyed bridge into suite case files where the register covers.
6. Precomputed, deterministic Claim DNA artifact (static JSON; no runtime API —
   static-export compatible).
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

### Migration safeguards

- Additive-only schema changes; originals preserved verbatim as `legacy_*`.
- Vocabulary mapping is an audited in-repo table; unmapped → `review_required`.
- Adapter is read-only over `claims.json` in R1 (no production data writes).
- No fabricated dosages/populations; `unresolved` stays `unresolved`.

### Scoped validation (no full build per iteration)

- Typecheck touched lib files; adapter unit tests (508 claims map without loss;
  PMID resolution rate reported, not asserted).
- Determinism: generate artifact twice, byte-compare.
- Targeted regression: herb pages consuming claims render unchanged.

---

## Open questions for ChatGPT

1. Trial identity: keep publication-identity-only in R1 (current safety posture)
   and defer trial/cohort resolution until explicit registry-ID fields exist?
2. The 274 PMID-less claims: pilot includes `editorial_documented`/`unresolved`
   strata — acceptable?
3. Evidence Integrity Diagnostics (orphan claims/evidence, claim–evidence
   mismatches, duplication, drift): R1 as internal review signals, or defer
   entirely to R2?
4. Will you draft the initial `study_design` / `certainty` / `claim_type`
   controlled vocabularies for review?

## Parked for Round 2

- Evidence Integrity Diagnostics as user-visible features (R1: internal signals).
- Trial/cohort identity resolution (needs explicit registry-ID fields + policy).
- Surfacing CI intelligence output on herb/compound pages.
