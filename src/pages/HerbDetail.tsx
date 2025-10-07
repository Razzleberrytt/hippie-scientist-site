import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { herbs } from '../data/herbs/herbsfull'
import { herbName } from '../utils/herb'
import { has, bullets, urlish } from '../lib/format'
import { getList, getText } from '../lib/fields'
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
  const compounds = bullets(getList(herb, 'compounds', ALIASES.compounds))
  const preparations = bullets(getList(herb, 'preparations', ALIASES.preparations))
  const interactions = bullets(getList(herb, 'interactions', ALIASES.interactions))
  const contraindications = bullets(getList(herb, 'contraindications', ALIASES.contraindications))
  const sideEffects = bullets(getList(herb, 'sideeffects', ALIASES.sideeffects))
  const sources = bullets(getList(herb, 'sources', ALIASES.sources))

  const descriptionText = getText(herb, 'description', ALIASES.description)
  const categoryText = getText(herb, 'category', ALIASES.category)
  const subcategoryText = getText(herb, 'subcategory', ALIASES.subcategory)
  const intensityText = getText(herb, 'intensity', ALIASES.intensity)
  const regionText = getText(herb, 'region', ALIASES.region)
  const effectsText = getText(herb, 'effects', ALIASES.effects)
  const mechanismText = getText(herb, 'mechanism', ALIASES.mechanism)
  const therapeuticText = getText(herb, 'therapeutic', ALIASES.therapeutic)
  const dosageText = getText(herb, 'dosage', ALIASES.dosage)
  const safetyText = getText(herb, 'safety', ALIASES.safety)
  const toxicityText = getText(herb, 'toxicity', ALIASES.toxicity)
  const toxicityLD50 = getText(herb, 'toxicity_ld50', ALIASES.toxicity_ld50)
  const legalStatusText = getText(herb, 'legalstatus', ALIASES.legalstatus)
  const scheduleText = getText(herb, 'schedule', ALIASES.schedule)
  const legalNotesText = getText(herb, 'legalnotes', ALIASES.legalnotes)

  const legalStatusClean = /^legal$/i.test(legalStatusText) ? '' : legalStatusText

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
    has(toxicityText) ||
    has(toxicityLD50) ||
    has(legalStatusClean) ||
    has(scheduleText) ||
    has(legalNotesText) ||
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
              {has(legalStatusClean) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Legal Status</dt>
                  <dd>{legalStatusClean}</dd>
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
              {has(toxicityText) && (
                <div>
                  <dt className='font-semibold uppercase tracking-wide text-xs text-sand/60'>Toxicity</dt>
                  <dd>{toxicityText}</dd>
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
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Mechanism of Action</h2>
            <p className='mt-3 text-sand/90'>{mechanismText}</p>
          </section>
        )}

        {preparations.length > 0 && (
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Common Preparations</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {preparations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {has(dosageText) && (
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Dosage / Administration</h2>
            <p className='mt-3 text-sand/90'>{dosageText}</p>
          </section>
        )}

        {has(therapeuticText) && (
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Therapeutic / Traditional Uses</h2>
            <p className='mt-3 text-sand/90'>{therapeuticText}</p>
          </section>
        )}

        {sideEffects.length > 0 && (
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Side Effects</h2>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sand/90'>
              {sideEffects.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {has(safetyText) && (
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Safety Notes</h2>
            <p className='mt-3 text-sand/90'>{safetyText}</p>
          </section>
        )}

        {has(toxicityText) && (
          <section className='mt-6 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Toxicity</h2>
            <p className='mt-3 text-sand/90'>{toxicityText}</p>
          </section>
        )}

        {(has(legalStatusClean) || has(scheduleText) || has(legalNotesText)) && (
          <section className='mt-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur'>
            <h2 className='text-2xl font-semibold text-lime-300'>Legal Notes</h2>
            <div className='mt-3 space-y-2 text-sand/90'>
              {has(legalStatusClean) && <p><strong>Legal Status:</strong> {legalStatusClean}</p>}
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
