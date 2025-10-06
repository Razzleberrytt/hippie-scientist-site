import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { herbs } from '../data/herbs/herbsfull'
import { herbName, splitField } from '../utils/herb'
import { has, bullets, urlish } from '../lib/format'

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
  const compounds = bullets(splitField(herb.compounds))
  const preparations = bullets(splitField(herb.preparations))
  const interactions = bullets(splitField(herb.interactions))
  const contraindications = bullets(splitField(herb.contraindications))
  const sideEffects = bullets(splitField(herb.sideeffects))
  const sources = bullets(splitField(herb.sources))

  const descriptionText = herb.description?.trim() || ''
  const categoryText = herb.category?.trim() || ''
  const subcategoryText = herb.subcategory?.trim() || ''
  const intensityText = herb.intensity?.trim() || ''
  const regionText = herb.region?.trim() || ''
  const effectsText = herb.effects?.trim() || ''
  const mechanismText = herb.mechanism?.trim() || ''
  const therapeuticText = herb.therapeutic?.trim() || ''
  const dosageText = herb.dosage?.trim() || ''
  const safetyText = herb.safety?.trim() || ''
  const legalStatusText = herb.legalstatus?.trim() || ''
  const scheduleText = herb.schedule?.trim() || ''
  const legalNotesText = herb.legalnotes?.trim() || ''
  const toxicityLD50 = herb.toxicity_ld50?.trim() || ''

  const hasExtraSections =
    has(effectsText) ||
    has(mechanismText) ||
    has(compounds) ||
    has(preparations) ||
    has(dosageText) ||
    has(therapeuticText) ||
    has(interactions) ||
    has(contraindications) ||
    has(sideEffects) ||
    has(safetyText) ||
    has(legalStatusText) ||
    has(scheduleText) ||
    has(sources)

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
            {has(descriptionText) && <p className='mt-4 text-sand/90'>{descriptionText}</p>}
            <dl className='mt-4 grid gap-3 text-sm text-sand/80 sm:grid-cols-2'>
              {has(categoryText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Category</dt>
                  <dd>{herb.category_label ? herb.category_label : herb.category}</dd>
                </div>
              )}
              {has(subcategoryText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Subcategory</dt>
                  <dd>{herb.subcategory}</dd>
                </div>
              )}
              {has(intensityText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Intensity</dt>
                  <dd>{herb.intensity_label ? herb.intensity_label : herb.intensity}</dd>
                </div>
              )}
              {has(legalStatusText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Legal Status</dt>
                  <dd>{legalStatusText}</dd>
                </div>
              )}
              {has(scheduleText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Schedule</dt>
                  <dd>{scheduleText}</dd>
                </div>
              )}
              {has(regionText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Region</dt>
                  <dd>{herb.region}</dd>
                </div>
              )}
              {has(dosageText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Dosage</dt>
                  <dd>{dosageText}</dd>
                </div>
              )}
              {has(toxicityLD50) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>LD50</dt>
                  <dd>{toxicityLD50}</dd>
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

        {has(effectsText) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Effects</h2>
            <p className='mt-3 text-sand/90'>{effectsText}</p>
          </section>
        )}
        {has(compounds) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Key Compounds</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {compounds.map(compound => (
                <li key={compound}>{compound}</li>
              ))}
            </ul>
          </section>
        )}

        {has(interactions) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Interactions</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {interactions.map(item => (
                <li key={`interaction-${item}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {has(contraindications) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Contraindications</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {contraindications.map(item => (
                <li key={`contra-${item}`}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {has(mechanismText) && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Mechanism of Action</h2>
            <p className='text-sm'>{mechanismText}</p>
          </section>
        )}

        {preparations.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Common Preparations</h2>
            <ul className='list-disc pl-5 text-sm'>
              {preparations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {has(dosageText) && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Dosage / Administration</h2>
            <p className='text-sm'>{dosageText}</p>
          </section>
        )}

        {has(therapeuticText) && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Therapeutic / Traditional Uses</h2>
            <p className='text-sm'>{therapeuticText}</p>
          </section>
        )}

        {sideEffects.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Side Effects</h2>
            <ul className='list-disc pl-5 text-sm'>
              {sideEffects.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {has(safetyText) && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Safety Notes</h2>
            <p className='text-sm'>{safetyText}</p>
          </section>
        )}

        {(has(legalStatusText) || has(scheduleText) || has(legalNotesText)) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Legal Notes</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {has(legalStatusText) && <p><strong>Legal Status:</strong> {legalStatusText}</p>}
              {has(scheduleText) && <p><strong>Schedule:</strong> {scheduleText}</p>}
              {has(legalNotesText) && <p><strong>Notes:</strong> {legalNotesText}</p>}
            </div>
          </section>
        )}

        {has(sources) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Sources &amp; References</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {sources.map(src => (
                <li key={src}>
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

        {!hasExtraSections && (
          <p className='mt-10 text-sm opacity-70'>No additional information available for this section yet.</p>
        )}

        <p className='mt-12 text-sm text-sand/60'>{DISCLAIMER_TEXT}</p>
      </main>
    </>
  )
}
