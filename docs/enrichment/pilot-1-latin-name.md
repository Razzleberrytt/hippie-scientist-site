# Pilot 1 — `latin_name` backfill (G14 record)

Run 2026-08-23 on branch `pilot/enrichment-latin-name`, under the G13 readiness
record approved the same day.

**Outcome: pass.** Six canonical cells were filled, four jobs correctly returned
no-ops, the re-import was a pure no-op, and two real defects were found and fixed.

---

## 1. Scope

Approved: `latin_name` only, 10 jobs, single worker, no spreadsheet migration.
Waived in the readiness record: G8 (source reuse), G9 (parallelism), G10 (migration).

Every proposed value was resolved against the **GBIF Backbone Taxonomy**
(`api.gbif.org/v1/species/match?strict=true`). Only `status: ACCEPTED`,
`matchType: EXACT`, `rank: SPECIES` results were proposed. Values are bare
binomials with no authority string, matching all 186 `latin_name` values already
in `Entity_Master`.

## 2. Results

### Imported (6)

| slug | value | GBIF usageKey | kingdom / family |
|------|-------|---------------|------------------|
| `lavandula-angustifolia` | Lavandula angustifolia | 2927305 | Plantae / Lamiaceae |
| `ginkgo-biloba` | Ginkgo biloba | 2687885 | Plantae / Ginkgoaceae |
| `elettaria-cardamomum` | Elettaria cardamomum | 2759871 | Plantae / Zingiberaceae |
| `ocimum-basilicum` | Ocimum basilicum | 2927096 | Plantae / Lamiaceae |
| `hericium-erinaceus` | Hericium erinaceus | 5248508 | Fungi / Hericiaceae |
| `eleuthero` | Eleutherococcus senticosus | 3035369 | Plantae / Araliaceae |

### No-ops (4) — researched, nothing proposed

| slug | why |
|------|-----|
| `coleus-forskohlii` | Genuinely contested. GBIF returns *Coleus forskohlii* (5605671) as a **synonym** of *Coleus hadiensis* (10964472), while the other commercial name *Plectranthus barbatus* (6412796) is a **synonym** of *Coleus barbatus* (8030165). The two names in common use resolve to **two different accepted species**. Proposing either would pick a side of an open taxonomic question. → human decision |
| `astragalus` | The entity is genus-level. The supplement species is *Astragalus mongholicus* Bunge (5345341); *A. membranaceus* Fisch. (11044089) is a homotypic synonym of it. Whether this profile means the genus or that one species is an editorial scoping decision, not a lookup. → human decision |
| `quercetin` | Not a taxon — a flavonol. Queued only because it is `entity_type: herb` in Entity_Master. The classification is what needs fixing, not the cell. |
| `phosphatidylserine` | Not a taxon — a phospholipid. Same misclassification. |

## 3. Required pilot coverage

| Requirement | How it was met |
|-------------|----------------|
| Missing field filled | 6 empty cells filled |
| No-op behaviour | 4 jobs returned no-ops with rationales, and wrote nothing |
| Duplicate source prevented | Attempt 1 for `lavandula-angustifolia` deliberately cited the same GBIF record twice — once plain, once with `?utm_source=taxonomy-pass`. Normalization collapsed them to one identity and `validateCitations` raised `duplicate-source`. **The candidate was rejected even though its change decision was a valid APPLY** — an error blocks import regardless. Attempt 2 shipped clean. |
| Conflict routed to a human | `coleus-forskohlii` and `astragalus`: two real taxonomic conflicts, neither resolved automatically |
| High-priority entity | `quercetin` (P2, the highest-scoring `latin_name` job) |
| Overwrite protection | Not exercised in production — no pilot entity had a populated `latin_name`. Covered by `validators.test.mjs`, which asserts an equivalent value is a no-op and a non-equivalent replacement routes to review |
| Interrupt / resume | `lavandula-angustifolia` was rejected, released to `pending`, re-claimed in a **separate process** reading the on-disk ledger, and completed on attempt 2 with `attempts` correctly at 2 |
| Repeat import is a no-op | Second `import --apply` reported `{"no-op": 6}` and never invoked the workbook runner |
| Traceability | Every change carries its job id and candidate id in the patch rationale; the patch records all six `job_ids` |
| No out-of-scope change | The first `claim` grabbed 10 jobs in id order rather than the approved set; they were released before any work. Only the 10 approved job ids were worked, and only `latin_name` was touched |

## 4. Verification

| Check | Result |
|-------|--------|
| Dry run | 6 additions, 0 conflicts, workbook byte-unchanged |
| Import | 6 additions applied atomically in place |
| Re-import | `{"no-op": 6}` — idempotent, runner not invoked |
| Entity content hash | `b4c542aee4a0b04d` → `94385c29ac07cf43` |
| Entity counts | herb 293 / compound 588 — unchanged |
| `validate-workbook-patches` | PASS, 15 records. The `applied` path re-checks every `new_value` against the live workbook, independently confirming all six landed |
| `guard:source-of-truth` | PASS, parity holds both directions, no duplicate slugs |
| `npm run test` | 497 files / 2,400 tests pass |
| Rescan | 4,768 → 4,762 gaps; `latin_name` 107 → 101; exactly the 6 jobs retired |

### Generated data was deliberately not committed

`npm run data:build:core` produced **1,736 changed files** in `public/data`,
almost none of it from this change: `ai-entities/*` flipped evidence labels
(`Moderate Human Evidence` → `Moderate evidence`, `low-moderate` → `B`) and
rewrote author blocks, and `herbs.json` showed 4,929 insertions. That is the
known divergence between the core build and the full build, not a result of the
pilot. `public/data` was reverted; the workbook and the patch record are the
durable artifacts, and the deploy build regenerates runtime data from the
workbook. `guard:source-of-truth` passes with the updated workbook against the
committed `public/data`.

## 5. Defects found and fixed

The pilot's real value was catching two bugs that no unit test had.

### 5.1 The queue never closed (blocking — fixed)

After importing, a rescan still reported 4,768 gaps and 107 `latin_name` jobs.
The six filled cells were being **re-queued as `unsupported`**.

Cause: `maintenanceDeficiencies` treated any *open* `Maintenance_Queue` row for
a field as a dispute of that field's value. But an `open` row is a **gap ticket**
— "this cell is blank, go find a value". Once filled, the ticket is stale, not a
dispute, so the same ticket re-queued the cell forever.

Fix: only statuses that explicitly question an existing value
(`latin_name_present_needs_authority_check`,
`needs_taxonomy_authority_verification`) can re-queue a populated cell. Now
declared separately as `disputes_populated_value_statuses` in
`priority-config.json`. Two regression tests added.

### 5.2 Retried jobs were counted twice (fixed)

`validate`, `export`, and `metrics` read every candidate file, so a retried job
appeared once per attempt. `export` would have emitted the same `(slug, column)`
twice — a duplicate edit the workbook runner rejects, so it failed safe, but it
was wrong. Added `latestCandidates()`; metrics now report `attempts_total` and
`retries` separately.

## 6. Observations for the next round

1. **`no_op` maps to job status `rejected`.** Accurate in the sense that no
   change is importable, but it reads as failure in `status`. Consider a
   distinct terminal status.
2. **The pilot worker rewrote all 10 candidates at attempt 2**, so `retries`
   reads 10 when only one job genuinely needed one. An artifact of the pilot
   script, not the pipeline.
3. **`claim` ignores an approved pilot scope.** It claims by id order; scope is
   only enforced at import. Consider having `claim` read the readiness record.
4. **`quercetin`, `resveratrol`, `phosphatidylserine` are typed `herb`.** They
   will keep surfacing as `latin_name` jobs until reclassified. Worth a separate
   data-correction pass.
5. **Source reuse stayed at 0**, as the readiness record predicted. The earlier
   taxonomy pass covered exactly the entities that already have a `latin_name`,
   so none of the remaining 101 has a reusable taxonomy source. The machinery
   was still exercised: `hericium-erinaceus`'s brief surfaced 7 existing
   evidence sources as leads and the worker correctly declined to cite them,
   because their class is not accepted for `latin_name`.

## 7. Metrics

```
jobs        4768 total — 4758 pending, 4 rejected (no-ops), 6 integrated
            bands P0=396 P2=97 P3=2239 P4=2030
candidates  10 (20 attempts, 10 retries — see §6.2)
            6 fields proposed, 4 no-ops
            6 citations (0.6/candidate)
            0 reused / 6 new  (reuse rate 0 — waived, see §6.5)
            1 duplicate prevented (attempt 1, superseded)
```

## 8. G14 verdict

**Approved for incremental production enrichment**, on these conditions:

- keep batches at or below ~25 jobs per patch so review stays real;
- stay on `latin_name` until the 101 remaining are done, then re-approve scope
  for the next field;
- never commit `public/data` alongside a workbook patch;
- re-run `npm run enrich:scan` after every import and confirm the gap count
  actually falls — that check is what caught §5.1.

Any new field, any move to parallel workers, and any spreadsheet migration needs
a fresh readiness record.
