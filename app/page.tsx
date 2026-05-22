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
      'Explore evidence-aware guides on herbs, compounds, stacks, and supplement decisions with mechanism, safety, and tradeoff context.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herbs, Compounds, and Evidence-Based Supplement Guides',
    description:
      'Explore evidence-aware guides on herbs, compounds, stacks, and supplement decisions with mechanism, safety, and tradeoff context.',
  },
}

export default async function Page() {
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
}
