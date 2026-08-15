import type { Metadata } from 'next'
import OnDemandComparisonClient from './OnDemandComparisonClient'

export const metadata: Metadata = {
  title: 'On-Demand Supplement Comparison',
  description: 'A temporary side-by-side research view assembled from canonical ingredient data.',
  alternates: { canonical: '/compare/on-demand/' },
  robots: {
    index: false,
    follow: true,
  },
}

export default function OnDemandComparisonPage() {
  return <OnDemandComparisonClient />
}
