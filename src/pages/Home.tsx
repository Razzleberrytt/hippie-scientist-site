import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import EmailCapture from '@/components/EmailCapture'
import Hero from '@/components/Hero'
import StatPill from '@/components/StatPill'
import { loadSiteCounts, siteStats } from '@/lib/stats'
import { loadHerbData } from '@/lib/herb-data'
import { loadCompoundData } from '@/lib/compound-data'
import { getCommonName } from '@/lib/herbName'
import { useRecentlyViewed, useSavedItems } from '@/lib/growth'
import { futureProducts } from '@/lib/products'
import { CTA } from '@/lib/cta'
import { buildHerbViralHooks } from '@/lib/viralContent'
import { buildCardSummary } from '@/lib/summary'
import {
  scoreCompoundQuality,
  scoreHerbQuality,
  toQualityBadge,
  type QualityResult,
} from '@/lib/data-quality'
import { FEATURED_COLLECTION_SLUGS, SEO_COLLECTIONS } from '@/data/seoCollections'

type FeaturedItem = {
  slug: string
  name: string
  blurb: string
  kind: 'herb' | 'compound'
  whyItMatters: string
  quality: QualityResult
}

const CURATED_FALLBACK = [
  'withania-somnifera-ashwagandha',
  'rhodiola-rosea',
  'passionflower',
  'caffeine',
  'quercetin',
]

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function sortByScore<T extends { quality: QualityResult }>(items: T[]) {
  return [...items].sort((a, b) => b.quality.score - a.quality.score)
}

export default function Home() {
  const [counts, setCounts] = useState(siteStats)
  const [featured, setFeatured] = useState<FeaturedItem[]>([])
  const [curated, setCurated] = useState<FeaturedItem[]>([])
  const { items } = useSavedItems()
  const recent = useRecentlyViewed()

  useEffect(() => {
    let alive = true
    loadSiteCounts()
      .then(data => alive && setCounts(data))
      .catch(() => {})

    Promise.all([loadHerbData(), loadCompoundData()])
      .then(([herbs, compounds]) => {
        if (!alive) return

        const herbItems: FeaturedItem[] = herbs
          .filter(herb => herb.slug)
          .map(herb => {
            const quality = scoreHerbQuality(herb as Record<string, unknown>)
            return {
              slug: herb.slug,
              name: getCommonName(herb) ?? herb.scientific ?? herb.common ?? 'Herb',
              blurb: buildCardSummary({
                effects: herb.effects,
                mechanism: herb.mechanism,
                description: herb.description,
                activeCompounds: herb.activeCompounds ?? herb.active_compounds,
                therapeuticUses: herb.therapeuticUses,
                maxLen: 150,
              }),
              kind: 'herb' as const,
              whyItMatters: buildHerbViralHooks(herb).whyItMatters,
              quality,
            }
          })

        const compoundItems: FeaturedItem[] = compounds
          .filter(compound => compound.slug)
          .map(compound => {
            const quality = scoreCompoundQuality(compound as Record<string, unknown>)
            return {
              slug: compound.slug,
              name: compound.name,
              blurb: buildCardSummary({
                effects: compound.effects,
                mechanism: compound.mechanism,
                description: compound.description,
                activeCompounds: compound.activeCompounds,
                therapeuticUses: compound.therapeuticUses,
                maxLen: 150,
              }),
              kind: 'compound' as const,
              whyItMatters:
                'Why it matters: compound-level literacy helps you evaluate mechanism, interactions, and realistic outcomes.',
              quality,
            }
          })

        const all = [...herbItems, ...compoundItems]
        const highQuality = all.filter(
          item =>
            item.quality.score >= 34 &&
            !item.quality.flags.isIncomplete &&
            !item.quality.flags.hasPlaceholderText
        )

        const fallbackPool = sortByScore(
          all.filter(item => !item.quality.flags.hasPlaceholderText && item.quality.score >= 24)
        )

        const dailyPool = highQuality.length ? highQuality : fallbackPool
        const daySeed = new Date().toISOString().slice(0, 10)
        const hash = Array.from(daySeed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const dailyPick = dailyPool[hash % Math.max(1, dailyPool.length)]

        const diverseFeatured = (() => {
          if (highQuality.length >= 5) {
            const herbsTop = sortByScore(highQuality.filter(item => item.kind === 'herb')).slice(
              0,
              3
            )
            const compoundsTop = sortByScore(
              highQuality.filter(item => item.kind === 'compound')
            ).slice(0, 2)
            return shuffle([...herbsTop, ...compoundsTop]).slice(0, 5)
          }
          return fallbackPool.slice(0, 5)
        })()

        const curatedFromSlugs = CURATED_FALLBACK.map(slug =>
          sortByScore(all).find(item => item.slug === slug)
        ).filter((item): item is FeaturedItem => Boolean(item && item.quality.score >= 24))

        const curatedFallback = sortByScore(highQuality.length ? highQuality : fallbackPool).slice(
          0,
          3
        )

        const curatedItems = (
          curatedFromSlugs.length >= 3 ? curatedFromSlugs : curatedFallback
        ).slice(0, 3)

        const mergedFeatured = dailyPick
          ? [dailyPick, ...diverseFeatured.filter(item => item.slug !== dailyPick.slug)].slice(0, 5)
          : diverseFeatured

        setFeatured(mergedFeatured)
        setCurated(curatedItems)
      })
      .catch(() => {
        if (!alive) return
        setFeatured([])
        setCurated([])
      })

    return () => {
      alive = false
    }
  }, [])

  const dailyDiscovery = useMemo(() => featured[0] ?? null, [featured])
  const featuredCollections = useMemo(
    () =>
      FEATURED_COLLECTION_SLUGS.map(slug =>
        SEO_COLLECTIONS.find(collection => collection.slug === slug)
      ).filter((collection): collection is (typeof SEO_COLLECTIONS)[number] => Boolean(collection)),
    []
  )

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <Hero />

      {dailyDiscovery && (
        <section className='container mx-auto max-w-4xl px-4 pt-5 sm:px-6'>
          <div className='ds-card-lg border-emerald-200/20 bg-emerald-400/5'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80'>
              Today&apos;s discovery
            </p>
            <h2 className='mt-2 text-2xl font-semibold text-white'>{dailyDiscovery.name}</h2>
            <p className='mt-2 text-sm text-white/75'>{dailyDiscovery.blurb}</p>
            <div className='mt-3 flex flex-wrap gap-2.5'>
              <Link
                to={
                  dailyDiscovery.kind === 'herb'
                    ? `/herbs/${dailyDiscovery.slug}`
                    : `/compounds/${dailyDiscovery.slug}`
                }
                className='btn-primary'
              >
                Read full breakdown
              </Link>
              <span className='ds-pill text-xs text-emerald-100/85'>
                {toQualityBadge(dailyDiscovery.quality)}
              </span>
            </div>
          </div>
        </section>
      )}

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
                <p className='mt-2 text-[11px] uppercase tracking-[0.16em] text-white/55'>
                  {toQualityBadge(item.quality)}
                </p>
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

      {(recent.length > 0 || items.length > 0) && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <div className='ds-card-lg ds-stack'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/60'>
              Continue exploring
            </p>
            <p className='text-sm text-white/70'>
              Want more like this? Jump back into your recent profiles or saved research trails.
            </p>
            <div className='flex flex-wrap gap-2'>
              {recent.slice(0, 2).map(item => (
                <Link key={`recent-${item.slug}`} to={item.href} className='btn-secondary'>
                  {item.title}
                </Link>
              ))}
              {items.slice(0, 2).map(item => (
                <Link key={`saved-${item.id}`} to={item.href} className='btn-secondary'>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/70'>
            Curated picks
          </p>
          <p className='text-sm text-white/80'>
            High-confidence profiles prioritized for mechanism clarity, safety context, and source
            quality.
          </p>
          <div className='grid gap-3 sm:grid-cols-3'>
            {curated.map(item => (
              <article key={`curated-${item.kind}-${item.slug}`} className='ds-card p-4'>
                <h3 className='text-sm font-semibold text-white'>{item.name}</h3>
                <p className='mt-2 line-clamp-3 text-xs text-white/80'>{item.blurb}</p>
                <p className='mt-2 text-[11px] uppercase tracking-[0.15em] text-white/55'>
                  {toQualityBadge(item.quality)}
                </p>
                <Link
                  to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                  className='mt-3 inline-flex text-xs text-emerald-200 hover:text-emerald-100'
                >
                  View details →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack border-lime-400/20 bg-lime-400/5'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-lime-300/80'>
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
          <p className='text-sm text-white/75'>
            Discover targeted landing pages generated from the same herb, compound, and combo
            dataset used by our tools.
          </p>
          <div className='grid gap-2 sm:grid-cols-2'>
            {featuredCollections.map(collection => (
              <Link
                key={collection.slug}
                to={`/collections/${collection.slug}`}
                className='ds-card p-3 text-sm font-medium text-white transition hover:border-white/25'
              >
                {collection.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <EmailCapture
        title='Get one new herb insight per day'
        subtitle='Day 1: beginner blend guide. Day 2+: a short daily herb or compound insight with a direct link back to the full breakdown.'
        buttonLabel='Start daily insights'
      />

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
    </>
  )
}
