import { useMemo, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '../components/Meta'
import { normalizeHerbDetails } from '../components/HerbDetails'
import { cleanLine, titleCase } from '../lib/pretty'
import { getCommonName } from '../lib/herbName'
import { useHerbData } from '@/lib/herb-data'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import { canonicalSlug } from '@/lib/slug'
import {
  getDisplayName,
  recommendRelatedCompoundsForHerb,
  recommendRelatedHerbs,
} from '@/lib/discovery'
import { trackEvent, useSavedItems } from '@/lib/growth'
import posts from '../../public/blogdata/index.json'
import type { Herb } from '@/types'

type Param = {
  slug?: string
}

const compounds = decorateCompounds()

function splitList(input: string) {
  return input
    .split(/\n|;|\.|•|,/g)
    .map(part => cleanLine(part))
    .filter(Boolean)
}

export default function HerbDetail() {
  const { slug = '' } = useParams<Param>()
  const herbs = useHerbData()
  const { toggle, isSaved } = useSavedItems()

  const herb = useMemo(() => {
    const normalized = canonicalSlug(slug)
    return herbs.find(h => canonicalSlug(h.slug, h.common, h.scientific, h.name) === normalized)
  }, [herbs, slug])

  if (!herbs.length) {
    return <main className='container py-6 text-white/75'>Loading herb profile…</main>
  }

  if (!herb) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <section className='card p-6'>
          <p className='text-xs uppercase tracking-[0.14em] text-white/60'>Not Found</p>
          <h1 className='mt-2 text-2xl font-semibold'>Herb profile not found</h1>
          <p className='mt-3 text-white/75'>
            We could not find that herb. Check the URL slug or return to the database.
          </p>
          <Link to='/herbs' className='btn-primary mt-5 inline-flex'>
            ← Back to database
          </Link>
        </section>
      </main>
    )
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

  const overview = cleanLine(details.description || details.effects || 'Herb profile')
  const traditionalUse = cleanLine((herb as any).traditionalUse || (herb as any).ethnobotany || '')
  const mechanism = cleanLine(herb.mechanism || (herb as any).mechanismOfAction || '')
  const pharmacology = cleanLine((herb as any).pharmacology || (herb as any).pharmacokinetics || '')
  const contraindications = splitList(
    cleanLine((herb.contraindications as string) || (herb as any).contraindicationsText || '')
  )
  const sideEffects = splitList(
    cleanLine((herb.sideEffects as string) || (herb.sideeffects as string) || '')
  )
  const riskLevel = cleanLine(herb.safety || herb.toxicity || 'Use caution')
  const researchNotes = splitList(
    cleanLine((herb as any).researchNotes || (herb as any).evidenceNotes || '')
  )

  const normalizedTags = normalizeScientificTags([
    ...details.tags,
    ...(herb.compoundClasses || []),
    ...(herb.pharmCategories || []),
  ])

  const linkedCompounds = details.active_compounds
    .map(name => {
      const match = compounds.find(
        entry =>
          entry.name?.toLowerCase() === name.toLowerCase() ||
          entry.common?.toLowerCase() === name.toLowerCase()
      )
      return { name, slug: match?.slug }
    })
    .slice(0, 6)

  const effectPoints = splitList(cleanLine(details.effects))
  const mental = effectPoints.filter(item => /mood|focus|calm|sleep|cognition|anxiety/i.test(item))
  const physical = effectPoints.filter(item =>
    /pain|energy|body|muscle|immune|digest|stamina|inflammation/i.test(item)
  )
  const subjective = effectPoints.filter(item =>
    /dream|ritual|subjective|sensory|awareness|perception/i.test(item)
  )

  const relatedHerbs = recommendRelatedHerbs(herb, herbs, 5)
  const relatedCompounds = recommendRelatedCompoundsForHerb(herb, compounds, 5)
  const articleMentions = (Array.isArray(posts) ? posts : [])
    .filter((post: any) => {
      const hay =
        `${post.title || ''} ${post.description || ''} ${(post.tags || []).join(' ')}`.toLowerCase()
      return (
        hay.includes((displayTitle || '').toLowerCase()) ||
        details.tags.some(tag => hay.includes(String(tag).toLowerCase()))
      )
    })
    .slice(0, 4)
  const curatedExplore = [...relatedHerbs.slice(0, 2), ...relatedCompounds.slice(0, 3)].slice(0, 5)
  const saved = isSaved('herb', herb.slug)

  return (
    <>
      <Meta
        title={`${displayTitle} — The Hippie Scientist`}
        description={overview}
        path={`/herbs/${canonicalSlug(herb.slug, displayTitle)}`}
        pageType='article'
        image={herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png')}
      />
      <main className='container py-6'>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
          <div>
            <Link to='/herbs' className='btn-secondary inline-flex items-center rounded-full px-4'>
              ← Back to database
            </Link>
          </div>
          <article className='card p-6'>
            <header className='border-b border-white/10 pb-5'>
              <h1 className='text-3xl font-semibold text-[color:var(--accent)]'>{displayTitle}</h1>
              {scientificName && (
                <p className='mt-1 italic text-[color:var(--muted-c)]'>{scientificName}</p>
              )}
              <button
                className='mt-3 rounded-full border border-white/20 px-3 py-1 text-sm text-white/85'
                onClick={() =>
                  toggle({
                    type: 'herb',
                    slug: herb.slug,
                    title: displayTitle,
                    href: `/herbs/${herb.slug}`,
                    note: overview,
                  })
                }
              >
                {saved ? '★ Favorited' : '☆ Favorite'}
              </button>
            </header>

            <section className='mt-6 rounded-2xl border border-white/10 bg-black/20 p-4'>
              <h2 className='text-sm font-semibold uppercase tracking-[0.14em] text-white/70'>
                Quick Facts
              </h2>
              <dl className='mt-3 grid gap-3 text-sm sm:grid-cols-2'>
                <Fact label='Class' value={details.categories[0] || 'Botanical'} />
                <Fact
                  label='Intensity'
                  value={herb.intensityLabel || titleCase(herb.intensityLevel || 'Unknown')}
                />
                <Fact label='Mechanism' value={mechanism || 'Not well characterized'} />
                <Fact label='Risk level' value={riskLevel} />
              </dl>
              <p className='mt-3 text-xs text-white/60'>
                Evidence varies by preparation and dose. Educational reference only, not medical
                advice.
              </p>
            </section>

            <Section title='Overview'>
              <p className='mt-3 text-sm leading-7 text-white/85'>{overview}</p>
              <p className='mt-3 text-xs text-white/70'>
                Cross-reference: review{' '}
                <Link to='/compounds' className='text-[color:var(--accent)] underline'>
                  compounds by mechanism
                </Link>{' '}
                and{' '}
                <Link to='/blog' className='text-[color:var(--accent)] underline'>
                  related research notes
                </Link>
                .
              </p>
            </Section>

            {!!traditionalUse && (
              <Section title='Traditional Use'>
                <p className='mt-3 text-sm leading-7 text-white/80'>{traditionalUse}</p>
              </Section>
            )}

            {linkedCompounds.length > 0 && (
              <Section title='Active Compounds'>
                <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-white/80'>
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
              </Section>
            )}

            <Section title='Effects'>
              <div className='mt-3 grid gap-4 sm:grid-cols-3'>
                <EffectList
                  title='Mental'
                  items={mental}
                  fallback='Reported mental effects are context-dependent; review evidence notes before interpreting.'
                />
                <EffectList
                  title='Physical'
                  items={physical}
                  fallback='Physical response profiles differ by extract chemistry and dose range.'
                />
                <EffectList
                  title='Subjective / Experiential'
                  items={subjective}
                  fallback='Subjective reports are heterogeneous and should not be treated as universal outcomes.'
                />
              </div>
              {relatedCompounds[0] && (
                <p className='mt-3 text-xs text-white/70'>
                  This profile overlaps with{' '}
                  <Link
                    to={`/compounds/${relatedCompounds[0].slug}`}
                    className='text-[color:var(--accent)] underline'
                  >
                    {relatedCompounds[0].common || relatedCompounds[0].name}
                  </Link>{' '}
                  and is discussed in{' '}
                  <Link to='/blog' className='text-[color:var(--accent)] underline'>
                    ongoing notes
                  </Link>
                  .
                </p>
              )}
            </Section>

            {(mechanism || pharmacology) && (
              <Section title='Mechanism / Science'>
                {mechanism && <p className='mt-3 text-sm leading-7 text-white/85'>{mechanism}</p>}
                {pharmacology && (
                  <p className='mt-2 text-sm leading-7 text-white/75'>{pharmacology}</p>
                )}
                {!!normalizedTags.length && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {normalizedTags.slice(0, 6).map(tag => (
                      <Link
                        key={tag}
                        to={`/herbs?tag=${encodeURIComponent(tag)}`}
                        className='ds-pill text-white/85'
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </Section>
            )}

            <Section title='Safety & Contraindications'>
              <dl className='text-white/82 mt-3 space-y-3 text-sm'>
                <div>
                  <dt className='font-semibold text-white'>Contraindications</dt>
                  <dd className='mt-1'>
                    {contraindications.length ? (
                      <ul className='list-disc space-y-1 pl-5'>
                        {contraindications.slice(0, 6).map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      'No clear contraindications were found in current notes; treat this as an evidence gap, not a safety guarantee.'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold text-white'>Reported side effects</dt>
                  <dd className='mt-1'>
                    {sideEffects.length ? (
                      <ul className='list-disc space-y-1 pl-5'>
                        {sideEffects.slice(0, 6).map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      'Side effects are insufficiently documented in this profile; start conservatively and monitor response.'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold text-white'>Risk level</dt>
                  <dd className='mt-1'>{riskLevel}</dd>
                </div>
              </dl>
            </Section>

            <Section title='Research Notes'>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/80'>
                {(researchNotes.length
                  ? researchNotes
                  : [
                      'Evidence ranges from traditional use records to preclinical work with limited controlled human data.',
                    ]
                )
                  .slice(0, 5)
                  .map(note => (
                    <li key={note}>{note}</li>
                  ))}
              </ul>
            </Section>
            {articleMentions.length > 0 && (
              <Section title='Mentioned in'>
                <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-white/80'>
                  {articleMentions.map((post: any) => (
                    <li key={post.slug}>
                      <Link
                        to={`/blog/${post.slug}`}
                        className='text-[color:var(--accent)] underline'
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </article>

          {(relatedHerbs.length > 0 || relatedCompounds.length > 0) && (
            <section className='card p-5'>
              <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>Explore Next</h2>
              <div className='mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                {relatedHerbs.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                      Related Herbs
                    </h3>
                    <ul className='mt-2 space-y-2 text-sm text-white/80'>
                      {relatedHerbs.map(item => (
                        <li key={item.slug}>
                          <Link
                            to={`/herbs/${item.slug}`}
                            className='link text-[color:var(--accent)]'
                          >
                            {getDisplayName(item)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {relatedCompounds.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                      Related Compounds
                    </h3>
                    <ul className='mt-2 space-y-2 text-sm text-white/80'>
                      {relatedCompounds.map(item => (
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
                )}
                {articleMentions.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                      Related Articles
                    </h3>
                    <ul className='mt-2 space-y-2 text-sm text-white/80'>
                      {articleMentions.map((post: any) => (
                        <li key={`post-${post.slug}`}>
                          <Link
                            to={`/blog/${post.slug}`}
                            className='link text-[color:var(--accent)]'
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
          {curatedExplore.length > 0 && (
            <section className='card p-5'>
              <h2 className='text-lg font-semibold text-white'>You might also explore</h2>
              <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {curatedExplore.map((item: any) => {
                  const isCompound = !!item.compoundClasses
                  const href = isCompound ? `/compounds/${item.slug}` : `/herbs/${item.slug}`
                  const title = item.common || item.name || item.scientific || item.slug
                  return (
                    <Link
                      key={`${isCompound ? 'c' : 'h'}-${item.slug}`}
                      to={href}
                      onClick={() =>
                        trackEvent('detail_click', {
                          source: 'herb_you_might_also_explore',
                          target: href,
                        })
                      }
                      className='rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30'
                    >
                      <p className='text-xs uppercase tracking-[0.14em] text-white/55'>
                        {isCompound ? 'compound' : 'herb'}
                      </p>
                      <h3 className='mt-1 text-base font-semibold text-white'>{title}</h3>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-8'>
      <h2 className='text-lg font-semibold text-white sm:text-xl'>{title}</h2>
      {children}
    </section>
  )
}

function EffectList({
  title,
  items,
  fallback,
}: {
  title: string
  items: string[]
  fallback: string
}) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
      <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>{title}</h3>
      <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/80'>
        {(items.length ? items : [fallback]).slice(0, 4).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
      <dt className='text-[11px] font-semibold uppercase tracking-wide text-white/65'>{label}</dt>
      <dd className='mt-1 text-sm text-white/85'>{value}</dd>
    </div>
  )
}
