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

## Body section order (around the existing structured template)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | Home → Herbs → herb |
| 2 | Lead / what it is | — | One-paragraph orientation |
| 3 | Mechanism (expanded) | `MechanismBox`, `PathwayDiagram` | Active constituents → pathway |
| 4 | Benefit-by-goal | `EvidenceSummaryBox` + `EvidenceMeter` | Tier each goal (stress, sleep, focus…) |
| 5 | Standardization / form | — | e.g. KSM-66 vs Sensoril; rosavin %; fruiting body vs mycelium |
| 6 | Dosing & timing | `DosageBox` | |
| 7 | Side effects & contraindications | `SafetyBox` | Thyroid, pregnancy, blood thinners, etc. |
| 8 | "How to choose a product" | `RecommendedProduct` | Buyer guidance + 2–3 affiliate cards |
| 9 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5–6 Qs from spec |
| 10 | Internal links / See also | `SeeAlsoCluster` | Link related compounds, guides, compares; funnel to money page |
| 11 | References | — | Citation per efficacy claim |

## Schema block

- Ensure `FAQPage` renders on the herb template (`FaqJsonLd`).
- `BreadcrumbList` — always.
- Entity schema already comes from the workbook via `buildWorkbookEntitySchema`
  (`lib/schema.ts`) — confirm it still emits; don't duplicate.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2–3 placements, mapped to standardized forms.

## Evidence

- Benefit-by-goal must be evidence-tiered; standardization quality noted.

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
