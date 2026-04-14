import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import EmailCapture from '@/components/EmailCapture'
import Hero from '@/components/Hero'
import EffectExplorer from '@/components/EffectExplorer'
import StatPill from '@/components/StatPill'
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

      <section className='container mx-auto max-w-6xl px-4 pb-4 sm:px-6'>
        <div className='grid gap-4 md:grid-cols-[1.35fr_1fr]'>
          <div className='premium-panel p-5 sm:p-6'>
            <p className='section-label'>Immediate next step</p>
            <h2 className='mt-3 text-2xl font-semibold text-white sm:text-3xl'>Search by outcome, then pressure-test safety.</h2>
            <p className='mt-3 max-w-2xl text-sm text-white/74 sm:text-base'>
              Use the effect explorer to shortlist candidates, then move into interactions and detailed context pages before experimenting.
            </p>
            <div className='mt-5 flex flex-wrap gap-2.5'>
              <a href='#effect-search' className='btn-primary'>Open Effect Search</a>
              <Link to='/interactions' className='btn-secondary'>Run Interaction Check</Link>
            </div>
          </div>
          <div className='browse-shell p-5 sm:p-6'>
            <p className='section-label'>Knowledge scope</p>
            <nav aria-label='Site stats' className='mt-3 grid grid-cols-1 gap-2.5'>
              <StatPill to='/herbs' value={homepageData.counts.herbs} label='psychoactive herbs' testId='pill-herbs' />
              <StatPill to='/compounds' value={homepageData.counts.compounds} label='active compounds' testId='pill-compounds' />
              <StatPill to='/blog' value={homepageData.counts.articles} label='research notes' testId='pill-articles' />
            </nav>
          </div>
        </div>
      </section>

      <EffectExplorer herbs={homepageData.effectExplorerHerbs} />

      <section className='container mx-auto max-w-6xl px-4 py-10 sm:px-6'>
        <div className='lux-grid sm:grid-cols-2 lg:grid-cols-3'>
          {curated.slice(0, 3).map(item => (
            <Link
              key={`starter-${item.kind}-${item.slug}`}
              to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
              className='premium-panel block h-full p-5 transition hover:-translate-y-0.5'
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
        <div className='grid gap-4 sm:grid-cols-2'>
          {featuredCollections.map(collection => (
            <Link key={collection.slug} to={`/collections/${collection.slug}`} className='browse-shell p-4 text-sm font-medium text-white/88 hover:text-white'>
              {collection.title}
            </Link>
          ))}
        </div>
      </section>

      {(items.length > 0 || recent.length > 0 || recentBlends.length > 0 || recentChecks.length > 0) && (
        <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
          <div className='browse-shell p-5 sm:p-6'>
            <p className='section-label'>Recent activity</p>
            <div className='mt-4 grid gap-4 sm:grid-cols-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.14em] text-white/58'>Viewed herbs</p>
                <div className='mt-2 grid gap-1.5'>
                  {recent.filter(item => item.type === 'herb').slice(0, 3).map(item => <Link key={item.id} to={item.href} className='text-sm text-white/88 hover:text-white'>{item.title}</Link>)}
                </div>
              </div>
              <div>
                <p className='text-xs uppercase tracking-[0.14em] text-white/58'>Recent blends</p>
                <div className='mt-2 grid gap-1.5'>
                  {recentBlends.slice(0, 3).map(item => <Link key={item.id} to='/build' className='text-sm text-white/88 hover:text-white'>{item.intent} · {item.herbSlugs.length} herbs</Link>)}
                </div>
              </div>
              <div>
                <p className='text-xs uppercase tracking-[0.14em] text-white/58'>Interaction checks</p>
                <div className='mt-2 grid gap-1.5'>
                  {recentChecks.slice(0, 3).map(item => <Link key={item.id} to='/interactions' className='text-sm text-white/88 hover:text-white'>{item.herbSlugs.length} herbs · {item.warningCount} warnings</Link>)}
                </div>
              </div>
            </div>
          </div>
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
