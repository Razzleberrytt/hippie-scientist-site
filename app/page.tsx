import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

export const metadata: Metadata = {
  title: { absolute: 'The Hippie Scientist – Evidence-Based Herb & Supplement Research' },
  description:
    'Research-backed profiles for herbs, nootropics, and compounds. Compare evidence, safety, and mechanisms — without the hype.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Herbs, Compounds, and Evidence-Based Supplement Guides',
    description:
      'Compare herbs, compounds, stacks, and supplement decisions by fit, safety, and evidence.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herbs, Compounds, and Evidence-Based Supplement Guides',
    description:
      'Compare herbs, compounds, stacks, and supplement decisions by fit, safety, and evidence.',
  },
}

export default async function Page() {
  try {
    const [herbs, compounds] = await Promise.all([
      getHerbSummaryIndex(),
      getCompoundSummaryIndex(),
    ])

    const featuredHerbs = herbs
      .filter((item: any) => getRuntimeVisibility(item).canFeature)
      .slice(0, 3)

    const featuredCompounds = compounds
      .filter((item: any) => getRuntimeVisibility(item).canFeature)
      .slice(0, 3)

    return (
      <HomepageV2
        featuredHerbs={featuredHerbs}
        featuredCompounds={featuredCompounds}
      />
    )
  } catch (e) {
    console.error('[homepage] Data load failed:', e)
    return <HomepageV2 featuredHerbs={[]} featuredCompounds={[]} />
  }
}
