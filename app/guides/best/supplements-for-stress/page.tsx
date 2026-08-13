import type { Metadata } from 'next'
import BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'

const CANONICAL_PATH = '/guides/best/supplements-for-stress/'

export const metadata: Metadata = {
  title: 'Best Supplements for Stress: Evidence & Safety',
  description:
    'Evidence-first comparison of ashwagandha, rhodiola, magnesium, and L-theanine for stress-related outcomes, with directness, safety, and combination limits.',
  alternates: { canonical: CANONICAL_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Best Supplements for Stress: Evidence & Safety',
    description:
      'Compare stress supplements by the outcomes, populations, formulations, and durations actually studied instead of copying a stack recipe.',
    url: CANONICAL_PATH,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

export default BestSupplementsForStressPage
