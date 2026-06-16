# Content Priority Scoreboard

> **Mission 005 — Content Dominance Engine**
> Purpose: rank every existing page by ROI so expansion effort flows to the highest-value
> assets first. **This is an analysis artifact only — no pages are created, redesigned, or
> rewritten as part of this document.**
>
> Generated: 2026-06-16 · Branch: `claude/content-dominance-scoring-ervnsj`

---

## 1. Scoring Model

Each page is scored **1–100** as a weighted blend of four sub-scores (each itself rated 1–100):

| Dimension | Weight | What it measures |
|-----------|:------:|------------------|
| **Search Intent Weight** | 40% | How commercially/decision-oriented the query behind the page is. "best X for Y", "X vs Y", "X for [condition]" score highest; pure-curiosity/glossary intent scores lowest. |
| **Traffic Potential** | 25% | Estimated search demand + breadth of the keyword cluster the page can own. |
| **Monetization Potential** | 20% | Affiliate/product fit — supplement-purchase intent, comparison shopping, dosing/brand decisions. |
| **Authority Potential** | 15% | Ability to become the canonical, citation-backed reference (E-E-A-T / topical authority). |

**Weighted Score = (0.40 × Intent) + (0.25 × Traffic) + (0.20 × Monetization) + (0.15 × Authority)**

### Evidence behind the scores
Scores are grounded in real signals pulled from the source tree on the generation date:
- **Word count** — text content of each page (and its backing `lib/` content module or
  `public/data` record for component-driven routes).
- **Internal links** — count of `href="/…"` references.
- **Citations** — `pubmed | doi | ncbi | nih.gov | et al | pmid` markers.
- **FAQ / Schema presence** — `FAQPage`, `@type`, JSON-LD markers.
- **Monetization wiring** — `AFFILIATE_TAGS`, `RecommendedProduct`, Amazon/affiliate markers.
- **Architecture** — inline content vs. shared component (`SeoEntryPage`,
  `FocusAdhdArticlePage`, `GoalClusterArticlePage`) vs. data-driven template
  (`/herbs/[slug]`, `/compounds/[slug]`).

---

## 2. Page Universe

The site exposes **303 build-time routes** plus two large dynamic collections. Total
addressable page count is ≈ **1,000+** once dynamic entity routes are expanded.

| Cluster | Route pattern | Pages | Role | Avg. intent |
|---------|---------------|------:|------|:-----------:|
| Commercial landing | `/best-supplements-for-*`, `/best-magnesium-supplements-for-adhd` | 8 | Money pages | **Very high** |
| ADHD/Focus articles | `/articles/*-adhd`, `/articles/*-focus` | ~19 | Commercial-info | **Very high** |
| Sleep articles | `/articles/*sleep*`, `/articles/*-stack-guide` | ~12 | Commercial-info | High |
| Anxiety articles | `/articles/*anxiety*`, `/articles/l-theanine-*` | ~8 | Commercial-info | High |
| Guides | `/guides/*` | ~37 | Discovery → depth | High |
| Compare | `/compare/*` | ~18 | Decision/commercial | **Very high** |
| Herb profiles | `/herbs/[slug]` | 287 | Authority depth | Medium-high |
| Compound profiles | `/compounds/[slug]` | 597 | Authority depth | Medium |
| Stacks | `/stacks/*`, `/stacks/builder` | 6 | Tool/commercial | Medium-high |
| Goals | `/goals/[goal]` | dynamic | Discovery hub | Medium |
| Education | `/education/*` | ~70 | Topical authority | Low-medium |
| Psychoactive | `/psychoactive/*` | 8 | Authority/safety | Medium |
| Novel psychoactive | `/novel-psychoactive-substances/*` | dynamic | Authority | Medium |
| Tools | `/safety-checker`, `/supplement-safety-checklist`, `/dosing`, `/search`, `/tools` | ~6 | Utility/engagement | Medium |
| Legal/Utility | `/about`, `/contact`, `/privacy`, `/disclaimer`, `/affiliate-disclosure`, `/newsletter`, `/author`, `/faq` | ~15 | Trust/infra | Low |

---

## 3. Top-Scoring Pages (ranked)

Scores below combine the weighted model with the measured content state. **"Headroom"**
flags how much expansion upside remains (the basis for Top-25 selection in
`top25-expansion-roadmap.md`).

| # | Page | Intent | Traffic | Money | Auth | **Score** | Words | Headroom |
|--:|------|:------:|:------:|:-----:|:----:|:---------:|------:|:--------:|
| 1 | `/best-supplements-for-sleep` | 95 | 92 | 95 | 70 | **89** | ~580 | High |
| 2 | `/articles/best-supplements-for-adhd` | 96 | 90 | 92 | 72 | **89** | comp. | High |
| 3 | `/best-supplements-for-stress` | 93 | 88 | 92 | 70 | **86** | ~580 | High |
| 4 | `/best-supplements-for-focus` | 92 | 86 | 90 | 70 | **85** | ~580 | High |
| 5 | `/articles/best-magnesium-supplement-for-adhd` | 95 | 85 | 95 | 72 | **87** | 1,852 | Med |
| 6 | `/best-magnesium-supplements-for-adhd` | 94 | 82 | 95 | 60 | **84** | 580 | High |
| 7 | `/guides/best-supplements-for-sleep` | 90 | 88 | 88 | 68 | **84** | 1,104 | High |
| 8 | `/articles/sleep-stack-guide` | 88 | 85 | 90 | 82 | **86** | 4,616 | Low |
| 9 | `/articles/natural-anxiety-relief` | 88 | 86 | 85 | 82 | **86** | 4,422 | Low |
| 10 | `/best-supplements-for-gut-health` | 92 | 88 | 90 | 60 | **84** | ~580 | High |
| 11 | `/best-supplements-for-blood-pressure` | 92 | 86 | 88 | 58 | **83** | ~580 | High |
| 12 | `/best-supplements-for-fat-loss` | 93 | 90 | 90 | 55 | **84** | ~580 | High |
| 13 | `/best-supplements-for-joint-support` | 90 | 82 | 90 | 58 | **81** | ~580 | High |
| 14 | `/guides/best-herbs-for-anxiety` | 88 | 85 | 82 | 68 | **82** | 998 | High |
| 15 | `/guides/adhd-supplements` | 90 | 84 | 85 | 66 | **83** | 795 | High |
| 16 | `/guides/best-nootropics-for-focus` | 88 | 82 | 85 | 66 | **82** | 985 | High |
| 17 | `/guides/best-adaptogens-for-stress` | 87 | 80 | 84 | 66 | **80** | 935 | High |
| 18 | `/articles/l-theanine-for-sleep` | 84 | 82 | 85 | 82 | **83** | 3,903 | Low |
| 19 | `/articles/best-herbs-for-sleep` | 86 | 84 | 84 | 80 | **84** | 3,738 | Low |
| 20 | `/articles/magnesium-types-for-sleep` | 84 | 80 | 88 | 80 | **83** | 3,927 | Low |
| 21 | `/articles/ashwagandha-vs-magnesium-for-sleep` | 86 | 80 | 86 | 78 | **83** | 3,412 | Low |
| 22 | `/compare/sleep-herbs-vs-melatonin` | 88 | 78 | 82 | 78 | **82** | 2,879 | Med |
| 23 | `/articles/ashwagandha-for-sleep` | 84 | 80 | 84 | 78 | **82** | 2,370 | Med |
| 24 | `/articles/ashwagandha-for-anxiety` | 84 | 80 | 82 | 76 | **81** | 1,857 | Med |
| 25 | `/guides/how-to-lower-cortisol-naturally` | 90 | 85 | 78 | 60 | **81** | 132 | High |
| 26 | `/guides/natural-alternatives-to-anxiety-medication` | 90 | 84 | 72 | 60 | **80** | 120 | High |
| 27 | `/guides/best-supplements-for-overthinking` | 86 | 80 | 76 | 58 | **78** | 145 | High |
| 28 | `/guides/supplements-for-brain-fog-and-fatigue` | 86 | 80 | 78 | 58 | **78** | 136 | High |
| 29 | `/guides/best-natural-sleep-aids-that-work` | 86 | 82 | 80 | 56 | **79** | 89 | High |
| 30 | `/compare/magnesium-glycinate-vs-magnesium-oxide` | 86 | 76 | 84 | 76 | **81** | 2,007 | Low |
| 31 | `/compare/rhodiola-vs-ashwagandha` | 86 | 78 | 84 | 64 | **80** | 679 | High |
| 32 | `/herbs/ashwagandha` | 80 | 86 | 82 | 78 | **81** | ~200+tpl | High |
| 33 | `/herbs/rhodiola` | 80 | 80 | 80 | 76 | **79** | ~170+tpl | High |
| 34 | `/herbs/turmeric` | 80 | 82 | 82 | 76 | **80** | ~183+tpl | High |
| 35 | `/herbs/lions-mane` | 80 | 84 | 82 | 74 | **80** | ~177+tpl | High |
| 36 | `/guides/magnesium-vs-melatonin` | 86 | 76 | 80 | 62 | **79** | 457 | High |
| 37 | `/guides/rhodiola-complete-guide` | 82 | 76 | 82 | 70 | **79** | 1,325 | Med |
| 38 | `/guides/turmeric-curcumin` | 82 | 78 | 82 | 72 | **80** | 1,667 | Med |
| 39 | `/guides/kava` | 80 | 72 | 78 | 70 | **76** | 1,357 | Med |
| 40 | `/compare/l-theanine-vs-magnesium` | 84 | 76 | 82 | 76 | **80** | 2,156 | Low |

---

## 4. Cluster-Level Scores (long-tail)

For the large dynamic collections, pages are scored as a cohort with a representative range.

| Cluster | Score range | Notes |
|---------|:-----------:|-------|
| Herb profiles (287) — **featured/high-search** (ashwagandha, rhodiola, turmeric, lions-mane, kava, kratom, valerian, passionflower, bacopa, ginkgo) | 76–81 | Highest-authority depth pages; ~170–200 words of structured data + rich template. Strong expansion ROI on the top ~20. |
| Herb profiles — mid-tail (next ~60) | 55–70 | Real search demand, thinner data. Batch-enrich. |
| Herb profiles — long-tail (~200) | 30–50 | Obscure botanicals; maintain, don't expand. |
| Compound profiles (597) — high-search (l-theanine, magnesium, melatonin, curcumin, ashwagandhanolides, mitragynine) | 65–78 | Commercial + authority overlap. |
| Compound profiles — long-tail (~550) | 20–45 | Index/authority breadth; low individual ROI. |
| Education (~70) | 30–62 | Topical-authority glue (low commercial intent). A few — `what-are-adaptogens`, `what-is-a-nootropic`, `how-receptors-work` — pull informational traffic and link equity (55–62). |
| Psychoactive (8) | 50–68 | Safety + authority; `harm-reduction` and `interactions` score highest. |
| Compare (18 total) | 64–86 | Decision intent; the supplement-vs-supplement set scores highest. |
| Stacks (6) | 58–72 | `builder` is a strong engagement/tool asset. |
| Goals (`/goals/[goal]`) | 60–74 | Discovery hubs; value is in routing equity to money pages. |
| Tools (safety-checker, dosing, checklist) | 55–70 | Engagement + trust; weak direct monetization. |
| Legal/Utility (~15) | 10–35 | Necessary infra; not expansion targets. |

---

## 5. Headline Findings

1. **The money pages are the thinnest.** Every `/best-supplements-for-*` landing page renders
   from the shared `SeoEntryPage` component (~580 words/route, limited FAQ/schema). They carry
   the **highest commercial intent on the site** yet have the **most headroom** — the single
   biggest ROI concentration.
2. **A cluster of high-intent guides is near-empty.** `how-to-lower-cortisol-naturally` (132 w),
   `natural-alternatives-to-anxiety-medication` (120 w), `best-supplements-for-overthinking`
   (145 w), `supplements-for-brain-fog-and-fatigue` (136 w), and
   `best-natural-sleep-aids-that-work` (89 w) target valuable queries with stub content.
3. **The sleep-article cluster is already best-in-class** (3,400–4,600 words, 9–16 citations,
   12–13 FAQs, full schema). These rank high but are **low-headroom** — optimize, don't rebuild.
4. **Schema & citations are inconsistent.** Guides and `/best-supplements-for-*` pages largely
   lack `FAQPage`/`ItemList` schema and citations that the article cluster already proves out.
   Porting the article cluster's pattern is a repeatable lift.
5. **Featured herb hubs under-monetize.** Ashwagandha, rhodiola, turmeric, and lion's mane have
   strong template scaffolding but thin (~170–200 word) bodies and could anchor far more
   internal-link equity and affiliate placement.

➡ **Top-25 expansion targets and the 90-day execution plan: see
[`top25-expansion-roadmap.md`](./top25-expansion-roadmap.md).**
