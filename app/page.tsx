import type { Metadata } from 'next'
import HomepageV2 from '@/components/homepage-v2'
import HomepageDecisionShortcuts from '@/components/HomepageDecisionShortcuts'
import NewsletterSignup from '@/components/NewsletterSignup'
import { buildPageMetadata } from '../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
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

export default function Page() {
  return (
    <>
      <HomepageV2 />
      <div className='mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10'>
        <NewsletterSignup location='homepage-editorial' variant='editorial' />
      </div>
      <HomepageDecisionShortcuts />
    </>
  )
}
