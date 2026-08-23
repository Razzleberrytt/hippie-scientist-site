# G13 — production-enrichment readiness evidence

Assembled 2026-08-23 on branch `feat/enrichment-pipeline`.

**Status: APPROVED 2026-08-23.** Approved by the repo owner, delegated to Claude
Code (session `015F1Gnxhg7XJu7E6UBh3HcP`). Scope: `latin_name` only, 10 jobs,
single worker, no spreadsheet migration. The authority-reference policy change in
§3.1 was reviewed and **accepted**.

Pilot 1 ran under this record and passed — see
`docs/enrichment/pilot-1-latin-name.md` for results, the two defects it found,
and the G14 verdict.

The readiness record itself lives at `ops/enrichment/readiness.json`, which is
git-ignored. To reproduce it, run
`node scripts/enrichment-pipeline/cli.mjs readiness --init` and fill in the
template from §4 below.

---

## 1. Evidence against the gate requirements

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Canonical sources and schemas identified | ✅ | `docs/enrichment/phase-0-baseline.md` §1–2 |
| Contract complete for approved pilot fields | ✅ | All 52 Entity_Master columns classified with a rationale; `contract.test.mjs` asserts completeness |
| Unsafe fields excluded or manual-review-only | ✅ | 22 prohibited + 11 derived pinned to `overwrite_policy: never` by the loader; 12 manual-review. `contract.test.mjs` names them explicitly |
| Gap scanning and job ids deterministic | ✅ | `scanner.test.mjs` — byte-identical rescan, id depends only on (entity_type, slug, sorted fields) |
| Jobs granular, resumable, safely retryable | ✅ | `job-store.test.mjs` — on-disk ledger survives process restart; 3-attempt limit; stale-claim recovery |
| Candidate output isolated from canonical data | ✅ | `assertPipelineWritePath` restricts writes to `ops/enrichment/`; `job-store.test.mjs` "write isolation" |
| Workers limited to requested fields | ✅ | `validateCandidateShape` rejects out-of-scope changes; brief omits requested fields from context |
| Normalization and source identity deterministic | ✅ | `normalize.test.mjs` — idempotence asserted for every normalizer; identity precedence DOI → PMID/PMCID → URL → title+year+author |
| Citation deduplication works | ✅ | `normalize.test.mjs` — merges across identifier spellings; refuses title-only identity |
| Scientific and citation validation passes | ✅ | `validators.test.mjs` — certainty language, clinical-claim-without-human-evidence, unlabelled preclinical, unidentified source, duplicate source, non-authority host |
| Contradictory / null / negative / safety evidence handled | ✅ | `contradicts_existing_evidence` → review; `negative_or_null_finding` retained as an INFO finding |
| Populated fields protected; conflicts route to review | ✅ | `validators.test.mjs` "overwrite protection" — equivalent value is a no-op, non-equivalent replacement routes to review |
| Dry runs non-mutating | ✅ | `end-to-end.test.mjs` — asserts workbook size and mtime unchanged, and the real workbook is byte-identical at suite end |
| Failed imports leave nothing partial | ✅ | The runner writes via temp file + rename; the importer surfaces failure without a partial state |
| Repeated imports idempotent | ✅ | `end-to-end.test.mjs` — real apply to a workbook copy, second run reports `{ "no-op": 1 }` |
| Duplicate citations/records prevented | ✅ | `dedupeSources`; `validateCitations` rejects two entries for one source |
| Rollback documented | ✅ | `docs/enrichment-pipeline.md` §7 |
| Priority, field priority, research budgets implemented | ✅ | `scanner.test.mjs` "priority" and "research budgets" — non-alphabetical ordering, P0 risk override, budget specificity |
| Source reuse available | ✅ | 485 distinct sources indexed from 569 + 696 register rows; 363 entities carry sources |
| Parallelism safe | ✅ | `job-store.test.mjs` "sharding" — disjoint, exhaustive, order-independent; two sharded workers claim without overlap |
| Migration safety | ⚠️ | Implemented and unit-tested, but **no historical spreadsheet exists in the repository**, so it has not been exercised against real legacy data. G10 is not required for a pilot that excludes spreadsheet migration. |
| Tests, build, and content checks pass | ✅ | See §2 |
| Baseline counts remain healthy | ✅ | See §2 |
| CLI and runbook documented | ✅ | `docs/enrichment-pipeline.md` |
| Production import fails closed | ✅ | `import.test.mjs` "readiness gate" — 6 refusal cases |
| Unresolved issues classified | ✅ | See §3 |

## 2. Verification results

These record the state **at the moment G13 was approved**, before any production
write. Pilot 1 subsequently changed the workbook by design; its own verification
table is in `docs/enrichment/pilot-1-latin-name.md` §4.

| Check | Baseline (`d7de88fb5`) | After | Verdict |
|-------|------------------------|-------|---------|
| `npm run test` | 490 files / 2,249 tests pass | **497 files / 2,398 tests pass** | +7 files, +149 tests, 0 regressions |
| `npm run lint` | pass | pass | clean |
| `npm run typecheck` | pass | pass | clean |
| `validate-workbook-source` | PASS | PASS | unchanged |
| `validate-workbook-schema` | PASS (1 pre-existing warning) | PASS (same warning) | unchanged |
| `validate-workbook-patches` | PASS, 14 records | PASS, 14 records | unchanged after the runner change |
| `validate-xlsx-boundary` | OK | OK | unchanged |
| `guard:source-of-truth` | PASS | PASS | unchanged |
| Entity content hash | `b4c542aee4a0b04d` | `b4c542aee4a0b04d` | **canonical data provably untouched** |
| Entity_Master rows | 881 (herb 293 / compound 588) | 881 | unchanged |
| `public/data` herbs / compounds | 291 / 565 | 291 / 565 | unchanged |
| Duplicate slugs | 0 | 0 | unchanged |

No production file was modified. The diff is: new pipeline code and tests, two
new documents, `.gitignore`, `package.json` scripts, and one scoped change to
`scripts/data/apply-workbook-patch.mjs` (see §3.1).

## 3. Unresolved issues

### Blockers for a *broad* rollout — none. Blockers for a *pilot* — none.

### 3.1 Policy change requiring explicit sign-off — ACCEPTED 2026-08-23

`scripts/data/apply-workbook-patch.mjs` previously required a valid DOI on every
source. Nomenclatural authorities (POWO, WFO, GBIF, NCBI Taxonomy) do not issue
DOIs, which made `latin_name` — the largest automatic gap at 107 herbs —
un-importable through the reviewed path.

The runner now accepts `"source_type": "authority-reference"` with a URL on an
allow-listed host, **and** refuses such a source as sole support for any column
outside `{latin_name, keywords}`. Every claim-bearing field still requires a
DOI-backed source. All 14 existing patch records still validate unchanged.

**Accepted.** It relaxes an existing rule, and was reviewed and kept on two
grounds: for nomenclature a taxonomic authority is a *better* source than a
journal article, not a weaker one; and the exemption is fenced on both sides —
an allow-list of authority hosts, and an allow-list of two non-claim-bearing
columns. Pilot 1 exercised this path for all six imported values.

### 3.2 Non-blocking

| Issue | Impact |
|-------|--------|
| `evidence_grade` has 32 raw spellings, `confidence_tier` 18 | Both stay manual-review; a normalization pass is recommended before either is ever automated |
| `quercetin`, `resveratrol`, `phosphatidylserine` typed `herb` | They queue for `latin_name`; correct worker answer is a no-op. Canonical classification issue, not a pipeline defect |
| `scripts/data/audit-workbook-gaps.mjs` targets sheets that no longer exist | Pre-existing; degrades silently to zero gaps. Superseded by the new scanner. Left in place — removing it is out of scope |
| `validate-workbook-schema` warns `summary_quality` is absent | Pre-existing, informational |
| Migration untested against real legacy data | G10 unmet; exclude spreadsheet migration from the pilot scope |
| No search-console or analytics feed | Value scoring uses internal signals only; nothing is fabricated |

## 4. Recommended pilot scope

Everything below goes into `ops/enrichment/readiness.json`. Adjust before approving.

```jsonc
{
  "readiness_version": 1,
  "gate": "G13",
  "approved": true,
  "approved_by": "<name>",
  "approved_at": "<date>",
  "pilot_scope": {
    "description": "First controlled pilot: latin_name backfill on herbs, single worker, no spreadsheet migration.",
    "max_jobs": 10,
    "job_ids": ["<10 job ids from: npm run enrich:queue -- --field latin_name --mode automatic --limit 10>"]
  },
  "allowed_fields": ["latin_name"],
  "allowed_commands": ["scan", "queue", "status", "brief", "claim", "index", "validate", "export", "import"],
  "waived_requirements": [
    "G10 migration — no historical spreadsheet is in scope for this pilot",
    "G9 parallelism — the pilot is single-worker"
  ],
  "conflict_reviewer": "<name>",
  "rollback_procedure": "git checkout -- data-sources/herb_monograph_master.xlsx && npm run data:build:core && npm run guard:source-of-truth",
  "notes": "Accepts the authority-reference source policy change recorded in docs/enrichment/g13-readiness-evidence.md §3.1."
}
```

`latin_name` is the recommended first field: highest-volume automatic gap (107),
verifiable against a nomenclatural authority, not a health claim, `only-if-empty`,
and it exercises the authority-source path that §3.1 asks the reviewer to accept.

To satisfy the Phase 14 pilot shape, add to the ten jobs at least one entity that
already has a `latin_name` (to prove overwrite protection produces a review) and
one of `quercetin` / `resveratrol` / `phosphatidylserine` (to prove a no-op is
recorded rather than a guess).

## 5. Reviewer checklist

- [ ] Accept or revert the authority-reference source policy change (§3.1)
- [ ] Confirm the automatic field list in `enrichment-contract.json`
- [ ] Confirm the manual-review field list, especially the safety fields
- [ ] Choose the pilot fields and job ids
- [ ] Name the conflict reviewer
- [ ] Confirm the rollback procedure
- [ ] `node scripts/enrichment-pipeline/cli.mjs readiness --init`, complete it, set `approved: true`
- [ ] Run the pilot per `docs/enrichment-pipeline.md` §5, then re-import to confirm idempotency
- [ ] Record the outcome and approve G14 before any broader enrichment
