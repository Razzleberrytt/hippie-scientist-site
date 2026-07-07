# Workbook → generated data pipeline

How the Excel workbook becomes `public/data/**`, where it is fragile, and how to
edit it safely. The workbook stays the human-editable source of truth; this doc
plus the schema guard make it deterministic and debuggable.

---

## 1. Where the workbook is read

- **Source file:** `data-sources/herb_monograph_master.xlsx` (2 MB, 14 sheets).
- **Path resolution:** `scripts/workbook-source.mjs`
  (`resolveWorkbookPath` / `assertWorkbookExists`; override with `HERB_XLSX_PATH`,
  local paths only — remote URLs are rejected).
- **Reader:** `scripts/utils/read-workbook-exceljs.mjs` → `readWorkbookExcelJS()`.
- **Parser:** `scripts/data/workbook-parser.mjs` + `scripts/data/build-runtime-from-workbook.mjs`.

## 2. Which sheets & columns the pipeline requires

The build only reads a few of the 14 sheets (the rest are audit/log sheets):

| Purpose | Sheet (with fallbacks) |
|---|---|
| Entities (herbs + compounds) | **`Entity_Master`** (`Sheet7`) — **hard-required** |
| Herb↔compound map | `Herb Compound Map V3` / `Entity_Relationships` (`Sheet11`) |
| Evidence claims | `Study Registry` / `Evidence_Register` (`Sheet8`) |

`Entity_Master` today: **881 rows** (herb=293, compound=588), 52 columns.
Parser/indexability-critical columns (renaming/removing any breaks the build or
silently changes indexability):

```
entity_type, slug, name, summary, primary_effects_or_targets,
evidence_tier, runtime_export_decision, profile_status
```

## 3. Which generated files depend on it

`npm run data:build` regenerates all of `public/data/**` from the workbook —
`herbs.json`, `compounds.json`, detail files, `*-summary.json`, runtime maps,
route/sitemap manifests, search index, semantic snapshots. **All are disposable
and must never be hand-edited** — edit the workbook and regenerate.

## 4. Which fields drive indexability / governance

`scripts/data/indexability-policy.mjs` decides `PUBLISH` / `NEEDS_REVIEW` /
`NOINDEX` / `BLOCKED`:

- **Hard gate first:** `runtime_export_decision` ∈ {`hidden_until_grounded`,
  `research_archive_runtime`} → `NOINDEX` *before any scoring*.
- Otherwise a **content score** (≥75 PUBLISH, ≥45 NEEDS_REVIEW): summary depth,
  effects, mechanism, safety, `profile_status`, `summary_quality`, `evidence_tier`,
  `runtime_export_decision`. `profile_status` of `research_only`/`minimal` caps
  the score below the publish line.

Audit any profile's status/blocker: **`npm run audit:why-noindex [slug ...]`**
(`scripts/report-grounding-readiness.mjs`). See `docs/grounding-noindex-profiles.md`.

## 5. Fragility found (why the workbook "causes intermittent issues")

1. **The full ExcelJS read path is broken.** `workbook.xlsx.readFile` throws
   `Cannot read properties of undefined (reading 'name')` on this workbook's
   table definitions. `readWorkbookExcelJS` survives only by falling back to a
   **streaming row reader** that returns `workbook: null`. Consequences:
   - The workbook **cannot be opened for writing** — every ExcelJS-write tool
     crashes. This is the real blocker behind "can't safely edit the workbook".
   - The fallback was **silent** (a lone `console.warn`). It is now surfaced by
     `validate:workbook-schema` as a loud WARNING.
2. **`scripts/data/edit-workbook.mjs` is retired.** It targeted the removed
   `Herb Master V3` / `Compound Master V3` sheets and relied on the broken ExcelJS
   read/write path. It now just prints a pointer to its replacement,
   `edit-entity-master-cell.mjs` (`npm run workbook:edit`), and exits.
3. **No schema contract (until now).** `validate-workbook-source.mjs` only checks
   file existence/size — not sheets, columns, or slug integrity. A renamed column
   or a duplicate/blank slug would have failed deep in the build or silently
   changed output. `validate:workbook-schema` now guards this.
4. **Policy/schema drift.** The indexability policy reads `summary_quality`, which
   **does not exist** in `Entity_Master` — so every profile scores
   `summary-quality-missing`. Flagged as a WARNING; align the policy or add the
   column deliberately.
5. **Weight.** Audit/log sheets are huge (`Gap_Fill_Log` ~36k rows,
   `Maintenance_Queue` ~5k). They are not read at build time — deterministic but
   they bloat the file and slow parsing. Consider archiving them out of the
   runtime workbook.

**Not fragile:** the entity data itself is clean — `Entity_Master` has **no**
blank, duplicate, or non-normalized slugs — and the read is **deterministic**
(identical content hash across repeated runs; `public/data` is byte-stable
against the committed build).

## 6. Guardrails added this pass

- **`npm run validate:workbook-schema`** (`scripts/ci/validate-workbook-schema.mjs`)
  — required entity sheet, required columns, slug integrity (blank / duplicate /
  whitespace / casing) with exact sheet+row+slug messages, a deterministic entity
  content hash, and a loud warning when the read degraded to streaming. Wired into
  `guard:source-of-truth` and `check:data`.
- **`npm run audit:why-noindex`** — per-profile indexability reason + promotion
  readiness (read-only).
- **`npm run workbook:edit`** (`scripts/data/edit-entity-master-cell.mjs`) — the
  targeted `Entity_Master` cell editor (zip/XML surgery; avoids ExcelJS full
  workbook writes and changes only the requested worksheet cell). The old
  `edit-workbook.mjs` is retired and just points here.
- **`npm run workbook:roundtrip-test`** (`scripts/ci/validate-workbook-roundtrip.mjs`)
  — runs a no-op round-trip through the editor and asserts every sheet's parsed
  data is preserved byte-for-byte. Run it after any workbook edit.

## 7. Editing workbook rows safely

### Publishing a profile? Use the one-command tool

If the edit is a **profile promotion** (lifting `runtime_export_decision` and/or
cleaning a summary so a page publishes), do not hand-sequence the steps below —
run `npm run promote:profile -- --slug <slug> --summary "…"` (read-only preview:
`npm run promote:check -- --slug <slug>`). It performs the workbook edit, a
**drift-free** rebuild, the detail-file refresh, and verification in one step.
See **docs/promoting-profiles.md**. The manual path below is for other cell edits.

> ⚠️ **Drift trap:** never commit the output of a full `npm run data:build` for a
> single-row change. Its governance overlay + postprocess rewrite ~855 records and
> are not committed by the deploy path (`build:fast` → `data:build:core`). For a
> committed hand rebuild, use **`npm run data:build:core`**.

### Preferred: targeted Entity_Master cell editor

Use `scripts/data/edit-entity-master-cell.mjs` for surgical row edits while the
ExcelJS full read/write path remains broken. The tool opens the `.xlsx` as a ZIP,
locates `Entity_Master` through `xl/workbook.xml` + workbook relationships, maps
headers from row 1, finds a row by `slug`, and patches the requested cell as an
inline string. It does **not** reconstruct tables, styles, relationships, formulas,
or unrelated sheets.

Examples:

```bash
node scripts/data/edit-entity-master-cell.mjs \
  --slug n-acetylcysteine \
  --column summary \
  --value "Careful grounded summary here." \
  --dry-run

node scripts/data/edit-entity-master-cell.mjs \
  --slug n-acetylcysteine \
  --column summary \
  --value "Careful grounded summary here." \
  --out /tmp/herb_monograph_master.edited.xlsx

node scripts/data/edit-entity-master-cell.mjs \
  --roundtrip \
  --out /tmp/herb_monograph_master.roundtrip.xlsx
```

The editor refuses unsafe edits:

- missing `Entity_Master`
- missing/duplicate target slug
- missing `slug` column
- missing target column
- blanking required parser/indexability fields
- invalid `runtime_export_decision` values
- invalid `profile_status` values

After any real edit:

```bash
npm run validate:workbook-schema
npm run data:build:core   # NOT `npm run data:build` — see the drift-trap note above
npm run guard:source-of-truth
```

Review the `public/data` diff before committing. The generated JSON remains the
runtime artifact; do not hand-edit it.

### Manual fallback

If the targeted editor cannot handle a specific workbook change, edit
`data-sources/herb_monograph_master.xlsx` by hand in Excel/Sheets — only
`Entity_Master` rows, matched by `slug`. Do not rename columns or sheets. Then run
exactly the same validation sequence above.

## 8. Why ExcelJS write is avoided

ExcelJS currently fails during full table-model reconstruction on this workbook,
then falls back to a streaming read path that returns `workbook: null`. That means
ExcelJS can read rows for the build, but it cannot safely write the workbook. The
targeted editor deliberately bypasses that broken object model and patches the
smallest possible worksheet XML surface.

The `--roundtrip` mode repacks the workbook without changing values. Use it to
prove that the workbook still parses and that `data:build` output remains stable
before trusting the write path in a larger batch.

## 9. Should governance fields move out of Excel?

**Recommendation (not yet migrated — flagged as small & safer for later):** the
publish-gating fields are the ones most painful to edit in the fragile binary
workbook and the most governance-sensitive. Consider moving **`runtime_export_decision`**
(and optionally `profile_status` / `summary_quality`) into a small, reviewable
**code/config promotion overlay** (e.g. `config/indexability-overlay.ts`, keyed by
slug) that `apply-governance-overlay.mjs` layers over the parsed workbook. Benefits:
promotions become deterministic, diff-reviewable, and possible **without touching
the fragile workbook** — the legitimate, safe path to grounding noindex profiles.

Constraints if pursued: the overlay must only be consumed *after* workbook parse,
must never override a workbook `BLOCKED`/safety field, and must be validated (real
slug + allowed enum). Do not build it as part of this pass — it changes how
indexability inputs are sourced and deserves its own focused change. It does **not**
weaken governance: the score-based quality gate still decides.

## 10. Should grounding happen in the workbook or a safer layer?

Grounding can now be attempted through the targeted cell editor for small,
reviewable changes to `Entity_Master`, followed by schema/data/source-of-truth
validation. Two viable paths remain:

- **Short term:** use the targeted cell editor for a few high-value rows, then
  validate and review generated-data diffs.
- **Better for promotions:** build the promotion overlay (§9), then promote
  profiles in code review without workbook surgery.

Either way the quality gate stays in control; 5-HTP and GABA remain correctly held
(`research_only` cap) until a human editor certifies completeness.
