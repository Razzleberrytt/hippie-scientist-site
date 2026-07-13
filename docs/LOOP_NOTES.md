# Loop Notes

Notes for future autonomous enhancement iterations — recurring friction, false positives, and tooling gaps discovered while working the loop.

---

## 2026-07-13 — `audit:content` word-count false positive on data-driven hub pages

`scripts/content-audit.mjs`'s `countWords()` stripped every `{...}` block
before counting words. That's correct for JSX interpolation, but the
`guides/*` hub pages (adhd, anxiety, best, compare, focus, herbs, sleep)
render their copy from typed data arrays — e.g.
`{ problem: 'Racing thoughts at bedtime', why: '...', cta: '...' }` — so
all of that user-facing prose lives inside `{}` and was being discarded
before the word count ran. Every one of the 7 hub pages was flagged
`thin_page` every run, regardless of actual content quality, because the
metric literally couldn't see their content model.

Fixed by extracting string-literal values for a known set of prose keys
(`title`, `desc`, `description`, `problem`, `why`, `cta`, `body`,
`caution`, `bestFor`, `fit`, `label`, `goal`, `role`, `summary`, `name`,
`kind`, `sub`, `eyebrow`, `text`, `note`, `question`, `answer`) before the
blanket brace-strip, and counting those alongside JSX text nodes.

Result: `guides/best`, `guides/herbs`, `guides/sleep` now correctly clear
the 500-word threshold. `guides/adhd`, `guides/anxiety`, `guides/compare`,
`guides/focus` still read thin (378–421 words) — that's a much more
trustworthy signal now and a reasonable next target, but wasn't tackled
this cycle to keep the change scoped and verifiable.

Takeaway for future cycles: if a hub/index page under `app/guides/*` is
built on the `DecisionRouter` / `GuideCardGrid` data-array pattern, don't
trust a stale `thin_page` reading without rerunning `audit:content` after
confirming the word-count method actually parses that page's content
shape — the audit is a heuristic over raw source, not the rendered DOM.

---

## 2026-07-13 — `audit:safety` was silently broken (0/0), masking a real compound-safety gap

`scripts/audit-safety-fill-rate.mjs` hard-coded `SHEETS = { herbs: 'Herb
Master V3', compounds: 'Compound Master V3' }`. Those sheets don't exist
in the current workbook — herbs and compounds were consolidated onto one
`Entity_Master` sheet (distinguished by an `entity_type` column) at some
earlier migration. Every run of `npm run audit:safety` silently printed
`0 filled / 0 total (0%)` for both, with no error — `getSheet()` just
returns `null` for an unknown sheet name and the script treats that as
"zero rows" rather than failing loudly. This was easy to miss because
the command still exits 0 and prints a well-formed-looking report.

Contrast with `scripts/data/build-runtime-from-workbook.mjs`, which reads
sheets via a *candidate-name list* (`['Herb Master V3', 'Herb
Monographs', 'Site Export Herbs']` etc., falling back to `Entity_Master`)
— that script degrades gracefully across the schema migration. The audit
script had no such fallback, so it just went quiet instead of failing.

Fixed by pointing `audit-safety-fill-rate.mjs` at `Entity_Master`,
filtering rows by `entity_type`, and reading safety completeness off
`contraindications_or_flags` (the field that actually carries structured
safety content now; the old `safety_level` enum no longer exists —
`safety_notes` is free text and is ~100% filled everywhere so it isn't a
useful completeness signal on its own).

Real result after the fix: **herbs are 292/293 (100%) filled, but
compounds are only 314/588 (53%) filled** — 274 compound rows have empty
`contraindications_or_flags`, each carrying a boilerplate `safety_notes`
placeholder ("Safety notes are not source-complete in this workbook row;
avoid broad safety claims and hold for interaction, population, and
formulation review."). That's a legitimate, large content gap, but too
large and too safety-sensitive to hand-author in one small verifiable
batch without real per-compound sourcing — flagging it here as the
highest-ROI target for a future enrichment cycle: pick a handful of the
274 (prioritize by traffic/sitemap priority once that's wired up — the
"TOP 20 MISSING" ranking in this script's own output is still a flat
`priority: 0.9` stub, not real traffic data) and source real
contraindication/interaction data per compound rather than batch-filling.

Takeaway for future cycles: any script that resolves a workbook sheet by
a single hard-coded name (not a candidate list through
`scripts/data/workbook-parser.mjs` conventions) is one workbook migration
away from silently reporting empty/zero and looking healthy. When an
audit reports a suspiciously round or empty number, check whether its
`SHEETS`/`getSheet()` reference still matches current `Entity_Master`
sheet names before trusting the number — don't assume 0/0 means "no
issues."
