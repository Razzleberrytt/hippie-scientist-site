import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'About The Hippie Scientist',
  description: 'Evidence-first reference for herbs, supplements, and compounds. Mechanism, safety, and practical context.',
  path: '/about/',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
