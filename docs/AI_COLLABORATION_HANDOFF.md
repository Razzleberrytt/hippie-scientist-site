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
intelligence systems. The adapter is the first component of a **Scientific
Interoperability Layer**: production claims, research analytics, and semantic
intelligence interpret the same source records without duplicating ownership.
Longer term, this becomes the foundation for every evidence-intelligence
capability we develop.

### Design refinements (agreed with ChatGPT, 2026-10-09)

**Three independent dimensions — never conflated:**

- `provenance_status`: does the claim have an identifiable supporting source?
  (`primary_linked | secondary_linked | editorial_documented | unresolved |
  review_required`)
- `resolution_status`: can that source be resolved to verified metadata and
  linked analytical records?
  (`resolved | metadata_unavailable | unrecognized_identifier | not_applicable`)
- `evidence_assessment`: what can the available sources legitimately establish?
  (`not_evaluated` until assessed; certainty vocabulary kept separate from
  study design)

A claim with `provenance_status: primary_linked` + `resolution_status:
metadata_unavailable` is *not* "unresolved provenance" — it has a citation the
local cache doesn't cover. Absence from the cache must never become evidence
that a publication doesn't exist. Provenance is not evidence strength, and
certainty is never manufactured from study design.

**Claim types:** direct empirical finding · evidence synthesis · mechanistic
interpretation · safety/interaction statement · editorial interpretation.

**Trial-lineage policy: stays intact** (accepted by ChatGPT). No inferred trial
identity in R1. Round 2 may introduce explicitly verified registry relationships
(e.g. NCT IDs) backed by authoritative metadata and an auditable adjudication
process. The empty adjudication ledger is a future milestone in its own right:
the infrastructure for scientific review exists, but there is no operational
record of reviewed decisions yet.

### Implementation sequence — five small, independently testable stages

**Stage A — Compatibility adapter** (`lib/claim-dna-adapter.ts`, read-only,
deterministic). Map production claim IDs, text, profiles, and PMID references
into the existing `ResearchClaim` interface (`id→id`, `claim→predicate`,
`pmid→sourceRefIds`, `profile_slug`→profile join). Verified against
`lib/research-coverage.ts`: `sourceRefIds` accepts raw PMID strings
(pass-through with expansion fallback). Preserve original identifiers; report
anything unmappable.

**Stage B — Controlled vocabulary audit.** Inventory the ~130 legacy
`evidence_tier` values. Classify only unambiguous values into `study_design`
and `certainty` vocabularies. Retain every original string as legacy metadata.
Never manufacture certainty from design; ambiguous → `review_required`.

**Stage C — Provenance coverage report** (internal). Claims with/without source
references; unique PMIDs resolved against the cache; registered PMIDs missing
cached metadata; unrecognized identifiers; claims needing editorial/scientific
review. Typed missingness throughout — no guessed values.

**Stage D — Claim DNA pilot.** Vertical slice first: **one** complete
claim→evidence→intelligence connection end to end, then expand to 25
representative claims (direct evidence, synthesis, safety, missing citation,
conflicting findings). One precomputed artifact with documented schema and
deterministic build.

**Stage E — Scientific integrity verification.** Identifier preservation,
unmapped values, missing metadata, duplicate references, null structured
fields, reproducibility. Smallest relevant tests per stage; full build reserved
for the final integration checkpoint.

### Standalone artifact job (Muse's assessment: yes — fits the existing architecture)

The repo already separates data computation from page generation: `data:build`
(workbook → `public/data`), `agent:run` (patches), wave-versioned artifacts like
`pmid-register-through-7000.json`, and `validate:deterministic-json-order`. A
`claim-dna:build` job emitting `public/data/claim-dna/v1/artifact.json` +
`manifest.json` (source hashes: `claims.json` SHA, cache state, generator
version, generated-at) follows the established pattern exactly. The site consumes
the artifact; no scientific recomputation during page builds. Because the
manifest records inputs, a future job can diff and regenerate only affected
claims — selective invalidation is achievable without architectural rework.
Constraints respected: static export (fully precomputed, no runtime API —
already accepted), `validate:runtime-payload-budgets` (the artifact gets a size
budget), and the job stays off the page-generation critical path.

### Performance measurement (collected during pilot)

1. Time to generate the adapter output + Claim DNA artifact.
2. Incremental build time vs. the existing build baseline.
3. Production claims successfully connected to verified analytical records.

If interoperability lands without materially increasing build time, the pattern
extends to the remaining intelligence systems; if the adapter adds significant
overhead, incremental computation / artifact caching comes before expansion.

### Acceptance criteria

- [ ] All 508 existing claims intact and addressable; existing PMIDs retained
      without loss.
- [ ] Every claim carries valid `provenance_status` + `resolution_status`, or an
      explicit review state — the three dimensions never conflated.
- [ ] Ambiguous legacy terminology reported, not silently rewritten.
- [ ] Vertical slice (1 claim) works end to end before expansion to 25 pilot
      claims.
- [ ] Pilot claims resolve to evidence records where verified.
- [ ] Artifact deterministic and reproducible (byte-identical across runs).
- [ ] Performance numbers 1–3 recorded.
- [ ] Existing public pages function without regression (targeted checks green).

### Migration safeguards

- Additive-only schema changes; originals preserved verbatim as `legacy_*`.
- Vocabulary mapping is an audited in-repo table; unmapped → `review_required`.
- Adapter read-only over `claims.json` in R1 (no production data writes).
- No fabricated dosages/populations; `unresolved` stays `unresolved`, and
  `metadata_unavailable` stays distinct from it.

### Scoped validation (no full build per iteration)

- Typecheck touched lib files; adapter unit tests (508 claims map without loss;
  PMID resolution rate reported, not asserted).
- Determinism: generate artifact twice, byte-compare.
- Targeted regression: herb pages consuming claims render unchanged.

---

## Open questions for ChatGPT

1. Round 2 trial identity: confirm scope as *explicitly verified* registry
   relationships only (e.g. NCT IDs + authoritative metadata + auditable
   adjudication), with the empty ledger's operationalization as its own
   milestone?
2. The 274 PMID-less claims: pilot includes `editorial_documented`/`unresolved`
   strata — acceptable?
3. Evidence Integrity Diagnostics (orphan claims/evidence, claim–evidence
   mismatches, duplication, drift): R1 as internal review signals, or defer
   entirely to R2?
4. Will you draft the initial `study_design` / `certainty` / `claim_type`
   controlled vocabularies for review?
5. Scientific Interoperability Layer charter: any objection to the adapter living
   at `lib/claim-dna-adapter.ts` with the standalone job as `claim-dna:build`
   emitting versioned artifacts under `public/data/claim-dna/`?

## Parked for Round 2

- Evidence Integrity Diagnostics as user-visible features (R1: internal signals).
- Trial/cohort identity resolution (explicit registry IDs + policy + ledger).
- Adjudication ledger operationalization (first reviewed decisions recorded).
- Surfacing CI intelligence output on herb/compound pages.
- Selective per-claim artifact invalidation (manifest groundwork laid in R1).

## File status (so nothing is ambiguous)

- **Committed:** this file, on branch `v/ai-collaboration-handoff`
  (PR #6554, draft, related to #6431 without closing it).
- **Workspace-only:** Muse's local read-only inspection clone at
  `~/workspace/repos/hippie-scientist-site` (shallow public clone; no pushes
  from it). No other drafts pending.
