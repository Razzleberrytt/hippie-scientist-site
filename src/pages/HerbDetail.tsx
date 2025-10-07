import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { herbs } from '../data/herbs/herbsfull'
import { herbName } from '../utils/herb'
import { getText } from '../lib/fields'
import { pick, tidy, urlish } from '../lib/present'
import { cleanLine, hasVal, joinList, titleCase } from '../lib/pretty'
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

  const cleanText = (value: any) => cleanLine(tidy(value ?? ''))
  const cleanItems = (values: string[]) =>
    values
      .map(item => cleanText(item))
      .filter(item => hasVal(item))

  const imageSrc = herb.image || `/images/herbs/${herb.slug}.jpg`
  const scientific = cleanText(getText(herb, 'scientific', ['botanical', 'latin', 'latinname']))
  const effects = cleanText(pick.effects(herb))
  const description = cleanText(pick.description(herb))
  const mechanism = cleanText(pick.mechanism(herb))
  const preparations = cleanItems(pick.preparations(herb))
  const dosage = cleanText(pick.dosage(herb))
  const therapeutic = cleanText(pick.therapeutic(herb))
  const interactions = cleanItems(pick.interactions(herb))
  const contraindications = cleanItems(pick.contraind(herb))
  const sideEffects = cleanItems(pick.sideeffects(herb))
  const safety = cleanText(pick.safety(herb))
  const toxicity = cleanText(pick.toxicity(herb))
  const toxicityLD50 = cleanText(pick.toxicity_ld50(herb))
  const legalStatus = cleanText(pick.legalstatus(herb))
  const schedule = cleanText(pick.schedule(herb))
  const legalNotes = cleanText(pick.legalnotes(herb))
  const compounds = cleanItems(pick.compounds(herb))
  const region = cleanText(pick.region(herb))
  const regionTags = cleanItems(pick.regiontags(herb))
  const sources = pick
    .sources(herb)
    .map(src => src.replace(/[.;,]\s*$/, '').trim())
    .map(src => (urlish(src) ? src : cleanText(src)))
    .filter(src => hasVal(src))

  const intensityRaw = herb.intensity_label ?? pick.intensity(herb)
  const intensityText = titleCase(cleanText(intensityRaw).toLowerCase())
  const categoryRaw = herb.category_label ?? getText(herb, 'category', ALIASES.category)
  const categoryText = cleanText(categoryRaw ?? '')
  const subcategoryRaw = herb.subcategory ?? getText(herb, 'subcategory', ALIASES.subcategory)
  const subcategoryText = cleanText(subcategoryRaw ?? '')

  const showEffects = hasVal(effects)
  const showDescription = hasVal(description)
  const showMechanism = hasVal(mechanism)
  const showDosage = hasVal(dosage)
  const showTherapeutic = hasVal(therapeutic)
  const showSafety = hasVal(safety)
  const showToxicity = hasVal(toxicity)
  const showToxicityLD50 = hasVal(toxicityLD50)
  const showLegal = hasVal(legalStatus) && !/^legal$/i.test(legalStatus)
  const showSchedule = hasVal(schedule)
  const showLegalNotes = hasVal(legalNotes)
  const showRegion = hasVal(region)

  const hasSections = [
    showEffects,
    showDescription,
    showMechanism,
    preparations.length > 0,
    showDosage,
    showTherapeutic,
    interactions.length > 0,
    contraindications.length > 0,
    sideEffects.length > 0,
    showSafety,
    showToxicity || showToxicityLD50,
    showLegal || showSchedule || showLegalNotes,
    compounds.length > 0,
    showRegion || regionTags.length > 0,
    sources.length > 0,
  ].some(Boolean)

  return (
    <>
      <SEO
        title={`${herbName(herb)} | The Hippie Scientist`}
        description={
          showDescription
            ? description
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
            {hasVal(scientific) && (
              <p className='mt-1 text-lg italic text-sand/80'>{scientific}</p>
            )}
            <dl className='mt-4 grid gap-3 text-sm text-sand/80 sm:grid-cols-2'>
              {hasVal(categoryText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Category</dt>
                  <dd>{categoryText}</dd>
                </div>
              )}
              {hasVal(subcategoryText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Subcategory</dt>
                  <dd>{subcategoryText}</dd>
                </div>
              )}
              {hasVal(intensityText) && (
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
              {showRegion && (
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
        {(showEffects || showDescription) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            {showEffects && (
              <>
                <h2 className='text-2xl font-semibold text-lime-300'>Effects</h2>
                <p className='mt-3 text-sand/90'>{effects}</p>
              </>
            )}
            {showDescription && (
              <>
                <h2 className={`text-2xl font-semibold text-lime-300 ${showEffects ? 'mt-6' : ''}`}>
                  Description
                </h2>
                <p className='mt-3 text-sand/90'>{description}</p>
              </>
            )}
          </section>
        )}

        {showMechanism && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Mechanism of Action</h2>
            <p className='mt-3 text-sand/90'>{mechanism}</p>
          </section>
        )}

        {preparations.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Preparations</h2>
            <p className='mt-3 text-sand/90'>{joinList(preparations)}</p>
          </section>
        )}

        {showDosage && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Dosage / Administration</h2>
            <p className='mt-3 text-sand/90'>{dosage}</p>
          </section>
        )}

        {showTherapeutic && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Therapeutic / Traditional Uses</h2>
            <p className='mt-3 text-sand/90'>{therapeutic}</p>
          </section>
        )}

        {interactions.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Interactions</h2>
            <p className='mt-3 text-sand/90'>{joinList(interactions)}</p>
          </section>
        )}

        {contraindications.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Contraindications</h2>
            <p className='mt-3 text-sand/90'>{joinList(contraindications)}</p>
          </section>
        )}

        {sideEffects.length > 0 && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Side Effects</h2>
            <p className='mt-3 text-sand/90'>{joinList(sideEffects)}</p>
          </section>
        )}

        {showSafety && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Safety Notes</h2>
            <p className='mt-3 text-sand/90'>{safety}</p>
          </section>
        )}

        {(showToxicity || showToxicityLD50) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Toxicity &amp; LD50</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {showToxicity && (
                <p>
                  <strong>Toxicity:</strong> {toxicity}
                </p>
              )}
              {showToxicityLD50 && (
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
            <p className='mt-3 text-sand/90'>{joinList(compounds)}</p>
          </section>
        )}

        {(showRegion || regionTags.length > 0) && (
          <section className='mt-8 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Region &amp; Distribution</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {showRegion && (
                <p>
                  <strong>Region:</strong> {region}
                </p>
              )}
              {regionTags.length > 0 && (
                <p>
                  <strong>Region Tags:</strong> {joinList(regionTags)}
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
