import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'

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

const validSlugs = new Set([
  ...generatedComparisons,
  ...supplementComparisons.map(c => c.slug),
  ...adjacentPairs
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
