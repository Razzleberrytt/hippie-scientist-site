# Content Expansion Playbook

> **Mission 006 — Expansion Assembly Line.** This converts the
> [Top 25 Expansion Roadmap](./top25-expansion-roadmap.md) from a one-off plan into
> a **reusable content production engine**: structured specs, reusable templates, a
> definition-of-done checklist, and a generator that presses it all out.
>
> **Scope (enforced):** This is *production infrastructure only*. Nothing here
> creates page content, rewrites pages, or redesigns anything. It standardizes
> *how* expansion work is specified and shipped.
>
> Generated: 2026-06-16 · Branch: `claude/expansion-assembly-line-2ljizj`

---

## What this system is

The roadmap identified 25 highest-ROI pages and described, prose-style, what each
needs. That doesn't scale: every page was a bespoke paragraph, and there was no
shared shape, no reusable parts, no machine-checkable "done."

This playbook turns that into an **assembly line** with four stations:

```
  ┌─────────────────┐   ┌──────────────┐   ┌──────────────┐   ┌───────────────┐
  │ 1. SPEC          │   │ 2. TEMPLATE  │   │ 3. BUILD      │   │ 4. CHECK       │
  │ page-specs/*.md  │ → │ templates/*  │ → │ expand page   │ → │ checklist gate │
  │ (what to add)    │   │ (how to lay  │   │ in the app    │   │ (done = all    │
  │                  │   │  it out)     │   │               │   │  boxes pass)   │
  └─────────────────┘   └──────────────┘   └──────────────┘   └───────────────┘
        ▲ generated from scripts/content/page-specs.data.mjs
```

Per-page cost drops across the quarter because stations 1, 2, and 4 are built once
and reused for all 25 (and any future) pages.

---

## The four stations

### 1. Specs — *what* each page needs

One file per page under [`page-specs/`](./page-specs/), each containing the
mission-required fields:

- **Current state** — measured signals today (words, FAQ, schema, citations, links)
- **Target state** — score, word count, template to apply
- **Missing sections** — body sections to add
- **Citation opportunities** — claims that need sourcing
- **FAQ opportunities** — questions to answer
- **Schema opportunities** — JSON-LD types to emit
- **Affiliate opportunities** — placements (always `AFFILIATE_TAGS.amazon`)
- **Internal links** — links to add (funnel to money pages)
- **Evidence opportunities** — per-item evidence grading

Specs are **generated**, not hand-written, so they stay consistent and in sync with
the roadmap. Source of truth: [`scripts/content/page-specs.data.mjs`](../scripts/content/page-specs.data.mjs).

### 2. Templates — *how* to lay a page out

Five reusable structural templates in [`templates/`](./templates/), one per page
archetype. Each defines section order, the real components to render, the schema to
attach, and affiliate/evidence rules:

| Archetype | Template | Applies to |
|-----------|----------|-----------|
| Commercial / money page | [`commercial-page-template.md`](./templates/commercial-page-template.md) | #1–#9, #25 |
| Guide | [`guide-template.md`](./templates/guide-template.md) | #7, #10–#18 |
| Comparison | [`comparison-page-template.md`](./templates/comparison-page-template.md) | #23, #24 |
| Herb authority | [`herb-authority-template.md`](./templates/herb-authority-template.md) | #19–#22 |
| Compound authority | [`compound-authority-template.md`](./templates/compound-authority-template.md) | linked depth pages |

Each spec links to its template; pick the template, fill it from the spec.

### 3. Build — expand the page in the app

Author against the chosen template using existing components. Nothing new is
designed. Key reusable building blocks already in the repo:

| Need | Component | Path |
|------|-----------|------|
| Affiliate card | `RecommendedProduct`, `AffiliateProductCard` | `components/` |
| Affiliate disclosure | `AffiliateDisclosure` | `components/AffiliateDisclosure.tsx` |
| FAQ + schema | `FAQAccordion`, `FaqJsonLd` | `components/`, `components/seo/` |
| Evidence grading | `EvidenceMeter`, `EvidenceSummaryBox`, `EvidenceLegend` | `components/` |
| Mechanism / dosing / safety | `MechanismBox`, `DosageBox`, `SafetyBox` | `components/` |
| Comparison table | `ComparisonTable`, `compare-table-client` | `components/` |
| Breadcrumbs + schema | `Breadcrumbs`, `BreadcrumbSchema` | `components/` |
| Related links | `SeeAlsoCluster`, `SeeAlsoInCluster` | `components/` |
| Schema builders | `buildClusterItemListNode`, `buildFAQPageFromComparisonRows`, `buildWorkbookEntitySchema` | `lib/schema.ts` |
| Data-driven guides | `GuideData` | `lib/schemas/guide-schemas.ts` |
| Affiliate tag | `AFFILIATE_TAGS.amazon` | `config/affiliate.ts` |

### 4. Check — the definition of done

A page is done only when it passes every box in the
[Expansion Checklist](./templates/expansion-checklist.md):

`Introduction · How it works · Evidence summary · Dosing · Safety · FAQ · Internal
links · Affiliate placements · Schema · References`

Copy the checklist into the page's tracking issue/PR (the per-page spec embeds a
copy). Phase exits and the portfolio definition-of-done live in the same file.

---

## How to run the assembly line

### Expand one page

1. Open its spec: `docs/page-specs/<slug>.md`.
2. Open the template the spec names.
3. Build the page in the app, section by section, using the components table above.
4. Walk the embedded checklist; ship when all boxes pass.
5. Run the quality gate: `npm run lint && npm run typecheck && npm run check`.

### Regenerate / update specs

Specs are generated. To change a spec, edit the data — never the `.md` directly:

```bash
# edit scripts/content/page-specs.data.mjs, then:
node scripts/content/generate-page-specs.mjs           # rewrite docs/page-specs/*.md
node scripts/content/generate-page-specs.mjs --check    # CI: fail if specs are stale
```

Generated files carry a "do not edit by hand" header. The `--check` mode is
CI-friendly (add to `check:full` if desired) so specs can't silently drift from the
data source.

### Add a new page to the line

1. Append an entry to the `pages` array in `page-specs.data.mjs` (copy an existing
   one as the shape).
2. Pick its `template`.
3. Run the generator — a new spec + updated index appear automatically.

No content is written at any step here — only the spec.

---

## Phasing (inherited from the roadmap)

| Phase | Window | Pages | Goal |
|-------|--------|:-----:|------|
| 1 — Money pages | Days 1–30 | #1–#9 | Establish the `ItemList`/`FAQPage` schema block, affiliate-card convention, citation style |
| 2 — Guide stubs | Days 31–60 | #10–#18 | Replicate the pattern on guides |
| 3 — Hubs/compare/authority | Days 61–90 | #19–#25 | Herb/compare pages; tie internal-link equity together |

Phase 1 builds the pattern once; phases 2–3 reuse it. Re-measure against the
[scoreboard](./content-priority-scoreboard.md) at each phase exit.

---

## Guardrails (carried from the roadmap)

1. **Build the pattern once.** Schema block, affiliate convention, citation style
   established on #1–#9 are reused everywhere after.
2. **Internal-link flow is the multiplier.** Every guide/herb/compare page funnels
   to a money page (#1–#9).
3. **YMYL discipline.** Fat loss (#9), blood pressure (#25), anxiety meds (#11):
   conservative, citation-backed claims; route to `/disclaimer`. Never advise
   discontinuing prescribed medication.
4. **Duplicate-intent watch.** #5 vs #6 (magnesium-for-ADHD): differentiate angle and
   cross-link — do **not** merge or redirect.
5. **Affiliate hygiene.** `AFFILIATE_TAGS.amazon` only; disclosure before first link;
   consolidate rather than over-link (#6).
6. **Static-export safe.** All data must be available at build time — no
   `force-dynamic`, `cookies()`, or `headers()` (see `CLAUDE.md`).

---

## File map

```
docs/
  content-expansion-playbook.md        ← you are here (the engine)
  top25-expansion-roadmap.md           ← the plan (Mission 005)
  page-specs/
    README.md                          ← generated index
    <slug>.md  × 25                    ← generated per-page specs
  templates/
    commercial-page-template.md
    guide-template.md
    comparison-page-template.md
    herb-authority-template.md
    compound-authority-template.md
    expansion-checklist.md             ← definition of done
scripts/content/
  page-specs.data.mjs                  ← structured spec source of truth
  generate-page-specs.mjs              ← the press (generates page-specs/*)
```

> **Reminder:** this system is infrastructure. Content creation, rewriting, and
> redesign are explicitly out of scope per the mission rules.
