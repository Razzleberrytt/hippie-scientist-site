import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Meta from '../components/Meta'
import { normalizeHerbDetails } from '../components/HerbDetails'
import { Button } from '../components/ui/Button'
import postsData from '../data/blog/posts.json'
import { relatedPostsByHerbSlug } from '../lib/relevance'
import { cleanLine, hasVal, titleCase } from '../lib/pretty'
import { pick } from '../lib/present'
import { getCommonName } from '../lib/herbName'
import { useHerbData } from '@/lib/herb-data'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import type { Herb } from '@/types'

type BlogPost = {
  slug: string
  title: string
  date?: string
  description?: string
}

const blogPosts = postsData as BlogPost[]
const compounds = decorateCompounds()

type Param = {
  slug?: string
}

function splitNotes(input: string) {
  return input
    .split(/\n|;|\.|•/g)
    .map(part => cleanLine(part))
    .filter(Boolean)
}

function splitList(input: string) {
  return input
    .split(/\n|;|•|,/g)
    .map(part => cleanLine(part))
    .filter(Boolean)
}

function inferEffectBuckets(input: string, tags: string[]) {
  const parts = input
    .split(/\n|;|\.|•/g)
    .map(part => cleanLine(part))
    .filter(Boolean)

  const mental = parts.filter(item =>
    /mood|focus|calm|stress|anxiety|sleep|cognition|mind/i.test(item)
  )
  const physical = parts.filter(item =>
    /pain|energy|inflammation|digest|body|muscle|immune|stamina/i.test(item)
  )
  const subtle = parts.filter(item =>
    /dream|spiritual|subjective|awareness|sensory|ritual|oneiro/i.test(item)
  )

  if (
    !mental.length &&
    tags.some(tag => /calming|stimulating|serotonergic|dopaminergic|adaptogen/.test(tag))
  ) {
    mental.push(`Associated tags: ${tags.join(', ')}`)
  }

  return {
    mental: mental.length
      ? mental
      : ['Mental effects vary by dose, preparation method, and physiology.'],
    physical: physical.length
      ? physical
      : ['Physical effects vary by dose, preparation method, and physiology.'],
    subtle: subtle.length
      ? subtle
      : ['Subjective effects vary by setting, expectation, and individual response.'],
  }
}

function inferEvidenceLevel(input: {
  sourcesCount: number
  mechanism: string
  notes: string[]
  traditionalUse: string
}) {
  const corpus = `${input.mechanism} ${input.notes.join(' ')} ${input.traditionalUse}`.toLowerCase()
  const hasHumanSignals = /human|clinical|trial|double-blind|randomized|rct|meta-analysis/.test(
    corpus
  )
  const hasPreclinicalSignals = /animal|in vitro|cell|rodent|preclinical|mechanistic/.test(corpus)
  const hasTraditionalSignals = /traditional|ethnobot|folk|historic|ceremonial/.test(corpus)

  if (
    (hasHumanSignals && input.sourcesCount >= 3) ||
    /meta-analysis|systematic review/.test(corpus)
  ) {
    return 'Well-studied'
  }
  if (hasHumanSignals) return 'Limited human data'
  if (hasPreclinicalSignals || Boolean(input.mechanism)) return 'Preclinical'
  if (hasTraditionalSignals || Boolean(input.traditionalUse)) return 'Traditional'
  return 'Traditional'
}

function RelatedPosts({ slug }: { slug?: string }) {
  if (!slug) return null
  const posts = relatedPostsByHerbSlug(slug, 3)
    .map(ref => blogPosts.find(p => p.slug === ref?.slug))
    .filter((p): p is BlogPost => Boolean(p))
  if (!posts.length) return null

  return (
    <section className='card bg-[color-mix(in_oklab,var(--surface-c)_92%,transparent_8%)] p-5 backdrop-blur'>
      <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>Related Articles</h2>
      <ul className='mt-3 space-y-3'>
        {posts.map(p => (
          <li key={p.slug} className='text-sm text-[color:var(--muted-c)]'>
            <Link to={`/blog/${p.slug}/`} className='link text-[color:var(--accent)]'>
              {p.title}
            </Link>
            {p.date && (
              <p className='text-xs text-[color:color-mix(in_oklab,var(--muted-c)_75%,transparent_25%)]'>
                {new Date(p.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function HerbDetail() {
  const { slug } = useParams<Param>()
  const herbs = useHerbData()
  const herb = useMemo(() => herbs.find((h: Herb) => h.slug === slug), [herbs, slug])

  if (!herb) {
    if (!herbs.length) {
      return <main className='container py-6'>Loading…</main>
    }
    return <main className='container py-6'>Not found.</main>
  }

  const details = normalizeHerbDetails(herb)
  const scientificName =
    herb.scientific || (herb as any).scientificName || (herb as any).binomial || herb.name
  const rawCommon = herb.common ? titleCase(String(herb.common)) : undefined
  const normalizedCommon = getCommonName(herb) ?? rawCommon
  const commonName =
    normalizedCommon &&
    scientificName &&
    normalizedCommon.toLowerCase() === scientificName.toLowerCase()
      ? undefined
      : normalizedCommon
  const displayTitle = commonName ?? scientificName ?? 'Herb'
  const description = details.description || details.effects || 'Herb profile'
  const intensityLevel = herb.intensityLevel || null
  const intensityLabel =
    herb.intensityLabel || (intensityLevel ? titleCase(intensityLevel) : 'Unknown')

  const benefits = cleanLine((herb as any).benefits || herb.benefits || '')
  const safety = cleanLine(herb.safety || pick.safety(herb))
  const therapeutic = cleanLine(herb.therapeutic || pick.therapeutic(herb))
  const sideEffects = pick
    .sideeffects(herb)
    .map(effect => cleanLine(effect))
    .filter(Boolean)
  const toxicity = cleanLine(herb.toxicity || pick.toxicity(herb))
  const mechanism = cleanLine(herb.mechanism || pick.mechanism(herb))
  const pharmacology = cleanLine((herb as any).pharmacology || (herb as any).pharmacokinetics || '')

  const traditionalUse = cleanLine((herb as any).traditionalUse || (herb as any).ethnobotany || '')
  const researchNotesRaw = cleanLine(
    (herb as any).researchNotes || (herb as any).evidenceNotes || ''
  )
  const effects = cleanLine(details.effects)
  const activeCompounds = details.active_compounds
  const contraindications = cleanLine(details.contraindications)
  const interactions = cleanLine(details.interactions)
  const normalizedTags = normalizeScientificTags(details.tags)
  const effectBuckets = inferEffectBuckets(effects, normalizedTags)

  const linkedCompounds = activeCompounds.map(name => {
    const match = compounds.find(
      entry =>
        entry.name?.toLowerCase() === name.toLowerCase() ||
        entry.common?.toLowerCase() === name.toLowerCase()
    )
    return {
      name,
      slug: match?.slug,
    }
  })

  const relatedHerbs = herbs
    .filter(
      entry =>
        entry.slug !== herb.slug &&
        entry.tags?.some(tag => normalizedTags.includes((tag || '').toLowerCase()))
    )
    .slice(0, 3)

  const relatedCompounds = compounds
    .filter(
      entry =>
        entry.slug !== herb.slug &&
        entry.tags?.some(tag =>
          normalizedTags.includes(
            tag
              .toLowerCase()
              .replace(/^[^a-z0-9]+/i, '')
              .trim()
          )
        )
    )
    .slice(0, 3)

  const researchNotes = splitNotes(researchNotesRaw)
  const evidenceLevel = inferEvidenceLevel({
    sourcesCount: details.sources.length,
    mechanism,
    notes: researchNotes,
    traditionalUse,
  })
  const primaryEffects = [
    ...effectBuckets.mental,
    ...effectBuckets.physical,
    ...effectBuckets.subtle,
  ].slice(0, 3)
  const contraindicationItems = splitList(contraindications)
  const interactionItems = splitList(interactions)
  const safetyLabel = safety || toxicity || 'Use caution; evidence varies by preparation and dose.'
  const fallbackRelatedHerbs = herbs.filter(entry => entry.slug !== herb.slug).slice(0, 3)
  const visibleRelatedHerbs = relatedHerbs.length ? relatedHerbs : fallbackRelatedHerbs

  return (
    <>
      <Meta
        title={`${displayTitle} — The Hippie Scientist`}
        description={description}
        path={`/herb/${slug}`}
        pageType='article'
        image={herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png')}
        og={{
          image: herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png'),
        }}
      />
      <main className='container py-6'>
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
          <article className='card bg-[color-mix(in_oklab,var(--surface-c)_94%,transparent_6%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,.25)] backdrop-blur'>
            <header className='flex flex-col gap-3 border-b border-b-[color:var(--border-c)] pb-5'>
              <h1 className='text-3xl font-semibold text-[color:var(--accent)]'>{displayTitle}</h1>
              {hasVal(scientificName) && (
                <p className='italic leading-relaxed text-[color:var(--muted-c)]'>
                  {scientificName}
                </p>
              )}
              {hasVal(benefits) && (
                <p className='text-sm leading-relaxed text-white/75'>{benefits}</p>
              )}
            </header>

            <section className='mt-6 rounded-2xl border border-white/10 bg-black/20 p-4'>
              <h2 className='text-sm font-semibold uppercase tracking-[0.14em] text-white/70'>
                Quick Facts
              </h2>
              <div className='mt-3 grid grid-cols-2 gap-3 text-sm lg:grid-cols-3'>
                <p>
                  <strong className='text-white'>Class:</strong>{' '}
                  <span className='text-white/80'>{details.categories[0] || 'Botanical'}</span>
                </p>
                {mechanism && (
                  <p>
                    <strong className='text-white'>Mechanism:</strong>{' '}
                    <span className='text-white/80'>{mechanism}</span>
                  </p>
                )}
                <p>
                  <strong className='text-white'>Primary effects:</strong>{' '}
                  <span className='text-white/80'>
                    {primaryEffects.join(', ') || normalizedTags.slice(0, 3).join(', ') || 'Varies'}
                  </span>
                </p>
                <p>
                  <strong className='text-white'>Intensity:</strong>{' '}
                  <span className='text-white/80'>{intensityLabel}</span>
                </p>
                <p>
                  <strong className='text-white'>Safety level:</strong>{' '}
                  <span className='text-white/80'>{safetyLabel}</span>
                </p>
              </div>
            </section>

            <div className='mt-6 flex flex-wrap gap-2 text-sm text-[color:var(--muted-c)]'>
              <Button
                variant='ghost'
                data-fav={herb.slug}
                className='px-3 py-1 text-current'
                onClick={() => toast('Added to favorites ❤️')}
              >
                ★ Favorite
              </Button>
              <Button
                variant='ghost'
                data-compare={herb.slug}
                className='px-3 py-1 text-current'
                onClick={() => toast('Added to compare list 🔄')}
              >
                ⇄ Compare
              </Button>
            </div>

            <div className='mt-8 space-y-8 text-[color:var(--text-c)]'>
              <section>
                <h2 className='text-xl font-semibold text-white'>Overview</h2>
                <p className='mt-3 text-sm leading-7 text-white/85'>{description}</p>
                {traditionalUse && (
                  <p className='mt-3 text-sm leading-7 text-white/75'>{traditionalUse}</p>
                )}
                {normalizedTags.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {normalizedTags.map(tag => (
                      <span
                        key={tag}
                        className='rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {(mechanism || pharmacology) && (
                <section>
                  <h2 className='text-xl font-semibold text-white'>Mechanism of Action</h2>
                  {mechanism && <p className='mt-3 text-sm leading-7 text-white/85'>{mechanism}</p>}
                  {pharmacology && (
                    <p className='mt-2 text-sm leading-7 text-white/70'>{pharmacology}</p>
                  )}
                </section>
              )}

              <section>
                <h2 className='text-xl font-semibold text-white'>Effects</h2>
                <div className='mt-3 grid gap-4 sm:grid-cols-3'>
                  <div>
                    <h3 className='text-sm font-semibold text-white/90'>Mental</h3>
                    <ul className='mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-white/75'>
                      {effectBuckets.mental.map(item => (
                        <li key={`mental-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-white/90'>Physical</h3>
                    <ul className='mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-white/75'>
                      {effectBuckets.physical.map(item => (
                        <li key={`physical-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-white/90'>Subtle / Subjective</h3>
                    <ul className='mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-white/75'>
                      {effectBuckets.subtle.map(item => (
                        <li key={`subtle-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className='mt-4 rounded-xl border border-white/10 bg-white/5 p-4'>
                  <h3 className='text-sm font-semibold text-white/90'>Context & Variability</h3>
                  <p className='mt-2 text-sm leading-7 text-white/80'>
                    Effects vary by dose, preparation method, and individual physiology.
                  </p>
                </div>
              </section>

              <section>
                <h2 className='text-xl font-semibold text-white'>Safety & Contraindications</h2>
                <div className='mt-3 space-y-2 text-sm leading-7 text-white/80'>
                  <p>
                    <strong>Safety summary:</strong> {safetyLabel}
                  </p>
                  {contraindicationItems.length > 0 && (
                    <div>
                      <p>
                        <strong>Contraindications:</strong>
                      </p>
                      <ul className='mt-1 list-disc space-y-1 pl-5'>
                        {contraindicationItems.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {interactionItems.length > 0 && (
                    <p>
                      <strong>Interactions:</strong> {interactionItems.join(', ')}
                    </p>
                  )}
                  {sideEffects.length > 0 && (
                    <p>
                      <strong>Reported side effects:</strong> {sideEffects.join(', ')}
                    </p>
                  )}
                  <p>
                    <strong>Risk level:</strong> {toxicity || safetyLabel}
                  </p>
                </div>
              </section>

              <section>
                <h2 className='text-xl font-semibold text-white'>Research Notes</h2>
                <p className='mt-3 text-sm text-white/80'>
                  <strong>Evidence Level:</strong>{' '}
                  <span className='rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs'>
                    {evidenceLevel}
                  </span>
                </p>
                <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/80'>
                  {(researchNotes.length
                    ? researchNotes
                    : [
                        'Evidence quality varies from traditional reports to preclinical and limited human data.',
                        'Findings are associated with dosage, extraction method, and individual variability.',
                      ]
                  ).map(note => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                {(linkedCompounds.length > 0 || therapeutic) && (
                  <details className='mt-4 rounded-xl border border-white/10 bg-white/5 p-4'>
                    <summary className='cursor-pointer text-sm font-semibold text-white/90'>
                      Read more / Deep dive
                    </summary>
                    {linkedCompounds.length > 0 && (
                      <>
                        <h3 className='mt-3 text-sm font-semibold text-white/90'>
                          Mapped compounds
                        </h3>
                        <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/80'>
                          {linkedCompounds.map(entry => (
                            <li key={entry.name}>
                              {entry.slug ? (
                                <Link
                                  className='link text-[color:var(--accent)]'
                                  to={`/compounds/${entry.slug}`}
                                >
                                  {entry.name}
                                </Link>
                              ) : (
                                entry.name
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {therapeutic && (
                      <p className='mt-3 text-sm leading-7 text-white/75'>
                        <strong>Traditional/clinical uses:</strong> {therapeutic}
                      </p>
                    )}
                  </details>
                )}
              </section>
            </div>
          </article>

          <section className='card bg-[color-mix(in_oklab,var(--surface-c)_92%,transparent_8%)] p-5 shadow-sm backdrop-blur-sm'>
            <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>Explore Next</h2>
            <div className='mt-4 grid gap-5 sm:grid-cols-3'>
              <div>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Related Herbs
                </h3>
                <ul className='mt-2 space-y-2 text-sm text-white/80'>
                  {visibleRelatedHerbs.length
                    ? visibleRelatedHerbs.map(item => (
                        <li key={item.slug}>
                          <Link
                            to={`/herb/${item.slug}`}
                            className='link text-[color:var(--accent)]'
                          >
                            {item.common || item.scientific || item.slug}
                          </Link>
                        </li>
                      ))
                    : null}
                </ul>
              </div>
              <div>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Related Compounds
                </h3>
                <ul className='mt-2 space-y-2 text-sm text-white/80'>
                  {relatedCompounds.length ? (
                    relatedCompounds.map(item => (
                      <li key={item.slug}>
                        <Link
                          to={`/compounds/${item.slug}`}
                          className='link text-[color:var(--accent)]'
                        >
                          {item.common || item.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className='text-white/60'>No mapped compounds yet.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Related Articles
                </h3>
                <RelatedPosts slug={herb.slug} />
              </div>
            </div>
          </section>

          <div className='text-sm text-[color:var(--muted-c)]'>
            <Link to='/herbs' className='link text-[color:var(--accent)]'>
              ← Back to Database
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
