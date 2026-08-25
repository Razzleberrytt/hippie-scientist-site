# Enrichment pipeline — operational handoff

Built and operated 2026-08-23/24. `latin_name` is complete: every one of its 107
jobs is resolved, and the pipeline is ready for the next field.

---

## 1. What replaced what

**Before.** Enrichment was allocated alphabetically in batches. There was no
record of which fields had been researched and found empty, so the same ground
was re-covered; no separation between research output and canonical data; and no
single place that decided whether a proposed value was safe to write.

**Now.**

```
scan → prioritize → claim → work (requested fields only) → candidate (isolated)
     → normalize → validate → export proposal → HUMAN REVIEW → dry-run → import
```

The pipeline never writes the workbook. Validated candidates become reviewable
patches in `data-sources/workbook-patches/`, which a human moves from `proposal`
to `approved` before the repository's existing atomic runner applies them. That
reuses the patch review, CI validation, and write path that already existed
rather than adding a second way into canonical data.

Important files:

| Path | What |
|------|------|
| `scripts/enrichment-pipeline/contract/` | All 52 Entity_Master columns classified, with weights and budgets |
| `scripts/enrichment-pipeline/lib/scanner.mjs` | Read-only gap scan, deterministic job ids |
| `scripts/enrichment-pipeline/lib/validators.mjs` | Contract, scientific, citation, production checks + overwrite engine |
| `scripts/enrichment-pipeline/lib/taxonomy-policy.mjs` | Synonym resolution rules |
| `scripts/enrichment-pipeline/lib/duplicate-organisms.mjs` | Duplicate-organism audit |
| `scripts/enrichment-pipeline/lib/importer.mjs` | Dry run, readiness gate, idempotency |
| `docs/enrichment-pipeline.md` | Architecture and runbook |

## 2. Routine commands

```bash
npm run enrich:doctor        # contract vs. live workbook — run first
npm run enrich:scan          # read-only gap scan; refreshes the ledger
npm run enrich:index         # local research index
npm run enrich:queue -- --field <field> --mode automatic --limit 25
npm run enrich:status
npm run enrich:duplicates
npm run enrich:metrics
npm run enrich:test
```

Per batch: `claim` → `brief` → research → write candidates → `validate` →
`export` → review the patch in Git → set `approved` → `import` (dry run) →
`import --apply` → set `applied` → `enrich:scan` and **confirm the gap count
falls**.

## 3. `latin_name` results

| | |
|---|---|
| populated | **186 → 253** of 293 herbs |
| jobs resolved | 107 of 107 — **0 pending** |
| imported | 67 |
| no-op, reason recorded | 33 |
| decided shared-value cases | 7 |

| Batch | Jobs | Filled | Record |
|-------|------|--------|--------|
| Pilot 1 | 10 | 6 | `pilot-1-latin-name.md` |
| Batch 2 | 25 | 17 | `batch-2-latin-name.md` |
| Batch 3 | 26 | 23 | `batch-3-latin-name.md` |
| Batch 4 | 47 | 21 | this document, §5 |
| Batch 5 | 7 | 7 | the decided shared-value cases, §5 |

Every no-op carries a reason in its candidate file. Nothing was left silently
unattempted.

## 4. What the work found

Four things that no test had caught, each now encoded rather than remembered.

**The queue never closed.** An open `Maintenance_Queue` row was read as
disputing a field's value, but it is a gap ticket — "this cell is blank". Filling
the cell never retired the job. Only statuses that explicitly question an
existing value may re-queue a populated cell now.

**A taxonomic authority cannot be followed mechanically.** GBIF resolves
*Citrus paradisi* (grapefruit) to *Citrus aurantium* — bitter orange, a different
supplement with its own cardiovascular cautions. `taxonomy-policy.mjs` resolves a
synonym only when the accepted target is at species rank, the **specific epithet
is unchanged** (a generic transfer, not a lumping), and no other entity holds the
name. It rejected grapefruit, `ocotea-odorifera`, and `fraxinus-rhynchophylla`
for three different reasons, and accepted `cordyceps-sinensis` and `kanna`.

**Two entities can claim the same organism.** The shared-value guard has caught
seven pairs so far, only one of which was known in advance. It reports at review
severity because some splits are legitimate — `roselle-seed` and
`hibiscus-sabdariffa` are seed and calyx of one plant.

**A guard that only sees canonical state misses same-batch collisions.**
`milk-oats` and `oatstraw` both imported *Avena sativa* in batch 4: neither
tripped the per-candidate check because the value was in neither row yet. Both
values are correct, but the pair should have surfaced. The exporter now catches
it, since it is the only layer that sees a whole batch.

## 5. The seven review cases — decided and applied

All seven were the shared-value guard asking "legitimate split, or duplicate?".
For `latin_name` the answer is the same either way: the binomial is factually
correct for both entities, and sharing one is already established practice here
(`roselle-seed` with `hibiscus-sabdariffa`, `milk-oats` with `oatstraw`,
`curcumin` with `turmeric`). Leaving a correct value off a page that exists is
the worse outcome. All seven were filled.

Whether any pair should be *merged* is an entity-level question, tracked
separately by `enrich duplicates` — filling a correct field neither creates nor
worsens it.

A change may now carry `shared_value_acknowledged` with a reason, which
downgrades the finding from review to info for that change only. The guard keeps
surfacing pairs nobody has looked at yet; it just stops re-asking a settled
question. This mirrors `--approve-human-review` in the workbook runner.

| entity | shares with | decision |
|--------|-------------|----------|
| `lions-mane` | `hericium-erinaceus` | duplicate; this is the surviving slug |
| `garcinia-mangostana` | `mangosteen` | duplicate, merge tracked separately |
| `gudmar` | `gymnema-sylvestre` | duplicate, merge tracked separately |
| `lemongrass` | `cymbopogon-citratus` | duplicate, merge tracked separately |
| `cistanche` | `cistanche-deserticola` | duplicate; primary medicinal species |
| `mulberry-leaf` | `morus-alba` | legitimate plant-part split |
| `holy-basil-seed` | `holy-basil` | legitimate plant-part split |

## 6. Duplicate organisms

34 `latin_name` values are held by more than one entity. **After the 2026-08-24
consolidation, 5 still serve two or more live profiles** — down from 17 — and all
five are deliberate part/preparation splits. 12 are resolved by a 301.

**That count went up as a direct result of §5**, from 28 shared and 13 live.
Filling the seven review cases did not create seven duplicates — those entity
pairs already existed. They were invisible to a `latin_name` audit while one side
of each pair had a blank cell. Making the data correct made the pre-existing
problem measurable, which is the right trade.

Measure it with `npm run enrich:duplicates`. Liveness comes from the route
manifest and `public/_redirects`, never from `runtime_export_decision` — a
redirected entity keeps `full_public_runtime` while emitting no page, which is
how an earlier pass of this audit overstated the count.

`npm run enrich:duplicates -- --plan` proposes a survivor per group, separates the four that are not duplicates at all, and writes the exact redirect lines and workbook edits.

**The precedent was applied.** All nine pre-existing herb redirects pointed the
binomial slug at the common-name slug, and twelve more now do. Two proposals
flipped once ranking used real rendered content instead of the stale
`source_count` column: `angelica-sinensis` has no built page, and
`gymnema-sylvestre` renders four citations to `gudmar`s one. A thirteenth pair
the audit could not see — `citicoline` and `cdp-choline`, same substance, neither
carrying a `latin_name` — was resolved too.

See `docs/enrichment/duplicate-organisms-audit.md`.

## 7. Recommended next action

**Retyping the non-organism entities is being done in #4183** — `resveratrol`,
`tyrosine`, `citicoline`, `quercetin`, `phosphatidylserine` from `herb` to
`compound`.

Two corrections to how this document previously framed it. First, the stated
motivation was wrong: these jobs sit at `rejected` in the ledger and a rescan
does not re-queue them, so there was never any recurring enrichment noise to
remove. The real payoff is correct entity typing — schema.org emits
`ChemicalSubstance` rather than a plant type, and the compound index becomes
right.

Second, a later draft withdrew the recommendation outright on the grounds that
retyping would break `resveratrol` (whose **herb** route is canonical, with the
compound `trans-resveratrol` 301ing to it) and would move live URLs for
`quercetin` and `phosphatidylserine`. That withdrawal was over-corrected. Those
are real costs, but they are the ordinary cost of a URL migration and #4183
handles them properly: it flips the resveratrol redirect rather than leaving it
dangling, repoints `trans-resveratrol` at the new canonical without creating a
chain, and adds 301s for the other three.

**The gap #4183 does not cover:** `citicoline` and `cdp-choline` are the same
substance. `cdp-choline` is already a live compound route, so retyping
`citicoline` produces two live compound URLs for one substance. The duplicate
audit cannot see it, because neither carries a `latin_name`. One of the two
should redirect to the other.

**The next enrichment field is `canonical_pathways`, and it is underway.** Gate
G15 supersedes G14 and adds it to the readiness scope. Batches 1 and 2 are
researched and staged as approved patches — 48 of 119 jobs, 36 filled, 12 no-ops
with reasons — but **not yet written to the workbook**: the apply step is blocked
in the environment they were produced in. See
`docs/enrichment/canonical-pathways.md` for results, the vocabulary decision, and
the exact commands to apply them.

Two things that work discovered are worth carrying forward regardless of field:

- `canonical_pathways` feeds `normalizeMechanisms()` via `site-export.mjs`, so a
  label the taxonomy cannot resolve is silently worth nothing. Write
  `canonical_label` values from `public/data/canonical-mechanisms.json`, which
  are guaranteed to map, rather than the shorthand older rows use.
- `enrich export` exports **every** candidate file on disk, not the current
  batch. Archive each batch's candidates to
  `ops/enrichment/candidates/archive/<batch>/` after exporting, or the next
  export re-proposes changes that are already in a patch.

Avoid `secondary_effects` (873 gaps) until there is appetite for the review load:
it is claim-bearing, requires human evidence, and every candidate routes to a
human regardless.

## 8. Standing rules

- Batches of 25 or fewer, so review stays real.
- **Never commit `public/data` alongside a workbook patch.** `data:build:core`
  produces ~1,700 changed files that have nothing to do with the change; that is
  the known core-vs-full build divergence. The workbook and the patch record are
  the durable artifacts, and the deploy build regenerates runtime data.
- Re-run `npm run enrich:scan` after every import and confirm the gap count
  actually falls. That check is what caught the queue-never-closes bug.
- Mark an applied patch `applied`. `validate-workbook-patches` re-checks any
  non-`applied` patch against the live workbook and fails it as stale.
- A new field, parallel workers, or spreadsheet migration each need a fresh
  readiness record.

## 9. Known limitations

1. **Entity_Master only.** No safe programmatic write path exists for
   `Evidence_Register`, `Source_Register`, or `Entity_Relationships`; those go
   through `data-sources/runtime-enrichment/`.
2. **`evidence_grade` has 32 raw spellings**, `confidence_tier` 18. Both stay
   manual-review until normalized.
3. **Migration is untested against real legacy data** — no historical
   spreadsheet exists in the repository.
4. **No demand signals.** Priority uses runtime visibility, retrieval priority,
   the workbook's weight columns, and the open maintenance backlog. Real traffic
   data would improve ranking; nothing is fabricated in its absence.
5. **19 genus-level entities** cannot take a `latin_name` under the current
   convention (0 of 253 values is a single word). Either adopt a genus
   convention or narrow each entity to a species.
