import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'
import { COMPARE_COMBINATIONS } from '@/config/compare-combinations'

const adjacentPairs = [
  '11-keto-beta-boswellic-acid-vs-acemannan',
  'acemannan-vs-acetyl-11-keto-beta-boswellic-acid',
  'acetyl-11-keto-beta-boswellic-acid-vs-acetyl-beta-boswellic-acid',
  'acetyl-beta-boswellic-acid-vs-acetylshikonin',
  'acetylshikonin-vs-acteoside',
  'acteoside-vs-aescin',
  'aescin-vs-ajoene',
  'ajoene-vs-albiflorin',
  'albiflorin-vs-alpha-asarone',
  'alpha-asarone-vs-alpha-mangostin',
  'alpha-mangostin-vs-anabasine',
  'anabasine-vs-anatabine',
  'anatabine-vs-andrographolide',
  'andrographolide-vs-anethole',
  'anethole-vs-angelicin',
  'angelicin-vs-apigenin',
  'apigenin-vs-arjunolic-acid',
  'arjunolic-acid-vs-artemisinin',
  'artemisinin-vs-artemisinin-b',
  'artemisinin-b-vs-artesunate',
  'artesunate-vs-asiatic-acid',
  'asiatic-acid-vs-asiaticoside',
  'asiaticoside-vs-aspalathin',
  'aspalathin-vs-astragalin',
]

const staticComparePages = [
  'ashwagandha-vs-l-theanine-vs-magnesium',
  'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  'curcumin-vs-boswellia-vs-omega-3',
  'melatonin-vs-valerian-vs-magnesium-for-sleep',
  'berberine-vs-metformin',
  'kanna-vs-ssris',
  'kava-vs-alcohol',
  'sleep-herbs-vs-melatonin',
]

const validSlugs = new Set([
  ...generatedComparisons,
  ...supplementComparisons.map(c => c.slug),
  ...COMPARE_COMBINATIONS,
  ...adjacentPairs,
  ...staticComparePages,
])

export function getValidComparisonSlug(a: string, b: string): string | undefined {
  const slug1 = `${a}-vs-${b}`
  if (validSlugs.has(slug1)) return slug1
  const slug2 = `${b}-vs-${a}`
  if (validSlugs.has(slug2)) return slug2
  return undefined
}

/**
 * Returns true only when `slug` resolves to a comparison page that is actually
 * built (i.e. emitted by `generateStaticParams` in `app/compare/[slug]/page.tsx`).
 *
 * This is the single guard every dynamic `/compare/...` link generator must pass
 * its candidate slug through. Under static export, linking to a `/compare/...`
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
