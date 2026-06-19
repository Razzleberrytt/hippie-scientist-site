import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { buildPageMetadata, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  openGraphType: 'website',
})

export default function Page() {
  return <HomepageV2 />
}
