import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { getPublicSiteMetrics } from '@/lib/public-site-metrics'
import { getResearchSourceRegisterSummary } from '@/lib/research-source-register'

const firstVisitPaths = [
  {
    label: 'Find an ingredient',
    description: 'Look up a supplement and its evidence.',
    href: '/herbs/',
  },
  {
    label: 'Compare options',
    description: 'See study context and tradeoffs.',
    href: '/guides/compare/',
  },
  {
    label: 'Check safety concerns',
    description: 'Review interaction and caution signals.',
    href: '/safety-checker/',
  },
] as const

export default async function HomepageV2() {
  const metrics = await getPublicSiteMetrics()
  const researchSourceRegister = getResearchSourceRegisterSummary()
  const stats = [
    { value: metrics.publishedArticles, label: 'Published articles' },
    { value: metrics.publishedHerbs, label: 'Published herbs' },
    { value: metrics.totalCompounds, label: 'Compounds tracked' },
    { value: metrics.structuredStudies, label: 'Structured studies' },
  ]

  return (
    <div className='hs-home'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 pb-20 pt-5 sm:px-6 sm:pt-6 lg:px-8'>
        <section className='hero-shell rounded-[2rem] border px-5 py-7 sm:p-10' aria-labelledby='home-title'>
          <p className='eyebrow-label'>Evidence-based supplement research</p>
          <h1 id='home-title' className='mt-3 max-w-5xl font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl'>
            Which supplements actually work—and what does the research say about their risks?
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8'>
            Compare human evidence where available, safety concerns, and study-backed outcomes without the marketing hype. When the research cannot establish an answer, we say so.
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
            <button type='submit' className='inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text-primary)] px-4 text-sm font-bold !text-[var(--surface-elevated)] transition hover:opacity-90 sm:px-5'>
              Search
            </button>
          </form>

          <nav className='mt-5' aria-label='Choose your first step'>
            <p className='mb-3 text-sm font-semibold text-ink'>What would you like to do?</p>
            <div className='grid gap-2 sm:grid-cols-3'>
              {firstVisitPaths.map((path) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className='group flex min-h-12 flex-col justify-center rounded-2xl border border-brand-900/10 bg-[var(--surface-elevated)] px-4 py-3 text-left shadow-sm transition hover:border-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700'
                >
                  <span className='flex items-center justify-between gap-2 text-sm font-bold text-ink'>
                    {path.label} <ArrowRight className='h-4 w-4 shrink-0 text-brand-700 transition group-hover:translate-x-0.5' aria-hidden='true' />
                  </span>
                  <span className='mt-1 text-xs leading-5 text-muted'>{path.description}</span>
                </Link>
              ))}
            </div>
          </nav>
          <p className='mt-4 text-sm text-muted'>
            Looking for something else? <Link href='/explore/' className='inline-flex min-h-11 items-center gap-1 font-semibold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'>Explore the site <ArrowRight className='h-4 w-4' aria-hidden='true' /></Link>
          </p>
          <p className='mt-4 text-xs leading-5 text-muted'>
            Need the exhaustive index? <Link href='/library/' className='font-semibold text-brand-700 hover:underline'>Open the complete library</Link>.
          </p>
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

            <dl className='grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3' aria-label='Research library size'>
              {stats.map((stat) => (
                <div key={stat.label} className='min-w-0 rounded-xl bg-brand-50/60 p-3 text-center sm:p-4'>
                  <dd className='text-2xl font-bold text-ink'>{stat.value}</dd>
                  <dt className='mt-1 text-[11px] leading-4 text-muted'>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <p className='mt-5 max-w-4xl border-t border-brand-900/10 pt-4 text-sm leading-6 text-muted'>
            Beyond the published evidence dataset, our source register tracks <strong className='text-ink'>{researchSourceRegister.totalIndexedPmids.toLocaleString()} unique PubMed references</strong> for further editorial review. Those are research-only identities, not an additional count of graded clinical studies. <Link href='/research/source-register/' className='font-semibold text-brand-700 hover:underline'>Explore the source trail →</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
