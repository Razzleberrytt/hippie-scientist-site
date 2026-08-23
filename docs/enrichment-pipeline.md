# Canonical enrichment pipeline

A gap-driven, resumable enrichment pipeline for the canonical herb/compound
workbook. It replaces alphabetical batch allocation with a deterministic queue
ranked by value and risk, keeps every research output isolated from canonical
data until a human accepts it, and reuses the repository's existing patch review
and atomic write path instead of adding a second way to write the workbook.

- **Code:** `scripts/enrichment-pipeline/`
- **Contract:** `scripts/enrichment-pipeline/contract/`
- **State:** `ops/enrichment/` (generated, disposable, git-ignored)
- **Tests:** `scripts/enrichment-pipeline/__tests__/` — `npm run enrich:test`

---

## 1. Source of truth

`data-sources/herb_monograph_master.xlsx` is authoritative. Everything in
`public/data/**` is generated from it and is disposable.

The pipeline reads the workbook through one module (`lib/canonical.mjs`) and
**never writes it**. The only way a pipeline result reaches canonical data is:

```
validated candidate
  → exported as a proposal in data-sources/workbook-patches/*.json
  → reviewed in Git; a human edits status: "proposal" → "approved"
  → applied by the existing scripts/data/apply-workbook-patch.mjs (atomic, in place)
  → npm run data:build → public/data
```

That runner already rejects stale patches, refuses governance columns, requires
DOI-backed sources, and demands an explicit acknowledgement flag for dosage,
safety, interaction, and evidence-grade fields. The pipeline inherits all of it.

---

## 2. Architecture

```
data-sources/herb_monograph_master.xlsx        ← canonical, read-only to this pipeline
        │
        │  lib/canonical.mjs  (single read path)
        ▼
   scan ─────────────────────────────────────► ops/enrichment/queue.json
        │  lib/scanner.mjs + lib/contract.mjs
        │  · one job per (entity, coherent field group)
        │  · deterministic job_id = hash(entity_type, slug, sorted fields)
        │  · populated cells are never re-queued
        ▼
   prioritize                                    lib/priority.mjs
        │  · value score from signals that already exist in the repo
        │  · risk band from safety / claim-integrity rules (field-scoped)
        │  · alphabetical order is a tie-break only
        ▼
   claim ────────────────────────────────────► ops/enrichment/jobs.json
        │  lib/job-store.mjs
        │  · exclusive claims, stale-claim recovery, attempt limits
        │  · deterministic sharding for parallel workers
        ▼
   work                                          lib/worker.mjs
        │  · brief carries ONLY the requested fields
        │  · plus sources the site already holds for that entity
        ▼
   candidate ────────────────────────────────► ops/enrichment/candidates/*.json
        │  lib/candidates.mjs — isolated; cannot resolve to a canonical path
        ▼
   normalize                                     lib/normalize.mjs
        │  · DOI / PMID / PMCID / URL identity, value normalizers
        │  · deterministic and idempotent
        ▼
   validate                                      lib/validators.mjs
        │  · contract · scientific integrity · citations · production integrity
        │  · overwrite protection → apply / no-op / review
        ▼
   export ───────────────────────────────────► data-sources/workbook-patches/*.json  (status: proposal)
        │  lib/exporter.mjs                      ops/enrichment/exports/*-review.json
        ▼
   HUMAN REVIEW  ── status: proposal → approved ──┐
        │                                          │
   dry-run import                                  │ lib/importer.mjs
        │  · classifies addition / change / no-op / conflict / skip
        │  · asserts the workbook was not touched
        ▼                                          │
   import ◄───────────────────────────────────────┘
        │  · blocked unless ops/enrichment/readiness.json is approved
        │  · drives apply-workbook-patch.mjs (atomic temp-file + rename)
        │  · re-reads the workbook and proves the result is idempotent
        ▼
   npm run data:build → public/data → production QA
```

---

## 3. The contract

`scripts/enrichment-pipeline/contract/enrichment-contract.json` classifies **all
52 Entity_Master columns**. Every entry carries a rationale.

| Mode | Count | Meaning |
|------|-------|---------|
| `automatic` | 7 | May be written by an approved import, subject to its overwrite policy. |
| `manual-review` | 12 | Researched and exported, but a human accepts every value. |
| `derived` | 11 | Computed by the build or counted from the registers. Never written. |
| `prohibited` | 22 | Identity, publishing, governance, regulatory. Never written. |

Automatic fields: `latin_name`, `secondary_effects`, `canonical_pathways`,
`canonical_ecosystem`, `topic_ecosystems`, `description`, `keywords`.

Overwrite policies:

| Policy | Behaviour |
|--------|-----------|
| `never` | The pipeline never writes the field. |
| `only-if-empty` | Fills an empty cell. A populated cell is a no-op when equivalent, otherwise it routes to review. |
| `only-if-higher-confidence` | Fills an empty cell; replaces a populated one only with strictly stronger evidence *and* high confidence, otherwise review. |
| `manual-review` | Never written automatically. |

Source classes and evidence ranks live in
`contract/source-classes.json`; scoring weights and research budgets in
`contract/priority-config.json`.

A field marked `automatic` still cannot be written unless it names accepted
source classes that can actually reach its declared evidence floor — the loader
rejects a contract that would create an unfillable or under-evidenced field.

### Fields deliberately excluded

`safety_notes`, `contraindications_or_flags`, `dosage_or_preferred_form`,
`runtime_safety`, `evidence_grade`, `evidence_tier`, `confidence_tier`,
`summary`, `primary_effects_or_targets`, `mechanism_summary`, `class_or_domain`,
and `tags` are researched and queued but never written automatically. They gate
claim language, safety display, or routing, and a wrong value is a user-harm or
compliance risk rather than a cosmetic defect.

---

## 4. Commands

```bash
npm run enrich:doctor        # contract vs. live workbook — run this first
npm run enrich:scan          # read-only gap scan; refreshes the job ledger
npm run enrich:index         # build the local research index
npm run enrich:queue -- --priority P0,P1 --limit 20
npm run enrich:status
npm run enrich:metrics
npm run enrich:test
```

Full CLI:

```bash
node scripts/enrichment-pipeline/cli.mjs <command> [options]

  scan          Scan canonical data for gaps and refresh the job queue (read-only)
  queue         Print the current queue, filtered
  status        Job counts by status, band, and field
  brief         Print the field-limited worker brief for one job
  claim         Claim jobs for a worker (supports --shard/--shards)
  index         Build the local research index
  validate      Normalize and validate candidates; report verdicts
  export        Turn validated candidates into a reviewable workbook patch
  export-xlsx   Write the Queue / Accepted / Needs Review / Failed / Metrics workbook
  import        Apply an approved patch. Requires an approved readiness record
  migrate       Compare a historical spreadsheet against canonical data (dry-run)
  metrics       Print deterministic pipeline metrics
  readiness     Show or initialise the readiness record
  doctor        Check the contract against the live workbook

Filters:  --priority P0,P1  --field latin_name  --entity-type herb
          --mode automatic  --slug ashwagandha  --status pending  --limit 20
Shards:   --shard 0 --shards 4
```

---

## 5. Daily operation

```bash
# 1. Confirm the contract still matches the workbook
npm run enrich:doctor

# 2. Refresh the queue and the research index
npm run enrich:scan
npm run enrich:index

# 3. Pick work by value and risk, not by alphabet
npm run enrich:queue -- --mode automatic --priority P0,P1,P2 --limit 20

# 4. Claim a job and get its brief
node scripts/enrichment-pipeline/cli.mjs claim --worker me --limit 1 --mode automatic
node scripts/enrichment-pipeline/cli.mjs brief --job <job_id>

# 5. Research ONLY the requested fields, then write the candidate to
#    ops/enrichment/candidates/<job_id>.01.json  (see §6 for the shape)

# 6. Normalize + validate
npm run enrich:validate

# 7. Export the validated ones as a reviewable proposal
npm run enrich:export -- --batch 2026-08-23

# 8. Review the proposal in Git. Confirm every value and citation.
#    Then edit the patch: "status": "proposal" -> "approved"

# 9. Dry run — never writes
node scripts/enrichment-pipeline/cli.mjs import --patch data-sources/workbook-patches/<id>.json

# 10. Import (blocked until the readiness record is approved)
node scripts/enrichment-pipeline/cli.mjs import --patch data-sources/workbook-patches/<id>.json --apply

# 11. Regenerate runtime data and verify
npm run data:build:core
npm run guard:source-of-truth
npm run validate:evidence-language
npm run validate:workbook-patches

# 12. Mark the patch "applied" in the same pull request, and record metrics
npm run enrich:metrics
```

Parallel workers:

```bash
node scripts/enrichment-pipeline/cli.mjs claim --worker w0 --shard 0 --shards 4 --limit 25
node scripts/enrichment-pipeline/cli.mjs claim --worker w1 --shard 1 --shards 4 --limit 25
```

Shards are derived from the job id, so they are stable across rescans and two
workers on different shard indices can never receive the same job.

---

## 6. Candidate format

A candidate is a delta, never a rewritten entity. It is rejected if it touches a
field its job did not request.

```json
{
  "candidate_version": 1,
  "candidate_id": "cand_…",
  "job_id": "job_…",
  "worker": "me",
  "created_at": "2026-08-23T00:00:00.000Z",
  "entity": { "type": "herb", "slug": "some-herb", "sheet": "Entity_Master" },
  "requested_fields": ["latin_name"],
  "changes": [
    {
      "field": "latin_name",
      "operation": "set",
      "current_value": "",
      "proposed_value": "Withania somnifera",
      "confidence": "high",
      "evidence_level": "regulatory-monograph",
      "source_ids": ["powo-1"],
      "rationale": "Accepted name per Plants of the World Online.",
      "negative_or_null_finding": false,
      "contradicts_existing_evidence": false
    }
  ],
  "sources": [
    {
      "id": "powo-1",
      "class": "reference-database-authority",
      "url": "https://powo.science.kew.org/taxon/…",
      "title": "Withania somnifera (L.) Dunal",
      "year": 2024
    }
  ],
  "provenance": {
    "sources_examined": 3,
    "sources_reused": 1,
    "sources_new": 1,
    "external_research_required": true
  }
}
```

`"operation": "no-op"` with a rationale is a valid and useful answer — it records
that the field was researched and nothing adequately supported was found, so the
job is not re-run blindly.

---

## 7. Review, conflicts, and recovery

**What routes to a human**

- any `manual-review` field, even when the cell is empty;
- any automatic field flagged `requires_human_review` (`secondary_effects`, `description`);
- any proposal that would replace a populated cell;
- a value that contradicts evidence already recorded for the entity;
- an evidence label that does not match the cited study design.

These land in `ops/enrichment/exports/<batch>-review.json` and in the
**Needs Review** sheet of `enrich export-xlsx`. Nothing is silently dropped.

**Conflicts.** A patch whose `expected_old_value` no longer matches the workbook
is stale. `import --dry-run` reports it as a conflict and the apply path refuses
to run. Rescan and re-run the job against the current value.

**Stale claims.** A worker that dies leaves its job claimed. Any later claim
older than 30 minutes is recovered automatically; `recoverStaleClaims()` returns
them to the pool without claiming them.

**Failed jobs.** Three attempts, then the job moves to `failed` and is not
retried. Inspect `errors[]` on the job in `ops/enrichment/jobs.json`.

**Rollback.** The workbook is a tracked file and the runner writes it in one
atomic replacement, so an import is a single-file change:

```bash
git checkout -- data-sources/herb_monograph_master.xlsx
npm run data:build:core
npm run guard:source-of-truth
```

**Losing pipeline state is not a problem.** `ops/enrichment/` is rebuildable:
`npm run enrich:scan` reproduces identical job ids from unchanged canonical data.

---

## 8. Gates

Infrastructure, isolated candidates, dry runs, and migration analysis are always
permitted. **No production-facing enrichment may run before G13.**

| Gate | What it certifies |
|------|-------------------|
| G0 | Baseline recorded — see `docs/enrichment/phase-0-baseline.md` |
| G1 | Every enrichable field has a validated contract entry; unsafe fields excluded |
| G2 | Scanner is read-only; job ids and rescans are deterministic |
| G3 | Jobs survive interruption; candidates cannot reach a canonical path |
| G4 | Normalization and source identity are deterministic; citations deduplicate |
| G5 | Invalid candidates cannot reach the importer; populated fields are protected |
| G6 | Dry runs do not write; failed imports leave nothing partial; repeats are no-ops |
| G7 | Scoring is deterministic; P0 risk outranks traffic; budgets are enforced |
| G8 | The local source index is searched before external research |
| G9 | Shards are disjoint; claims are exclusive; stale claims recover |
| G10 | Historical spreadsheets migrate through the normal candidate path |
| G11 | CLI and metrics available; production import fails closed |
| G12 | This document |
| **G13** | **Human-approved readiness record. The first gate that authorises any production write.** ✅ approved 2026-08-23 |
| **G14** | **Pilot approved. The gate that authorises ongoing incremental enrichment.** ✅ passed — `docs/enrichment/pilot-1-latin-name.md` |

Pilot 1 filled six `latin_name` cells from the GBIF Backbone Taxonomy, recorded
four no-ops, and found two defects that unit tests had missed (see §9.7). Ongoing
enrichment is authorised for `latin_name` only; any new field, parallel workers,
or spreadsheet migration needs a fresh readiness record.

### G13 — production-enrichment readiness

```bash
node scripts/enrichment-pipeline/cli.mjs readiness --init
```

writes an **unapproved** template to `ops/enrichment/readiness.json`. A human
must complete it and set `approved: true`. Until then every import is refused.

The record must name:

- `approved_by`, `approved_at`
- `pilot_scope.description`, `pilot_scope.max_jobs`, `pilot_scope.job_ids`
- `allowed_fields` — no field outside this list can be imported
- `allowed_commands`
- `conflict_reviewer` — who decides review cases
- `rollback_procedure`
- `waived_requirements` — anything knowingly skipped for the pilot

The guard rejects an import whose command, fields, jobs, or batch size fall
outside the approved scope, and it fails closed when the record is missing.

### Pilot shape (Phase 14)

5–10 jobs covering: a missing field and a partial one, a reused source and a new
one, a duplicate source, a conflicting value, a high-priority entity, a
safety-sensitive field, and at least one job that exercises overwrite protection
or produces a no-op. Import, verify, then import again to confirm idempotency.

---

## 9. Known limitations

1. **Entity_Master only.** `edit-entity-master-cell.mjs` is slug-keyed and
   Entity_Master-specific, so there is no safe programmatic write path for
   `Evidence_Register`, `Source_Register`, or `Entity_Relationships`. Additive
   evidence and source rows go through `data-sources/runtime-enrichment/`
   instead, and bibliographic backfill through `npm run citations:fetch-pubmed`
   / `npm run citations:apply-pubmed`. The contract records this explicitly.

2. **Authority sources.** Nomenclatural authorities (POWO, WFO, GBIF, NCBI
   Taxonomy) do not issue DOIs. `apply-workbook-patch.mjs` was extended to accept
   `"source_type": "authority-reference"` with a URL on an allow-listed host —
   but only for `latin_name` and `keywords`. Every claim-bearing field still
   requires a DOI-backed source. This is the one place an existing rule was
   relaxed; it is compensated by the host allow-list and the column allow-list.

3. **`evidence_grade` needs a normalization pass.** The workbook carries 32 raw
   spellings (`c`, `C`, `C+`, `moderate`, `moderate-high`, `F`, `25`, …) and
   `confidence_tier` carries 18. `normalizeEvidenceGradeForComparison` collapses
   them for comparison only; it is not a writer. Both fields stay manual-review.

4. **Some compounds are typed `herb`.** `quercetin`, `resveratrol`, and
   `phosphatidylserine` are `entity_type: herb` in the workbook, so they are
   queued for `latin_name`. That is a canonical data classification issue, not a
   pipeline defect; the correct worker answer is a `no-op`.

5. **No historical spreadsheets are in the repository.** `enrich migrate` accepts
   an operator-supplied `--file` and is tested against synthetic schemas. It has
   not been exercised against a real legacy workbook.

6. **Demand signals are internal.** There is no search-console or analytics feed
   in the repo, so the value score uses runtime visibility, retrieval priority,
   the workbook's own weight columns, the open `Maintenance_Queue` backlog, and
   curated prominence. Real traffic data would improve ranking; nothing is
   fabricated in its absence.

7. **`Maintenance_Queue` statuses mean two different things.** An `open` row is a
   *gap ticket* ("this cell is blank"). Only the statuses listed under
   `disputes_populated_value_statuses` in `priority-config.json` question a value
   that already exists. Conflating them means filling a cell never closes its
   job — the ticket re-queues it forever. This was found by pilot 1, not by a
   unit test; two regression tests now cover it. **After every import, re-run
   `npm run enrich:scan` and confirm the gap count actually falls.**

8. **`claim` does not read the readiness record.** It claims in job-id order, so
   an operator can claim work outside an approved pilot scope. Scope is enforced
   at import, which is where it matters, but release out-of-scope claims before
   working them.

9. **A `no_op` verdict sets the job status to `rejected`.** Accurate — nothing is
   importable — but it reads as failure in `enrich status`. A distinct terminal
   status would be clearer.
