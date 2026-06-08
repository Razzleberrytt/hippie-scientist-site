import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '@/lib/runtime-data'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'
import { bestPages } from '@/data/best'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import { getAffiliateShopLinks } from '@/lib/affiliate'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'
import { isFlagshipCompareSlug } from '@/lib/goal-hub-links'
import { buildCompareDetailSchemaGraph } from '@/lib/schema-graph'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'

import type { RuntimeRecord } from '@/types/content'

type Params = { params: Promise<{ slug: string }> }

const formatSlug = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bL\b/g, 'L')
    .replace(/\bD3\b/g, 'D3')

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const displayName = (compound: RuntimeRecord | undefined) => {
  if (!compound) return 'Compound'
  const raw = compound as Record<string, unknown>
  return (raw.displayName || raw.name || formatSlug(raw.slug as string || 'Compound')) as string
}

const summary = (compound: RuntimeRecord | undefined) => {
  if (!compound) return 'Open the profile for more detail.'
  const raw = compound as Record<string, unknown>
  return cleanSummary((raw.summary || raw.description) as string, 'compound') || 'Open the profile for more detail.'
}

const evidenceScore = (compound: RuntimeRecord | undefined) => {
  if (!compound) return 3
  const raw = compound as Record<string, unknown>
  const textVal = `${raw.evidence_grade ?? ''} ${raw.evidenceTier ?? ''} ${raw.tier_level ?? ''} ${raw.evidence ?? ''} ${raw.summary_quality ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|a-tier|meta|rct/.test(textVal)) return 5
  if (/moderate|tier\s*2|human/.test(textVal)) return 4
  if (/limited|low|tier\s*3/.test(textVal)) return 2
  return 3
}

const findCompound = (compounds: RuntimeRecord[], candidates: string[]) =>
  compounds.find((compound: RuntimeRecord) => {
    const aliases = new Set([
      compound.slug,
      normalize(compound.slug),
      compound.name,
      compound.displayName,
      normalize(compound.name),
      normalize(compound.displayName)
    ].filter(Boolean))
    return candidates.some(candidate => aliases.has(candidate) || aliases.has(normalize(candidate)))
  })

const getComparisonConfig = (slug: string) => supplementComparisons.find(item => item.slug === slug)

const allComparisonSlugs = Array.from(new Set([
  ...generatedComparisons,
  ...supplementComparisons.map(item => item.slug),
  '11-keto-beta-boswellic-acid-vs-acemannan',
  'acemannan-vs-acetyl-11-keto-beta-boswellic-acid',
  'acetyl-11-keto-beta-boswellic-acid-vs-acetyl-beta-boswellic-acid',
  'acetyl-beta-boswellic-acid-vs-acetylshikonin',
  'acetylshikonin-vs-acteoside',
  'acteoside-vs-aescin',
  'aescin-vs-ajoene',
  'ajoene-vs-albiflorin',
  'albiflorin-vs-alpha-asarone',
  'alpha-asarone-vs-alpha-mangostin',
  'alpha-mangostin-vs-anabasine',
  'anabasine-vs-anatabine',
  'anatabine-vs-andrographolide',
  'andrographolide-vs-anethole',
  'anethole-vs-angelicin',
  'angelicin-vs-apigenin',
  'apigenin-vs-arjunolic-acid',
  'arjunolic-acid-vs-artemisinin',
  'artemisinin-vs-artemisinin-b',
  'artemisinin-b-vs-artesunate',
  'artesunate-vs-asiatic-acid',
  'asiatic-acid-vs-asiaticoside',
  'asiaticoside-vs-aspalathin',
  'aspalathin-vs-astragalin',
  'aspalathin-vs-astragalin',
]))

function getSignals(compound: RuntimeRecord | undefined) {
  if (!compound) return []
  const raw = compound as Record<string, unknown>
  return unique([
    ...list(raw.effects),
    ...list(raw.primary_effects),
    ...list(raw.mechanisms),
    ...list(raw.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 6)
}

const evidenceLabel = (score: number) => {
  if (score >= 5) return 'Stronger'
  if (score >= 4) return 'Moderate'
  if (score <= 2) return 'Limited'
  return 'Mixed'
}

const profileLabel = (compound: RuntimeRecord | undefined) => {
  if (!compound) return 'Mixed or goal-dependent'
  const raw = compound as Record<string, unknown>
  const textVal = `${list(raw.effects).join(' ')} ${list(raw.primary_effects).join(' ')} ${raw.summary || ''}`.toLowerCase()
  if (/stim|energy|focus|alert/.test(textVal)) return 'More stimulating'
  if (/sleep|calm|sedat|relax|anx/.test(textVal)) return 'More calming'
  return 'Mixed or goal-dependent'
}

const firstItems = (values: string[], fallback: string) => (values.length > 0 ? values.slice(0, 3) : [fallback])

export function generateStaticParams() {
  return allComparisonSlugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const title = config?.title ? `${config.title}: Which Is Better?` : `${formatSlug(slug)}: Which Is Better?`
  const description = config?.summary || `Compare ${formatSlug(slug)} for benefits, safety, evidence, best use cases, and supplement buying options.`

  const indexable = isFlagshipCompareSlug(slug)
  return buildPageMetadata({
    title,
    description,
    path: `/compare/${slug}`,
    openGraphType: 'article',
    robots: indexable
      ? undefined
      : { index: false, follow: true },
  })
}

function isFieldEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true
  const str = String(val).trim().toLowerCase()
  return str === '' || str === 'nan' || str === 'null' || str === 'undefined'
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const [aSlug, bSlug] = slug.split('-vs-')
  
  // Load unified records (handles both herbs and compounds)
  const { allRecords } = await getUnifiedRuntimeRecords()
  const stacks = await getStacks()

  const a = config ? findCompound(allRecords as RuntimeRecord[], config.a.candidates) : (allRecords as RuntimeRecord[]).find((c) => c.slug === aSlug)
  const b = config ? findCompound(allRecords as RuntimeRecord[], config.b.candidates) : (allRecords as RuntimeRecord[]).find((c) => c.slug === bSlug)
  if (!a || !b) return notFound()

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b
  const loser = winner.slug === a.slug ? b : a
  const title = config?.title || `${displayName(a)} vs ${displayName(b)}`
  const pageSummary = config?.summary || `Compare ${displayName(a)} and ${displayName(b)} by evidence, fit, safety, and practical use.`

  const chooseWinnerIf = `You prioritize a stronger clinical evidence base (${evidenceLabel(evidenceScore(winner))} Evidence), or if your goals align with the primary outcomes of ${firstItems(getSignals(winner), 'general support').slice(0, 2).join(' and ')}.`
  const chooseLoserIf = `You seek an alternative pathway profile, or if your goals focus specifically on ${firstItems(getSignals(loser), 'targeted support').slice(0, 2).join(' and ')}.`

  const relatedStack = stacks.find((s: RuntimeRecord) => {
    const rawS = s as Record<string, unknown>
    const compoundsArr = (rawS.compounds || rawS.stack || []) as Record<string, unknown>[]
    return compoundsArr.some((i) => {
      const compoundSlug = i.compound_slug || i.compound
      return compoundSlug === a.slug || compoundSlug === b.slug
    })
  })

  const relatedComparisons = supplementComparisons
    .filter(item => item.slug !== slug)
    .filter(item =>
      item.a.candidates.includes(a.slug) || item.b.candidates.includes(a.slug) ||
      item.b.candidates.includes(b.slug) || item.b.candidates.includes(b.slug) ||
      item.a.candidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)) ||
      item.b.candidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug))
    )
    .slice(0, 3)

  const relatedBestPages = bestPages
    .filter(page => page.compoundCandidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)))
    .slice(0, 3)

  const evidenceA = evidenceScore(a)
  const evidenceB = evidenceScore(b)
  const cautionA = list(a.safety_flags || a.safetyNotes || a.contraindications).map(formatDisplayLabel).filter(isClean)
  const cautionB = list(b.safety_flags || b.safetyNotes || b.contraindications).map(formatDisplayLabel).filter(isClean)
  const timingA = formatDisplayLabel(a.time_to_effect as string || a.onset as string) || 'Timing varies'
  const timingB = formatDisplayLabel(b.time_to_effect as string || b.onset as string) || 'Timing varies'
  const durationA = formatDisplayLabel(a.duration as string) || 'Not consistently reported'
  const durationB = formatDisplayLabel(b.duration as string) || 'Not consistently reported'
  const costA = formatDisplayLabel(a.cost as string) || 'Price varies by product quality'
  const costB = formatDisplayLabel(b.cost as string) || 'Price varies by product quality'

  const renderRow = (label: string, valA: React.ReactNode, valB: React.ReactNode, rawValA?: unknown, rawValB?: unknown) => {
    const isEmptyA = rawValA !== undefined ? isFieldEmpty(rawValA) : !valA
    const isEmptyB = rawValB !== undefined ? isFieldEmpty(rawValB) : !valB
    if (isEmptyA && isEmptyB) return null
    return (
      <div className="grid gap-4 py-5 border-b border-brand-900/10 last:border-0 sm:grid-cols-[180px_1fr_1fr] items-start">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-900/60 pt-0.5">{label}</div>
        <div className="text-sm text-ink leading-relaxed">
          {!isEmptyA ? valA : <span className="text-muted font-normal italic">Not available</span>}
        </div>
        <div className="text-sm text-ink leading-relaxed">
          {!isEmptyB ? valB : <span className="text-muted font-normal italic">Not available</span>}
        </div>
      </div>
    )
  }

  const renderVerdictCell = (compound: RuntimeRecord, verdictText: string) => {
    const raw = compound as Record<string, unknown>
    const shopLinks = getAffiliateShopLinks(compound, displayName(compound), raw.entityType as 'herb' | 'compound' | undefined)
    const cta = shopLinks.find(l => l.url)
    return (
      <div className="space-y-4">
        <p className="leading-relaxed text-[#35453d] bg-emerald-50/50 p-4 rounded-xl border border-emerald-900/5 text-sm">
          {verdictText}
        </p>
        {cta ? (
          <a
            href={cta.url}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-900"
          >
            {cta.label} →
          </a>
        ) : null}
      </div>
    )
  }

  const schemaGraph = buildCompareDetailSchemaGraph({
    path: `/compare/${slug}`,
    title,
    description: pageSummary,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Compare', url: `${SITE_URL}/compare/` },
      { name: title, url: `${SITE_URL}/compare/${slug}/` },
    ],
    entities: [
      {
        name: displayName(a),
        url: a.entityType === 'herb' ? `/herbs/${a.slug}` : `/compounds/${a.slug}`,
        type: (a.entityType || 'compound') as 'herb' | 'compound',
      },
      {
        name: displayName(b),
        url: b.entityType === 'herb' ? `/herbs/${b.slug}` : `/compounds/${b.slug}`,
        type: (b.entityType || 'compound') as 'herb' | 'compound',
      },
    ],
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <SchemaGraphScript graph={schemaGraph} />
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Semantic Comparison</p>
        <h1 className="heading-premium mt-3 text-ink">{title}</h1>
        <p className="detail-reading mt-5 text-base text-[#46574d] sm:text-lg">{pageSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip-readable">Decision guide</span>
          <span className="chip-readable">Evidence signals compared</span>
          <span className="chip-readable">Mechanism contrast</span>
        </div>
      </section>

      {/* Side-by-Side Quick Cards */}
      <section className="grid gap-6 sm:grid-cols-2">
        {[a, b].map((compound: RuntimeRecord) => (
          <article key={compound.slug} className="card-premium p-6 space-y-3">
            <span className="identity-kicker">Evidence signal: {evidenceScore(compound)}/5</span>
            <h2 className="text-xl font-bold text-ink">{displayName(compound)}</h2>
            <p className="text-sm leading-relaxed text-muted">{summary(compound)}</p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-900/5">
              {getSignals(compound).slice(0, 4).map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
            <div className="pt-2">
              <Link href={compound.entityType === 'herb' ? `/herbs/${compound.slug}` : `/compounds/${compound.slug}`} className="text-sm font-bold text-teal-700 hover:text-teal-900">
                Open full profile →
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Comparison Table */}
      <section className="card-premium p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-ink">Comparison Table</h2>
          <p className="text-sm text-muted mt-1">Tradeoffs, timing, safety, and evidence signals compared.</p>
        </div>

        {/* Table Headers */}
        <div className="grid gap-4 pb-4 border-b border-brand-900/15 sm:grid-cols-[180px_1fr_1fr] font-bold text-xs uppercase tracking-wider text-brand-900/70">
          <div>Attribute</div>
          <div>{displayName(a)}</div>
          <div>{displayName(b)}</div>
        </div>

        <div className="flex flex-col">
          {renderRow('Evidence Level', 
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100/50">
              {evidenceLabel(evidenceA)} ({evidenceA}/5)
            </span>, 
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100/50">
              {evidenceLabel(evidenceB)} ({evidenceB}/5)
            </span>
          )}

          {renderRow('Onset & Duration',
            <div>
              <p className="font-semibold">{timingA}</p>
              <p className="text-xs text-muted mt-0.5">{durationA}</p>
            </div>,
            <div>
              <p className="font-semibold">{timingB}</p>
              <p className="text-xs text-muted mt-0.5">{durationB}</p>
            </div>,
            a?.time_to_effect || a?.onset,
            b?.time_to_effect || b?.onset
          )}

          {renderRow('Safety', 
            <p>{a.safetyNotes || (cautionA.length > 0 ? cautionA.join(', ') : null)}</p>, 
            <p>{b.safetyNotes || (cautionB.length > 0 ? cautionB.join(', ') : null)}</p>,
            a.safetyNotes || (cautionA.length > 0 ? cautionA.join(', ') : null),
            b.safetyNotes || (cautionB.length > 0 ? cautionB.join(', ') : null)
          )}

          {renderRow('Best For', 
            <p>{((a as Record<string, unknown>).best_for || a.summary) as React.ReactNode}</p>, 
            <p>{((b as Record<string, unknown>).best_for || b.summary) as React.ReactNode}</p>,
            (a as Record<string, unknown>).best_for || a.summary,
            (b as Record<string, unknown>).best_for || b.summary
          )}

          {renderRow('Cost Tier', 
            <p>{costA}</p>, 
            <p>{costB}</p>,
            a?.cost,
            b?.cost
          )}

          {renderRow('Stimulation Profile', 
            <p className="font-semibold text-emerald-700">{profileLabel(a)}</p>, 
            <p className="font-semibold text-emerald-700">{profileLabel(b)}</p>
          )}

          {renderRow('Interactions',
            <div>
              {list(a.interactions).length > 0 ? (
                <ul className="space-y-1">
                  {list(a.interactions).map((item) => <li key={item}>• {item}</li>)}
                </ul>
              ) : null}
            </div>,
            <div>
              {list(b.interactions).length > 0 ? (
                <ul className="space-y-1">
                  {list(b.interactions).map((item) => <li key={item}>• {item}</li>)}
                </ul>
              ) : null}
            </div>,
            list(a.interactions).length > 0 ? 'available' : null,
            list(b.interactions).length > 0 ? 'available' : null
          )}

          {renderRow('Verdict & Sourcing',
            renderVerdictCell(a, winner.slug === a.slug ? chooseWinnerIf : chooseLoserIf),
            renderVerdictCell(b, winner.slug === b.slug ? chooseWinnerIf : chooseLoserIf)
          )}
        </div>
      </section>

      {/* Routine Integration & Navigation */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedStack && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">Use in a routine</h3>
            <p className="text-sm text-muted">These options can be stacked for goal-based synergy.</p>
            <Link href={`/stacks/${relatedStack.slug}`} className="inline-block text-sm font-bold text-teal-700 hover:text-teal-900">
              View stack →
            </Link>
          </article>
        )}

        {relatedComparisons.length > 0 && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">Related comparisons</h3>
            <div className="flex flex-col gap-2">
              {relatedComparisons.map(item => (
                <Link key={item.slug} href={`/compare/${item.slug}`} className="text-sm font-semibold text-brand-850 hover:underline">
                  {item.title} →
                </Link>
              ))}
            </div>
          </article>
        )}

        {relatedBestPages.length > 0 && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">Best-of guides</h3>
            <div className="flex flex-col gap-2">
              {relatedBestPages.map(page => (
                <Link key={page.slug} href={`/best/${page.slug}`} className="text-sm font-semibold text-brand-850 hover:underline">
                  {page.title} →
                </Link>
              ))}
            </div>
          </article>
        )}
      </section>

      <RelatedDiscoveryGroups
        eyebrow="Continue comparison research"
        title="Explore nearby decision paths"
        groups={[
          {
            title: 'Related comparisons',
            description: 'Compare close alternatives without forcing a single winner.',
            links: relatedComparisons.map(item => ({ href: `/compare/${item.slug}`, label: item.title })),
          },
          {
            title: 'Beginner-friendly next reads',
            description: 'Start with practical overviews before advanced stacking.',
            links: [
              { href: `/${winner.entityType === 'herb' ? 'herbs' : 'compounds'}/${winner.slug}`, label: `${displayName(winner)} profile` },
              { href: '/learn', label: 'Learn evidence basics' },
            ],
          },
          {
            title: 'Safety context',
            description: 'Read safety framing before trial decisions.',
            links: [
              { href: '/guides/sleep-herbs-vs-melatonin', label: 'Sleep safety tradeoffs' },
              { href: '/guides/psychedelic-adjacent-herbs', label: 'Harm-reduction herb context' },
            ],
          },
          {
            title: 'Related goals pages',
            description: 'Use goal pages when choosing by outcome instead of ingredient.',
            links: [
              { href: '/goals', label: 'Browse goal guides' },
            ],
          },
        ]}
      />
    </div>
  )
}
