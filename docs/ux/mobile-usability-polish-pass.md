# Mobile usability polish pass

## Scope

This pass is limited to active runtime UI surfaces for the mobile experience on:

- `/herbs`
- `/compounds`
- `/search`
- Mobile header menu navigation
- Mobile bottom navigation
- Shared decision-card, chip, filter, and search-result interaction surfaces

## Goals

- Improve thumb ergonomics for filters, mobile menu links, search controls, and bottom navigation.
- Reduce visual noise in search result cards while preserving conservative evidence and safety context.
- Improve wrapping behavior for chips and compact metadata on narrow screens.
- Stabilize vertical rhythm across stacked cards, filters, and result sections.
- Preserve existing route contracts, runtime data contracts, workbook generation, and information architecture.

## Major refinements

- Increased mobile tap target consistency for filter rows, menu links, and bottom navigation items.
- Adjusted bottom navigation spacing to use flexible equal-width items, stronger safe-area padding, and a calmer elevated surface.
- Reduced duplicate metadata pressure in `/search` result cards by keeping profile type as the top badge while retaining evidence and safety metrics inside the card body.
- Added safer heading wrapping for shared profile cards and search cards to avoid clipped or cramped long names.
- Relaxed mobile chip wrapping so long metadata chips can wrap instead of forcing horizontal overflow on narrow screens.
- Tightened mobile page gutters on `/herbs` and `/compounds` to reduce cramped card edges without changing desktop layout.
- Normalized shared filter disclosure padding and touch target heights for calmer mobile scanning.

## Non-goals

- No route changes.
- No redesign of the brand direction, component system, or navigation architecture.
- No workbook, runtime data generation, or package changes.
- No new dependencies.
- No broad refactors or inactive-code cleanup.

## Validation status

Validation completed on this branch with the required commands:

- `npm run lint` — passed.
- `npx tsc --noEmit` — passed.
- `npm run build` — passed. Build output included the existing MVP deploy-readiness warning that `sitemap.xml` is missing, followed by `[deploy-readiness] PASS (MVP relaxed mode)`.

## Known remaining risks

- This pass included one automated mobile screenshot check of `/search`; remaining issues may still appear only on specific physical viewport widths or device safe-area implementations.
- Existing global CSS has multiple layers that define chip/button behavior; this pass only added narrow mobile wrapping safeguards and did not consolidate the styling sources.
- Search result ordering and data payloads were intentionally left unchanged, so any data-quality issues remain outside this UX polish scope.
