import type { Metadata } from 'next'
import Link from 'next/link'
import { coreGoals, type CoreGoalSlug } from '@/lib/core-goals'
import { buildPageMetadata } from '@/src/lib/seo'

const TITLE = 'Start Here: Choose What You Are Researching'
const DESCRIPTION =
  'Choose a research path for Sleep, Stress, Anxiety, Focus, ingredient lookup, or supplement safety without entering personal medical information.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/start/',
  openGraphType: 'website',
})

const pathDescriptions: Record<CoreGoalSlug, string> = {
  sleep: 'Compare sleep-support evidence, timing, forms, and next-day tradeoffs.',
  stress: 'Explore stress-related evidence without treating every calming mechanism as a proven outcome.',
  anxiety: 'Use stricter evidence and safety framing for anxiety-adjacent research.',
  focus: 'Research attention, cognition, stimulant tradeoffs, and non-stimulant approaches.',
}

const paths = [
  ...coreGoals.map((goal) => ({
    label: goal.label,
    href: goal.href,
    description: pathDescriptions[goal.slug],
  })),
  {
    label: 'Ingredient lookup',
    href: '/search/',
    description: 'Find a herb or compound by common name, scientific context, goal, or mechanism.',
  },
  {
    label: 'Safety',
    href: '/safety-checker/',
    description: 'Screen combinations for documented or theoretical caution flags and open the full safety profiles.',
  },
]

export default function StartHerePage() {
  return (
    <main className='container-page mx-auto max-w-5xl space-y-8 py-10 sm:py-14'>
      <header className='rounded-[2rem] border border-brand-900/10 bg-white/95 p-6 shadow-sm sm:p-10'>
        <p className='eyebrow-label'>Start here</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          What are you researching?
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Pick the closest research path. You do not need to describe symptoms, diagnoses, medications, or other personal health information to use this router.
        </p>
      </header>

      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3' aria-label='Research starting points'>
        {paths.map((path) => (
          <Link
            key={path.label}
            href={path.href}
            className='group rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/25 hover:bg-brand-50/30'
          >
            <h2 className='text-2xl font-bold tracking-tight text-ink group-hover:text-brand-800'>{path.label}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{path.description}</p>
            <span className='mt-5 inline-flex text-sm font-bold text-brand-800'>Open path →</span>
          </Link>
        ))}
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-brand-50/60 p-6 sm:p-8'>
        <h2 className='text-2xl font-bold text-ink'>Not sure which path fits?</h2>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
          Start with ingredient search if you already have a name. Start with Safety if you are checking a combination. Otherwise choose the goal that best describes the information you want to read—not a diagnosis you want the site to make.
        </p>
        <div className='mt-5 flex flex-wrap gap-3'>
          <Link href='/search/' className='button-primary'>Search ingredients</Link>
          <Link href='/safety-checker/' className='button-secondary'>Open Safety Checker</Link>
        </div>
      </section>
    </main>
  )
}
