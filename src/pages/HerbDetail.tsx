import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { herbs } from '../data/herbs/herbsfull'
import { herbName } from '../utils/herb'
import { getText } from '../lib/fields'
import { pick, tidy, formatList, isNonEmpty, urlish } from '../lib/present'
import { ALIASES } from '../data/schema'

const DISCLAIMER_TEXT =
  'The information on this site is for educational purposes only. It is not medical advice and should not be used to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before using any herbal products or supplements.'

const placeholderImage = '/images/placeholder.png'

export default function HerbDetail() {
  const { slug } = useParams<{ slug?: string }>()

  const herb = useMemo(() => {
    if (!slug) return undefined
    const normalized = slug.toLowerCase()
    return herbs.find(h => {
      const slugMatch = (h.slug || '').toLowerCase() === normalized
      const idMatch = (h.id || '').toLowerCase() === normalized
      const nameMatch = (h.nameNorm || '').toLowerCase().replace(/\s+/g, '-') === normalized
      return slugMatch || idMatch || nameMatch
    })
  }, [slug])

  const canonical = slug ? `https://thehippiescientist.net/herb/${slug}` : undefined

  if (!herb) {
    return (
      <>
        <SEO
          title='Herb Not Found | The Hippie Scientist'
          description='The requested herb profile could not be located.'
          canonical={canonical}
        />
        <main className='mx-auto max-w-3xl px-4 py-8 text-center text-sand'>
          <h1 className='text-3xl font-bold'>Herb not found</h1>
          <p className='mt-2'>We could not locate that herb profile.</p>
          <p className='mt-4'>
            <Link className='text-sky-300 underline' to='/database'>
              ← Back to Herb Database
            </Link>
          </p>
        </main>
      </>
    )
  }

  const imageSrc = herb.image || `/images/herbs/${herb.slug}.jpg`
  const scientific = tidy(getText(herb, 'scientific', ['botanical', 'latin', 'latinname']))
  const effects = tidy(pick.effects(herb))
  const description = tidy(pick.description(herb))
  const mechanism = tidy(pick.mechanism(herb))
  const preparations = pick.preparations(herb).map(tidy).filter(Boolean)
  const dosage = tidy(pick.dosage(herb))
  const therapeutic = tidy(pick.therapeutic(herb))
  const interactions = pick.interactions(herb).map(tidy).filter(Boolean)
  const contraindications = pick.contraind(herb).map(tidy).filter(Boolean)
  const sideEffects = pick.sideeffects(herb).map(tidy).filter(Boolean)
  const safety = tidy(pick.safety(herb))
  const toxicity = tidy(pick.toxicity(herb))
  const toxicityLD50 = tidy(pick.toxicity_ld50(herb))
  const legalStatus = tidy(pick.legalstatus(herb))
  const schedule = tidy(pick.schedule(herb))
  const legalNotes = tidy(pick.legalnotes(herb))
  const compounds = pick.compounds(herb).map(tidy).filter(Boolean)
  const region = tidy(pick.region(herb))
  const regionTags = pick.regiontags(herb).map(tidy).filter(Boolean)
  const sources = pick
    .sources(herb)
    .map(src => src.replace(/[.;,]\s*$/, '').trim())
    .map(src => (urlish(src) ? src : tidy(src)))
    .filter(Boolean)

  const intensityRaw = herb.intensity_label ?? pick.intensity(herb)
  const intensityText = tidy(intensityRaw ?? '')
  const categoryRaw = herb.category_label ?? getText(herb, 'category', ALIASES.category)
  const categoryText = tidy(categoryRaw ?? '')
  const subcategoryRaw = herb.subcategory ?? getText(herb, 'subcategory', ALIASES.subcategory)
  const subcategoryText = tidy(subcategoryRaw ?? '')

  const showLegal = isNonEmpty(legalStatus) && !/^legal$/i.test(legalStatus)
  const showSchedule = isNonEmpty(schedule)
  const showLegalNotes = isNonEmpty(legalNotes)

  const hasSections = [
    isNonEmpty(effects),
    isNonEmpty(description),
    isNonEmpty(mechanism),
    preparations.length > 0,
    isNonEmpty(dosage),
    isNonEmpty(therapeutic),
    interactions.length > 0,
    contraindications.length > 0,
    sideEffects.length > 0,
    isNonEmpty(safety),
    isNonEmpty(toxicity) || isNonEmpty(toxicityLD50),
    showLegal || showSchedule || showLegalNotes,
    compounds.length > 0,
    isNonEmpty(region) || regionTags.length > 0,
    sources.length > 0,
  ].some(Boolean)

  return (
    <>
      <SEO
        title={`${herbName(herb)} | The Hippie Scientist`}
        description={
          herb.description
            ? herb.description
            : `Learn about ${herbName(herb)}, including key compounds, traditional uses, and safety insights.`
        }
        canonical={canonical}
      />
      <main className='mx-auto max-w-4xl px-4 py-10 text-sand'>
        <p>
          <Link className='text-sky-300 underline' to='/database'>
            ← Back to Herb Database
          </Link>
        </p>
        <header className='mt-6 flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='flex-1'>
            <h1 className='text-gradient text-4xl font-bold'>{herbName(herb)}</h1>
            {isNonEmpty(scientific) && (
              <p className='mt-1 text-lg italic text-sand/80'>{scientific}</p>
            )}
            <dl className='mt-4 grid gap-3 text-sm text-sand/80 sm:grid-cols-2'>
              {isNonEmpty(categoryText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Category</dt>
                  <dd>{categoryText}</dd>
                </div>
              )}
              {isNonEmpty(subcategoryText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Subcategory</dt>
                  <dd>{subcategoryText}</dd>
                </div>
              )}
              {isNonEmpty(intensityText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Intensity</dt>
                  <dd>{intensityText}</dd>
                </div>
              )}
              {showLegal && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Legal Status</dt>
                  <dd>{legalStatus}</dd>
                </div>
              )}
              {showSchedule && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Schedule</dt>
                  <dd>{schedule}</dd>
                </div>
              )}
              {isNonEmpty(region) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Region</dt>
                  <dd>{region}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className='mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 shadow-lg'>
            <img
              src={imageSrc}
              alt={herbName(herb)}
              className='h-56 w-full object-cover'
              onError={event => {
                const target = event.currentTarget
                if (target.src !== placeholderImage) {
                  target.src = placeholderImage
                }
              }}
            />
          </div>
        </header>
        {(isNonEmpty(effects) || isNonEmpty(description)) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            {isNonEmpty(effects) && (
              <>
                <h2 className='text-2xl font-semibold text-lime-300'>Effects</h2>
                <p className='mt-3 text-sand/90'>{effects}</p>
              </>
            )}
            {isNonEmpty(description) && (
              <>
                <h2 className={`text-2xl font-semibold text-lime-300 ${isNonEmpty(effects) ? 'mt-6' : ''}`}>
                  Description
                </h2>
                <p className='mt-3 text-sand/90'>{description}</p>
              </>
            )}
          </section>
        )}

        {isNonEmpty(mechanism) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Mechanism of Action</h2>
            <p className='mt-3 text-sand/90'>{mechanism}</p>
          </section>
        )}

        {preparations.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Preparations</h2>
            <p className='mt-3 text-sand/90'>{formatList(preparations)}</p>
          </section>
        )}

        {isNonEmpty(dosage) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Dosage / Administration</h2>
            <p className='mt-3 text-sand/90'>{dosage}</p>
          </section>
        )}

        {isNonEmpty(therapeutic) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Therapeutic / Traditional Uses</h2>
            <p className='mt-3 text-sand/90'>{therapeutic}</p>
          </section>
        )}

        {interactions.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Interactions</h2>
            <p className='mt-3 text-sand/90'>{formatList(interactions)}</p>
          </section>
        )}

        {contraindications.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Contraindications</h2>
            <p className='mt-3 text-sand/90'>{formatList(contraindications)}</p>
          </section>
        )}

        {sideEffects.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Side Effects</h2>
            <p className='mt-3 text-sand/90'>{formatList(sideEffects)}</p>
          </section>
        )}

        {isNonEmpty(safety) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Safety Notes</h2>
            <p className='mt-3 text-sand/90'>{safety}</p>
          </section>
        )}

        {(isNonEmpty(toxicity) || isNonEmpty(toxicityLD50)) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Toxicity &amp; LD50</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {isNonEmpty(toxicity) && (
                <p>
                  <strong>Toxicity:</strong> {toxicity}
                </p>
              )}
              {isNonEmpty(toxicityLD50) && (
                <p>
                  <strong>LD50:</strong> {toxicityLD50}
                </p>
              )}
            </div>
          </section>
        )}

        {(showLegal || showSchedule || showLegalNotes) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Legal Status</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {showLegal && (
                <p>
                  <strong>Status:</strong> {legalStatus}
                </p>
              )}
              {showSchedule && (
                <p>
                  <strong>Schedule:</strong> {schedule}
                </p>
              )}
              {showLegalNotes && (
                <p>
                  <strong>Notes:</strong> {legalNotes}
                </p>
              )}
            </div>
          </section>
        )}

        {compounds.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Active Compounds</h2>
            <p className='mt-3 text-sand/90'>{formatList(compounds)}</p>
          </section>
        )}

        {(isNonEmpty(region) || regionTags.length > 0) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Region &amp; Distribution</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {isNonEmpty(region) && (
                <p>
                  <strong>Region:</strong> {region}
                </p>
              )}
              {regionTags.length > 0 && (
                <p>
                  <strong>Region Tags:</strong> {formatList(regionTags)}
                </p>
              )}
            </div>
          </section>
        )}

        {sources.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Sources &amp; References</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {sources.map((src, index) => (
                <li key={`${herb.slug}-source-${index}`}>
                  {urlish(src) ? (
                    <a href={src} target='_blank' rel='noopener noreferrer' className='text-sky-300 underline'>
                      {src}
                    </a>
                  ) : (
                    src
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!hasSections && (
          <p className='mt-10 text-sm opacity-70'>No additional information available for this herb yet.</p>
        )}

        <p className='mt-12 text-sm text-sand/60'>{DISCLAIMER_TEXT}</p>
      </main>
    </>
  )
}
