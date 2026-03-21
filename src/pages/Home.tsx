import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import EmailCapture from '@/components/EmailCapture'
import Hero from '@/components/Hero'
import StatPill from '@/components/StatPill'
import { loadSiteCounts, siteStats } from '@/lib/stats'
import { loadHerbData } from '@/lib/herb-data'
import { decorateHerbs } from '@/lib/herbs'
import { decorateCompounds } from '@/lib/compounds'
import postsData from '@/data/blog/posts.json'
import { sortPostsByDateDesc } from '@/lib/blog'
import { getCommonName } from '@/lib/herbName'

type Post = {
  slug: string
  title: string
  summary?: string | null
}

export default function Home() {
  const [counts, setCounts] = useState(siteStats)
  const [featuredHerbs, setFeaturedHerbs] = useState<
    Array<{ slug: string; name: string; blurb: string }>
  >([])
  const [featuredCompounds, setFeaturedCompounds] = useState<
    Array<{ slug: string; name: string; blurb: string }>
  >([])
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)

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

    loadHerbData()
      .then(data => {
        if (!alive) return
        const herbs = decorateHerbs(data)
          .filter(herb => herb.slug)
          .slice(0, 3)
          .map(herb => ({
            slug: herb.slug,
            name: getCommonName(herb) ?? herb.scientific ?? herb.common ?? 'Herb',
            blurb: herb.effectsSummary || herb.effects || herb.description || 'Herbal profile',
          }))
        setFeaturedHerbs(herbs)
      })
      .catch(() => {
        if (!alive) return
        setFeaturedHerbs([])
      })

    const compounds = decorateCompounds()
      .slice(0, 2)
      .map(compound => ({
        slug: compound.slug,
        name: compound.common || compound.scientific || 'Compound',
        blurb: compound.effects || compound.description || 'Compound profile',
      }))
    setFeaturedCompounds(compounds)

    const post = sortPostsByDateDesc(postsData as Post[]).find(entry => entry.slug)
    setFeaturedPost(post ?? null)

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

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Trusted scope
          </p>
          <h2 className='text-xl font-semibold text-white sm:text-2xl'>
            Explore a research-backed psychoactive plant database
          </h2>
          <p className='text-sm leading-relaxed text-white/75 sm:text-base'>
            Start with verified herb profiles, active compounds, and short research notes.
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

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Featured discoveries
          </p>
          <div className='grid gap-3 sm:grid-cols-2'>
            {featuredHerbs.map(herb => (
              <Link
                key={herb.slug}
                to={`/herbs/${herb.slug}`}
                className='ds-card p-5 transition hover:border-white/25'
              >
                <p className='text-xs uppercase tracking-[0.18em] text-emerald-200/80'>Herb</p>
                <h3 className='mt-1 text-lg font-semibold text-white'>{herb.name}</h3>
                <p className='mt-2 line-clamp-2 text-sm text-white/70'>{herb.blurb}</p>
              </Link>
            ))}
            {featuredCompounds.map(compound => (
              <Link
                key={compound.slug}
                to={`/compounds/${compound.slug}`}
                className='ds-card p-5 transition hover:border-white/25'
              >
                <p className='text-xs uppercase tracking-[0.18em] text-sky-200/80'>Compound</p>
                <h3 className='mt-1 text-lg font-semibold text-white'>{compound.name}</h3>
                <p className='mt-2 line-clamp-2 text-sm text-white/70'>{compound.blurb}</p>
              </Link>
            ))}
          </div>
          {featuredPost && (
            <Link
              to={`/blog/${featuredPost.slug}/`}
              className='ds-card block p-5 transition hover:border-white/25'
            >
              <p className='text-xs uppercase tracking-[0.18em] text-violet-200/80'>
                Research note
              </p>
              <h3 className='mt-1 text-lg font-semibold text-white'>{featuredPost.title}</h3>
              {featuredPost.summary && (
                <p className='mt-2 line-clamp-2 text-sm text-white/70'>{featuredPost.summary}</p>
              )}
            </Link>
          )}
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack border-brand-lime/20 bg-brand-lime/5'>
          <p className='text-brand-lime/80 text-xs font-semibold uppercase tracking-[0.24em]'>
            Why this matters
          </p>
          <h2 className='text-xl font-semibold text-white sm:text-2xl'>
            Learn effects and safety before experimentation
          </h2>
          <p className='max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base'>
            Better decisions come from context: what a herb does, how compounds work, and where
            contraindications apply. This project prioritizes informed, lower-risk exploration.
          </p>
        </div>
      </section>

      <EmailCapture />

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/55'>
            Applied learning tool
          </p>
          <h2 className='text-xl font-semibold text-white sm:text-2xl'>
            Build a Blend (Applied Learning)
          </h2>
          <p className='max-w-2xl text-sm text-white/75'>
            Use your knowledge to create a blend. Start with herbs and compounds first, then test
            combinations intentionally.
          </p>
          <Link to='/build' className='btn-primary'>
            Build a Blend (Applied Learning)
          </Link>
          <div className='flex flex-wrap gap-2.5 text-sm'>
            <Link to='/herbs' className='btn-secondary min-h-10 px-3 py-2 text-sm'>
              Browse herbs
            </Link>
            <Link to='/blog' className='btn-secondary min-h-10 px-3 py-2 text-sm'>
              Read articles
            </Link>
            <Link to='/compounds' className='btn-secondary min-h-10 px-3 py-2 text-sm'>
              Study compounds
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
