import type { Metadata } from 'next'
import { buildPageMetadata } from '../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence Lookup — Search 557 Compounds by Clinical Trial Grade',
  description: 'Search our database of 557 herbs and compounds for evidence grades (A-F) based on 816 peer-reviewed studies. See which supplements have real human evidence vs marketing claims.',
  path: '/evidence-checker/',
})

export default function EvidenceCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
