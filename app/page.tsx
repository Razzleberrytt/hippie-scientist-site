import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { buildPageMetadata } from '../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'The Hippie Scientist - Clinical Evidence & Safety for Herbs & Supplements',
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

export default function Page() {
  return <HomepageV2 />
}
