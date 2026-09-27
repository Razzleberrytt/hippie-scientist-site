import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import SiteDestinationGrid from '@/components/navigation/SiteDestinationGrid'
import { getPublicSiteMetrics } from '@/lib/public-site-metrics'

export default async function HomepageV2() {
  const metrics = await getPublicSiteMetrics()
  const stats = [
    { value: metrics.publishedHerbs, label: 'Published herbs' },
    { value: metrics.publishedCompounds, label: 'Published compounds' },
    { value: metrics.structuredStudies, label: 'Structured studies' },
  ]

  return (
    <div className='hs-home'>
      <div className='mx-auto max-w-7xl space-y-10 px-4 pb-20 pt-6 sm:px-6 lg:px-8'>
        <section className='hero-shell rounded-[2rem] border px-5 py-8 sm:p-10' aria-labelledby='home-title'>
          <p className='eyebrow-label'>Evidence-based supplement research</p>
          <h1 id='home-title' className='mt-4 max-w-5xl font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl'>
            Find the right path before you dive into the details.
          </h1>
          <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
            Search directly when you know the name, or choose the job you are trying to do: compare a goal, read a guide, look up an ingredient, check safety, or verify the research.
          </p>

          <form className='mt-7 flex max-w-3xl items-center gap-3 rounded-2xl border border-brand-900/10 bg-white p-3 shadow-sm' action='/search/' method='get' role='search'>
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
              className='min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-ink outline-none placeholder:text-muted'
            />
            <button type='submit' className='inline-flex min-h-11 items-center justify-center rounded-full bg-brand-900 px-5 text-sm font-bold text-white'>
              Search
            </button>
          </form>

          <div className='mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
            <Link href='/start/' className='font-semibold text-brand-700 hover:underline'>Not sure where to begin? Start here →</Link>
            <Link href='/library/' className='font-semibold text-brand-700 hover:underline'>Browse the complete directory →</Link>
          </div>
        </section>

        <section aria-labelledby='home-destinations-heading'>
          <div className='max-w-3xl'>
            <p className='eyebrow-label'>Five destinations</p>
            <h2 id='home-destinations-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
              Choose what you are trying to accomplish.
            </h2>
            <p className='mt-3 text-sm leading-7 text-muted'>
              These same five destinations organize the rest of the site, so the structure stays consistent after you click through.
            </p>
          </div>
          <div className='mt-6'>
            <SiteDestinationGrid />
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
                The site separates clinical outcomes from mechanisms, keeps interaction and contraindication context visible, and leaves uncertainty intact instead of turning every study into a recommendation.
              </p>
              <Link href='/info/methodology/' className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline'>
                Read the methodology <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>

            <dl className='grid grid-cols-3 gap-3' aria-label='Research library size'>
              {stats.map((stat) => (
                <div key={stat.label} className='min-w-[7rem] rounded-xl bg-brand-50/60 p-4 text-center'>
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
