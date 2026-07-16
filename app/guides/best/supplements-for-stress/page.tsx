import type { Metadata } from 'next'
import BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'

const CANONICAL_PATH = '/guides/best/supplements-for-stress/'

export const metadata: Metadata = {
  title: 'Best Supplements for Stress: Ashwagandha, Rhodiola, Magnesium & More',
  description:
    'Compare evidence-backed supplements for chronic stress, stress-related fatigue, poor sleep, and acute tension. Includes dosing, safety, and product-selection guidance.',
  alternates: { canonical: CANONICAL_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Best Supplements for Stress: Evidence-Based Guide',
    description:
      'Choose among ashwagandha, rhodiola, magnesium, L-theanine, and phosphatidylserine based on your stress pattern, timeline, and safety needs.',
    url: CANONICAL_PATH,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

export default BestSupplementsForStressPage
