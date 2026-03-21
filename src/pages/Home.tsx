import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import EmailCapture from '@/components/EmailCapture'
import Hero from '@/components/Hero'
import StatPill from '@/components/StatPill'
import { loadSiteCounts, siteStats } from '@/lib/stats'

export default function Home() {
  const [counts, setCounts] = useState(siteStats)

  // eslint-disable-next-line no-console
  console.log('App mounted')
  // eslint-disable-next-line no-console
  console.log('Rendering homepage')

  useEffect(() => {
    let alive = true
    loadSiteCounts()
      .then(data => {
        if (!alive) return
        setCounts(data)
      })
      .catch(() => {
        /* ignore */
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <Hero />

      <section className='container mx-auto max-w-4xl px-4 pb-6 sm:px-6 sm:pb-8'>
        <div className='space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Proof you can trust
          </p>
          <h2 className='text-xl font-semibold text-white sm:text-2xl'>
            Explore a research-backed herb database
          </h2>
          <p className='text-sm leading-relaxed text-white/75 sm:text-base'>
            Everything below is designed to help you move from confusion to clear next steps.
          </p>
          <nav aria-label='Site stats' className='grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3'>
            <StatPill
              to='/herbs'
              value={counts.herbs}
              label='psychoactive herbs'
              testId='pill-herbs'
            />
            <StatPill
              to='/compounds'
              value={counts.compounds}
              label='active compounds'
              testId='pill-compounds'
            />
            <StatPill to='/blog' value={counts.articles} label='articles' testId='pill-articles' />
          </nav>
        </div>
      </section>

      <section className='container mx-auto max-w-4xl px-4 pb-6 sm:px-6 sm:pb-8'>
        <div className='border-brand-lime/20 bg-brand-lime/5 space-y-3 rounded-3xl border p-5 sm:p-7'>
          <p className='text-brand-lime/80 text-xs font-semibold uppercase tracking-[0.24em]'>
            Why this matters
          </p>
          <h2 className='text-xl font-semibold text-white sm:text-2xl'>
            Stop guessing. Start with a guided blend plan.
          </h2>
          <p className='max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base'>
            The Hippie Scientist helps you choose a goal, get a simple recommendation, and take a
            safer first step without reading dozens of conflicting posts.
          </p>
          <Link
            to='/build'
            className='border-brand-lime/35 bg-brand-lime/20 text-brand-lime hover:bg-brand-lime/30 inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition'
          >
            Start your guided build
          </Link>
        </div>
      </section>

      <EmailCapture />

      <section className='container mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16'>
        <div className='space-y-3 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/55'>
            Explore more
          </p>
          <div className='flex flex-wrap gap-2.5 text-sm'>
            <Link
              to='/herbs'
              className='rounded-lg border border-white/15 px-3 py-2 text-white/80 hover:bg-white/10'
            >
              Browse herbs
            </Link>
            <Link
              to='/blog'
              className='rounded-lg border border-white/15 px-3 py-2 text-white/80 hover:bg-white/10'
            >
              Read articles
            </Link>
            <Link
              to='/compounds'
              className='rounded-lg border border-white/15 px-3 py-2 text-white/80 hover:bg-white/10'
            >
              Study compounds
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
