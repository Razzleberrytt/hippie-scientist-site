import { useMemo, type ReactNode } from 'react'
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
import { trackEvent, useSavedItems } from '@/lib/growth'
import posts from '../../public/blogdata/index.json'

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

            <Section title='Overview' label='Research-backed'>
              <p className='mt-2 text-sm leading-7 text-white/85'>{overview}</p>
            </Section>

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

          <section className='ds-card-lg'>
            <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
            <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <ExploreColumn
                title='Same class'
                items={(relatedHerbs.length ? relatedHerbs : popularFallback).map(item => ({
                  label: item.common || item.scientific || item.slug,
                  href: `/herbs/${item.slug}`,
                }))}
              />
              <ExploreColumn
                title='Similar effects'
                items={(relatedCompounds.length ? relatedCompounds : compounds.slice(0, 3)).map(
                  item => ({
                    label: item.common || item.name || item.scientific || item.slug,
                    href: `/compounds/${item.slug}`,
                  })
                )}
              />
              <ExploreColumn
                title='Contains similar compounds'
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
        </div>
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
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
