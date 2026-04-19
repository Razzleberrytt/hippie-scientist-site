import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import Hero from '@/components/Hero'
import { getHomepageData, type HomepageFeaturedItem } from '@/lib/homepage-data'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { trackHomepageEntityClick } from '@/lib/contentJourneyTracking'

type MechanismTopic = {
  label: string
  query: string
  description: string
}

const MECHANISM_TOPICS: MechanismTopic[] = [
  { label: 'GABA signaling', query: 'gaba', description: 'Sedative and anxiolytic pathways.' },
  { label: 'Serotonin signaling', query: 'serotonin', description: 'Mood, perception, and regulation pathways.' },
  { label: 'Dopamine signaling', query: 'dopamine', description: 'Motivation and reward-associated pathways.' },
  { label: 'Cholinergic pathways', query: 'acetylcholine', description: 'Attention, memory, and cognitive signaling.' },
]

function conciseBlurb(value: string, fallback: string) {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return fallback
  if (normalized.length <= 145) return normalized
  return `${normalized.slice(0, 142).trimEnd()}...`
}

function countMechanismMatches(records: Array<{ mechanism?: string }>, query: string) {
  const needle = query.toLowerCase()
  return records.filter(entry => String(entry.mechanism || '').toLowerCase().includes(needle)).length
}

function entityHref(item: HomepageFeaturedItem) {
  return item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`
}

export default function Home() {
  const homepageData = useMemo(() => getHomepageData(), [])
  const generatedDateLabel = useMemo(
    () =>
      new Date(homepageData.generatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [homepageData.generatedAt],
  )

  const featuredHerbs = useMemo(
    () => homepageData.featured.filter(item => item.kind === 'herb').slice(0, 3),
    [homepageData.featured],
  )
  const featuredCompounds = useMemo(
    () => homepageData.featured.filter(item => item.kind === 'compound').slice(0, 3),
    [homepageData.featured],
  )

  return (
    <>
      <Meta
        title='The Hippie Scientist — Science-first Herb & Compound Reference'
        description='Science-first herb and compound reference with mechanism context, confidence framing, and safety notes.'
        path='/'
        pageType='website'
        jsonLd={[websiteJsonLd(), organizationJsonLd()]}
      />

      <Hero />

      <section className='container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10'>
        <p className='section-label'>Browse entry points</p>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <Link to='/herbs' className='premium-panel p-4 transition-colors hover:border-white/20'>
            <p className='section-label'>Herbs</p>
            <p className='mt-2 text-2xl font-semibold text-amber-200'>{homepageData.counts.herbs}</p>
            <p className='mt-2 text-sm text-white/72'>Browse herb profiles with effects, confidence, and safety context.</p>
          </Link>
          <Link to='/compounds' className='premium-panel p-4 transition-colors hover:border-white/20'>
            <p className='section-label'>Compounds</p>
            <p className='mt-2 text-2xl font-semibold text-amber-200'>{homepageData.counts.compounds}</p>
            <p className='mt-2 text-sm text-white/72'>Review compound mechanisms, linked herbs, and risk notes.</p>
          </Link>
          <Link to='/herbs?query=mechanism' className='premium-panel p-4 transition-colors hover:border-white/20'>
            <p className='section-label'>Mechanisms</p>
            <p className='mt-2 text-2xl font-semibold text-amber-200'>Explore</p>
            <p className='mt-2 text-sm text-white/72'>Search mechanism language across herb entries and follow links to details.</p>
          </Link>
          <Link to='/blog' className='premium-panel p-4 transition-colors hover:border-white/20'>
            <p className='section-label'>Notebook</p>
            <p className='mt-2 text-2xl font-semibold text-amber-200'>{homepageData.counts.articles}</p>
            <p className='mt-2 text-sm text-white/72'>Read research notebooks documenting assumptions, caveats, and updates.</p>
          </Link>
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
        <div className='browse-shell p-4 sm:p-5'>
          <p className='section-label'>Trust strip</p>
          <div className='mt-3 grid gap-2 md:grid-cols-3'>
            {homepageData.trustBadges.slice(0, 3).map(badge => (
              <p key={badge} className='rounded-xl border border-white/12 bg-white/[0.02] px-3 py-2 text-sm text-white/76'>
                {badge}
              </p>
            ))}
          </div>
          <p className='mt-3 text-xs text-white/55'>Homepage data snapshot: {generatedDateLabel}</p>
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 py-8 sm:px-6'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <div>
            <p className='section-label'>Featured herbs</p>
            <h2 className='mt-1 text-2xl text-white'>Herb profiles to start with</h2>
          </div>
          <Link to='/herbs' className='text-sm text-cyan-200 hover:text-cyan-100'>
            View all herbs →
          </Link>
        </div>
        <div className='grid gap-3 md:grid-cols-3'>
          {featuredHerbs.map(item => (
            <Link
              key={item.slug}
              to={entityHref(item)}
              className='premium-panel flex h-full flex-col p-4 transition-colors hover:border-white/20'
              onClick={() =>
                trackHomepageEntityClick({
                  targetType: item.kind,
                  targetSlug: item.slug,
                  placement: 'featured_herbs',
                })
              }
            >
              <p className='section-label'>{item.qualityBadge}</p>
              <h3 className='mt-2 text-lg font-semibold text-white'>{item.name}</h3>
              <p className='mt-2 text-sm text-white/73'>{conciseBlurb(item.blurb, 'Open profile for mechanism and safety notes.')}</p>
              <span className='mt-4 text-xs text-cyan-200'>Open herb profile →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 py-2 sm:px-6 sm:py-4'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <div>
            <p className='section-label'>Featured compounds</p>
            <h2 className='mt-1 text-2xl text-white'>Compound entries from the archive</h2>
          </div>
          <Link to='/compounds' className='text-sm text-cyan-200 hover:text-cyan-100'>
            View all compounds →
          </Link>
        </div>
        <div className='grid gap-3 md:grid-cols-3'>
          {featuredCompounds.map(item => (
            <Link
              key={item.slug}
              to={entityHref(item)}
              className='premium-panel flex h-full flex-col p-4 transition-colors hover:border-white/20'
              onClick={() =>
                trackHomepageEntityClick({
                  targetType: item.kind,
                  targetSlug: item.slug,
                  placement: 'featured_compounds',
                })
              }
            >
              <p className='section-label'>{item.qualityBadge}</p>
              <h3 className='mt-2 text-lg font-semibold text-white'>{item.name}</h3>
              <p className='mt-2 text-sm text-white/73'>{conciseBlurb(item.blurb, 'Open profile for source-backed mechanism context.')}</p>
              <span className='mt-4 text-xs text-cyan-200'>Open compound profile →</span>
            </Link>
          ))}
        </div>
      </section>

      <section id='mechanism-explorer' className='container mx-auto max-w-6xl px-4 py-10 sm:px-6'>
        <p className='section-label'>Mechanism explorer</p>
        <h2 className='mt-1 text-2xl text-white'>Start from pathway-level questions</h2>
        <p className='mt-2 max-w-3xl text-sm text-white/73'>
          Jump into mechanism-related terms found in current herb records. Use these as a first pass, then validate on full profile pages.
        </p>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {MECHANISM_TOPICS.map(topic => {
            const matchCount = countMechanismMatches(homepageData.effectExplorerHerbs, topic.query)
            return (
              <Link
                key={topic.query}
                to={`/herbs?query=${encodeURIComponent(topic.query)}`}
                className='browse-shell p-4 transition-colors hover:border-white/20'
              >
                <p className='text-sm font-semibold text-white'>{topic.label}</p>
                <p className='mt-1 text-xs text-white/64'>{topic.description}</p>
                <p className='mt-3 text-xs text-amber-200'>{matchCount} herb records mention this term</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
        <div className='premium-panel p-5 sm:p-6'>
          <p className='section-label'>Research notebook</p>
          <h2 className='mt-2 text-2xl text-white'>How the archive evolves</h2>
          <p className='mt-3 max-w-3xl text-sm text-white/74'>
            The research notebook tracks data updates, pipeline changes, and evidence caveats so readers can audit why entries changed.
          </p>
          <div className='mt-4 flex flex-wrap gap-2.5'>
            <Link to='/blog' className='btn-secondary'>
              Open research notebook
            </Link>
            <Link to='/data-report' className='btn-secondary'>
              View data report
            </Link>
          </div>
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-12 sm:px-6'>
        <div className='browse-shell p-5 sm:p-6'>
          <p className='section-label'>Methodology</p>
          <h2 className='mt-2 text-2xl text-white'>How confidence and safety framing work</h2>
          <p className='mt-3 max-w-3xl text-sm text-white/74'>
            Read the methodology before acting on any entry. Confidence labels are evidence framing, not treatment recommendations.
          </p>
          <div className='mt-4 flex flex-wrap gap-2.5'>
            <Link to='/methodology' className='btn-primary'>
              Read methodology
            </Link>
            <Link to='/interactions' className='btn-secondary'>
              Run interaction check
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
