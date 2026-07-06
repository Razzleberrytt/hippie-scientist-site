# Grounding noindex curated profiles — findings & promotion plan

Operating task: make the highest-value `noindex` curated profiles (5-HTP, GABA,
NAC, Citicoline, Apigenin; plus Lavender, Lemon balm, Chamomile) legitimately
indexable through the existing workbook/governance system.

**Outcome of this pass:** diagnosis + a ready-to-apply promotion plan + a blocking
tooling defect. No source-of-truth or generated data was mutated (see
[§4 Why nothing was auto-applied](#4-why-nothing-was-auto-applied)).

Re-run the live readout any time: `node scripts/report-grounding-readiness.mjs`.

---

## 1. Why each profile is `noindex` — it is NOT thin content

The indexability policy (`scripts/data/indexability-policy.mjs`) **hard-gates**
a profile to `NOINDEX` *before any content scoring* when its workbook field
`runtime_export_decision` is `hidden_until_grounded` or `research_archive_runtime`.

All 8 targets are held by that gate — the content score never runs. So the real
blocker is a deliberate governance holdback, not (for most) weak content.

## 2. Readiness (from `scripts/report-grounding-readiness.mjs`)

The "if promoted" column is what the quality gate (score ≥75 → PUBLISH) would
decide on the **current content** if the holdback were lifted.

| Profile | Canonical slug | Held by | If promoted | Leaked summary? | Verdict |
|---|---|---|---|---|---|
| NAC | `n-acetylcysteine` (compound) | `hidden_until_grounded` | **PUBLISH (100)** | yes | Ready to promote |
| Apigenin | `apigenin` (compound) | `research_archive_runtime` | **PUBLISH (100)** | yes | Ready to promote |
| Lemon balm | `lemon-balm` (compound) | `hidden_until_grounded` | **PUBLISH (100)** | no | Ready to promote |
| Chamomile | `chamomile` (compound) | `hidden_until_grounded` | **PUBLISH (100)** | yes | Ready to promote |
| Lavender | `lavender` (compound) | `hidden_until_grounded` | **PUBLISH (95)** | yes | Ready to promote |
| Citicoline | `citicoline` (herb sheet) | `hidden_until_grounded` | NEEDS_REVIEW (65) | yes | Needs content (summary is a placeholder) |
| GABA | `gaba` (compound) | `hidden_until_grounded` | NEEDS_REVIEW (50) | no | Needs editorial certification |
| 5-HTP | `5-htp` (compound) | `hidden_until_grounded` | NEEDS_REVIEW (50) | no | Needs editorial certification |

Notes:
- **Lion's Mane** (a related target) is already indexable via its canonical
  `hericium-erinaceus` — no action needed.
- **5-HTP and GABA** are capped at 50 by `profile_status: research_only`
  (`non-publishable-profile-status`). They cannot reach PUBLISH by content edits
  alone — a human must certify editorial completeness (`profile_status`).
- **Citicoline** is not capped; it just needs a real summary (currently the
  placeholder `"No summary available yet."`) — then it scores PUBLISH.

## 3. Content issue: leaked pipeline text in summaries

Several summaries contain build-pipeline/placeholder strings that must **not** be
indexed (they would also fail `npm run audit:leaked-text`). Clean these to real,
user-facing, careful, evidence-aligned sentences as part of grounding:

- `n-acetylcysteine`, `apigenin`, `chamomile` — begin with `"Decision-ready summary:"`
- `lavender` — `"Lavender entry from SciSpace evidence pass. Evidence level: moderate."`
- `citicoline` — `"No summary available yet."`

Preserve all safety cautions when rewriting (e.g. 5-HTP serotonin-syndrome
interaction, apigenin/chamomile sedative + pregnancy notes, NAC's *targeted*
compulsive-behavior framing — not broad "anxiety supplement").

## 4. Why nothing was auto-applied

Two independent reasons, both blocking a safe automated change:

1. **No safe write path to the source-of-truth workbook.** The only editable
   source for `runtime_export_decision` / `summary` / `profile_status` is
   `data-sources/herb_monograph_master.xlsx`. ExcelJS **cannot load this workbook
   into a writable object** — `workbook.xlsx.readFile` throws
   `Cannot read properties of undefined (reading 'name')` on its table
   definitions, and the repo's reader (`scripts/utils/read-workbook-exceljs.mjs`)
   only survives by falling back to a **streaming row reader that returns
   `workbook: null`**. The old `edit-workbook.mjs` (which needed `readFile` to
   succeed) would crash, and a lossy full rebuild would risk corrupting all 850+
   records. At the time of this pass, no safe write path existed. **This tooling
   defect has since been RESOLVED** by the surgical `edit-entity-master-cell.mjs`
   editor (see §6) — workbook grounding can now proceed safely.
2. **Governance boundary.** `docs/runtime-promotion-governance.md` reserves
   runtime promotion for scientific + governance human review, with *mandatory
   human approval* for controversial / interaction-heavy compounds. 5-HTP
   (serotonin syndrome) and NAC (psychiatric framing) fall squarely there. The
   task also says: do not override governance directly, do not force PUBLISH by
   bypassing quality gates.

The correct promotion is not a bypass: it is lifting the `hidden_until_grounded`
holdback in the workbook so the **score-based quality gate** evaluates the
profile. The gate stays the arbiter — content-ready profiles publish, capped ones
(5-HTP, GABA) are correctly held at NEEDS_REVIEW.

## 5. Exact promotion plan (apply once §6 tooling is fixed)

In the workbook, per row (matched by slug in column 1):

1. **Clean leaked summaries** (§3) → real grounded sentences, safety preserved.
2. **Citicoline**: write a real summary + set `summary_quality: moderate`.
3. **Lift the holdback** for the ready set — set `runtime_export_decision`
   `hidden_until_grounded` / `research_archive_runtime` → `full_public_runtime`
   for: `n-acetylcysteine`, `apigenin`, `lemon-balm`, `chamomile`, `lavender`,
   and `citicoline` (after step 2).
4. **5-HTP, GABA**: leave held. To promote later, a human editor must raise
   `profile_status` off `research_only` (an editorial-completeness certification),
   which is appropriate to keep gated for 5-HTP given its serotonergic risk.
5. Regenerate: `npm run data:build`, then run the validation suite (§7).

Expected result: 6 profiles flip to `index,follow` and enter the sitemap; 5-HTP
and GABA remain `noindex` (correctly held by the quality gate + governance).

## 6. Blocking tooling fix — ✅ RESOLVED

The safe, lossless workbook write path has been restored. Use the surgical
targeted editor `scripts/data/edit-entity-master-cell.mjs`
(`npm run workbook:edit`), which patches a single `Entity_Master` cell by
slug + column via zip/XML surgery without touching unrelated workbook structure.
It is proven byte-stable by `npm run workbook:roundtrip-test` (a no-op round-trip
that asserts every sheet's parsed data is unchanged). See docs/workbook-pipeline.md
§7. Grounding the profiles in §5 can now proceed through this editor.

> Historical note: this was blocked because ExcelJS's `readFile` throws on the
> workbook's table definitions, so the old `edit-workbook.mjs` (now retired) could
> not open it for writing. The new editor avoids ExcelJS entirely.

## 7. Validation to run after applying

```
npm run data:build
npm run validate:evidence-language      # promoted summaries now audited
npm run validate:data-governance        # governance/indexability metadata
node scripts/ci/validate-indexability-metadata.mjs
npm run validate:profile-verdicts
npm run validate:safety-visibility
npm run validate:claim-discipline
npm run build
node scripts/ci/validate-internal-links.mjs
```

Any promoted profile that fails evidence-language or governance is the quality
gate doing its job — hold that one and fix the content first.
