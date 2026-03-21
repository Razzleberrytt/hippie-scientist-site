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
import {
  getTopClickedCompounds,
  getTopSearches,
  getTopViewedHerbs,
  useRecentlyViewed,
  useSavedItems,
} from '@/lib/growth'
import { futureProducts } from '@/lib/products'
import { CTA } from '@/lib/cta'
import { buildHerbViralHooks } from '@/lib/viralContent'

type FeaturedItem = {
  slug: string
  name: string
  blurb: string
  kind: 'herb' | 'compound'
  whyItMatters: string
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function tightenBlurb(value: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'Mechanism and safety profile pending editorial review.'
  return cleaned.length > 145 ? `${cleaned.slice(0, 142).trimEnd()}…` : cleaned
}

export default function Home() {
  const [counts, setCounts] = useState(siteStats)
  const [featured, setFeatured] = useState<FeaturedItem[]>([])
  const { items } = useSavedItems()
  const recent = useRecentlyViewed()
  const [topViewed, setTopViewed] = useState<Array<{ slug: string; count: number }>>([])
  const [topCompounds, setTopCompounds] = useState<Array<{ slug: string; count: number }>>([])
  const [topSearches, setTopSearches] = useState<Array<{ value: string; count: number }>>([])

  useEffect(() => {
    let alive = true
    loadSiteCounts()
      .then(data => alive && setCounts(data))
      .catch(() => {})

    loadHerbData()
      .then(data => {
        if (!alive) return
        const daySeed = new Date().toISOString().slice(0, 10)
        const sessionSeed = `${daySeed}-${sessionStorage.getItem('hs_feature_seed') || Math.random().toString(36).slice(2, 8)}`
        sessionStorage.setItem('hs_feature_seed', sessionSeed)
        const herbPicks = shuffle(
          decorateHerbs(data)
            .filter(herb => herb.slug)
            .map(herb => ({
              slug: herb.slug,
              name: getCommonName(herb) ?? herb.scientific ?? herb.common ?? 'Herb',
              blurb: tightenBlurb(
                herb.effectsSummary || herb.effects || herb.description || 'Herbal profile'
              ),
              kind: 'herb' as const,
              whyItMatters: buildHerbViralHooks(herb).whyItMatters,
            }))
        )
          .sort((a, b) => (a.slug + sessionSeed > b.slug + sessionSeed ? 1 : -1))
          .slice(0, 3)

        const compoundPicks = shuffle(
          decorateCompounds().map(compound => ({
            slug: compound.slug,
            name: compound.common || compound.scientific || 'Compound',
            blurb: tightenBlurb(compound.effects || compound.description || 'Compound profile'),
            kind: 'compound' as const,
            whyItMatters:
              'Why it matters: compound-level literacy helps you evaluate mechanism, interactions, and realistic outcomes.',
          }))
        ).slice(0, 2)

        setFeatured(shuffle([...herbPicks, ...compoundPicks]).slice(0, 5))
      })
      .catch(() => alive && setFeatured([]))

    setTopViewed(getTopViewedHerbs(3))
    setTopCompounds(getTopClickedCompounds(3))
    setTopSearches(getTopSearches(4))

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
            Knowledge scope
          </p>
          <h2 className='ds-heading'>A science-forward index for botanical decision-making</h2>
          <p className='ds-text'>
            Review compounds, proposed mechanisms, and safety boundaries before any personal
            experimentation.
          </p>
          <p className='text-xs text-white/65'>Designed to help you learn safely.</p>
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
            <StatPill
              to='/blog'
              value={counts.articles}
              label='research notes'
              testId='pill-articles'
            />
          </nav>
          <p className='text-xs text-white/60'>
            Educational use only. Evidence strength varies across herbs and outcomes.
          </p>
        </div>
      </section>

      {items.length > 0 && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <div className='ds-card-lg ds-stack'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
              Saved items
            </p>
            <h2 className='ds-heading'>Pick up where you left off</h2>
            <div className='grid gap-3 sm:grid-cols-2'>
              {items.slice(0, 4).map(item => (
                <Link key={item.id} to={item.href} className='ds-card p-4'>
                  <p className='text-xs uppercase tracking-[0.14em] text-white/55'>{item.type}</p>
                  <p className='mt-1 text-sm font-semibold text-white'>{item.title}</p>
                </Link>
              ))}
            </div>
            <Link to='/favorites' className='btn-secondary w-fit'>
              {CTA.secondary.save}d items
            </Link>
          </div>
        </section>
      )}

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
                <p className='mt-2 line-clamp-3 text-sm text-white/70'>{item.blurb}</p>
                <p className='mt-3 text-xs text-emerald-100/80'>{item.whyItMatters}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <div className='ds-card-lg ds-stack'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
              Recently viewed
            </p>
            <div className='grid gap-3 sm:grid-cols-2'>
              {recent.slice(0, 4).map(item => (
                <Link key={`${item.type}-${item.slug}`} to={item.href} className='ds-card p-4'>
                  <p className='text-xs uppercase tracking-[0.14em] text-white/55'>{item.type}</p>
                  <p className='mt-1 text-sm font-semibold text-white'>{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Trending now
          </p>
          <div className='grid gap-3 sm:grid-cols-3'>
            <article className='ds-card p-4'>
              <h3 className='text-sm font-semibold text-white'>Most viewed herbs</h3>
              <ul className='mt-2 text-xs text-white/70'>
                {topViewed.length ? (
                  topViewed.map(item => <li key={item.slug}>{item.slug}</li>)
                ) : (
                  <li>No data yet</li>
                )}
              </ul>
            </article>
            <article className='ds-card p-4'>
              <h3 className='text-sm font-semibold text-white'>Most clicked compounds</h3>
              <ul className='mt-2 text-xs text-white/70'>
                {topCompounds.length ? (
                  topCompounds.map(item => <li key={item.slug}>{item.slug}</li>)
                ) : (
                  <li>No data yet</li>
                )}
              </ul>
            </article>
            <article className='ds-card p-4'>
              <h3 className='text-sm font-semibold text-white'>Top searches</h3>
              <ul className='mt-2 text-xs text-white/70'>
                {topSearches.length ? (
                  topSearches.map(item => <li key={item.value}>{item.value}</li>)
                ) : (
                  <li>No data yet</li>
                )}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack border-brand-lime/20 bg-brand-lime/5'>
          <p className='text-brand-lime/80 text-xs font-semibold uppercase tracking-[0.24em]'>
            How to use this database
          </p>
          <h2 className='ds-heading'>How to explore this database</h2>
          <p className='ds-text'>
            Browse herbs, then study compounds to understand mechanism context. Read research notes,
            track confidence labels, and only build blends after learning core safety details.
          </p>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Programmatic collections
          </p>
          <div className='flex flex-wrap gap-2'>
            <Link to='/herbs-for-relaxation' className='btn-secondary'>
              Herbs for relaxation
            </Link>
            <Link to='/herbs-for-focus' className='btn-secondary'>
              Herbs for focus
            </Link>
            <Link to='/herbs-for-sleep' className='btn-secondary'>
              Herbs for sleep
            </Link>
          </div>
        </div>
      </section>

      <EmailCapture />

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Learning Paths
          </p>
          <h2 className='ds-heading'>Move from scattered reading to guided study</h2>
          <p className='ds-text-muted'>
            Follow curated paths like Psychedelic Mechanisms 101 and Safety & Risk Awareness.
          </p>
          <Link to='/learning' className='btn-secondary w-fit'>
            {CTA.primary.learn}
          </Link>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Value ladder
          </p>
          <div className='grid gap-3 sm:grid-cols-3'>
            <article className='ds-card p-4'>
              <h3 className='text-sm font-semibold text-white'>FREE</h3>
              <p className='mt-2 text-xs text-white/65'>
                Herb database • compound database • blog.
              </p>
            </article>
            <article className='ds-card p-4'>
              <h3 className='text-sm font-semibold text-white'>LEAD MAGNET</h3>
              <p className='mt-2 text-xs text-white/65'>
                Beginner-safe blend guide with practical context and safety framing.
              </p>
            </article>
            <article className='ds-card p-4'>
              <h3 className='text-sm font-semibold text-white'>PRODUCT READY</h3>
              <p className='mt-2 text-xs text-white/65'>
                Starter packs, premium datasets, and deeper field guides (coming next).
              </p>
            </article>
          </div>
          <p className='text-xs text-white/60'>Built for clarity, not hype.</p>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
            Future product engine
          </p>
          <div className='grid gap-3 sm:grid-cols-2'>
            {futureProducts.map(product => (
              <article key={product.id} className='ds-card p-4'>
                <p className='text-xs uppercase tracking-[0.12em] text-white/55'>
                  {product.category}
                </p>
                <h3 className='text-sm font-semibold text-white'>{product.title}</h3>
                <p className='mt-2 text-xs text-white/65'>{product.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/55'>
            Applied learning
          </p>
          <h2 className='ds-heading'>Build a Blend with constraints in mind</h2>
          <p className='ds-text-muted'>
            Prototype combinations after reviewing mechanisms and contraindications in the herb and
            compound indexes.
          </p>
          <div className='flex flex-wrap gap-2.5'>
            <Link to='/build' className='btn-primary'>
              Build a Blend
            </Link>
            <Link to='/herbs' className='btn-secondary'>
              Explore Herbs
            </Link>
            <Link to='/compounds' className='btn-secondary'>
              View Compounds
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
