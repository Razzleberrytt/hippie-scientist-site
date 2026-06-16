# Template — Compound Authority Page

> **Use for:** `/compounds/:slug` profile hubs. No single compound is a Top-25
> *target*, but compound pages are the most-linked **depth destinations** from the
> Top 25 (e.g. `/compounds/magnesium`, `/compounds/l-theanine`, `/compounds/melatonin`,
> `/compounds/berberine`, `/compounds/curcumin`, `/compounds/coenzyme-q10`). This
> template keeps them authoritative so inbound link equity lands on a strong page.
> **Target shape:** 1,400–2,000 words of **body** around the existing structured
> `/compounds/[slug]` template (do not redesign) · `FAQPage` + `BreadcrumbList`
> schema · 2–3 affiliate placements · 6–8 internal links.
>
> Structural template only — no content. Fill from the linking page's spec and the
> compound's workbook record.

## Body section order (around the existing structured template)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | Home → Compounds → compound |
| 2 | Lead / what it is | — | Class, source, why it matters |
| 3 | Mechanism of action | `MechanismBox`, `PathwayDiagram` | Receptor/pathway-level |
| 4 | Forms & bioavailability | — | e.g. magnesium glycinate vs L-threonate; curcumin phytosome |
| 5 | Benefit-by-goal | `EvidenceSummaryBox` + `EvidenceMeter` | Tier each use-case |
| 6 | Dosing & timing | `DosageBox` | By form where relevant |
| 7 | Safety, interactions, contraindications | `SafetyBox` | Med interactions; upper limits |
| 8 | "How to choose / buy" | `RecommendedProduct` | 2–3 affiliate cards by form |
| 9 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5–6 Qs |
| 10 | Internal links / See also | `SeeAlsoCluster` | Link parent herbs, comparisons, money pages |
| 11 | References | — | Citation per efficacy claim |

## Schema block

- `FAQPage` (`FaqJsonLd`) + `BreadcrumbList`.
- Entity schema from the workbook via `buildWorkbookEntitySchema` / `buildThingNode`
  / `buildDrugNode` (`lib/schema.ts`) as appropriate — confirm emission; don't duplicate.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2–3 placements, split by form.

## Evidence

- Form/bioavailability claims and benefit tiers must be citation-backed.

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
