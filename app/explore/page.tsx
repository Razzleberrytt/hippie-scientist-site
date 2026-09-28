import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  LibraryBig,
  Microscope,
  Search,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Explore | Goals, Ingredients, Safety & Research',
  description:
    'Choose a clear path through The Hippie Scientist by goal, ingredient, safety question, guide, or research task without starting from the exhaustive library.',
  path: '/explore/',
})

const primaryPaths = [
  {
    eyebrow: 'Start with an outcome',
    title: 'Explore by goal',
    description: 'Choose the result or question you care about, then compare the relevant options in context.',
    href: '/goals/',
    icon: Target,
  },
  {
    eyebrow: 'Know the name',
    title: 'Look up an ingredient',
    description: 'Search herbs, compounds, nutrients, and extracts, then open the evidence and safety context.',
    href: '/search/',
    icon: FlaskConical,
  },
  {
    eyebrow: 'Check before combining',
    title: 'Review safety',
    description: 'Screen interaction signals, contraindications, stacking risks, and uncertainty before going deeper.',
    href: '/safety-checker/',
    icon: ShieldCheck,
  },
] as const

const deeperPaths = [
  {
    title: 'Guides',
    description: 'Decision guides and explainers for questions that need context.',
    href: '/guides/',
    icon: BookOpen,
  },
  {
    title: 'Research',
    description: 'Studies, citations, evidence tools, reports, and methodology.',
    href: '/research/',
    icon: Microscope,
  },
  {
    title: 'Complete library',
    description: 'The exhaustive directory when you already know what you want to browse.',
    href: '/library/',
    icon: LibraryBig,
  },
] as const

export default function ExplorePage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-9 lg:px-8'>
      <section className='hero-shell rounded-[2rem] border px-5 py-7 sm:p-9' aria-labelledby='explore-title'>
        <p className='eyebrow-label'>Explore</p>
        <h1 id='explore-title' className='mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          What are you trying to do?
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8'>
          Pick one path. The deeper evidence stays available after you have enough context to make sense of it.
        </p>

        <form className='mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border border-brand-900/10 bg-white p-2.5 shadow-sm' action='/search/' method='get' role='search'>
          <Search className='ml-1 h-5 w-5 shrink-0 text-brand-700' aria-hidden='true' />
          <label className='sr-only' htmlFor='explore-search'>Search herbs, compounds, or questions</label>
          <input
            id='explore-search'
            name='q'
            type='search'
            autoComplete='off'
            autoCapitalize='none'
            autoCorrect='off'
            spellCheck={false}
            enterKeyHint='search'
            placeholder='Search a name or question'
            className='min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-ink outline-none placeholder:text-muted sm:px-2'
          />
          <button type='submit' className='inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text-primary)] px-4 text-sm font-bold text-[var(--surface-elevated)] transition hover:opacity-90'>
            Search
          </button>
        </form>
      </section>

      <section aria-labelledby='explore-primary-heading'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Start here</p>
          <h2 id='explore-primary-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
            The three most useful entry points.
          </h2>
        </div>

        <div className='mt-5 grid gap-4 md:grid-cols-3'>
          {primaryPaths.map((path) => {
            const Icon = path.icon
            return (
              <Link
                key={path.href}
                href={path.href}
                className='card-premium group flex min-h-[13rem] flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-700/25 hover:bg-brand-50/30 sm:p-6'
              >
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-800'>
                  <Icon className='h-5 w-5' aria-hidden='true' />
                </span>
                <p className='eyebrow-label mt-4'>{path.eyebrow}</p>
                <h3 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{path.title}</h3>
                <p className='mt-2 text-sm leading-6 text-muted'>{path.description}</p>
                <span className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-brand-700'>
                  Open <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7' aria-labelledby='explore-deeper-heading'>
        <p className='eyebrow-label'>Go deeper when needed</p>
        <h2 id='explore-deeper-heading' className='mt-2 text-2xl font-semibold tracking-tight text-ink'>
          Guides, source-level research, and the full directory.
        </h2>

        <div className='mt-5 divide-y divide-brand-900/10'>
          {deeperPaths.map((path) => {
            const Icon = path.icon
            return (
              <Link
                key={path.href}
                href={path.href}
                className='group flex min-h-16 items-center gap-4 py-4 first:pt-0 last:pb-0'
              >
                <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800'>
                  <Icon className='h-5 w-5' aria-hidden='true' />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block text-sm font-semibold text-ink'>{path.title}</span>
                  <span className='mt-1 block text-xs leading-5 text-muted'>{path.description}</span>
                </span>
                <ArrowRight className='h-4 w-4 shrink-0 text-brand-700 transition-transform group-hover:translate-x-1' aria-hidden='true' />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
