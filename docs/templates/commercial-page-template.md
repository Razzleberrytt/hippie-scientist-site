# Template — Commercial / Money Page

> **Use for:** ranked "best supplements for X" landing pages and product roundups
> (roadmap #1–#9, #25). Highest commercial intent.
> **Target shape:** 1,800–2,500 words · `ItemList` + `FAQPage` + `BreadcrumbList`
> schema · 3–6 affiliate placements · 8–12 internal links.
>
> This is a **structural template** — section order, the components to render, and
> the schema to attach. It contains no page content. Fill from the page's spec in
> [`../page-specs/`](../page-specs/).

## Non-negotiables

- Keep ranked-list routes stable. If a route changes, add the redirect to
  `public/_redirects`.
- Lead with selection criteria before products; the page must read like a decision
  guide, not a catalog.
- Do not add server-only Next.js features. The site ships as static export.
- Use conservative YMYL claims and link `/info/disclaimer` where treatment, meds,
  diagnosis, or risk groups are involved.
- Keep affiliate density within the target range and avoid repeated links to the
  same product unless there is a clear comparison reason.

## Section order (top → bottom)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | Home -> cluster -> page |
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

## Required fields before publishing

- Ranking criteria are explicit: evidence quality, safety, fit, form quality, and
  practical availability.
- Every pick has a unique role, target reader, dose/form note, and caution.
- At least one "not for" or "skip if" note appears for each major pick.
- Internal links include depth pages for the main ingredients and adjacent money pages.
- Product claims are about form, testing, or fit; efficacy claims belong to the
  ingredient evidence section and must be cited.

## Schema block

Attach via `components/seo/JsonLd.tsx` / `FaqJsonLd.tsx` and `lib/schema.ts` helpers:

- `ItemList` — over the ranked picks (use `buildClusterItemListNode` pattern).
- `FAQPage` — from the FAQ items (`FaqJsonLd`).
- `BreadcrumbList` — `BreadcrumbSchema`.

## Affiliate rules

- Only `AFFILIATE_TAGS.amazon` from `config/affiliate.ts` — **never** hardcode a tag.
- 3-6 placements; avoid over-linking (see #6 — consolidate, don't proliferate).
- Disclosure (`AffiliateDisclosure`) must appear before the first link.
- Do not place affiliate cards before the ranking method and safety framing.
- Avoid affiliate links in FAQ answers unless the page already introduced that product.

## Evidence & YMYL

- Every efficacy claim carries a citation in **References**.
- Tier each pick (high / moderate / low) with `EvidenceMeter`.
- For YMYL topics (fat loss, blood pressure): conservative claims, explicit
  "not a substitute for prescribed treatment," route to `/disclaimer`.
- Distinguish deficiency correction, symptom support, wellness support, and
  disease-treatment claims.

## Verification

- For content/data changes: `npm run check:fast`.
- For route, affiliate, or schema changes: `npm run build && npm run verify:output`.
- Spot-check product cards on mobile and confirm disclosure appears before links.

## Done = the checklist

This template is "complete" only when the page passes every box in
[`expansion-checklist.md`](./expansion-checklist.md).
