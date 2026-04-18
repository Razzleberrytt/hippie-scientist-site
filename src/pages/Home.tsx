import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import EmailCapture from '@/components/EmailCapture'
import Hero from '@/components/Hero'
import EffectExplorer from '@/components/EffectExplorer'
import { getHomepageData, type HomepageFeaturedItem } from '@/lib/homepage-data'
import { useRecentlyViewed, useSavedItems } from '@/lib/growth'
import { readStorage } from '@/utils/storageState'
import GuideDownloadCard from '@/components/GuideDownloadCard'
import { FEATURED_COLLECTION_SLUGS, SEO_COLLECTIONS } from '@/data/seoCollections'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { trackHomepageEntityClick } from '@/lib/contentJourneyTracking'

type RecentBlend = {
  id: string
  intent: 'sleep' | 'focus' | 'relaxation'
  herbSlugs: string[]
  createdAt: string
}

type RecentInteractionCheck = {
  id: string
  checkedAt: string
  herbSlugs: string[]
  warningCount: number
}

const RECENT_STACKS_KEY = 'ths:recent-herb-stacks'
const INTERACTION_HISTORY_KEY = 'ths:interaction-check-history'

export default function Home() {
  const homepageData = useMemo(() => getHomepageData(), [])
  const [featured] = useState<HomepageFeaturedItem[]>(homepageData.featured)
  const [curated] = useState<HomepageFeaturedItem[]>(homepageData.curated)
  const { items } = useSavedItems()
  const recent = useRecentlyViewed()
  const [recentBlends, setRecentBlends] = useState<RecentBlend[]>([])
  const [recentChecks, setRecentChecks] = useState<RecentInteractionCheck[]>([])

  useEffect(() => {
    setRecentBlends(readStorage<RecentBlend[]>(RECENT_STACKS_KEY, []))
    setRecentChecks(readStorage<RecentInteractionCheck[]>(INTERACTION_HISTORY_KEY, []))
  }, [])

  const dailyDiscovery = useMemo(() => featured[0] ?? null, [featured])
  const featuredCollections = useMemo(
    () =>
      FEATURED_COLLECTION_SLUGS.map(slug =>
        SEO_COLLECTIONS.find(collection => collection.slug === slug)
      ).filter((collection): collection is (typeof SEO_COLLECTIONS)[number] => Boolean(collection)),
    []
  )
  const recentHerbs = useMemo(
    () => recent.filter(item => item.type === 'herb').slice(0, 12),
    [recent]
  )

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Science-based harm-reduction research on psychoactive herbs and plant compounds. Browse 100+ herbs, check interactions, build blends, and read independent field notes.'
        path='/'
        pageType='website'
        jsonLd={[websiteJsonLd(), organizationJsonLd()]}
      />

      <Hero />

      <section className='container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16'>
        <div className='grid gap-4 md:grid-cols-[1.35fr_1fr]'>
          <div className='premium-panel p-5 sm:p-6'>
            <p className='section-label'>Immediate next step</p>
            <h2 className='mt-3 text-2xl font-semibold text-white sm:text-3xl'>Where to start</h2>
            <p className='mt-3 max-w-2xl text-sm text-white/74 sm:text-base'>
              Search by outcome first, then pressure-test safety using interactions and full context pages before experimenting.
            </p>
            <div className='mt-5 flex flex-wrap gap-2.5'>
              <a href='#effect-search' className='btn-primary'>Open Effect Search</a>
              <Link to='/interactions' className='btn-secondary'>Run Interaction Check</Link>
            </div>
          </div>

          <div className='browse-shell p-5 sm:p-6'>
            <p className='section-label'>Knowledge scope</p>
            <nav aria-label='Site stats' className='mt-3 grid grid-cols-1 gap-2.5'>
              <Link
                to='/herbs'
                className='group flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.035] px-4 py-3 text-sm text-white/85 transition-all duration-200 hover:border-white/24 hover:bg-white/[0.07]'
                aria-label={`${homepageData.counts.herbs} psychoactive herbs`}
              >
                <span className='font-mono text-base font-medium tabular-nums text-amber-300'>{homepageData.counts.herbs}+</span>
                <span className='leading-tight text-white/82'>psychoactive herbs</span>
                <span aria-hidden className='ml-auto text-white/55 transition group-hover:text-white/85'>
                  →
                </span>
              </Link>
              <Link
                to='/compounds'
                className='group flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.035] px-4 py-3 text-sm text-white/85 transition-all duration-200 hover:border-white/24 hover:bg-white/[0.07]'
                aria-label={`${homepageData.counts.compounds} active compounds`}
              >
                <span className='font-mono text-base font-medium tabular-nums text-amber-300'>{homepageData.counts.compounds}+</span>
                <span className='leading-tight text-white/82'>active compounds</span>
                <span aria-hidden className='ml-auto text-white/55 transition group-hover:text-white/85'>
                  →
                </span>
              </Link>
              <Link
                to='/blog'
                className='group flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.035] px-4 py-3 text-sm text-white/85 transition-all duration-200 hover:border-white/24 hover:bg-white/[0.07]'
                aria-label={`${homepageData.counts.articles} research notes`}
              >
                <span className='font-mono text-base font-medium tabular-nums text-amber-300'>{homepageData.counts.articles}+</span>
                <span className='leading-tight text-white/82'>research notes</span>
                <span aria-hidden className='ml-auto text-white/55 transition group-hover:text-white/85'>
                  →
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </section>

      <EffectExplorer herbs={homepageData.effectExplorerHerbs} />

      <section className='container mx-auto max-w-6xl px-4 py-10 sm:px-6'>
        <p className='section-label'>Editor curation</p>
        <h2 className='font-display mb-6 text-2xl text-white sm:text-3xl'>Editor&apos;s Picks</h2>
        <div className='lux-grid sm:grid-cols-2 lg:grid-cols-3'>
          {curated.slice(0, 3).map(item => (
            <Link
              key={`starter-${item.kind}-${item.slug}`}
              to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
              className='premium-panel block h-full p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20'
              onClick={() =>
                trackHomepageEntityClick({
                  targetType: item.kind,
                  targetSlug: item.slug,
                  placement: 'popular_paths_starter_profile',
                })
              }
            >
              <p className='section-label'>{item.kind} spotlight</p>
              <h3 className='mt-2 text-xl font-semibold text-white'>{item.name}</h3>
              <p className='mt-3 line-clamp-3 text-sm text-white/74'>{item.blurb}</p>
              <p className='mt-4 text-xs tracking-[0.14em] text-cyan-200/80 uppercase'>{item.qualityBadge}</p>
            </Link>
          ))}
        </div>
      </section>

      {dailyDiscovery && (
        <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
          <div className='premium-panel p-6 sm:p-8'>
            <p className='section-label'>Today&apos;s discovery</p>
            <h2 className='mt-3 text-3xl text-white sm:text-4xl'>{dailyDiscovery.name}</h2>
            <p className='mt-3 max-w-3xl text-sm text-white/78 sm:text-base'>{dailyDiscovery.blurb}</p>
            <div className='mt-5 flex flex-wrap gap-2'>
              <Link
                to={dailyDiscovery.kind === 'herb' ? `/herbs/${dailyDiscovery.slug}` : `/compounds/${dailyDiscovery.slug}`}
                className='btn-primary'
              >
                Read full breakdown
              </Link>
              <span className='ds-pill'>{dailyDiscovery.qualityBadge}</span>
            </div>
          </div>
        </section>
      )}

      <section className='container mx-auto max-w-6xl px-4 py-4 sm:px-6'>
        <GuideDownloadCard
          eyebrow='Safety download'
          title='Unknown Compound Survival Guide'
          description='Get a practical framework for unknown or uncertain compounds, including a decision tree and stop/go checks.'
          buttonText='Download the Free Guide'
          fileUrl='/downloads/unknown-compound-survival-guide.pdf'
          footer={<Link to='/guides/unknown-compound-survival-guide' className='text-cyan-200 hover:text-cyan-100'>See full guide overview →</Link>}
        />
      </section>

      <section className='container mx-auto max-w-6xl px-4 py-10 sm:px-6'>
        <h2 className='font-display mb-6 text-2xl text-white sm:text-3xl'>Browse Collections</h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          {featuredCollections.map(collection => (
            <Link
              key={collection.slug}
              to={`/collections/${collection.slug}`}
              className='neo-card block p-4 text-sm font-medium text-white/88 transition-colors hover:text-white'
            >
              {collection.title}
            </Link>
          ))}
        </div>
      </section>

      {items.length > 0 && (
        <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
          <p className='section-label'>Recently Viewed</p>
          <div className='mt-3 flex gap-2 overflow-x-auto pb-1'>
            {recentHerbs.map(item => (
              <Link
                key={`${item.type}-${item.slug}`}
                to={item.href}
                className='shrink-0 rounded-full border border-white/12 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:border-white/24 hover:text-white'
              >
                {item.title}
              </Link>
            ))}
          </div>
          {(recentBlends.length > 0 || recentChecks.length > 0) && (
            <p className='mt-3 text-xs text-white/48'>
              Also tracked: {recentBlends.length} recent blends and {recentChecks.length} interaction checks.
            </p>
          )}
        </section>
      )}

      <EmailCapture
        title='Get one new herb insight per day'
        subtitle='Day 1: beginner blend guide. Day 2+: a short daily herb or compound insight with a direct link back to the full breakdown.'
        buttonLabel='Start daily insights'
      />
    </>
  )
}
