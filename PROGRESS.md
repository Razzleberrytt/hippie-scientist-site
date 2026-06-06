# Project Progress

## Current Status

The evidence-based herb and supplement research platform is fully operational, building successfully, and type-safe. Recent audit-driven fixes have resolved critical data leaks, redirect loops, and static export compilation failures.

**Last updated:** June 5, 2026

---

## Completed in the Last Pass

1. **Workbook Data Quality Cleanup**:
   - Cleared **15 leaked raw internal pipeline text rows** (e.g. `"Lean bulk ingestion row for..."`) in `Herb Master V3` in [herb_monograph_master.xlsx](file:///c:/Users/Will/hippie-scientist-site/data-sources/herb_monograph_master.xlsx).
   - Replaced **23 duplicate placeholder descriptions** (e.g. `"Conservative evidence framing applied."`) with custom, context-specific descriptive summaries.
   - Rebuilt all static JSON files in `public/data/` from the workbook.

2. **Redirect Validation & Loop Prevention**:
   - Truncated the legacy auto-generated redirects and successfully applied **104 loop-free redirects** using the de-duplication mapping in `apply-slug-redirects.mjs`.
   - Updated the truncation script to check both `# SYSTEM SLUG DE-DUPLICATION REDIRECTS` and `# AUTO-GENERATED DUPLICATE SLUG REDIRECTS` to avoid orphaned/duplicate redirect blocks.
   - Added manual redirects for `/compounds/coq10` to `/compounds/coenzyme-q10` in the manual section of [public/_redirects](file:///c:/Users/Will/hippie-scientist-site/public/_redirects).
   - Generated canonical herb redirects via [generate-herb-redirects.mjs](file:///c:/Users/Will/hippie-scientist-site/scripts/generate-herb-redirects.mjs).

3. **Next.js Static Export Build & Type Safety**:
   - Fixed Next.js prerendering errors on `/blog` and `/compounds` pages under static export (`output: 'export'`) by setting `export const dynamic = 'force-static'`.
   - Resolved the `generateStaticParams` type error in `app/compounds/page/[page]/page.tsx` and ESLint checks.
   - Fixed the Windows quote-escaping syntax error in [orchestrate-build.mjs](file:///c:/Users/Will/hippie-scientist-site/scripts/orchestrate-build.mjs).

---

## Ongoing Work & Next Priorities

- [ ] **Affiliate Tag Verification**: Perform a routine check on custom affiliate tag performance in Cloudflare Pages.
- [ ] **Sourcing & Buying Criteria expansion**: Standardize and expand criteria across less common herbs in the workbook.
- [ ] **Deployment Verification**: Verify automated CDN deployment pipeline on Cloudflare Pages.
