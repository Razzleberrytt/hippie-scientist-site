import type { RuntimeComparisonSideConfig } from '@/src/lib/runtime-comparison-resolution'

export type RuntimeComparisonSides = {
  left: RuntimeComparisonSideConfig
  right: RuntimeComparisonSideConfig
}

/**
 * The two ingredient sides every runtime comparison page resolves at build time.
 *
 * These lived as private `COMPARISON_LEFT` / `COMPARISON_RIGHT` consts inside each
 * `app/guides/compare/<slug>/page.tsx`, so only the page itself could tell whether
 * its comparison actually resolves. `app/sitemap.ts` could not, and therefore
 * advertised comparisons whose ingredient records are not publishable — pages that
 * call `notFound()` and render `noindex`. Two were live in that state
 * (lions-mane-vs-bacopa, magnesium-glycinate-vs-citrate); any further ingredient
 * demotion silently adds more.
 *
 * Holding the sides here lets the page and the sitemap answer "does this comparison
 * resolve?" from one source, through the same resolver. Pure literal data (no
 * `node:fs`) so RSC components and build-time callers can both import it — the same
 * rule `BUILT_COMPARE_SLUGS` in `lib/comparison-utils.ts` follows.
 *
 * `app/__tests__/sitemap-canonical-visibility.test.ts` fails if this map drifts from
 * the pages that actually render `RuntimeEvidenceComparison`.
 */
export type RuntimeComparisonSlug =
  | 'ashwagandha-vs-magnesium'
  | 'ashwagandha-vs-saffron'
  | 'bacopa-vs-citicoline'
  | 'berberine-vs-cinnamon'
  | 'caffeine-vs-caffeine-l-theanine'
  | 'citicoline-vs-alpha-gpc'
  | 'creatine-monohydrate-vs-alternative-forms'
  | 'l-theanine-vs-ashwagandha'
  | 'l-theanine-vs-magnesium'
  | 'lions-mane-vs-bacopa'
  | 'magnesium-glycinate-vs-citrate'
  | 'magnesium-glycinate-vs-oxide'
  | 'magnesium-glycinate-vs-threonate'
  | 'melatonin-vs-l-theanine'
  | 'melatonin-vs-valerian'
  | 'rhodiola-vs-l-theanine'
  | 'turmeric-vs-curcumin'

export const RUNTIME_COMPARISON_SIDES: Record<RuntimeComparisonSlug, RuntimeComparisonSides> = {
  'ashwagandha-vs-magnesium': {
    left: { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] },
    right: { label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-citrate', 'magnesium-threonate'] },
  },
  'ashwagandha-vs-saffron': {
    left: { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] },
    right: { label: 'Saffron', candidates: ['saffron', 'crocus-sativus', 'saffron-extract'] },
  },
  'bacopa-vs-citicoline': {
    left: { label: 'Bacopa', candidates: ['bacopa', 'bacopa-monnieri', 'bacopa-monnieri-extract'] },
    right: { label: 'Citicoline', candidates: ['citicoline', 'cdp-choline'] },
  },
  'berberine-vs-cinnamon': {
    left: { label: 'Berberine', candidates: ['berberine'] },
    right: { label: 'Cinnamon', candidates: ['cinnamon', 'ceylon-cinnamon', 'cinnamomum-verum', 'cinnamomum-cassia'] },
  },
  'caffeine-vs-caffeine-l-theanine': {
    left: { label: 'Caffeine Alone', candidates: ['caffeine'] },
    right: { label: 'L-Theanine Add-On Evidence', candidates: ['l-theanine', 'theanine'] },
  },
  'citicoline-vs-alpha-gpc': {
    left: { label: 'Citicoline', candidates: ['citicoline', 'cdp-choline'] },
    right: { label: 'Alpha-GPC', candidates: ['alpha-gpc', 'alpha-glycerophosphocholine'] },
  },
  'creatine-monohydrate-vs-alternative-forms': {
    left: { label: 'Creatine Monohydrate', candidates: ['creatine-monohydrate', 'creatine'] },
    right: { label: 'Alternative Creatine Form', candidates: ['creatine-hcl', 'creatine-hydrochloride', 'buffered-creatine', 'creatine-ethyl-ester'] },
  },
  'l-theanine-vs-ashwagandha': {
    left: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
    right: { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ksm-66-ashwagandha'] },
  },
  'l-theanine-vs-magnesium': {
    left: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
    right: { label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-citrate', 'magnesium-threonate'] },
  },
  'lions-mane-vs-bacopa': {
    left: { label: 'Lion’s Mane', candidates: ['lions-mane', 'lion-s-mane', 'lions-mane-mushroom', 'hericium-erinaceus'] },
    right: { label: 'Bacopa', candidates: ['bacopa', 'bacopa-monnieri', 'bacopa-monnieri-extract'] },
  },
  'magnesium-glycinate-vs-citrate': {
    left: { label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] },
    right: { label: 'Magnesium Citrate', candidates: ['magnesium-citrate'] },
  },
  'magnesium-glycinate-vs-oxide': {
    left: { label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] },
    right: { label: 'Magnesium Oxide', candidates: ['magnesium-oxide'] },
  },
  'magnesium-glycinate-vs-threonate': {
    left: { label: 'Magnesium Glycinate', candidates: ['magnesium-glycinate', 'magnesium-bisglycinate'] },
    right: { label: 'Magnesium Threonate', candidates: ['magnesium-threonate', 'magnesium-l-threonate'] },
  },
  'melatonin-vs-l-theanine': {
    left: { label: 'Melatonin', candidates: ['melatonin'] },
    right: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
  },
  'melatonin-vs-valerian': {
    left: { label: 'Melatonin', candidates: ['melatonin'] },
    right: { label: 'Valerian', candidates: ['valerian', 'valerian-root', 'valeriana-officinalis'] },
  },
  'rhodiola-vs-l-theanine': {
    left: { label: 'Rhodiola', candidates: ['rhodiola', 'rhodiola-rosea', 'rhodiola-rosea-extract'] },
    right: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
  },
  'turmeric-vs-curcumin': {
    left: { label: 'Turmeric', candidates: ['turmeric', 'curcuma-longa', 'turmeric-extract'] },
    right: { label: 'Curcumin', candidates: ['curcumin', 'curcuminoids'] },
  },
}

export const RUNTIME_COMPARISON_SLUGS = Object.keys(RUNTIME_COMPARISON_SIDES) as RuntimeComparisonSlug[]
