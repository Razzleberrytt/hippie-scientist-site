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
