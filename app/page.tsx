import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { buildPageMetadata } from '../src/lib/seo'
import { getCurrentLocaleAlternates } from '../src/lib/international-seo'

const homepageLocaleAlternates = Object.fromEntries(
  getCurrentLocaleAlternates('/').map((alternate) => [alternate.locale, alternate.url]),
)

const homepageMetadata = buildPageMetadata({
  title: 'The Hippie Scientist: Evidence & Safety for Supplements',
  description:
    'Compare evidence-based plant medicine, herbs, and supplements by goal. Explore human clinical trial evidence, biological mechanisms, and drug interactions for sleep, anxiety, focus, and stress.',
  keywords: [
    'evidence-based herbs',
    'evidence-based supplements',
    'supplement clinical trial evidence',
    'natural anxiolytics research',
    'sleep supplement comparison',
    'adaptogen science safety',
    'herb mechanisms of action',
    'botanical medicine database',
    'nootropic clinical studies',
    'supplement safety and interactions',
  ],
  path: '/',
  openGraphType: 'website',
})

export const metadata: Metadata = {
  ...homepageMetadata,
  alternates: {
    ...homepageMetadata.alternates,
    languages: homepageLocaleAlternates,
  },
}

export default function Page() {
  return <HomepageV2 />
}
