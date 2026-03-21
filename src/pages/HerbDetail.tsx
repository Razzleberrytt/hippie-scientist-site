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
    mental: mental.length ? mental : ['Mental effects vary by dose and context.'],
    physical: physical.length
      ? physical
      : ['Physical effects are context-dependent and may vary by preparation.'],
    subtle: subtle.length
      ? subtle
      : ['Subjective effects are traditionally described and may vary between people.'],
  }
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
              <div className='mt-3 grid gap-3 text-sm sm:grid-cols-2'>
                <p>
                  <strong className='text-white'>Type:</strong>{' '}
                  <span className='text-white/80'>{details.categories[0] || 'Botanical'}</span>
                </p>
                <p>
                  <strong className='text-white'>Primary effects:</strong>{' '}
                  <span className='text-white/80'>
                    {normalizedTags.slice(0, 3).join(', ') || 'Varies'}
                  </span>
                </p>
                <p>
                  <strong className='text-white'>Intensity:</strong>{' '}
                  <span className='text-white/80'>{intensityLabel}</span>
                </p>
                <p>
                  <strong className='text-white'>Safety level:</strong>{' '}
                  <span className='text-white/80'>
                    {safety || toxicity || 'Use caution; evidence varies by preparation and dose.'}
                  </span>
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

              <section>
                <h2 className='text-xl font-semibold text-white'>Traditional Use</h2>
                <p className='mt-3 text-sm leading-7 text-white/80'>
                  {traditionalUse ||
                    'Traditionally used in regional systems of herbal practice; details vary by preparation and lineage.'}
                </p>
              </section>

              <section>
                <h2 className='text-xl font-semibold text-white'>Active Compounds</h2>
                {linkedCompounds.length > 0 ? (
                  <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/80'>
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
                ) : (
                  <p className='mt-3 text-sm text-white/75'>
                    No compound data is currently mapped for this herb.
                  </p>
                )}
              </section>

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
              </section>

              <section>
                <h2 className='text-xl font-semibold text-white'>Mechanism (Simple Science)</h2>
                <p className='mt-3 text-sm leading-7 text-white/85'>
                  {mechanism ||
                    'Mechanism evidence is still evolving. Current findings suggest this herb may support specific pathways without implying guaranteed outcomes.'}
                </p>
                {pharmacology && (
                  <p className='mt-2 text-sm leading-7 text-white/70'>{pharmacology}</p>
                )}
              </section>

              <section>
                <h2 className='text-xl font-semibold text-white'>Safety & Contraindications</h2>
                <div className='mt-3 space-y-2 text-sm leading-7 text-white/80'>
                  <p>
                    {safety ||
                      'Safety profile depends on dose, extract type, and individual context.'}
                  </p>
                  {contraindications && (
                    <p>
                      <strong>Contraindications:</strong> {contraindications}
                    </p>
                  )}
                  {interactions && (
                    <p>
                      <strong>Interactions:</strong> {interactions}
                    </p>
                  )}
                  {sideEffects.length > 0 && (
                    <p>
                      <strong>Reported side effects:</strong> {sideEffects.join(', ')}
                    </p>
                  )}
                  {therapeutic && (
                    <p>
                      <strong>Traditional/clinical uses:</strong> {therapeutic}
                    </p>
                  )}
                  {toxicity && (
                    <p>
                      <strong>Risk level:</strong> {toxicity}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h2 className='text-xl font-semibold text-white'>Research Notes</h2>
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
                  {relatedHerbs.length ? (
                    relatedHerbs.map(item => (
                      <li key={item.slug}>
                        <Link to={`/herb/${item.slug}`} className='link text-[color:var(--accent)]'>
                          {item.common || item.scientific || item.slug}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className='text-white/60'>No mapped herbs yet.</li>
                  )}
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
