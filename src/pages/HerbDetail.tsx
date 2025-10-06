import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { herbs } from '../data/herbs/herbsfull'
import { herbName, splitField } from '../utils/herb'

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
  const compounds = Array.isArray(herb.compounds) ? herb.compounds : splitField(herb.compounds)
  const interactions = Array.isArray(herb.interactions)
    ? herb.interactions
    : splitField(herb.interactions)
  const contraindications = Array.isArray(herb.contraindications)
    ? herb.contraindications
    : splitField(herb.contraindications)
  const sources = Array.isArray(herb.sources) ? herb.sources : splitField(herb.sources)

  const hasSafety = Boolean(herb.safety || herb.sideeffects || herb.therapeutic)
  const hasMechanism = Boolean((herb.mechanism || herb.mechanismofaction || '').trim())

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
            {herb.scientific && (
              <p className='mt-1 text-lg italic text-sand/80'>{herb.scientific}</p>
            )}
            {herb.description && <p className='mt-4 text-sand/90'>{herb.description}</p>}
            <dl className='mt-4 grid gap-3 text-sm text-sand/80 sm:grid-cols-2'>
              {herb.category && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Category</dt>
                  <dd>{herb.category_label ? herb.category_label : herb.category}</dd>
                </div>
              )}
              {herb.intensity && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Intensity</dt>
                  <dd>{herb.intensity_label ? herb.intensity_label : herb.intensity}</dd>
                </div>
              )}
              {herb.legalstatus && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Legal Status</dt>
                  <dd>{herb.legalstatus}</dd>
                </div>
              )}
              {herb.region && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Region</dt>
                  <dd>{herb.region}</dd>
                </div>
              )}
              {herb.dosage && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Dosage</dt>
                  <dd>{herb.dosage}</dd>
                </div>
              )}
              {herb.toxicity_ld50 && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>LD50</dt>
                  <dd>{herb.toxicity_ld50}</dd>
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

        {hasMechanism && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Mechanism</h2>
            <p className='mt-3 text-sand/90'>{herb.mechanism || herb.mechanismofaction}</p>
          </section>
        )}

        {compounds.length > 0 && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Key Compounds</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {compounds.map(compound => (
                <li key={compound}>{compound}</li>
              ))}
            </ul>
          </section>
        )}

        {(interactions.length > 0 || contraindications.length > 0) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Interactions &amp; Contraindications</h2>
            {interactions.length > 0 && (
              <div className='mt-3'>
                <h3 className='text-lg font-semibold text-sand'>Interactions</h3>
                <ul className='mt-2 list-disc space-y-2 pl-6 text-sand/90'>
                  {interactions.map(item => (
                    <li key={`interaction-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {contraindications.length > 0 && (
              <div className='mt-4'>
                <h3 className='text-lg font-semibold text-sand'>Contraindications</h3>
                <ul className='mt-2 list-disc space-y-2 pl-6 text-sand/90'>
                  {contraindications.map(item => (
                    <li key={`contra-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {hasSafety && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Therapeutic &amp; Safety Notes</h2>
            <div className='mt-3 space-y-3 text-sand/90'>
              {herb.therapeutic && (
                <p>
                  <strong className='text-sand'>Therapeutic Use:</strong> {herb.therapeutic}
                </p>
              )}
              {herb.safety && (
                <p>
                  <strong className='text-sand'>Safety:</strong> {herb.safety}
                </p>
              )}
              {herb.sideeffects && (
                <p>
                  <strong className='text-sand'>Side Effects:</strong> {herb.sideeffects}
                </p>
              )}
            </div>
          </section>
        )}

        {sources.length > 0 && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Sources &amp; References</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {sources.map(src => (
                <li key={src}>
                  {/^https?:\/\//i.test(src) ? (
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

        <p className='mt-12 text-sm text-sand/60'>{DISCLAIMER_TEXT}</p>
      </main>
    </>
  )
}
