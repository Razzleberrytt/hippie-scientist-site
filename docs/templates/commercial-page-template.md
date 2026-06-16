# Template — Commercial / Money Page

> **Use for:** ranked "best supplements for X" landing pages and product roundups
> (roadmap #1–#9, #25). Highest commercial intent.
> **Target shape:** 1,800–2,500 words · `ItemList` + `FAQPage` + `BreadcrumbList`
> schema · 3–6 affiliate placements · 8–12 internal links.
>
> This is a **structural template** — section order, the components to render, and
> the schema to attach. It contains no page content. Fill from the page's spec in
> [`../page-specs/`](../page-specs/).

## Section order (top → bottom)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | Home → cluster → page |
| 2 | H1 + intro (2–3 sentences) | — | State the promise + the selection method in one line |
| 3 | Affiliate disclosure | `AffiliateDisclosure` | Required above the first affiliate link |
| 4 | "How we ranked these" | `EvidenceLegend` | Methodology box; links credibility to evidence tiers |
| 5 | Ranked picks (`ItemList`) | `RecommendedProduct` / `AffiliateProductCard` + `EvidenceMeter` | One card per pick; evidence tier badge each |
| 6 | Per-item breakdown | `EvidenceSummaryBox`, `MechanismBox` | Mechanism + what trials show, per item |
| 7 | Dosing & timing table | `DosageBox` | Form, dose range, timing |
| 8 | Safety / interactions | `SafetyBox` | "Who should avoid"; med interactions |
| 9 | Buyer's checklist | — | Form, dose, third-party testing |
| 10 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5–6 Qs from spec |
| 11 | Internal links / See also | `SeeAlsoCluster` | Funnel to related money + depth pages |
| 12 | References | — | Citations backing every efficacy claim |
| 13 | Disclaimer (YMYL) | `NPSDisclaimer` | Route to `/disclaimer` for health-sensitive pages |

## Schema block

Attach via `components/seo/JsonLd.tsx` / `FaqJsonLd.tsx` and `lib/schema.ts` helpers:

- `ItemList` — over the ranked picks (use `buildClusterItemListNode` pattern).
- `FAQPage` — from the FAQ items (`FaqJsonLd`).
- `BreadcrumbList` — `BreadcrumbSchema`.

## Affiliate rules

- Only `AFFILIATE_TAGS.amazon` from `config/affiliate.ts` — **never** hardcode a tag.
- 3–6 placements; avoid over-linking (see #6 — consolidate, don't proliferate).
- Disclosure (`AffiliateDisclosure`) must appear before the first link.

## Evidence & YMYL

- Every efficacy claim carries a citation in **References**.
- Tier each pick (high / moderate / low) with `EvidenceMeter`.
- For YMYL topics (fat loss, blood pressure): conservative claims, explicit
  "not a substitute for prescribed treatment," route to `/disclaimer`.

## Done = the checklist

This template is "complete" only when the page passes every box in
[`expansion-checklist.md`](./expansion-checklist.md).
