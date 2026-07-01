# Template — Guide Page

> **Use for:** `/guides/*` educational pages and high-intent guide stubs
> (roadmap #7, #10–#18). Mix of informational + commercial intent.
> **Target shape:** 1,500–2,200 words · `FAQPage` schema (+ `HowTo` / `ItemList`
> where applicable) · 2–4 affiliate placements · 6–10 internal links.
>
> Structural template only — no content. Fill from the page's spec in
> [`../page-specs/`](../page-specs/). Consider authoring through `lib/schemas/guide-schemas.ts`
> (`GuideData`) where the guide is data-driven.

## Non-negotiables

- Keep existing `/guides/*` routes stable. If a route changes, add the redirect to
  `public/_redirects`.
- Match the route's search intent before writing: educational, decision support,
  comparison, or commercial.
- Do not add server-only Next.js features. The site ships as static export.
- Prefer shared components and structured page data over bespoke one-off sections.
- Use conservative YMYL language and link `/info/disclaimer` where health decisions
  or medication interactions are discussed.

## Section order (top → bottom)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | |
| 2 | H1 + intro | — | Frame the problem; promise the takeaway |
| 3 | Affiliate disclosure | `AffiliateDisclosure` | Above first affiliate link |
| 4 | "How it works" / primer | `MechanismBox` | Mechanism or topic 101 |
| 5 | Options / per-item cards | `EvidenceSummaryBox` + `EvidenceMeter` | One card per herb/compound/aid; evidence tier each and cite the basis |
| 6 | "What to try first" / decision | — | Selection logic for the reader |
| 7 | Dosing & timing | `DosageBox` | Table where multiple items |
| 8 | Safety & interactions | `SafetyBox` | Serotonergic / med-interaction notes |
| 9 | Affiliate placements | `RecommendedProduct` | 2-4, mapped to the items above |
| 10 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5–6 Qs from spec |
| 11 | Internal links / See also | `SeeAlsoCluster` | **Funnel to a money page (#1–#9)** |
| 12 | References | — | Citation per efficacy claim |
| 13 | Disclaimer (YMYL) | `NPSDisclaimer` | Route to `/info/disclaimer` |

## Required fields before publishing

- H1 matches the user problem and does not bury the route's main keyword.
- Intro states who the guide is for, who should be cautious, and what decision the
  page helps make.
- Each option has a distinct best-fit use case; avoid near-duplicate cards.
- Internal links include at least one depth page and one related guide or money page.
- FAQ questions reflect real objections, safety concerns, and choice criteria.

## Schema block

- `FAQPage` — always (`FaqJsonLd`).
- `HowTo` — for protocol/lifestyle guides (e.g. #10 cortisol protocol).
- `ItemList` — for ranked-list guides (e.g. #14 sleep aids).
- `BreadcrumbList` — always.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2-4 placements; conservative on YMYL guides.
- Disclosure before first link.
- Affiliate placements must support the decision section; do not add products that
  were not discussed above.

## Evidence & YMYL

- Tier every option; distinguish deficiency-correction vs adjunct where relevant.
- Anxiety-medication guide (#11): never advise discontinuing prescribed meds —
  complementary, prescriber-supervised framing + `/disclaimer`.
- Separate "may help" statements from stronger consensus statements.

## Verification

- For content/data changes: `npm run check:fast`.
- For route or schema changes: `npm run build && npm run verify:output`.
- Spot-check the page at mobile width and desktop width in light and dark mode.

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
