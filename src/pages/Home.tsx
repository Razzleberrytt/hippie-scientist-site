import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import herbsData from '../../public/data/herbs.json'
import type { HerbRecord } from '@/types/herb'
import { sanitizeSummaryText } from '@/lib/sanitize'
import { sanitizeRenderChips } from '@/lib/renderGuard'

const FEATURED_HERBS = [
  'Curcuma longa',
  'Camellia sinensis',
  'Withania somnifera',
  'Panax ginseng',
  'Ginkgo biloba',
  'Rosmarinus officinalis',
  'Glycyrrhiza glabra',
  'Nigella sativa',
  'Centella asiatica',
  'Zingiber officinale',
  'Silybum marianum',
  'Rhodiola rosea',
] as const

const FEATURED_COMPOUNDS = [
  'Curcumin',
  'Epigallocatechin gallate',
  'Withaferin A',
  'Ginsenoside Rg1',
  'Ginkgolide B',
  'Carnosic acid',
  'Glycyrrhizin',
  'Thymoquinone',
  'Asiatic acid',
  'Berberine',
  'Quercetin',
  'Resveratrol',
] as const

const TRUST_ITEMS = ['Evidence-linked entries', 'Safety framing on every profile', 'Methods and assumptions published']

function encodedQuery(name: string) {
  return encodeURIComponent(name)
}

const HERB_FALLBACK_SUMMARY = 'Science-first herbal reference profile.'

const herbLookup = new Map(
  (herbsData as HerbRecord[]).map(herb => [String(herb.name || '').trim().toLowerCase(), herb] as const),
)

function truncateCardLine(value: string, maxLength = 110) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).replace(/\s+\S*$/, '').trim()}…`
}

function buildHerbSummary(herb: HerbRecord | undefined) {
  const preferred = sanitizeSummaryText(herb?.summary, 1)
  if (preferred) return truncateCardLine(preferred)

  const fallbackDescription = sanitizeSummaryText(herb?.description, 1)
  if (fallbackDescription) return truncateCardLine(fallbackDescription)

  return HERB_FALLBACK_SUMMARY
}

function buildMechanismChips(herb: HerbRecord | undefined) {
  const chips = sanitizeRenderChips([herb?.mechanismTags, herb?.mechanisms], 4)
  return chips.filter(chip => chip.length >= 3 && chip.length <= 28).slice(0, 2)
}

export default function Home() {
  return (
    <>
      <Meta
        title='The Hippie Scientist — Science-first Herb & Compound Reference'
        description='Science-first herb and compound reference with mechanism context, confidence framing, and safety notes.'
        path='/'
        pageType='website'
        jsonLd={[websiteJsonLd(), organizationJsonLd()]}
      />

      <section className='container mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14'>
        <div className='premium-panel p-6 sm:p-8'>
          <p className='section-label'>Herb and compound reference</p>
          <h1 className='mt-2 text-3xl font-semibold text-white sm:text-4xl'>Find evidence-oriented herb and compound profiles.</h1>
          <p className='mt-3 max-w-3xl text-sm text-white/74'>
            Browse structured entries with mechanism context, confidence framing, and safety notes.
          </p>
          <div className='mt-5 flex flex-wrap gap-2.5'>
            <Link to='/herbs' className='btn-primary'>
              Browse herbs
            </Link>
            <Link to='/compounds' className='btn-secondary'>
              Browse compounds
            </Link>
          </div>
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
        <p className='section-label'>Browse</p>
        <div className='mt-3 grid gap-3 md:grid-cols-2'>
          <Link to='/herbs' className='premium-panel p-5 transition-colors hover:border-white/20'>
            <h2 className='text-lg font-semibold text-white'>Herbs</h2>
            <p className='mt-2 text-sm text-white/73'>Plant profiles with key effects, safety context, and evidence framing.</p>
          </Link>
          <Link to='/compounds' className='premium-panel p-5 transition-colors hover:border-white/20'>
            <h2 className='text-lg font-semibold text-white'>Compounds</h2>
            <p className='mt-2 text-sm text-white/73'>Active compounds with mechanism summaries and linked plant sources.</p>
          </Link>
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
        <p className='section-label'>Trust</p>
        <div className='mt-3 grid gap-2 md:grid-cols-3'>
          {TRUST_ITEMS.map(item => (
            <p key={item} className='browse-shell px-3 py-2 text-sm text-white/76'>
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-8 sm:px-6'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <p className='section-label'>Featured herbs</p>
          <Link to='/herbs' className='text-sm text-cyan-200 hover:text-cyan-100'>
            View all herbs →
          </Link>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {FEATURED_HERBS.map(name => {
            const herb = herbLookup.get(name.toLowerCase())
            const summary = buildHerbSummary(herb)
            const mechanismChips = buildMechanismChips(herb)

            return (
              <Link
                key={name}
                to={`/herbs?query=${encodedQuery(name)}`}
                className='premium-panel p-4 transition-colors hover:border-white/20'
              >
                <h3 className='text-base font-semibold text-white'>{name}</h3>
                <p className='mt-2 text-sm text-white/73'>{summary}</p>
                {mechanismChips.length > 0 ? (
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {mechanismChips.map(chip => (
                      <span
                        key={`${name}-${chip}`}
                        className='rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/74'
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            )
          })}
        </div>
      </section>

      <section className='container mx-auto max-w-6xl px-4 pb-12 sm:px-6'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <p className='section-label'>Featured compounds</p>
          <Link to='/compounds' className='text-sm text-cyan-200 hover:text-cyan-100'>
            View all compounds →
          </Link>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {FEATURED_COMPOUNDS.map(name => (
            <Link
              key={name}
              to={`/compounds?query=${encodedQuery(name)}`}
              className='premium-panel p-4 transition-colors hover:border-white/20'
            >
              <h3 className='text-base font-semibold text-white'>{name}</h3>
              <p className='mt-2 text-sm text-white/73'>Open profile and review mechanism, confidence, and safety details.</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
