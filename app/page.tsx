import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import { buildPageMetadata } from '../lib/seo'
import '@/styles/homepage-structure.css'
import '@/styles/homepage-premium-final.css'
import '@/styles/homepage-mobile-refinement.css'
import '@/styles/homepage-mobile-cohesion.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'The Hippie Scientist: Evidence & Safety for Supplements',
  description:
    'Compare herb and supplement research, human evidence, uncertainties, and safety considerations for sleep, stress, and focus.',
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
