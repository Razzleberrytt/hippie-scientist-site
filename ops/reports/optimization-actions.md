# Focused Optimization Actions (Prompt 23)

Generated: 2026-03-30

## Data-driven target selection

Sources reviewed:
- `ops/reports/conversion-scorecard.json` (Prompt 22 output)
- `public/data/cta-variants.json` (Prompt 21 output)
- `ops/reports/affiliate-inventory.json` (Prompt 20 output)
- `public/data/seo-priority-report.json`

Selection logic used:
1. Start with pages present in conversion scorecard visibility set but marked `insufficient data`.
2. Prioritize collections with strongest SEO opportunity score/rank.
3. Include all pages currently eligible for curated affiliate modules (`ashwagandha`, `chamomile`, `luteolin`).
4. Preserve trust-first ordering for caution-sensitive detail pages.

## Target pages optimized

See machine-readable report: `ops/reports/optimization-targets.json`.

Primary target set:
- `collection:herbs-for-relaxation`
- `collection:herbs-for-sleep`
- `collection:herbs-for-focus`
- `collection:calming-herb-combinations`
- `collection:stimulant-herb-combinations`
- `herb:ashwagandha`
- `herb:chamomile`
- `compound:luteolin`

## Applied optimization strategies

### 1) CTA variant reassignment for high-opportunity collection pages
- Changed page-level CTA overrides from default `C` (editorial-first) to `A` (tool-first compact) for 5 selected collections.
- Intent: reduce delay before interaction-checker CTA exposure and strengthen tool path on high-visibility pages.

### 2) Tool CTA clarity improvements on collection CTA blocks
- Updated Step 1 copy to emphasize immediate interaction validation.
- Updated primary CTA text to explicitly mention running the collection through the Interaction Checker.
- Updated related block title to reinforce “compare next” path before exit.

### 3) Trust-first affiliate module ordering and click intent clarity
- Reordered curated product module to show caution/avoidance notes before “Who it may fit”.
- Updated affiliate button label from generic wording to “Review product fit & disclosure”.
- This preserves disclosure + safety-first framing while improving why-click clarity.

## Variant/config/content adjustments made

- `src/config/ctaExperiments.ts`
  - Added page overrides to force Variant `A` for five selected collection pages.
- `src/pages/CollectionPage.tsx`
  - Strengthened tool CTA microcopy and related/comparison block heading.
- `src/components/CuratedProductModule.tsx`
  - Moved caution/avoidance section earlier in product card.
  - Updated affiliate CTA button copy.

## Verification snapshot

- Conversion scorecard and affiliate inventory reports regenerated successfully.
- Optimization target manifest generated successfully.
- Code-level checks run:
  - `npm run report:affiliate-inventory`
  - `npm run report:conversion-scorecard`
  - `npm run verify:affiliate-products`
