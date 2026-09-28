import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { getPublicSiteMetrics } from '@/lib/public-site-metrics'
import { buildPageMetadata } from '../lib/seo'

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

export default async function HomepageV2() {
  const metrics = await getPublicSiteMetrics()
  const stats = [
    { value: metrics.publishedHerbs, label: 'Published herbs' },
    { value: metrics.publishedCompounds, label: 'Published compounds' },
    { value: metrics.structuredStudies, label: 'Structured studies' },
  ]

  return (
    <div className='hs-home'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 pb-20 pt-5 sm:px-6 sm:pt-6 lg:px-8'>
        <section className='hero-shell rounded-[2rem] border px-5 py-7 sm:p-10' aria-labelledby='home-title'>
          <p className='eyebrow-label'>Evidence-based supplement research</p>
          <h1 id='home-title' className='mt-3 max-w-5xl font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl'>
            Start with the question. Open the evidence when you need it.
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8'>
            Search a name directly, or use Explore to choose a path by goal, ingredient, safety question, guide, or research task.
          </p>

          <form className='mt-6 flex max-w-3xl items-center gap-2 rounded-2xl border border-brand-900/10 bg-white p-2.5 shadow-sm sm:gap-3 sm:p-3' action='/search/' method='get' role='search'>
            <Search className='ml-1 h-5 w-5 shrink-0 text-brand-700' aria-hidden='true' />
            <label className='sr-only' htmlFor='homepage-search'>Search herbs, compounds, or questions</label>
            <input
              id='homepage-search'
              name='q'
              type='search'
              autoComplete='off'
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
              enterKeyHint='search'
              placeholder='Search herbs, compounds, or questions'
              className='min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-ink outline-none placeholder:text-muted sm:px-2'
            />
            <button type='submit' className='inline-flex min-h-11 items-center justify-center rounded-full bg-brand-900 px-4 text-sm font-bold text-white sm:px-5'>
              Search
            </button>
          </form>

          <div className='mt-5 flex flex-wrap items-center gap-3'>
            <Link
              href='/explore/'
              className='inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800'
            >
              Explore the site <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
            <Link
              href='/safety-checker/'
              className='inline-flex min-h-11 items-center rounded-full border border-brand-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50'
            >
              Check safety
            </Link>
          </div>
          <p className='mt-4 text-xs leading-5 text-muted'>
            Need the exhaustive index? <Link href='/library/' className='font-semibold text-brand-700 hover:underline'>Open the complete library</Link>.
          </p>
        </section>

        <section aria-labelledby='home-paths-heading'>
          <div className='max-w-3xl'>
            <p className='eyebrow-label'>Common starting points</p>
            <h2 id='home-paths-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
              Three fast ways into the research.
            </h2>
          </div>

          <div className='mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]'>
            <Link
              href='/goals/'
              className='card-premium group flex min-h-[13rem] flex-col justify-between p-6 transition hover:border-brand-700/25 hover:bg-brand-50/30 sm:p-7'
            >
              <div>
                <p className='eyebrow-label'>Start with an outcome</p>
                <h3 className='mt-2 text-2xl font-semibold tracking-tight text-ink'>Explore by goal</h3>
                <p className='mt-3 max-w-2xl text-sm leading-7 text-muted'>
                  Begin with sleep, anxiety, focus, stress, or another goal and compare the relevant options in context.
                </p>
              </div>
              <span className='mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700'>
                Choose a goal <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
              </span>
            </Link>

            <div className='grid gap-3'>
              <Link href='/search/' className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm transition hover:border-brand-700/25 hover:bg-brand-50/30'>
                <p className='text-sm font-semibold text-ink'>Look up an ingredient</p>
                <p className='mt-1 text-xs leading-5 text-muted'>Jump straight to an herb, compound, nutrient, or extract.</p>
              </Link>
              <Link href='/guides/' className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm transition hover:border-brand-700/25 hover:bg-brand-50/30'>
                <p className='text-sm font-semibold text-ink'>Read a decision guide</p>
                <p className='mt-1 text-xs leading-5 text-muted'>Use a focused guide when the question matters more than the ingredient name.</p>
              </Link>
              <Link href='/explore/' className='rounded-2xl border border-brand-900/10 bg-brand-50/45 p-5 transition hover:border-brand-700/25'>
                <p className='text-sm font-semibold text-brand-800'>See every discovery path →</p>
                <p className='mt-1 text-xs leading-5 text-muted'>Goals, ingredients, safety, guides, research, and the full library.</p>
              </Link>
            </div>
          </div>
        </section>

        <section className='rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8' aria-labelledby='home-trust-heading'>
          <div className='grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end'>
            <div>
              <p className='eyebrow-label'>Evidence stays visible</p>
              <h2 id='home-trust-heading' className='mt-2 text-2xl font-semibold tracking-tight text-ink'>
                Human evidence, safety context, and uncertainty remain part of the answer.
              </h2>
              <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
                Clinical outcomes stay separate from mechanisms, while interaction context and uncertainty remain visible instead of being flattened into a recommendation.
              </p>
              <Link href='/info/methodology/' className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline'>
                Read the methodology <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>

            <dl className='grid grid-cols-3 gap-2 sm:gap-3' aria-label='Research library size'>
              {stats.map((stat) => (
                <div key={stat.label} className='min-w-0 rounded-xl bg-brand-50/60 p-3 text-center sm:p-4'>
                  <dd className='text-2xl font-bold text-ink'>{stat.value}</dd>
                  <dt className='mt-1 text-[11px] leading-4 text-muted'>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </div>
  )
}
