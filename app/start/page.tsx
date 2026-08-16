import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'

const TITLE = 'Start Here: Choose What You Are Researching'
const DESCRIPTION =
  'Choose whether you are starting from a goal, an ingredient, or a safety question without entering personal medical information.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/start/',
  openGraphType: 'website',
})

const paths = [
  {
    label: 'Start with a goal',
    href: '/goals/',
    description: 'Choose the outcome or question first, then compare relevant options by evidence, fit, onset, and risk.',
  },
  {
    label: 'Look up an ingredient',
    href: '/search/',
    description: 'Find a herb, nutrient, compound, extract, or familiar supplement by name.',
  },
  {
    label: 'Check safety',
    href: '/safety-checker/',
    description: 'Screen combinations for documented or theoretical caution signals before stacking products.',
  },
] as const

export default function StartHerePage() {
  return (
    <main className='container-page mx-auto max-w-5xl space-y-8 py-10 sm:py-14'>
      <header className='rounded-[2rem] border border-brand-900/10 bg-white/95 p-6 shadow-sm sm:p-10'>
        <p className='eyebrow-label'>Start here</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          What are you researching?
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Pick the closest intent. You do not need to describe symptoms, diagnoses, medications, or other personal health information to use this router.
        </p>
      </header>

      <section className='grid gap-4 md:grid-cols-3' aria-label='Research starting points'>
        {paths.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className='group rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/25 hover:bg-brand-50/30'
          >
            <h2 className='text-2xl font-bold tracking-tight text-ink group-hover:text-brand-800'>{path.label}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{path.description}</p>
            <span className='mt-5 inline-flex text-sm font-bold text-brand-800'>Open path →</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
