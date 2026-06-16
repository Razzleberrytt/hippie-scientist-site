# Template — Comparison Page

> **Use for:** head-to-head `X vs Y` pages (roadmap #23 `/compare/rhodiola-vs-ashwagandha`,
> #24 `/guides/magnesium-vs-melatonin`).
> **Target shape:** 1,800–2,400 words · comparison table + `FAQPage` schema ·
> 2–3 affiliate placements (split by use-case) · 6+ internal links.
>
> Structural template only — no content. Fill from the page's spec in
> [`../page-specs/`](../page-specs/).

## Section order (top → bottom)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | |
| 2 | H1 + verdict-in-brief | — | One-line "X for ___, Y for ___" |
| 3 | Affiliate disclosure | `AffiliateDisclosure` | Above first link |
| 4 | Head-to-head table | `ComparisonTable` / `compare-table-client` | Mechanism, best-for, timing, side effects |
| 5 | "How they differ" | `MechanismBox` | Mechanism contrast |
| 6 | Evidence per side | `EvidenceSummaryBox` + `EvidenceMeter` | Tier each, per use-case |
| 7 | "Can you stack / combine them?" | `SafetyBox` | Interaction + combo guidance |
| 8 | Dosing for each | `DosageBox` | |
| 9 | Decision tree | — | "Choose X if… choose Y if…" |
| 10 | Affiliate placements | `RecommendedProduct` | 2–3, split by use-case |
| 11 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5 Qs from spec |
| 12 | Internal links / See also | `SeeAlsoCluster` | Link both entities + funnel to money page |
| 13 | References | — | Citation per claim |

## Schema block

- Comparison/FAQ schema via `buildFAQPageFromComparisonRows` (`lib/schema.ts`)
  + `FaqJsonLd`.
- `BreadcrumbList` — always.
- Keep any existing comparison schema markers; add citations.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2–3 placements, mapped to each side's best use-case.

## Evidence

- The comparison table is the centerpiece — every row cell that asserts efficacy
  must be backed in References.
- Tier each entity per use-case (e.g. rhodiola = energy/focus, ashwagandha = stress/sleep).

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
