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
