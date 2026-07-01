import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AboutClient from './AboutClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'About The Hippie Scientist',
  description:
    'Meet The Hippie Scientist: an evidence-first herb and supplement reference with transparent editorial review, safety governance, and affiliate separation.',
  path: '/info/info/about/',
})

export default function AboutPage() {
  return <AboutClient />
}
