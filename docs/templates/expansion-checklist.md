# Expansion Checklist System

> The single definition of "done" for every Top-25 expansion. A page is complete
> only when **all ten boxes** pass. Copy the block below into the tracking issue or
> PR for the page (the per-page spec already embeds a copy).
>
> Infrastructure only — this defines the gate; it produces no content.

## The checklist (copy/paste per page)

```md
### Expansion — `<route>`  (spec: docs/page-specs/<slug>.md)

- [ ] Route and source-of-truth check
- [ ] Introduction
- [ ] How it works
- [ ] Evidence summary
- [ ] Dosing
- [ ] Safety
- [ ] FAQ
- [ ] Internal links
- [ ] Affiliate placements
- [ ] Schema
- [ ] References
- [ ] Static export and build checks
```

## What each box means (acceptance criteria)

| Box | Passes when… | Hook into |
|-----|--------------|-----------|
| **Route and source-of-truth check** | Route is stable, slug is valid, redirects are added for renamed URLs, and workbook/public data source is clear. | `public/_redirects`, workbook, `public/data` |
| **Introduction** | H1 + 2–3 sentence intro states the promise and selection method. | template §intro |
| **How it works** | Mechanism / topic primer present. | `MechanismBox` |
| **Evidence summary** | Each option carries an evidence tier (high/moderate/low). | `EvidenceSummaryBox`, `EvidenceMeter` |
| **Dosing** | Dose + form + timing given (table when multiple items). | `DosageBox` |
| **Safety** | Interactions, contraindications, "who should avoid" covered; YMYL → `/disclaimer`. | `SafetyBox`, `NPSDisclaimer` |
| **FAQ** | Spec's FAQ questions answered and rendered. | `FAQAccordion` + `FaqJsonLd` |
| **Internal links** | Spec's internal links added; at least one funnels to a money page (#1–#9). | `SeeAlsoCluster` |
| **Affiliate placements** | Spec's placements present via `AFFILIATE_TAGS.amazon`; disclosure above first link; no hardcoded tags. | `RecommendedProduct`, `AffiliateDisclosure` |
| **Schema** | All schema types from the spec emit valid JSON-LD. | `lib/schema.ts`, `FaqJsonLd`, `BreadcrumbSchema` |
| **References** | Every efficacy claim cited; citation count ≥ 4. | template §references |
| **Static export and build checks** | No API routes/middleware/server actions/runtime revalidation added; required checks pass. | `next.config.mjs`, `npm run check:fast`, `npm run build` |

## Preflight

- Identify the exact template: commercial, guide, comparison, herb authority, or
  compound authority.
- Open the generated page spec under `docs/page-specs/` and keep its route,
  affiliate target, internal links, FAQ, and schema requirements visible while editing.
- Confirm whether the change belongs in workbook data, `public/data`, structured
  page data, or route code before editing.
- Validate slugs and required fields before writing JSON artifacts.

## Per-phase exit gate

Per the roadmap, **re-measure after each phase** before moving on. Confirm against
[`../content-priority-scoreboard.md`](../content-priority-scoreboard.md) signal pass:

- [ ] Word count at target
- [ ] `FAQPage` schema present
- [ ] Citations ≥ 4
- [ ] Affiliate placements in target range
- [ ] Internal links at target
- [ ] Static export compatible: no server-only Next.js APIs introduced
- [ ] Quality gate green:
  - Template-only/doc change: `npm run typecheck`
  - Content/data change: `npm run check:fast`
  - Route/schema/affiliate change: `npm run build && npm run verify:output`

## Portfolio definition-of-done (all 25)

From the roadmap Portfolio Summary — the program is complete when:

- [ ] Combined words ~47,000 (+33,600)
- [ ] 25/25 pages with `FAQPage` schema
- [ ] 25/25 pages with citations (≥4)
- [ ] 25/25 pages with ≥3 affiliate placements
- [ ] Avg. internal links/page ~9
- [ ] Avg. weighted score ~91
