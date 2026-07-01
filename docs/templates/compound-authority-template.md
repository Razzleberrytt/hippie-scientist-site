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

## Non-negotiables

- Keep `/compounds/:slug` stable. If a slug changes, add the redirect to
  `public/_redirects`.
- Prefer workbook-backed runtime JSON under `public/data`; run `npm run data:build`
  after workbook edits.
- Do not add API routes, middleware, server actions, runtime revalidation, or other
  server-only features under static export.
- Separate compound-level evidence from evidence for parent herbs, blends, or
  unrelated salts/forms.
- Avoid treatment, cure, or medication-replacement claims.

## Body section order (around the existing structured template)

| # | Section | Component(s) | Notes |
|--:|---------|--------------|-------|
| 1 | Breadcrumbs | `Breadcrumbs` + `BreadcrumbSchema` | Home -> Compounds -> compound |
| 2 | Lead / what it is | — | Class, source, why it matters |
| 3 | Mechanism of action | `MechanismBox`, `PathwayDiagram` | Receptor/pathway-level; label speculative mechanisms |
| 4 | Forms & bioavailability | — | e.g. magnesium glycinate vs L-threonate; curcumin phytosome |
| 5 | Benefit-by-goal | `EvidenceSummaryBox` + `EvidenceMeter` | Tier each use-case; cite the evidence basis |
| 6 | Dosing & timing | `DosageBox` | By form where relevant |
| 7 | Safety, interactions, contraindications | `SafetyBox` | Med interactions; upper limits |
| 8 | "How to choose / buy" | `RecommendedProduct` | 2-3 affiliate cards by form |
| 9 | FAQ | `FAQAccordion` + `FaqJsonLd` | 5–6 Qs |
| 10 | Internal links / See also | `SeeAlsoCluster` | Link parent herbs, comparisons, money pages |
| 11 | References | — | Citation per efficacy claim |

## Required fields before publishing

- `slug`, `name`, class/category, and summary are present.
- Forms are clearly named when dose, absorption, or safety differs by form.
- Parent herb links and guide links resolve; avoid orphan compound pages.
- Safety section includes upper-limit or interaction notes when applicable.
- Every affiliate URL is generated through shared affiliate config, not a hardcoded tag.

## Schema block

- `FAQPage` (`FaqJsonLd`) + `BreadcrumbList`.
- Entity schema from the workbook via `buildWorkbookEntitySchema` / `buildThingNode`
  / `buildDrugNode` (`lib/schema.ts`) as appropriate — confirm emission; don't duplicate.

## Affiliate rules

- `AFFILIATE_TAGS.amazon` only. 2-3 placements, split by form.
- Disclosure must appear before the first affiliate link.
- If evidence is form-specific, only monetize the matching form.

## Evidence

- Form/bioavailability claims and benefit tiers must be citation-backed.
- Do not infer efficacy from a chemically adjacent compound without saying so.
- Separate human clinical data from mechanistic, animal, and traditional-use support.

## Verification

- For workbook changes: `npm run data:build && npm run build`.
- For template-only edits: `npm run typecheck`.
- Spot-check one representative compound route in light and dark mode.

## Done = the checklist

Complete only when the page passes [`expansion-checklist.md`](./expansion-checklist.md).
