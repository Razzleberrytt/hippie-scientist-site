import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import featuredData from '../../public/data/homepage-featured.json'

const TRUST_ITEMS = ['Evidence-linked entries', 'Safety framing on every profile', 'Methods and assumptions published']

function encodedQuery(name: string) {
  return encodeURIComponent(name)
}

type HomeFeaturedItem = {
  name: string
  slug: string
  summary: string
  tags?: string[]
}

const featuredHerbs = ((featuredData as { herbs?: HomeFeaturedItem[] }).herbs || []).slice(0, 12)
const featuredCompounds = ((featuredData as { compounds?: HomeFeaturedItem[] }).compounds || []).slice(0, 12)

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
          {featuredHerbs.map(herb => {
            const mechanismChips = Array.isArray(herb.tags) ? herb.tags : []

            return (
              <Link
                key={herb.slug}
                to={`/herbs?query=${encodedQuery(herb.name)}`}
                className='premium-panel p-4 transition-colors hover:border-white/20'
              >
                <h3 className='text-base font-semibold text-white'>{herb.name}</h3>
                <p className='mt-2 text-sm text-white/73'>{herb.summary}</p>
                {mechanismChips.length > 0 ? (
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {mechanismChips.map(chip => (
                      <span
                        key={`${herb.slug}-${chip}`}
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
          {featuredCompounds.map(compound => (
            <Link
              key={compound.slug}
              to={`/compounds?query=${encodedQuery(compound.name)}`}
              className='premium-panel p-4 transition-colors hover:border-white/20'
            >
              <h3 className='text-base font-semibold text-white'>{compound.name}</h3>
              <p className='mt-2 text-sm text-white/73'>{compound.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
