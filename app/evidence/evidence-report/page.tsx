import type { Metadata } from 'next'

import { buildPageMetadata } from '@/src/lib/seo'
import EvidenceReportClient from './EvidenceReportClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence Report',
  description: 'Evidence distribution and grading summary across The Hippie Scientist supplement and herb research library.',
  path: '/evidence/evidence-report/',
  openGraphType: 'article',
})

export default function EvidenceReportPage() {
  return <EvidenceReportClient />
}
