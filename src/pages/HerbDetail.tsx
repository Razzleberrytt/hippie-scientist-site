import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '../components/Meta'
import { normalizeHerbDetails } from '../components/HerbDetails'
import { cleanLine, titleCase } from '../lib/pretty'
import { getCommonName } from '../lib/herbName'
import { useHerbData } from '@/lib/herb-data'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import { canonicalSlug, slugify } from '@/lib/slug'
import { recommendRelatedCompoundsForHerb, recommendRelatedHerbs } from '@/lib/discovery'
import { getTopViewedHerbs, pushRecentlyViewed, trackEvent, useSavedItems } from '@/lib/growth'
import ContextualLeadMagnet from '@/components/ContextualLeadMagnet'
import { CTA } from '@/lib/cta'
import posts from '../../public/blogdata/index.json'
import { buildHerbViralHooks } from '@/lib/viralContent'
import ShareInsightCard from '@/components/ShareInsightCard'
import { getSnippet } from '@/utils/contentSnippets'

type Param = { slug?: string }
const compounds = decorateCompounds()

function splitList(input: string) {
  return input
    .split(/\n|;|\.|•|,/g)
    .map(part => cleanLine(part))
    .filter(Boolean)
}

function evidenceChips(hasTraditionalUse: boolean, hasSources: boolean, noteCount: number) {
  const chips: string[] = []
  if (hasTraditionalUse) chips.push('Traditional use')
  if (hasSources && noteCount > 0) chips.push('Limited human data')
  if (hasSources) chips.push('Preclinical research')
  if (hasSources && noteCount > 2) chips.push('Well-studied')
  return chips.length ? chips : ['Limited human data']
}

function riskLevelText(rawRisk: string) {
  const value = rawRisk.toLowerCase()
  if (/(high|severe|strong caution|unsafe)/.test(value)) return 'High'
  if (/(moderate|caution|interaction|watch)/.test(value)) return 'Moderate'
  if (/(low|minimal|mild)/.test(value)) return 'Low'
  return 'Moderate'
}

export default function HerbDetail() {
  const { slug = '' } = useParams<Param>()
  const herbs = useHerbData()
  const { toggle, isSaved } = useSavedItems()

  const herb = useMemo(() => {
    const normalized = canonicalSlug(slug)
    return herbs.find(h => canonicalSlug(h.slug, h.common, h.scientific, h.name) === normalized)
  }, [herbs, slug])

  useEffect(() => {
    if (!herb) return
    const details = normalizeHerbDetails(herb)
    const scientificName =
      herb.scientific || (herb as any).scientificName || (herb as any).binomial || herb.name
    const normalizedCommon =
      getCommonName(herb) ?? (herb.common ? titleCase(String(herb.common)) : undefined)
    const displayTitle = normalizedCommon ?? scientificName ?? 'Herb'
    pushRecentlyViewed({
      type: 'herb',
      slug: herb.slug,
      title: displayTitle,
      href: `/herbs/${herb.slug}`,
    })
    trackEvent('detail_click', {
      kind: 'herb',
      slug: herb.slug,
      action: 'view',
      tag_count: details.tags.length,
    })
  }, [herb])

  if (!herbs.length)
    return <main className='container py-6 text-white/75'>Loading herb profile…</main>
  if (!herb) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <section className='ds-card-lg'>
          <p className='text-xs uppercase tracking-[0.14em] text-white/60'>Not Found</p>
          <h1 className='mt-2 text-2xl font-semibold'>Herb profile not found</h1>
          <Link to='/herbs' className='btn-primary mt-5 inline-flex'>
            ← Back to herbs
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
  const displayTitle = normalizedCommon ?? scientificName ?? 'Herb'
  const overview = cleanLine(details.description || details.effects || 'Profile under review.')
  const traditionalUse = cleanLine((herb as any).traditionalUse || (herb as any).ethnobotany || '')
  const mechanism = cleanLine(herb.mechanism || (herb as any).mechanismOfAction || '')
  const contraindications = splitList(
    cleanLine((herb.contraindications as string) || (herb as any).contraindicationsText || '')
  )
  const sideEffects = splitList(
    cleanLine((herb.sideEffects as string) || (herb as any).sideeffects || '')
  )
  const riskRaw = cleanLine(herb.safety || herb.toxicity || 'Use caution with unknown variables')
  const riskLevel = riskLevelText(riskRaw)
  const lastUpdated = cleanLine(String((herb as any).lastUpdated || ''))
  const researchNotes = splitList(
    cleanLine((herb as any).researchNotes || (herb as any).evidenceNotes || '')
  )
  const effectPoints = splitList(cleanLine(details.effects))
  const relatedHerbs = recommendRelatedHerbs(herb, herbs, 5)
  const relatedCompounds = recommendRelatedCompoundsForHerb(herb, compounds, 5)
  const popularFallback = herbs.slice(0, 3).filter(item => item.slug !== herb.slug)
  const evidence = evidenceChips(
    Boolean(traditionalUse),
    Boolean(details.sources.length),
    researchNotes.length
  )
  const normalizedTags = normalizeScientificTags([
    ...details.tags,
    ...(herb.compoundClasses || []),
  ]).slice(0, 4)
  const saved = isSaved('herb', herb.slug)
  const relatedArticles = (Array.isArray(posts) ? posts : [])
    .filter((post: any) => {
      const hay =
        `${post.title || ''} ${post.description || ''} ${(post.tags || []).join(' ')}`.toLowerCase()
      return hay.includes(displayTitle.toLowerCase())
    })
    .slice(0, 3)
  const viralHooks = buildHerbViralHooks(herb)
  const snippet = getSnippet('herb', herb.slug)
  const trendingHerbs = getTopViewedHerbs(4).filter(item => item.slug !== herb.slug)

  return (
    <>
      <Meta
        title={`${displayTitle} — The Hippie Scientist`}
        description={overview}
        path={`/herbs/${canonicalSlug(herb.slug, displayTitle)}`}
        pageType='article'
      />
      <main className='container py-6'>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
          <Link
            to='/herbs'
            className='btn-secondary inline-flex w-fit items-center rounded-full px-4'
          >
            ← Back to herbs
          </Link>
          <article className='ds-card-lg ds-stack'>
            <header className='border-b border-white/10 pb-4'>
              <h1 className='text-3xl font-semibold text-white'>{displayTitle}</h1>
              {scientificName && <p className='mt-1 italic text-white/65'>{scientificName}</p>}
              <p className='mt-2 text-xs text-white/60'>Designed to help you learn safely.</p>
              {lastUpdated && (
                <p className='mt-1 text-xs text-emerald-100/85'>
                  Last updated: {lastUpdated.slice(0, 10)}
                </p>
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
              <p className='mt-2 text-xs text-white/60'>
                Save this for later and continue exploring.
              </p>
              <ShareInsightCard
                title={displayTitle}
                insight={viralHooks.didYouKnow[0]}
                kind='herb'
                slug={herb.slug}
              />
            </header>

            <Section title='Overview' label='Research-backed'>
              <p className='mt-2 text-sm leading-7 text-white/85'>{overview}</p>
              <p className='mt-3 text-sm text-emerald-100/85'>{viralHooks.beginnerExplanation}</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Link to={`/herbs/${herb.slug}`} className='btn-secondary'>
                  Read full breakdown
                </Link>
                <Link to='/blend' className='btn-secondary'>
                  Build a blend with this
                </Link>
              </div>
            </Section>

            {snippet && (
              <Section title='Distribution snippet' label='Social + email ready'>
                <ul className='text-white/82 mt-2 space-y-2 text-sm'>
                  <li>
                    <strong className='text-white'>Hook:</strong> {snippet.hook}
                  </li>
                  <li>
                    <strong className='text-white'>Explanation:</strong> {snippet.explanation}
                  </li>
                  <li>
                    <strong className='text-white'>Safety note:</strong> {snippet.safetyNote}
                  </li>
                </ul>
              </Section>
            )}

            <Section title='Classification' label='Taxonomy + profile'>
              <dl className='mt-3 grid gap-3 text-sm sm:grid-cols-2'>
                <Fact label='Primary class' value={details.categories[0] || 'Botanical profile'} />
                <Fact
                  label='Profile tags'
                  value={normalizedTags.join(', ') || 'General botanical'}
                />
              </dl>
            </Section>

            <Section title='Mechanism (if known)' label='Mechanism overview'>
              <p className='mt-2 text-sm leading-7 text-white/85'>
                {mechanism || 'Mechanistic pathway not yet characterized in this entry.'}
              </p>
            </Section>

            <Section title='Effects' label='Observed outcomes'>
              <ul className='text-white/82 mt-2 list-disc space-y-2 pl-5 text-sm'>
                {(effectPoints.length
                  ? effectPoints
                  : ['Effect profile can vary by preparation, dose, and individual context.']
                )
                  .slice(0, 6)
                  .map(item => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </Section>

            <Section title='Safety' label='Safety profile'>
              <SafetyBlock
                riskLevel={riskLevel}
                contraindications={contraindications}
                sideEffects={sideEffects}
                evidenceQuality={
                  evidence.includes('Well-studied') ? 'Moderate to strong' : 'Limited to moderate'
                }
                cautionNote={riskRaw}
              />
              <p className='mt-3 text-sm text-amber-100/90'>{viralHooks.safetyInsight}</p>
            </Section>

            {details.sources.length > 0 && (
              <Section title='Sources' label='Citations'>
                <ol className='text-white/82 mt-2 list-decimal space-y-2 pl-5 text-sm'>
                  {details.sources.map(source => (
                    <li key={source}>
                      {/^https?:\/\//i.test(source) ? (
                        <a
                          href={source}
                          target='_blank'
                          rel='noreferrer'
                          className='link text-[color:var(--accent)]'
                        >
                          {source}
                        </a>
                      ) : (
                        source
                      )}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <Section title='Did you know?' label='Shareable facts'>
              <ul className='text-white/82 mt-2 list-disc space-y-2 pl-5 text-sm'>
                {viralHooks.didYouKnow.map(fact => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </Section>

            <Section title='Traditional Use' label='Historical context'>
              <p className='text-white/82 mt-2 text-sm leading-7'>
                {traditionalUse || 'Traditional-use context is limited in the current record.'}
              </p>
            </Section>

            <Section title='Research Notes' label='Evidence quality'>
              <div className='mt-2 flex flex-wrap gap-2'>
                {evidence.map(chip => (
                  <span key={chip} className='ds-pill'>
                    {chip}
                  </span>
                ))}
              </div>
              <ul className='text-white/82 mt-3 list-disc space-y-2 pl-5 text-sm'>
                {(researchNotes.length
                  ? researchNotes
                  : ['This profile is educational and should be interpreted with clinical caution.']
                )
                  .slice(0, 5)
                  .map(note => (
                    <li key={note}>{note}</li>
                  ))}
              </ul>
            </Section>
          </article>
          <ContextualLeadMagnet
            context='herb'
            title='Get a beginner-safe blend using herbs like this'
            subtitle='Get the free Beginner Blend Guide and apply this profile with safety-first context.'
          />

          <section className='ds-card-lg'>
            <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
            <p className='mt-1 text-sm text-white/70'>
              If you found this interesting… keep exploring.
            </p>
            <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <ExploreColumn
                title='Compare with…'
                items={(relatedHerbs.length ? relatedHerbs : popularFallback).map(item => ({
                  label: item.common || item.scientific || item.slug,
                  href: `/herbs/${item.slug}`,
                }))}
              />
              <ExploreColumn
                title='Explore similar mechanisms'
                items={(relatedCompounds.length ? relatedCompounds : compounds.slice(0, 3)).map(
                  item => ({
                    label: item.common || item.name || item.scientific || item.slug,
                    href: `/compounds/${item.slug}`,
                  })
                )}
              />
              <ExploreColumn
                title='Read a related blog post'
                items={
                  relatedArticles.length
                    ? relatedArticles.map((post: any) => ({
                        label: post.title,
                        href: `/blog/${post.slug}`,
                      }))
                    : posts
                        .slice(0, 3)
                        .map((post: any) => ({ label: post.title, href: `/blog/${post.slug}` }))
                }
              />
            </div>
          </section>
          <section className='ds-card-lg'>
            <h2 className='text-lg font-semibold text-white'>Trending now</h2>
            <p className='mt-1 text-sm text-white/70'>
              Want more like this? Follow the profiles readers are opening now.
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              {(trendingHerbs.length ? trendingHerbs : popularFallback).slice(0, 4).map(item => (
                <Link key={item.slug} className='btn-secondary' to={`/herbs/${item.slug}`}>
                  {item.slug}
                </Link>
              ))}
            </div>
          </section>
        </div>
        <ContextualLeadMagnet
          context='herb'
          title='Save this learning path and get your free guide'
          subtitle='A practical way to move from herb research to your first safe starter blend.'
        />
      </main>
    </>
  )
}

function Section({
  title,
  label,
  children,
}: {
  title: string
  label: string
  children: ReactNode
}) {
  return (
    <section>
      <p className='text-xs font-semibold uppercase tracking-[0.15em] text-white/55'>{label}</p>
      <h2 className='mt-1 text-xl font-semibold text-white'>{title}</h2>
      {children}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2'>
      <dt className='text-[11px] font-semibold uppercase tracking-wide text-white/60'>{label}</dt>
      <dd className='mt-1 text-sm text-white/85'>{value}</dd>
    </div>
  )
}

function SafetyBlock({
  riskLevel,
  contraindications,
  sideEffects,
  evidenceQuality,
  cautionNote,
}: {
  riskLevel: string
  contraindications: string[]
  sideEffects: string[]
  evidenceQuality: string
  cautionNote: string
}) {
  return (
    <div className='mt-3 rounded-xl border border-amber-300/35 bg-amber-500/10 p-4'>
      <p className='text-sm font-semibold text-amber-100'>⚠️ Safety-first review required</p>
      <dl className='mt-3 space-y-2 text-sm text-white/85'>
        <div>
          <dt className='font-semibold text-white'>Risk level</dt>
          <dd>{riskLevel}</dd>
        </div>
        <div>
          <dt className='font-semibold text-white'>Contraindications</dt>
          <dd>{contraindications.join('; ') || 'Not clearly documented in this record.'}</dd>
        </div>
        <div>
          <dt className='font-semibold text-white'>Known side effects</dt>
          <dd>{sideEffects.join('; ') || 'Side effect reports are limited or inconsistent.'}</dd>
        </div>
        <div>
          <dt className='font-semibold text-white'>Evidence quality</dt>
          <dd>{evidenceQuality}</dd>
        </div>
      </dl>
      <p className='mt-3 text-xs text-white/75'>{cautionNote}</p>
      <p className='mt-2 text-xs text-white/80'>Educational purposes only.</p>
    </div>
  )
}

function ExploreColumn({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; href: string }>
}) {
  return (
    <div>
      <h3 className='text-xs font-semibold uppercase tracking-[0.13em] text-white/60'>{title}</h3>
      <ul className='mt-2 space-y-2'>
        {items.slice(0, 4).map(item => (
          <li key={`${title}-${slugify(item.label)}`}>
            <Link
              to={item.href}
              onClick={() =>
                trackEvent('detail_click', { source: `herb_${title}`, target: item.href })
              }
              className='text-white/84 text-sm underline decoration-white/35 underline-offset-2 hover:text-white'
            >
              {item.label} · {CTA.primary.viewDetails}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
