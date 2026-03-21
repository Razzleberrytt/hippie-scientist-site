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
import { getCommonName } from '@/lib/herbName'

type FeaturedItem = { slug: string; name: string; blurb: string; kind: 'herb' | 'compound' }

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Home() {
  const [counts, setCounts] = useState(siteStats)
  const [featured, setFeatured] = useState<FeaturedItem[]>([])

  useEffect(() => {
    let alive = true
    loadSiteCounts()
      .then(data => alive && setCounts(data))
      .catch(() => {})

    loadHerbData()
      .then(data => {
        if (!alive) return
        const herbPicks = shuffle(
          decorateHerbs(data)
            .filter(herb => herb.slug)
            .map(herb => ({
              slug: herb.slug,
              name: getCommonName(herb) ?? herb.scientific ?? herb.common ?? 'Herb',
              blurb: herb.effectsSummary || herb.effects || herb.description || 'Herbal profile',
              kind: 'herb' as const,
            }))
        ).slice(0, 3)

        const compoundPicks = shuffle(
          decorateCompounds().map(compound => ({
            slug: compound.slug,
            name: compound.common || compound.scientific || 'Compound',
            blurb: compound.effects || compound.description || 'Compound profile',
            kind: 'compound' as const,
          }))
        ).slice(0, 2)

        setFeatured(shuffle([...herbPicks, ...compoundPicks]).slice(0, 5))
      })
      .catch(() => alive && setFeatured([]))

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
          <div className='no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1'>
            {featured.map(item => (
              <Link
                key={`${item.kind}-${item.slug}`}
                to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                className='ds-card min-w-[230px] snap-start p-5 transition hover:border-white/25'
              >
                <p className='text-xs uppercase tracking-[0.18em] text-emerald-200/80'>
                  {item.kind}
                </p>
                <h3 className='mt-1 text-lg font-semibold text-white'>{item.name}</h3>
                <p className='mt-2 line-clamp-2 text-sm text-white/70'>{item.blurb}</p>
              </Link>
            ))}
          </div>
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
