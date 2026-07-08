/**
 * The comparison pages that are ACTUALLY built as static routes under
 * `app/guides/compare/<slug>/page.tsx`.
 *
 * Under static export there is no `[slug]` route and no `generateStaticParams`, so a
 * `/guides/compare/<slug>` page exists **only** when its directory exists. The config
 * comparison lists (`COMPARE_COMBINATIONS`, `generatedComparisons`, `supplementComparisons`)
 * and the historical hard-coded "adjacent pair" list enumerate *intended* comparisons
 * that are NOT built — treating them as built is what emitted internal links (and the
 * sitemap) to hundreds of pages that 404, the `/guides/compare/*` Search Console cluster.
 *
 * This is the single runtime source of truth for the guards below. It is kept **pure**
 * (no `node:fs`) because this module is imported by RSC/authority components. Drift from
 * the real page.tsx directories fails CI via
 * `app/__tests__/compare-sitemap-integrity.test.ts` (which diffs this against
 * `getBuiltCompareSlugs()`), so add the slug here when you add a compare page.
 */
export const BUILT_COMPARE_SLUGS = [
  'ashwagandha-vs-l-theanine-vs-magnesium',
  'berberine-vs-metformin',
  'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  'curcumin-vs-boswellia-vs-omega-3',
  'kanna-vs-ssris',
  'kava-vs-alcohol',
  'melatonin-vs-magnesium',
  'melatonin-vs-valerian-vs-magnesium-for-sleep',
  'rhodiola-vs-ashwagandha',
  'sleep-herbs-vs-melatonin',
] as const

const validSlugs = new Set<string>(BUILT_COMPARE_SLUGS)

export function getValidComparisonSlug(a: string, b: string): string | undefined {
  const slug1 = `${a}-vs-${b}`
  if (validSlugs.has(slug1)) return slug1
  const slug2 = `${b}-vs-${a}`
  if (validSlugs.has(slug2)) return slug2
  return undefined
}

/**
 * Returns true only when `slug` resolves to a comparison page that is actually
 * built — i.e. a directory in `BUILT_COMPARE_SLUGS` / `app/guides/compare/<slug>/`.
 *
 * This is the single guard every dynamic `/guides/compare/...` link generator must pass
 * its candidate slug through. Under static export, linking to a `/guides/compare/...`
 * slug that is NOT built produces a hard 404 the moment Google crawls it — the
 * root cause of the large "Not found (404)" cluster in Search Console. Validating
 * here keeps internal links honest and prevents that class of phantom URL from
 * ever being emitted again.
 */
export function isBuiltComparisonSlug(slug: string): boolean {
  return typeof slug === 'string' && validSlugs.has(slug)
}

export function formatComparisonSlug(slug: string): string {
  let title = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bFor\b/g, 'for')
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bTo\b/g, 'to')

  // Apply special case overrides:
  const overrides: Record<string, string> = {
    'L Theanine': 'L-Theanine',
    'Alpha Gpc': 'Alpha-GPC',
    'Cdp Choline': 'CDP-Choline',
    '5 Htp': '5-HTP',
    'Coq10': 'CoQ10',
    'Pea': 'PEA',
    'Nac': 'NAC',
    'Ssris': 'SSRIs',
    'D3': 'D3',
    '11 Keto Beta Boswellic Acid': '11-Keto-Beta-Boswellic-Acid',
    'Acemannan': 'Acemannan',
    'Acetyl 11 Keto Beta Boswellic Acid': 'Acetyl-11-Keto-Beta-Boswellic-Acid',
    'Acetyl Beta Boswellic Acid': 'Acetyl-Beta-Boswellic-Acid',
    'Acetylshikonin': 'Acetylshikonin',
    'Acteoside': 'Acteoside',
    'Aescin': 'Aescin',
    'Ajoene': 'Ajoene',
    'Albiflorin': 'Albiflorin',
    'Alpha Asarone': 'Alpha-Asarone',
    'Alpha Mangostin': 'Alpha-Mangostin',
    'Anabasine': 'Anabasine',
    'Anatabine': 'Anatabine',
    'Andrographolide': 'Andrographolide',
    'Anethole': 'Anethole',
    'Angelicin': 'Angelicin',
    'Apigenin': 'Apigenin',
    'Arjunolic Acid': 'Arjunolic-Acid',
    'Artemisinin': 'Artemisinin',
    'Artemisinin B': 'Artemisinin-B',
    'Artesunate': 'Artesunate',
    'Asiatic Acid': 'Asiatic-Acid',
    'Asiaticoside': 'Asiaticoside',
    'Aspalathin': 'Aspalathin',
    'Astragalin': 'Astragalin',
  }

  for (const [key, value] of Object.entries(overrides)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi')
    title = title.replace(regex, value)
  }

  return title
}
