import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { buildPageMetadata } from '../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'The Hippie Scientist - Supplement Guides for Sleep, Stress, Anxiety, and Focus',
  description:
    'Choose evidence-based supplement guides for sleep, stress, anxiety, and focus, with human evidence, safety cautions, and uncertainty kept visible.',
  path: '/',
  openGraphType: 'website',
})

export default function Page() {
  return <HomepageV2 />
}
