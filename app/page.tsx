import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { buildPageMetadata, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  openGraphType: 'website',
})

export default async function Page() {
  let featuredHerbs: any[] = []
  let featuredCompounds: any[] = []

  try {
    const [herbs, compounds] = await Promise.all([
      getHerbSummaryIndex(),
      getCompoundSummaryIndex(),
    ])

    // Curated high-recognition popular starting points (task requirement; avoid obscure alpha-first picks)
    const popularHerbSlugs = ['ashwagandha', 'turmeric', 'lions-mane', 'rhodiola']
    const popularCompSlugs = ['magnesium-glycinate', 'melatonin', 'l-theanine']

    featuredHerbs = popularHerbSlugs
      .map(slug => herbs.find((item: any) => item.slug === slug))
      .filter((item: any): item is any => Boolean(item) && getRuntimeVisibility(item).canFeature)

    featuredCompounds = popularCompSlugs
      .map(slug => compounds.find((item: any) => item.slug === slug))
      .filter((item: any): item is any => Boolean(item) && getRuntimeVisibility(item).canFeature)

    // Fallback to any canFeature if curated missing (should not happen)
    if (featuredHerbs.length === 0) {
      featuredHerbs = herbs.filter((item: any) => getRuntimeVisibility(item).canFeature).slice(0, 3)
    }
    if (featuredCompounds.length === 0) {
      featuredCompounds = compounds.filter((item: any) => getRuntimeVisibility(item).canFeature).slice(0, 3)
    }
  } catch (e) {
    console.error('[homepage] Data load failed:', e)
  }

  return (
    <HomepageV2
      featuredHerbs={featuredHerbs}
      featuredCompounds={featuredCompounds}
    />
  )
}
