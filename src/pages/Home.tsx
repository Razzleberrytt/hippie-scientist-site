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
import Collapse from '@/components/ui/Collapse'
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

  const renderGovernedSignals = (item: HomepageFeaturedItem) => {
    if (!item.governedSummary?.enrichedAndReviewed) return null
    const secondarySignal = item.governedSummary.safetyCautionsPresent
      ? 'Safety cautions'
      : item.governedSummary.mechanismCoveragePresent
        ? 'Mechanism coverage'
        : item.governedSummary.conflictingEvidence
          ? 'Conflicting evidence'
          : null
    return (
      <div className='mt-2 flex flex-wrap gap-1'>
        <span className='rounded-full border border-emerald-300/40 bg-emerald-500/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-100'>
          {item.governedSummary.title}
        </span>
        {secondarySignal && (
          <span className='rounded-full border border-white/20 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/70'>
            {secondarySignal}
          </span>
        )}
      </div>
    )
  }

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

      <section className='container mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12'>
        <div className='grid gap-8 sm:grid-cols-2 sm:gap-10'>
          <div className='h-full space-y-2'>
            <p className='label-specimen'>
              First move
            </p>
            <h2 className='text-base font-medium text-white/82'>Search by effect, not hype</h2>
            <p className='text-sm text-white/60'>
              Start with the outcome you want. Then pressure-test safety.
            </p>
            <a href='#effect-search' className='btn-primary mt-4 inline-flex'>
              Open Effect Search
            </a>
          </div>
          <div className='h-full space-y-2'>
            <p className='label-specimen'>
              Quick tools
            </p>
            <h2 className='text-base font-medium text-white/82'>Run a second check</h2>
            <div className='flex flex-wrap items-center gap-2 text-sm text-white/60'>
              <Link
                to='/herbs'
                className='underline-offset-4 transition hover:text-white hover:underline'
                onClick={() =>
                  trackHomepageEntityClick({
                    targetType: 'herb',
                    targetSlug: 'index',
                    placement: 'quick_actions',
                  })
                }
              >
                Browse Herbs
              </Link>
              <span className='text-white/35'>•</span>
              <Link to='/interactions' className='underline-offset-4 transition hover:text-white hover:underline'>
                Interaction Checker
              </Link>
              <span className='text-white/35'>•</span>
              <Link to='/build' className='underline-offset-4 transition hover:text-white hover:underline'>
                Blend Builder
              </Link>
            </div>
            <p className='pt-1 text-xs text-white/48'>One action, then verify.</p>
          </div>
        </div>
      </section>

      <EffectExplorer herbs={homepageData.effectExplorerHerbs} />

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg border-amber-300/30 bg-amber-500/10'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-amber-100/80'>
            Trust & safety
          </p>
          <h2 className='mt-2 text-2xl font-semibold text-white'>
            Educational research, safety-first
          </h2>
          <div className='mt-3 grid gap-2 sm:grid-cols-3'>
            {homepageData.trustBadges.map(badge => (
              <p key={badge} className='ds-card p-3 text-xs text-white/80'>
                {badge}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <GuideDownloadCard
          eyebrow='Safety download'
          title='Unknown Compound Survival Guide'
          description='Get a practical framework for unknown or uncertain compounds, including a decision tree and stop/go checks.'
          buttonText='Download the Free Guide'
          fileUrl='/downloads/unknown-compound-survival-guide.pdf'
          footer={
            <Link
              to='/guides/unknown-compound-survival-guide'
              className='text-emerald-200 hover:text-emerald-100'
            >
              See full guide overview →
            </Link>
          }
        />
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <Collapse title='Popular effects and starter paths'>
          <div className='ds-stack'>
            <div className='flex flex-wrap gap-2'>
              {homepageData.popularEffects.map(effect => (
                <a
                  key={effect}
                  href='#effect-search'
                  className='rounded-full border border-violet-300/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium capitalize text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-500/15'
                >
                  {effect}
                </a>
              ))}
            </div>
            <div className='ds-card-grid sm:grid-cols-3'>
              {curated.map(item => (
                <article key={`starter-${item.kind}-${item.slug}`} className='ds-card ds-card-paper h-full'>
                  <p className='label-specimen'>
                    starter profile
                  </p>
                  <h3 className='mt-1 text-sm font-semibold text-white'>{item.name}</h3>
                  <p className='mt-2 line-clamp-3 text-xs text-white/80'>{item.blurb}</p>
                  {renderGovernedSignals(item)}
                  <Link
                    to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                    className='mt-3 inline-flex text-xs text-emerald-200 hover:text-emerald-100'
                    onClick={() =>
                      trackHomepageEntityClick({
                        targetType: item.kind,
                        targetSlug: item.slug,
                        placement: 'popular_paths_starter_profile',
                      })
                    }
                  >
                    Start here →
                  </Link>
                </article>
              ))}
            </div>
            <div className='ds-action-row'>
              <Link to='/learning' className='btn-secondary'>
                Beginner learning paths
              </Link>
              <Link to='/herbs' className='btn-secondary'>
                Full herb index
              </Link>
            </div>
          </div>
        </Collapse>
      </section>

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='ds-card-lg ds-stack'>
          <p className='label-specimen'>
            Knowledge scope
          </p>
          <p className='text-sm text-white/75'>
            Review compounds, mechanisms, and safety boundaries before any personal experimentation.
          </p>
          <nav aria-label='Site stats' className='grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3'>
            <StatPill
              to='/herbs'
              value={homepageData.counts.herbs}
              label='psychoactive herbs'
              testId='pill-herbs'
              onClick={() =>
                trackHomepageEntityClick({
                  targetType: 'herb',
                  targetSlug: 'index',
                  placement: 'knowledge_scope_pill',
                })
              }
            />
            <StatPill
              to='/compounds'
              value={homepageData.counts.compounds}
              label='active compounds'
              testId='pill-compounds'
              onClick={() =>
                trackHomepageEntityClick({
                  targetType: 'compound',
                  targetSlug: 'index',
                  placement: 'knowledge_scope_pill',
                })
              }
            />
            <StatPill
              to='/blog'
              value={homepageData.counts.articles}
              label='research notes'
              testId='pill-articles'
            />
          </nav>
        </div>
      </section>

      {dailyDiscovery && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <div className='ds-card-lg ds-card-paper border-emerald-200/20 bg-emerald-400/5'>
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
                onClick={() =>
                  trackHomepageEntityClick({
                    targetType: dailyDiscovery.kind,
                    targetSlug: dailyDiscovery.slug,
                    placement: 'daily_discovery',
                  })
                }
              >
                Read full breakdown
              </Link>
              <span className='ds-pill text-xs text-emerald-100/85'>
                {dailyDiscovery.qualityBadge}
              </span>
              {dailyDiscovery.governedSummary?.lastReviewedAt && (
                <span className='ds-pill text-xs text-white/80'>
                  Reviewed {dailyDiscovery.governedSummary.lastReviewedAt.slice(0, 10)}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <div className='ds-card-lg ds-stack'>
            <p className='label-specimen'>
              Saved items
            </p>
            <h2 className='ds-heading'>Pick up where you left off</h2>
            <div className='ds-card-grid sm:grid-cols-2'>
              {items.slice(0, 4).map(item => (
                <Link key={item.id} to={item.href} className='ds-card h-full'>
                  <p className='text-xs uppercase tracking-[0.14em] text-white/55'>{item.type}</p>
                  <p className='mt-1 text-sm font-semibold text-white'>{item.title}</p>
                </Link>
              ))}
            </div>
            <Link to='/favorites' className='btn-secondary w-fit'>
              Saved items
            </Link>
          </div>
        </section>
      )}

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <Collapse title='Featured discoveries'>
          <div className='no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1'>
            {featured.map(item => (
              <Link
                key={`${item.kind}-${item.slug}`}
                to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                className='ds-card min-w-[230px] snap-start p-5 transition hover:border-white/25'
                onClick={() =>
                  trackHomepageEntityClick({
                    targetType: item.kind,
                    targetSlug: item.slug,
                    placement: 'featured_discoveries',
                  })
                }
              >
                <p className='text-xs uppercase tracking-[0.18em] text-emerald-200/80'>
                  {item.kind}
                </p>
                <h3 className='mt-1 text-lg font-semibold text-white'>{item.name}</h3>
                <p className='mt-2 line-clamp-3 text-sm text-white/70'>{item.blurb}</p>
                {renderGovernedSignals(item)}
                <p className='mt-3 text-xs text-emerald-100/80'>{item.whyItMatters}</p>
                <p className='mt-2 text-[11px] uppercase tracking-[0.16em] text-white/55'>
                  {item.qualityBadge}
                </p>
              </Link>
            ))}
          </div>
        </Collapse>
      </section>

      {homepageData.governedHighlights.length > 0 && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <Collapse title='Reviewed research highlights'>
            <div className='ds-card-grid sm:grid-cols-2'>
              {homepageData.governedHighlights.slice(0, 4).map(item => (
                <Link
                  key={`reviewed-${item.kind}-${item.slug}`}
                  to={item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                  className='ds-card h-full transition hover:border-white/25'
                >
                  <p className='text-xs uppercase tracking-[0.14em] text-emerald-200/80'>
                    {item.kind} · enriched + reviewed
                  </p>
                  <h3 className='mt-1 text-sm font-semibold text-white'>{item.name}</h3>
                  <p className='mt-2 text-xs text-white/80'>{item.blurb}</p>
                  {renderGovernedSignals(item)}
                </Link>
              ))}
            </div>
            <p className='text-xs text-white/55'>
              Signals above only appear when governed enrichment is publishable and approved.
            </p>
          </Collapse>
        </section>
      )}

      {(recent.length > 0 || recentBlends.length > 0 || recentChecks.length > 0) && (
        <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
          <Collapse title='Recent activity'>
            <div className='ds-card-grid sm:grid-cols-3'>
              <div className='ds-card h-full'>
                <p className='text-xs uppercase tracking-[0.14em] text-white/55'>Viewed herbs</p>
                <div className='mt-2 grid gap-2'>
                  {recent
                    .filter(item => item.type === 'herb')
                    .slice(0, 3)
                    .map(item => (
                      <Link
                        key={`${item.type}-${item.slug}`}
                        to={item.href}
                        className='text-sm font-medium text-white/90 hover:text-white'
                      >
                        {item.title}
                      </Link>
                    ))}
                </div>
              </div>
              <div className='ds-card h-full'>
                <p className='text-xs uppercase tracking-[0.14em] text-white/55'>Recent blends</p>
                <div className='mt-2 grid gap-2'>
                  {recentBlends.slice(0, 3).map(item => (
                    <Link key={item.id} to='/build' className='text-sm font-medium text-white/90'>
                      {item.intent} · {item.herbSlugs.length} herbs
                    </Link>
                  ))}
                </div>
              </div>
              <div className='ds-card h-full'>
                <p className='text-xs uppercase tracking-[0.14em] text-white/55'>
                  Interaction checks
                </p>
                <div className='mt-2 grid gap-2'>
                  {recentChecks.slice(0, 3).map(item => (
                    <Link
                      key={item.id}
                      to='/interactions'
                      className='text-sm font-medium text-white/90 hover:text-white'
                    >
                      {item.herbSlugs.length} herbs · {item.warningCount} warnings
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Collapse>
        </section>
      )}

      <section className='ds-section container mx-auto max-w-4xl px-4 sm:px-6'>
        <Collapse title='Programmatic collections'>
          <div className='ds-stack'>
            <p className='text-sm text-white/75'>
              Discover focused landing pages generated from the same herb and compound dataset used
              by our tools.
            </p>
            <div className='grid gap-2 sm:grid-cols-2'>
              {featuredCollections.map(collection => (
                <Link
                  key={collection.slug}
                  to={`/collections/${collection.slug}`}
                  className='ds-card p-3 text-sm font-medium text-white transition hover:border-white/25'
                  onClick={() =>
                    trackHomepageEntityClick({
                      targetType: 'collection',
                      targetSlug: collection.slug,
                      placement: 'programmatic_collections',
                    })
                  }
                >
                  {collection.title}
                </Link>
              ))}
            </div>
          </div>
        </Collapse>
      </section>

      <EmailCapture
        title='Get one new herb insight per day'
        subtitle='Day 1: beginner blend guide. Day 2+: a short daily herb or compound insight with a direct link back to the full breakdown.'
        buttonLabel='Start daily insights'
      />
    </>
  )
}
