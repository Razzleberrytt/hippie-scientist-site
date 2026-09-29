import type { Metadata } from 'next'
import SiteDestinationGrid from '@/components/navigation/SiteDestinationGrid'
import { buildPageMetadata } from '@/lib/seo'

const TITLE = 'Start Here: Choose What You Are Researching'
const DESCRIPTION =
  'Choose Goals, Guides, Ingredients, Safety, or Research without entering personal medical information.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/start/',
  openGraphType: 'website',
})

export default function StartHerePage() {
  return (
    <div className='container-page mx-auto max-w-7xl space-y-8 py-10 sm:py-14'>
      <header className='rounded-[2rem] border border-brand-900/10 bg-white/95 p-6 shadow-sm sm:p-10'>
        <p className='eyebrow-label'>Start here</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          What are you trying to do?
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Pick the closest task. The same five destinations organize the whole site, and you do not need to share symptoms, diagnoses, medications, or other personal health information to choose a path.
        </p>
      </header>

      <SiteDestinationGrid />
    </div>
  )
}
