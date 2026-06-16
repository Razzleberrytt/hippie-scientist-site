# The Magnificent 10

> **Mission 007 — The Magnificent 10**
> Purpose: collapse the Top 25 expansion targets into the **10 highest-ROI pages** that
> deserve the **majority of future content effort**.
>
> **Scope rules (enforced):** This is an **analysis and prioritization artifact only**. It does
> **not** create content, redesign anything, create pages, or build systems. Every page below
> already exists as a route. Source inputs:
> [`content-priority-scoreboard.md`](./content-priority-scoreboard.md) and
> [`top25-expansion-roadmap.md`](./top25-expansion-roadmap.md).
>
> Generated: 2026-06-16 · Branch: `claude/magnificent-10-ranking-r81dnf`

---

## 1. Re-Weighted Scoring Model

Mission 007 uses a **different weighting** than the Mission 005 scoreboard. The scoreboard led
with commercial **Intent (40%)** and treated Authority as a minor factor (15%). Mission 007
re-balances toward durable, defensible assets:

| Dimension | Weight | What it measures |
|-----------|:------:|------------------|
| **Search Demand** | 40% | Raw query volume + breadth of the keyword cluster the page can own. |
| **Authority Potential** | 25% | Ability to become the canonical, citation-backed, link-earning reference (E-E-A-T / topical authority). |
| **Monetization Potential** | 20% | Affiliate/product fit — purchase intent, comparison shopping, dosing/brand decisions. |
| **Strategic Importance** | 15% | Role in the site architecture: cluster-anchoring, internal-link equity it distributes, brand/topic coverage, and funnel leverage. |

**Priority Score = (0.40 × Search Demand) + (0.25 × Authority) + (0.20 × Monetization) + (0.15 × Strategic Importance)**

Sub-scores (1–100) are carried forward from the scoreboard's measured signals (word count,
links, citations, FAQ/schema, monetization wiring, architecture). **Search Demand** maps to the
scoreboard's *Traffic* sub-score; **Authority** and **Monetization** map directly. **Strategic
Importance** is assigned per page from its architectural role.

### What changed when we re-weighted

Raising Authority from 15% → 25% and adding Strategic Importance pulls **authority hubs up** and
**compresses the thin commercial landers**. Three consequences drove the final cut:

1. **Herb hubs climbed into the 10.** `ashwagandha`, `lions-mane`, and `turmeric` carry the
   highest Authority sub-scores on the site (74–78) and act as link magnets. Under the old
   Intent-heavy model they sat at #32–#35; here they rank in the top 8.
2. **Duplicates were dropped.** `/guides/best-supplements-for-sleep` (near-duplicate of
   `/best-supplements-for-sleep`) and `/best-magnesium-supplements-for-adhd` (near-duplicate of
   `/articles/best-magnesium-supplement-for-adhd`) score well but lose on Strategic Importance —
   two pages chasing one intent is redundant. The stronger variant of each pair is kept; the
   duplicate is excluded.
3. **Cluster coverage broke the tie.** At the #9/#10 cutline, `best-herbs-for-anxiety` and
   `adhd-supplements` tied at 79. Both were kept because anxiety was otherwise unrepresented and
   the ADHD guide already ships a `FAQPage`/schema base, lowering its expansion cost.

---

## 2. The Magnificent 10 (ranked)

| Rank | Page | Search Demand (40%) | Authority (25%) | Monetization (20%) | Strategic (15%) | **Priority Score** |
|:---:|------|:---:|:---:|:---:|:---:|:---:|
| 1 | `/best-supplements-for-sleep` | 92 | 70 | 95 | 93 | **87** |
| 2 | `/articles/best-supplements-for-adhd` | 90 | 72 | 92 | 92 | **86** |
| 3 | `/best-supplements-for-stress` | 88 | 70 | 92 | 85 | **84** |
| 4 | `/herbs/ashwagandha` | 86 | 78 | 82 | 90 | **84** |
| 5 | `/best-supplements-for-focus` | 86 | 70 | 90 | 82 | **82** |
| 6 | `/articles/best-magnesium-supplement-for-adhd` | 85 | 72 | 95 | 74 | **82** |
| 7 | `/herbs/lions-mane` | 84 | 74 | 82 | 80 | **81** |
| 8 | `/herbs/turmeric` | 82 | 76 | 82 | 80 | **80** |
| 9 | `/guides/best-herbs-for-anxiety` | 85 | 68 | 82 | 80 | **79** |
| 10 | `/guides/adhd-supplements` | 84 | 66 | 85 | 82 | **79** |

> The other 15 Top-25 pages remain valid expansion targets in
> [`top25-expansion-roadmap.md`](./top25-expansion-roadmap.md); they are simply *not* in the
> priority tier that should absorb the majority of effort.

---

## 3. Per-Page Briefs

### Rank 1 — `/best-supplements-for-sleep` · Score 87
- **Why it matters:** The flagship money page. Highest monetization fit on the site (95) and the
  anchor of the entire sleep cluster, funneling to herb, compound, and comparison depth pages.
  Thin today (~580 words via `SeoEntryPage`), so headroom is large.
- **User intent:** Commercial-investigational — a buyer comparing sleep supplements and ready to
  purchase the right form/dose.
- **Estimated traffic opportunity:** ~8,000–14,000 organic sessions/mo at maturity (head-term
  "best supplements for sleep" cluster). *Directional.*
- **Monetization opportunity:** 4–5 affiliate placements (magnesium glycinate, melatonin,
  L-theanine, glycine, valerian) via `RecommendedProduct` / `AFFILIATE_TAGS.amazon`.
- **Suggested target word count:** **2,400**.
- **Priority score:** 87.

### Rank 2 — `/articles/best-supplements-for-adhd` · Score 86
- **Why it matters:** Highest-intent commercial-info page in the largest commercial cluster
  (ADHD/Focus). Component-driven base already exists; deep evidence framing makes it both a money
  page and an authority asset.
- **User intent:** Commercial-investigational — researching evidence-graded ADHD nutrients,
  often deciding between supplements and/or alongside medication.
- **Estimated traffic opportunity:** ~7,000–12,000 sessions/mo. *Directional.*
- **Monetization opportunity:** 4–6 placements (omega-3, zinc, magnesium glycinate, iron,
  saffron) via existing `AdhdMonetizationWidgets`.
- **Suggested target word count:** **2,500**.
- **Priority score:** 86.

### Rank 3 — `/best-supplements-for-stress` · Score 84
- **Why it matters:** Anchors the stress/adaptogen cluster and feeds the high-value ashwagandha
  and rhodiola hubs. Strong monetization (92), thin body today.
- **User intent:** Commercial-investigational — choosing an adaptogen/stress supplement.
- **Estimated traffic opportunity:** ~5,000–9,000 sessions/mo. *Directional.*
- **Monetization opportunity:** 4 placements (ashwagandha KSM-66, rhodiola, magnesium,
  L-theanine).
- **Suggested target word count:** **2,200**.
- **Priority score:** 84.

### Rank 4 — `/herbs/ashwagandha` · Score 84
- **Why it matters:** The single most-searched herb hub and the site's strongest authority asset
  (Authority 78). A link magnet that earns citations and distributes equity across stress, sleep,
  anxiety, and ADHD clusters. Rose into the top tier specifically because of the re-weighting
  toward Authority + Strategic Importance.
- **User intent:** Mixed informational + commercial — "what does ashwagandha do," KSM-66 vs
  Sensoril, dosing, safety — frequently converting to a product choice.
- **Estimated traffic opportunity:** ~6,000–11,000 sessions/mo (large branded-herb demand).
  *Directional.*
- **Monetization opportunity:** 2–3 placements (KSM-66, Sensoril, gummies).
- **Suggested target word count:** **1,800** (body around the existing structured template).
- **Priority score:** 84.

### Rank 5 — `/best-supplements-for-focus` · Score 82
- **Why it matters:** Anchors the focus/nootropic cluster; strong monetization (90); thin today.
  Complements (does not duplicate) the ADHD pages.
- **User intent:** Commercial-investigational — choosing a focus/nootropic stack, "focus without
  jitters."
- **Estimated traffic opportunity:** ~4,500–8,000 sessions/mo. *Directional.*
- **Monetization opportunity:** 4–5 placements (L-theanine, citicoline, alpha-GPC, lion's mane,
  bacopa).
- **Suggested target word count:** **2,200**.
- **Priority score:** 82.

### Rank 6 — `/articles/best-magnesium-supplement-for-adhd` · Score 82
- **Why it matters:** Highest monetization fit in the set (95) and the strongest existing base
  among the money pages (1,852 words, 10 FAQ, schema, dense affiliate wiring) — low incremental
  cost to push to elite. Kept over its near-duplicate `/best-magnesium-supplements-for-adhd`.
- **User intent:** High commercial — buyer choosing a magnesium *form* for ADHD.
- **Estimated traffic opportunity:** ~3,500–6,500 sessions/mo. *Directional.*
- **Monetization opportunity:** 4 distinct forms (glycinate, L-threonate, citrate, malate).
- **Suggested target word count:** **2,600**.
- **Priority score:** 82.

### Rank 7 — `/herbs/lions-mane` · Score 81
- **Why it matters:** High-authority herb hub (74) with rising branded demand; anchors the
  cognition/focus depth layer and earns links. Strong template scaffolding, thin body.
- **User intent:** Informational → commercial — mechanism, fruiting-body vs mycelium, dosing,
  product selection.
- **Estimated traffic opportunity:** ~4,000–7,500 sessions/mo. *Directional.*
- **Monetization opportunity:** 2–3 placements (fruiting-body extract, dual-extract capsules).
- **Suggested target word count:** **1,700** (body around the template).
- **Priority score:** 81.

### Rank 8 — `/herbs/turmeric` · Score 80
- **Why it matters:** High-authority herb hub (76) spanning joint, inflammation, and gut
  clusters; broad evergreen demand and strong link-earning potential.
- **User intent:** Informational → commercial — curcumin bioavailability/form, dosing, safety.
- **Estimated traffic opportunity:** ~4,000–7,000 sessions/mo. *Directional.*
- **Monetization opportunity:** 2–3 placements (curcumin phytosome/Meriva, curcumin + piperine).
- **Suggested target word count:** **1,700** (body around the template).
- **Priority score:** 80.

### Rank 9 — `/guides/best-herbs-for-anxiety` · Score 79
- **Why it matters:** Sole dedicated anxiety-cluster anchor in the priority tier (high search
  demand, 85). Funnels to multiple herb hubs and the natural-anxiety depth articles.
- **User intent:** Commercial-investigational — choosing a calming herb, "fastest-acting,"
  "which to try first."
- **Estimated traffic opportunity:** ~3,500–6,500 sessions/mo. *Directional.*
- **Monetization opportunity:** 3–4 placements (ashwagandha, kava, passionflower, lemon balm).
- **Suggested target word count:** **2,000**.
- **Priority score:** 79.

### Rank 10 — `/guides/adhd-supplements` · Score 79
- **Why it matters:** Already ships a `FAQPage`/schema base (12 FAQ, 10 schema markers) with a
  thin body — the **lowest-cost lift** in the set. Strong monetization (85) and a key discovery
  hub funneling into the ADHD depth cluster.
- **User intent:** Commercial-investigational — surveying evidence-graded ADHD supplements,
  adults vs kids, adjunct vs deficiency.
- **Estimated traffic opportunity:** ~3,000–5,500 sessions/mo. *Directional.*
- **Monetization opportunity:** 4 placements (omega-3, zinc, magnesium, saffron).
- **Suggested target word count:** **2,000**.
- **Priority score:** 79.

---

## 4. Portfolio Shape

| Cluster | Pages in the 10 | Note |
|---------|:---------------:|------|
| Sleep | 1 (#1) | Single anchor; duplicate guide excluded. |
| ADHD / Focus | 4 (#2, #5, #6, #10) | Largest commercial cluster; widest coverage. |
| Stress / Adaptogen | 2 (#3, #4) | Landing page + its top authority hub. |
| Anxiety | 1 (#9) | Distinct intent, otherwise unrepresented. |
| Authority herb hubs | 3 (#4, #7, #8) | Link magnets; the re-weighting's headline winners. |

**Effort concentration:** these 10 pages represent roughly **21,000 words of combined target
content** and the bulk of the site's affiliate-placement and link-equity upside. They are where
the majority of future content effort should go. Sequencing is in
[`expansion-order.md`](./expansion-order.md).

> **Reminder:** this document *selects and ranks*. Content creation, rewriting, redesign, new
> pages, and new systems are explicitly out of scope per Mission 007 rules.
