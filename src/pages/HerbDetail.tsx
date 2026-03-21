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
import {
  EXPLORE_EFFECTS,
  getDisplayName,
  pickRandomHerb,
  recommendRelatedCompoundsForHerb,
  recommendRelatedHerbs,
} from '@/lib/discovery'
import type { Herb } from '@/types'

type BlogPost = {
  slug: string
  title: string
  date?: string
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
  if (
    (/human|clinical|trial|rct/.test(corpus) && input.sourcesCount >= 3) ||
    /meta-analysis/.test(corpus)
  ) {
    return 'Well-studied'
  }
  if (/human|clinical/.test(corpus)) return 'Limited human data'
  if (/animal|in vitro|cell|preclinical|mechanistic/.test(corpus) || Boolean(input.mechanism)) {
    return 'Preclinical'
  }
  return 'Traditional'
}

export default function HerbDetail() {
  const { slug } = useParams<Param>()
  const herbs = useHerbData()
  const herb = useMemo(() => herbs.find((h: Herb) => h.slug === slug), [herbs, slug])

  if (!herb) {
    return <main className='container py-6'>{herbs.length ? 'Not found.' : 'Loading…'}</main>
  }

  const details = normalizeHerbDetails(herb)
  const scientificName =
    herb.scientific || (herb as any).scientificName || (herb as any).binomial || herb.name
  const normalizedCommon =
    getCommonName(herb) ?? (herb.common ? titleCase(String(herb.common)) : undefined)
  const commonName =
    normalizedCommon &&
    scientificName &&
    normalizedCommon.toLowerCase() === scientificName.toLowerCase()
      ? undefined
      : normalizedCommon
  const displayTitle = commonName ?? scientificName ?? 'Herb'
  const description = details.description || details.effects || 'Herb profile'
  const benefits = cleanLine((herb as any).benefits || herb.benefits || '')
  const safety = cleanLine(herb.safety || pick.safety(herb))
  const therapeutic = cleanLine(herb.therapeutic || pick.therapeutic(herb))
  const toxicity = cleanLine(herb.toxicity || pick.toxicity(herb))
  const mechanism = cleanLine(herb.mechanism || pick.mechanism(herb))
  const pharmacology = cleanLine((herb as any).pharmacology || (herb as any).pharmacokinetics || '')
  const traditionalUse = cleanLine((herb as any).traditionalUse || (herb as any).ethnobotany || '')
  const researchNotes = splitNotes(
    cleanLine((herb as any).researchNotes || (herb as any).evidenceNotes || '')
  )
  const effectBuckets = inferEffectBuckets(
    cleanLine(details.effects),
    normalizeScientificTags(details.tags)
  )
  const primaryEffects = [
    ...effectBuckets.mental,
    ...effectBuckets.physical,
    ...effectBuckets.subtle,
  ].slice(0, 3)

  const normalizedTags = normalizeScientificTags([
    ...details.tags,
    ...(herb.compoundClasses || []),
    ...(herb.pharmCategories || []),
  ])

  const linkedCompounds = details.active_compounds.map(name => {
    const match = compounds.find(
      entry =>
        entry.name?.toLowerCase() === name.toLowerCase() ||
        entry.common?.toLowerCase() === name.toLowerCase()
    )
    return { name, slug: match?.slug }
  })

  const relatedHerbs = recommendRelatedHerbs(herb, herbs, 6)
  const relatedCompounds = recommendRelatedCompoundsForHerb(herb, compounds, 5)
  const fallbackRelatedHerbs = herbs.filter(entry => entry.slug !== herb.slug).slice(0, 4)
  const visibleRelatedHerbs = relatedHerbs.length ? relatedHerbs : fallbackRelatedHerbs
  const visibleRelatedCompounds = relatedCompounds.length ? relatedCompounds : compounds.slice(0, 4)
  const discoveryStrip = [...visibleRelatedHerbs.slice(0, 3), ...fallbackRelatedHerbs.slice(0, 2)]
  const randomHerb = pickRandomHerb(herbs.filter(item => item.slug !== herb.slug))

  const posts = relatedPostsByHerbSlug(herb.slug, 3)
    .map(ref => blogPosts.find(p => p.slug === ref?.slug))
    .filter((p): p is BlogPost => Boolean(p))

  return (
    <>
      <Meta
        title={`${displayTitle} — The Hippie Scientist`}
        description={description}
        path={`/herb/${slug}`}
        pageType='article'
        image={herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png')}
      />
      <main className='container py-6'>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
          <article className='card p-6'>
            <header className='flex flex-col gap-3 border-b border-white/10 pb-5'>
              <h1 className='text-3xl font-semibold text-[color:var(--accent)]'>{displayTitle}</h1>
              {hasVal(scientificName) && (
                <p className='italic text-[color:var(--muted-c)]'>{scientificName}</p>
              )}
              {hasVal(benefits) && <p className='text-sm text-white/75'>{benefits}</p>}
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='ghost'
                  className='px-3 py-1 text-current'
                  onClick={() => toast('Added to favorites ❤️')}
                >
                  ★ Favorite
                </Button>
                {randomHerb?.slug && (
                  <Link to={`/herb/${randomHerb.slug}`} className='btn-secondary px-3 py-1 text-sm'>
                    Discover something new
                  </Link>
                )}
              </div>
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
                  <span className='text-white/80'>{primaryEffects.join(', ') || 'Varies'}</span>
                </p>
                <p>
                  <strong className='text-white'>Intensity:</strong>{' '}
                  <span className='text-white/80'>
                    {herb.intensityLabel || titleCase(herb.intensityLevel || 'unknown')}
                  </span>
                </p>
                <p>
                  <strong className='text-white'>Safety level:</strong>{' '}
                  <span className='text-white/80'>{safety || toxicity || 'Use caution'}</span>
                </p>
              </div>
            </section>

            <section className='mt-6'>
              <h2 className='text-xl font-semibold text-white'>Overview</h2>
              <p className='mt-3 text-sm leading-7 text-white/85'>{description}</p>
              {traditionalUse && (
                <p className='mt-3 text-sm leading-7 text-white/75'>{traditionalUse}</p>
              )}
              {normalizedTags.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {normalizedTags.map(tag => (
                    <Link
                      key={tag}
                      to={`/herbs?tag=${encodeURIComponent(tag)}`}
                      className='rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 hover:border-white/35'
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className='mt-8'>
              <h2 className='text-xl font-semibold text-white'>Explore by Effect</h2>
              <div className='mt-3 flex flex-wrap gap-2'>
                {EXPLORE_EFFECTS.map(effect => (
                  <Link
                    key={effect}
                    to={`/herbs?effect=${encodeURIComponent(effect)}`}
                    className='rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100'
                  >
                    {effect}
                  </Link>
                ))}
              </div>
            </section>

            {(mechanism || pharmacology) && (
              <section className='mt-8'>
                <h2 className='text-xl font-semibold text-white'>Mechanism of Action</h2>
                {mechanism && <p className='mt-3 text-sm leading-7 text-white/85'>{mechanism}</p>}
                {pharmacology && (
                  <p className='mt-2 text-sm leading-7 text-white/70'>{pharmacology}</p>
                )}
              </section>
            )}

            <section className='mt-8'>
              <h2 className='text-xl font-semibold text-white'>Research Notes</h2>
              <p className='mt-3 text-sm text-white/80'>
                <strong>Evidence Level:</strong>{' '}
                {inferEvidenceLevel({
                  sourcesCount: details.sources.length,
                  mechanism,
                  notes: researchNotes,
                  traditionalUse,
                })}
              </p>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/80'>
                {(researchNotes.length
                  ? researchNotes
                  : [
                      'Evidence quality varies from traditional reports to limited preclinical and human data.',
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
                  )}
                  {therapeutic && (
                    <p className='mt-3 text-sm leading-7 text-white/75'>
                      <strong>Traditional/clinical uses:</strong> {therapeutic}
                    </p>
                  )}
                </details>
              )}
            </section>
          </article>

          <section className='card p-5'>
            <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>Explore Next</h2>
            <div className='mt-4 grid gap-5 sm:grid-cols-3'>
              <div>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Related Herbs
                </h3>
                <ul className='mt-2 space-y-2 text-sm text-white/80'>
                  {visibleRelatedHerbs.slice(0, 6).map(item => (
                    <li key={item.slug}>
                      <Link to={`/herb/${item.slug}`} className='link text-[color:var(--accent)]'>
                        {getDisplayName(item)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Related Compounds
                </h3>
                <ul className='mt-2 space-y-2 text-sm text-white/80'>
                  {visibleRelatedCompounds.map(item => (
                    <li key={item.slug}>
                      <Link
                        to={`/compounds/${item.slug}`}
                        className='link text-[color:var(--accent)]'
                      >
                        {item.common || item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                  Related Articles
                </h3>
                <ul className='mt-2 space-y-2 text-sm text-white/80'>
                  {posts.length ? (
                    posts.map(p => (
                      <li key={p.slug}>
                        <Link to={`/blog/${p.slug}/`} className='link text-[color:var(--accent)]'>
                          {p.title}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className='text-white/65'>Browse the blog for adjacent topics.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {discoveryStrip.length > 0 && (
            <section className='card p-5'>
              <h2 className='text-lg font-semibold text-white'>You might also explore</h2>
              <div className='no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto pb-1'>
                {discoveryStrip.slice(0, 5).map(item => (
                  <Link
                    key={`strip-${item.slug}`}
                    to={`/herb/${item.slug}`}
                    className='min-w-[200px] snap-start rounded-xl border border-white/10 bg-white/5 p-4'
                  >
                    <p className='text-xs uppercase tracking-wide text-white/55'>Herb</p>
                    <p className='mt-1 font-semibold text-white'>{getDisplayName(item)}</p>
                    <p className='mt-1 line-clamp-2 text-sm text-white/70'>
                      {item.effectsSummary ||
                        item.effects ||
                        item.description ||
                        'Explore this profile'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

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
