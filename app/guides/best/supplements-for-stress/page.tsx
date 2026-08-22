import type { Metadata } from 'next'
import BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'
import { buildTwitterMetadata } from '@/src/lib/seo'

const CANONICAL_PATH = '/guides/best/supplements-for-stress/'

export const metadata: Metadata = {
  title: 'Best Supplements for Stress: Evidence-Ranked Guide (2026)',
  description:
    'Evidence-ranked stress supplements with 18 clinical sources: ashwagandha, rhodiola, magnesium and L-theanine, plus careful context on omega-3 and saffron.',
  alternates: { canonical: CANONICAL_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Best Supplements for Stress: Evidence-Ranked Guide (2026)',
    description:
      'Compare stress supplements by direct human evidence, formulation, effect size, safety, negative trials and what the research does not establish.',
    url: CANONICAL_PATH,
    type: 'article',
    images: ['/images/guides/best-supplements-for-stress.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Best Supplements for Stress: Evidence-Ranked Guide (2026)',
    description: 'Compare stress supplements by direct human evidence, formulation, effect size, safety and important negative trials.',
  }),
}

export default BestSupplementsForStressPage