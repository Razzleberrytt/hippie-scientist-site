# Business Coverage Report: Phase 3 Decision Surfaces & Revenue Readiness

This coverage report assesses the presence of key decision support and commercial parameters across the catalog database (285 herbs, 235 compounds, total 520 entities).

## Summary Metrics

| Metric | Count | Percentage | Status |
|---|---|---|---|
| Total Herbs | 285 | - | Mapped |
| Total Compounds | 235 | - | Mapped |
| **Entities Missing Explicit `best_for`** | 520 | 100.0% | **Critical Gap** |
| **Entities Missing `avoid_if`** | 235 | 45.2% | **Action Needed** |
| **Entities Missing Explicit `evidence_tier`** | 323 | 62.1% | **Action Needed** |
| **Entities Missing Affiliate/Sourcing URL** | 520 | 100.0% | **Critical Gap** |

---

## Analysis of Key Gaps

### 1. Missing Explicit `best_for` (520/520)
- **Impact:** High. While detail pages fall back to `primary_effects` or `effects` lists for the "Best For" signals, having a dedicated, targeted `best_for` summary is crucial for click-through rate, search snippets, and semantic matching relevance.
- **Remediation:** Phase 4 should introduce a focused editorial pass to write single-sentence `best_for` summaries directly to `data-sources/herb_monograph_master.xlsx`.

### 2. Missing `avoid_if` Safety Flags (235/520)
- **Impact:** Moderate-High. For the 285 herbs and 235 compounds, 235 are missing custom contraindications, warnings, or interactions lists. Although they fall back to general safety warnings, having specific avoid-if tags (e.g., "avoid if taking anticoagulants") makes decision pages much safer and more useful.
- **Remediation:** Priority pass to map known contraindications to the source spreadsheet.

### 3. Missing Explicit `evidence_tier` (323/520)
- **Impact:** Moderate. 323 long-tail entities default to "Evidence-Limited" or "Preliminary Evidence" status.
- **Remediation:** Review literature for popular long-tail compounds to elevate them to "Moderate Human Evidence" where clinical trials support it.

### 4. Missing Affiliate/Sourcing URLs (520/520)
- **Impact:** High. Currently, no entities in the generated JSON record direct Amazon product listing links (`amazon_affiliate_url`). The templates successfully fall back to safe search queries utilizing the central `AFFILIATE_TAGS.amazon` tag (e.g., `https://www.amazon.com/s?k=Caffeine+supplement+third+party+tested&tag=razzleberry02-20`).
- **Remediation:** For the top-converting 20 herbs/compounds, add direct affiliate ASIN URLs to the master spreadsheet to improve conversion rates and revenue potential.

---

## Page-Level Quality Gaps

### 1. Goal Guides (`/goals/:slug`)
- **Status:** Upgraded from static 4-goal mapping to 9 dynamically-ranked goal guides.
- **Gap:** Out of the 9 goals, `longevity` and `cognition` have fewer high-confidence human clinical matches, meaning they feature more "Preclinical/Mechanistic" options. 
- **Opportunity:** Add short, custom introductory copy for each of the new goals to establish context and safety boundaries.

### 2. Comparison Pages (`/compare/:slug`)
- **Status:** Enriched with shared/divergent mechanisms, evidence ranking, and "Choose this if" comparative logic.
- **Gap:** The automated comparison generator only covers a subset of adjacent pairs.
- **Opportunity:** Create high-intent commercial routes for major tradeoffs (e.g., "L-Theanine vs Ashwagandha for anxiety").

---

## High-Priority Revenue & SEO Opportunities

1. **Top-20 ASIN mapping:** Directly add Amazon affiliate links for high-intent herbs (Ashwagandha, Rhodiola, L-Theanine, Curcumin, Melatonin, Caffeine, Lions Mane, Bacopa, Magnesium, CoQ10).
2. **Dynamic Comparison Internal Links:** Automatically cross-link detail pages to their corresponding `/compare/[slug]` routes within the first paragraph to capture high-intent search traffic.
3. **Structured Schema Auditing:** Maintain strict schema verification during build time (e.g., ensuring FAQPage and MedicalWebPage tags are valid for all new goals and comparison pages).

---

## Recommended Phase 4 Tasks
1. **Workbook Sourcing Pass:** Write specific affiliate URLs, standardizations, and standardized caution signals into `data-sources/herb_monograph_master.xlsx`.
2. **Compare Page Expansion:** Auto-generate comparison pairs for all top-20 entities to increase search query indexability.
3. **Safety Checker Integration:** Expose the safety checker page (`/safety-checker`) more prominently on goal hubs to capture searchers investigating polypharmacy/supplement safety risks.
