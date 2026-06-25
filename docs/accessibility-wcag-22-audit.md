# The Hippie Scientist — WCAG 2.2 Accessibility Audit

Last updated: 2026-06-24

This document tracks the accessibility architecture pass for The Hippie Scientist. It is intentionally focused on implementation details that matter for a Next.js static-export site with a scientific-content mission.

## Conformance Target

- Target baseline: WCAG 2.2 Level AA.
- Selective AAA enhancements: focus appearance, focus-not-obscured enhanced behavior, target size, contrast where practical, and text-spacing resilience.
- Source-of-truth rule: do not edit generated `public/data/**` files or workbook-derived factual content while doing accessibility work.

## Implemented

### Global Focus and Target Sizing

File: `styles/accessibility-wcag-22.css`

Implemented:

- WCAG 2.4.7 Focus Visible, AA.
- WCAG 2.4.11 Focus Not Obscured, AA.
- WCAG 2.4.12 Focus Not Obscured Enhanced, AAA baseline.
- WCAG 2.4.13 Focus Appearance, AAA.
- WCAG 2.5.5 Target Size Enhanced, AAA where feasible.
- WCAG 1.4.10 Reflow.
- WCAG 1.4.11 Non-text Contrast.
- WCAG 1.4.12 Text Spacing resilience.

Notes:

- Focus indicators use a 3px solid outline plus an outer halo.
- Focusable elements receive scroll margins so mobile fixed content does not cover focused controls.
- Interactive controls are globally nudged toward 44px minimum target size, excluding inline prose links.
- Forced-colors support is included.

### Skip Link and Main Landmark

File: `app/layout.tsx`

Implemented:

- WCAG 2.4.1 Bypass Blocks.
- WCAG 3.1.1 Language of Page.
- WCAG 1.3.1 Info and Relationships.

Notes:

- Root `<html lang="en">` is present.
- Skip link now uses the global `.skip-link` pattern.
- The only page-level `<main>` lives in `app/layout.tsx` and is programmatically focusable with `tabIndex={-1}` for skip-link landing.

### Responsive Tables

Files:

- `components/ui/ResponsiveTable.tsx`
- `components/ComparisonTable.tsx`
- `components/compare-table-client.tsx`
- `components/compare/EvidenceMatrix.tsx`
- `mdx-components.tsx`

Implemented:

- WCAG 1.3.1 Info and Relationships.
- WCAG 2.1.1 Keyboard.
- WCAG 2.4.6 Headings and Labels.

Notes:

- Wide tables use a keyboard-focusable scroll region through the shared `ResponsiveTable` wrapper.
- Tables receive captions.
- Data tables use `scope="col"` and `scope="row"`.
- MDX tables receive a default screen-reader caption.

### Navigation

Files:

- `components/Navigation.tsx`
- `src/components/mobile-bottom-nav.tsx`

Implemented:

- WCAG 2.1.1 Keyboard.
- WCAG 2.4.3 Focus Order.
- WCAG 2.4.6 Headings and Labels.
- WCAG 4.1.2 Name, Role, Value.

Notes:

- Mobile bottom navigation has `aria-label="Primary mobile navigation"`.
- Mobile drawer has `role="dialog"`, `aria-modal="true"`, and a clear accessible label.
- Icons that are purely decorative are marked `aria-hidden="true"`.

### Search and Dynamic UI

Files:

- `components/search/search-ui.tsx`
- `components/compare-table-client.tsx`

Implemented:

- Filter chips increased to 44px minimum height.
- Compare search uses a labeled input, clear button label, and live selected-state updates.
- Compare table selection controls use `aria-pressed` for toggle buttons.

## Current Known Opportunities

### High Priority

1. Run full automated validation:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run validate:static-export`
   - `npm run test`
   - `npm run build`
2. Run axe/Lighthouse on critical routes:
   - `/`
   - `/goals`
   - `/goals/anxiety`
   - `/goals/sleep`
   - `/guides`
   - `/compare`
   - `/search`
   - `/herbs/ashwagandha`
   - `/compounds/l-theanine`
3. Manually keyboard-test mobile bottom nav and skip-link behavior on iOS Safari-sized viewport.

### Medium Priority

1. Convert older guide-template dosage tables in `components/guides/GuidePage.tsx` to `ResponsiveTable`.
   - Add caption.
   - Add `scope="col"` to column headers.
   - Change first data cell to row header with `scope="row"`.
   - Keep workbook/source content unchanged.
2. Audit all remaining raw `<table>` occurrences and either:
   - confirm table semantics are complete, or
   - migrate to `ResponsiveTable`.
3. Check all custom icon-only buttons for visible text or `aria-label`.
4. Check dark-mode contrast on hardcoded utility colors.

### Lower Priority

1. Add glossary or inline definition components for dense scientific terms.
2. Add optional simplified summaries for complex articles without altering evidence claims.
3. Add Playwright keyboard route smoke tests.
4. Add CI axe checks for a small route set after static export.

## AAA Checklist

| WCAG SC | Status | Notes |
|---|---:|---|
| 2.4.13 Focus Appearance | Implemented | 3px outline plus halo, light/dark aware. |
| 2.4.12 Focus Not Obscured Enhanced | Implemented baseline | Scroll padding/margins added; needs manual mobile verification. |
| 2.5.5 Target Size Enhanced | Implemented where feasible | Global controls and major UI chips are 44px; inline prose links excluded. |
| 1.4.6 Contrast Enhanced | Partial | Needs contrast scan on remaining hardcoded colors. |
| 1.4.8 Visual Presentation | Partial | Text spacing/reflow improved; full customization not implemented. |
| 3.1.5 Reading Level | Deferred | Use glossary/summaries selectively to preserve scientific accuracy. |

## Recommended CI Additions

Add a future `validate:a11y` script that runs after static export:

```bash
npm run build
npx @axe-core/cli out/index.html
```

For better route coverage, prefer Playwright + axe after static export:

```bash
npm run build
npx playwright test tests/a11y.spec.ts
```

Suggested route fixture list:

```ts
const routes = [
  '/',
  '/goals',
  '/guides',
  '/compare',
  '/search',
  '/herbs/ashwagandha',
  '/compounds/l-theanine',
]
```

## Manual Verification Script

1. Load the homepage.
2. Press Tab once.
3. Confirm skip link appears and is not clipped.
4. Press Enter.
5. Confirm focus lands at main content.
6. Tab through navigation and search.
7. Open search, type a query, use arrow keys, Enter, Escape.
8. Open mobile nav at 390px viewport.
9. Confirm focus rings are visible and not hidden by bottom nav.
10. Visit `/compare` and use the search, toggle buttons, and comparison table by keyboard.
11. Test light mode and dark mode.
12. Test browser zoom at 200% and mobile width at 320px.
