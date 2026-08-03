# High-potential page quality pass

Date: August 2, 2026

## Scope

Identify the strongest remaining existing-page opportunities after the five-guide batch merged in PRs #2401 and #2402, then improve the pages where commercial intent and trust risk overlap most heavily.

The uploaded Bing performance CSVs were not available through the current repository or file connector during this pass, so this ranking uses the current `main` branch, the repository's high-ROI opportunity rules, cluster role, commercial intent, content differentiation, and severity of evidence/safety gaps. Re-rank with route-level impressions, clicks, CTR, and conversions when those exports are available in the active workspace.

## Priority ranking

| Rank | Route | Why it has upside | Main quality risk | Action |
|---:|---|---|---|---|
| 1 | `/guides/adhd/best-magnesium-supplement-for-adhd/` | Strong buying intent, ADHD cluster authority, product-module potential, and multiple supporting routes | Presented glycinate as the proven best ADHD form; used unsupported ADHD-specific dosing, timing, glycine-synergy, and absorption certainty | Rebuilt in this branch |
| 2 | `/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/` | Exact comparison intent and natural path into the buying guide | Claimed a winner despite no direct ADHD head-to-head trial; comparison was asymmetrical and risked cannibalizing the buying guide | Rebuilt in this branch |
| 3 | `/guides/adhd/adhd-supplements/` | Pillar route with the strongest internal-link leverage in the ADHD cluster | Evidence tiers and several mechanism statements remain more confident than the underlying ADHD evidence | Next editorial target |
| 4 | `/guides/adhd/l-theanine-magnesium-adhd-stack/` | High stack intent and natural commercial path | Combination language can imply synergy without isolating either ingredient or the stack | Review after the two magnesium pages deploy |
| 5 | `/guides/focus/best-nootropics-for-focus/` | Broad high-value focus query with multiple profile and product paths | Strong structure already; main gap is source depth and route-level performance validation rather than a fundamental rewrite | Protect, measure, then selectively deepen |

## Changes completed

### Best magnesium supplement for ADHD

- Preserved the stable route and core keyword intent.
- Changed the answer from “glycinate wins” to “no form is proven best for core ADHD symptoms.”
- Separated core ADHD treatment claims from sleep, constipation, low intake, and tolerability decisions.
- Replaced the hardcoded generic Amazon search with the governed magnesium recommendation set.
- Added an answer-first block, decision framework, symmetrical form table, buyer checklist, FAQ schema, stronger internal links, and visible safety guardrails.
- Corrected label guidance to emphasize elemental magnesium.
- Corrected status-testing language: serum magnesium is common but no single assessment method is definitive.
- Added current NIH guidance, the 2025 bisglycinate sleep RCT, the ADHD magnesium treatment systematic review, and the magnesium-status meta-analysis.

### Magnesium glycinate vs citrate for ADHD

- Preserved the comparison URL and search intent.
- Reframed the page around the absence of a direct ADHD head-to-head trial.
- Made the comparison symmetrical across evidence, sleep context, absorption, GI fit, cost, practical use, and unsupported claims.
- Removed form-superiority, glycine-synergy, universal timing, and ADHD-dose certainty.
- Differentiated the route from the buying guide: this page answers “which tradeoff fits?” while the buying guide answers “how do I choose and read a product?”
- Retained one governed product module after evidence and safety context.

## Measurement plan

After deployment, track these routes separately for at least 14 days:

- organic impressions, clicks, CTR, and average position;
- guide-to-guide and guide-to-profile clicks;
- affiliate outbound CTR;
- engagement with the product module;
- email or checklist conversion where present;
- query overlap between the buying guide and comparison page.

If both pages receive impressions for the same query but one consistently underperforms, adjust title and introduction language before considering consolidation. Do not create another magnesium-for-ADHD URL.
