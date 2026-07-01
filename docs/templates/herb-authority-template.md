# Template — Herb Authority Page

> **Use for:** `/herbs/:slug` profile hubs (roadmap #19 ashwagandha, #20 rhodiola,
> #21 turmeric, #22 lion's mane).
> **Target shape:** 1,400–2,000 words of **body** built *around* the existing
> structured `/herbs/[slug]` template (do not redesign the template) · `FAQPage`
> + `BreadcrumbList` schema · 2–3 affiliate placements · 7–8 internal links.
>
> Structural template only — no content. The herb route already renders structured
> workbook data + scaffolding (`app/herbs/[slug]/page.tsx`); this spec lists the
> **body sections** to layer in. Fill from the page's spec in [`../page-specs/`](../page-specs/).

## Non-negotiables

- Keep `/herbs/:slug` stable. If a slug changes, add the redirect to `public/_redirects`.
- Prefer workbook-backed fields from `data-sources/herb_monograph_master.xlsx`; run
  `npm run data:build` after workbook edits.
- Do not add server-only Next.js features. The site ships as static export.
- Keep the initial payload lean: render essential profile data first, then deeper
  details lower on the page.
- State evidence conservatively. Avoid treatment, cure, or medication-replacement claims.

## Body section order (around the existing structured template)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | Home -> Herbs -> herb |
| 2 | Lead / what it is | — | One-paragraph orientation; include botanical name and common use context |
| 3 | Mechanism (expanded) | `MechanismBox`, `PathwayDiagram` | Active constituents -> pathway; distinguish known, plausible, and speculative mechanisms |
| 4 | Benefit-by-goal | `EvidenceSummaryBox` + `EvidenceMeter` | Tier each goal (stress, sleep, focus); cite the evidence basis |
| 5 | Standardization / form | — | Name extract ratios, constituent percentages, and preparation differences |
| 6 | Dosing & timing | `DosageBox` | |
| 7 | Side effects & contraindications | `SafetyBox` | Include meds, pregnancy/lactation, liver/kidney cautions, and stop-use triggers |
| 8 | "How to choose a product" | `RecommendedProduct` | Buyer guidance + 2-3 affiliate cards |
| 9 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5–6 Qs from spec |
| 10 | Internal links / See also | `SeeAlsoCluster` | Link related compounds, guides, compares; funnel to money page |
| 11 | References | — | Citation per efficacy claim |

## Required fields before publishing

- `slug`, `commonName`, and `botanicalName` are present and normalized.
- Summary is 1-2 sentences and does not overclaim.
- At least one safety field renders even when evidence fields are sparse.
- Related compound, goal, and guide links resolve to stable routes.
- Every affiliate URL is generated through shared affiliate config, not a hardcoded tag.

## Schema block

- Ensure `FAQPage` renders on the herb template (`FaqJsonLd`).
- `BreadcrumbList` — always.
- Entity schema already comes from the workbook via `buildWorkbookEntitySchema`
  (`lib/schema.ts`) — confirm it still emits; don't duplicate.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2-3 placements, mapped to standardized forms.
- Disclosure must appear before the first affiliate link.
- Do not recommend a form that conflicts with the safety or standardization section.

## Evidence

- Benefit-by-goal must be evidence-tiered; standardization quality noted.
- Separate human evidence from animal, in vitro, and traditional-use rationale.
- Cite form-specific claims; do not transfer evidence from one extract to another
  unless the section explains the limitation.

## Verification

- For workbook changes: `npm run data:build && npm run build`.
- For template-only edits: `npm run typecheck`.
- Spot-check one representative herb route in light and dark mode.

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
