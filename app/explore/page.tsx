import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeftRight,
  ArrowRight,
  FlaskConical,
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

const taskPaths = [
  {
    eyebrow: 'Start with an outcome',
    title: 'Browse by goal',
    description: 'Start with sleep, stress, focus, mood, recovery, or another question, then compare the relevant options in context.',
    href: '/goals/',
    icon: Target,
  },
  {
    eyebrow: 'Check before combining',
    title: 'Check an interaction',
    description: 'Review known and plausible interaction signals, contraindications, and uncertainty before combining supplements or medicines.',
    href: '/safety-checker/interactions/',
    icon: ShieldCheck,
  },
  {
    eyebrow: 'Choosing between options',
    title: 'Compare ingredients',
    description: 'Compare evidence, safety, forms, doses, and practical tradeoffs side by side instead of reading isolated profiles.',
    href: '/guides/compare/',
    icon: ArrowLeftRight,
  },
  {
    eyebrow: 'Trace the evidence',
    title: 'Inspect research & updates',
    description: 'Find studies, check evidence strength, see what changed, review methodology, and trace claims back to their sources.',
    href: '/research/',
    icon: Microscope,
  },
] as const

export default function ExplorePage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-9 lg:px-8'>
      <section className='hero-shell rounded-[2rem] border px-5 py-7 sm:p-9' aria-labelledby='explore-title'>
        <p className='eyebrow-label'>Explore the evidence</p>
        <h1 id='explore-title' className='mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          What are you trying to figure out?
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8'>
          Know the name? Search it directly. Otherwise choose the job that matches your question and open the deeper evidence only when you need it.
        </p>

        <div className='mt-6 max-w-3xl rounded-2xl border border-brand-900/10 bg-white p-3 shadow-sm sm:p-4'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800'>
              <FlaskConical className='h-5 w-5' aria-hidden='true' />
            </span>
            <div className='min-w-0'>
              <p className='text-sm font-bold text-ink'>Look up an herb or compound</p>
              <p className='mt-0.5 text-xs leading-5 text-muted'>Names, aliases, scientific names, extracts, or a plain-language question.</p>
            </div>
          </div>

          <form className='mt-3 flex items-center gap-2 rounded-xl border border-brand-900/10 bg-brand-50/25 p-2' action='/search/' method='get' role='search'>
            <Search className='ml-1 h-5 w-5 shrink-0 text-brand-700' aria-hidden='true' />
            <label className='sr-only' htmlFor='explore-search'>Search herbs, compounds, aliases, or questions</label>
            <input
              id='explore-search'
              name='q'
              type='search'
              autoComplete='off'
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
              enterKeyHint='search'
              placeholder='Try “mitragynine”, “7-OH”, or a question'
              className='min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-ink outline-none placeholder:text-muted sm:px-2'
            />
            <button type='submit' className='inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text-primary)] px-4 text-sm font-bold text-[var(--surface-elevated)] transition hover:opacity-90'>
              Search
            </button>
          </form>

          <p className='mt-3 text-xs leading-5 text-muted'>
            Prefer to browse? <Link href='/herbs/' className='font-semibold text-brand-700 hover:underline'>Herbs</Link>
            {' · '}
            <Link href='/compounds/' className='font-semibold text-brand-700 hover:underline'>Compounds</Link>
          </p>
        </div>
      </section>

      <section aria-labelledby='explore-task-heading'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Choose the job</p>
          <h2 id='explore-task-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
            Four paths when a name alone is not enough.
          </h2>
          <p className='mt-3 text-sm leading-7 text-muted'>
            Each path has a different purpose, so you do not have to decode the site structure before finding the useful part.
          </p>
        </div>

        <div className='mt-5 overflow-hidden rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] shadow-sm divide-y divide-brand-900/10'>
          {taskPaths.map((path) => {
            const Icon = path.icon
            return (
              <Link
                key={path.href}
                href={path.href}
                className='group grid min-h-24 grid-cols-[2.75rem_minmax(0,1fr)_1.25rem] items-center gap-3 px-4 py-4 transition hover:bg-brand-50/30 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-4 sm:px-5'
              >
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800'>
                  <Icon className='h-5 w-5' aria-hidden='true' />
                </span>
                <span className='min-w-0'>
                  <span className='eyebrow-label block'>{path.eyebrow}</span>
                  <span className='mt-1 block text-base font-semibold tracking-tight text-ink sm:text-lg'>{path.title}</span>
                  <span className='mt-1 block text-xs leading-5 text-muted sm:text-sm sm:leading-6'>{path.description}</span>
                </span>
                <span className='inline-flex items-center gap-2 text-sm font-bold text-brand-700'>
                  <span className='hidden sm:inline'>Open</span>
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white px-5 py-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6' aria-labelledby='explore-library-heading'>
        <div className='min-w-0'>
          <p className='eyebrow-label'>Need everything?</p>
          <h2 id='explore-library-heading' className='mt-1 text-lg font-semibold text-ink'>Open the complete library</h2>
          <p className='mt-1 text-xs leading-5 text-muted'>Use the exhaustive directory when you already know which section or resource you want.</p>
        </div>
        <Link href='/library/' className='mt-3 inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-brand-700 hover:underline sm:mt-0'>
          Complete library <ArrowRight className='h-4 w-4' aria-hidden='true' />
        </Link>
      </section>
    </div>
  )
}
