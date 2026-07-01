# Template — Comparison Page

> **Use for:** head-to-head `X vs Y` pages (roadmap #23 `/compare/rhodiola-vs-ashwagandha`,
> #24 `/guides/magnesium-vs-melatonin`).
> **Target shape:** 1,800–2,400 words · comparison table + `FAQPage` schema ·
> 2–3 affiliate placements (split by use-case) · 6+ internal links.
>
> Structural template only — no content. Fill from the page's spec in
> [`../page-specs/`](../page-specs/).

## Non-negotiables

- Keep comparison and guide routes stable. If a route changes, add the redirect to
  `public/_redirects`.
- Lead with a useful verdict, then show the tradeoffs that justify it.
- Do not add server-only Next.js features. The site ships as static export.
- Compare equivalent forms and use cases; call out when evidence is not comparable.
- Avoid medical substitution claims, especially when one side is a medication.

## Section order (top → bottom)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | |
| 2 | H1 + verdict-in-brief | — | One-line "X for ___, Y for ___" |
| 3 | Affiliate disclosure | `AffiliateDisclosure` | Above first link |
| 4 | Head-to-head table | `ComparisonTable` / `compare-table-client` | Mechanism, best-for, timing, side effects |
| 5 | "How they differ" | `MechanismBox` | Mechanism contrast |
| 6 | Evidence per side | `EvidenceSummaryBox` + `EvidenceMeter` | Tier each, per use-case; cite the basis |
| 7 | "Can you stack / combine them?" | `SafetyBox` | Interaction + combo guidance |
| 8 | Dosing for each | `DosageBox` | |
| 9 | Decision tree | — | "Choose X if… choose Y if…" |
| 10 | Affiliate placements | `RecommendedProduct` | 2-3, split by use-case |
| 11 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5 Qs from spec |
| 12 | Internal links / See also | `SeeAlsoCluster` | Link both entities + funnel to money page |
| 13 | References | — | Citation per claim |

## Required fields before publishing

- Verdict names the better fit for at least two distinct user goals.
- Table rows are symmetrical: both sides answer the same question in each row.
- Stack/combine guidance includes interaction and timing cautions.
- Internal links include both entity pages and at least one related commercial guide.
- FAQ covers "which is better", "can I combine", "how fast", and safety.

## Schema block

- Comparison/FAQ schema via `buildFAQPageFromComparisonRows` (`lib/schema.ts`)
  + `FaqJsonLd`.
- `BreadcrumbList` — always.
- Keep any existing comparison schema markers; add citations.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2-3 placements, mapped to each side's best use-case.
- Disclosure before first link.
- Do not monetize an option that the verdict discourages for the target reader.

## Evidence

- The comparison table is the centerpiece — every row cell that asserts efficacy
  must be backed in References.
- Tier each entity per use-case (e.g. rhodiola = energy/focus, ashwagandha = stress/sleep).
- When one side has stronger evidence, say whether the difference is evidence
  quality, effect size, safety, or just better study availability.

## Verification

- For content/data changes: `npm run check:fast`.
- For route or schema changes: `npm run build && npm run verify:output`.
- Spot-check table behavior on mobile; cells must wrap without horizontal text clipping.

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
