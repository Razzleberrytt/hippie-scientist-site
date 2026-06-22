import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '../../../src/lib/runtime-data'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'
import { bestPageHref, bestPages } from '@/data/best'
import { formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import { getAffiliateShopLinks } from '../../../src/lib/affiliate'
import { getUnifiedRuntimeRecords } from '../../../src/lib/runtime-record-index'
import { buildPageMetadata, SITE_URL } from '../../../src/lib/seo'
import { isFlagshipCompareSlug } from '../../../src/lib/goal-hub-links'
import { buildCompareDetailSchemaGraph } from '../../../src/lib/schema-graph'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { getComparisonRecommendationEntries } from '../../../src/lib/runtime-related-maps'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { COMPARE_COMBINATIONS } from '@/config/compare-combinations'
import {
  recordToCompareItem,
  parseCompareSlug,
  getRelatedComparisons,
  buildFAQs,
} from '@/lib/compare'
import CompareHero from '@/components/compare/CompareHero'
import CompareDecisionWidget from '@/components/compare/CompareDecisionWidget'
import CompareSummaryTable from '@/components/compare/CompareSummaryTable'
import CompareMechanisms from '@/components/compare/CompareMechanisms'
import CompareEvidenceMatrix from '@/components/compare/CompareEvidenceMatrix'
import CompareGoalRouting from '@/components/compare/CompareGoalRouting'
import CompareSynergy from '@/components/compare/CompareSynergy'
import CompareSafety from '@/components/compare/CompareSafety'
import CompareDosing from '@/components/compare/CompareDosing'
import CompareAffiliate from '@/components/compare/CompareAffiliate'
import CompareRelated from '@/components/compare/CompareRelated'
import CompareFAQ from '@/components/compare/CompareFAQ'
import CompareCitations from '@/components/compare/CompareCitations'
import CompareSchema from '@/components/compare/CompareSchema'

type Params = { params: Promise<{ slug: string }> }

const formatSlug = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bL\b/g, 'L')
    .replace(/\bD3\b/g, 'D3')

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const asString = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback

const displayName = (compound: Record<string, unknown>) =>
  asString(compound?.displayName) || asString(compound?.name) || formatSlug(asString(compound?.slug, 'Compound'))

const evidenceScore = (compound: Record<string, unknown>) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''} ${compound?.evidence ?? ''} ${compound?.summary_quality ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|a-tier|meta|rct/.test(text)) return 5
  if (/moderate|tier\s*2|human/.test(text)) return 4
  if (/limited|low|tier\s*3/.test(text)) return 2
  return 3
}

const findCompound = (compounds: Record<string, unknown>[], candidates: string[]) =>
  compounds.find((compound: Record<string, unknown>) => {
    const aliases = new Set([
      asString(compound.slug),
      normalize(asString(compound.slug)),
      asString(compound.name),
      asString(compound.displayName),
      normalize(asString(compound.name)),
      normalize(asString(compound.displayName)),
    ].filter(Boolean))
    return candidates.some(candidate => aliases.has(candidate) || aliases.has(normalize(candidate)))
  })

const getComparisonConfig = (slug: string) => supplementComparisons.find(item => item.slug === slug)

// Static pages with their own routes — must be excluded from the dynamic [slug] route
const STATIC_COMPARE_PAGES = new Set([
  'ashwagandha-vs-rhodiola', 'ashwagandha-vs-l-theanine-vs-magnesium',
  'berberine-vs-metformin', 'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  'curcumin-vs-boswellia-vs-omega-3', 'kanna-vs-ssris', 'kava-vs-alcohol',
  'l-theanine-vs-magnesium', 'magnesium-glycinate-vs-l-threonate-for-sleep',
  'magnesium-glycinate-vs-magnesium-oxide', 'melatonin-vs-magnesium',
  'melatonin-vs-valerian-vs-magnesium-for-sleep', 'mitragynine-vs-7-hydroxymitragynine',
  'rhodiola-vs-ashwagandha', 'sleep-herbs-vs-melatonin',
])

const allComparisonSlugs = Array.from(new Set([
  ...generatedComparisons,
  ...supplementComparisons.map(item => item.slug),
  ...COMPARE_COMBINATIONS,
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
])).filter(slug => !STATIC_COMPARE_PAGES.has(slug))

function getSignals(compound: Record<string, unknown>) {
  return unique([
    ...list(compound?.effects),
    ...list(compound?.primary_effects),
    ...list(compound?.mechanisms),
    ...list(compound?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 6)
}

const evidenceLabel = (score: number) => {
  if (score >= 5) return 'Stronger'
  if (score >= 4) return 'Moderate'
  if (score <= 2) return 'Limited'
  return 'Mixed'
}

const profileLabel = (compound: Record<string, unknown>) => {
  const text = `${list(compound?.effects).join(' ')} ${list(compound?.primary_effects).join(' ')} ${compound?.summary || ''}`.toLowerCase()
  if (/stim|energy|focus|alert/.test(text)) return 'More stimulating'
  if (/sleep|calm|sedat|relax|anx/.test(text)) return 'More calming'
  return 'Mixed or goal-dependent'
}

const firstItems = (values: string[], fallback: string) => (values.length > 0 ? values.slice(0, 3) : [fallback])

function isFieldEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true
  const str = String(val).trim().toLowerCase()
  return str === '' || str === 'nan' || str === 'null' || str === 'undefined'
}

export function generateStaticParams() {
  return allComparisonSlugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const parsed = parseCompareSlug(slug)

  let title: string
  let description: string

  if (config?.title) {
    title = `${config.title}: Which Is Better?`
    description = config.summary || `Compare ${config.title} for benefits, safety, evidence, and best use cases.`
  } else if (parsed) {
    const { allRecords } = await getUnifiedRuntimeRecords()
    const a = allRecords.find((c: Record<string, unknown>) => c.slug === parsed.item1Slug)
    const b = allRecords.find((c: Record<string, unknown>) => c.slug === parsed.item2Slug)
    const n1 = a ? displayName(a) : formatSlug(parsed.item1Slug)
    const n2 = b ? displayName(b) : formatSlug(parsed.item2Slug)
    title = `${n1} vs ${n2}: Complete Comparison | The Hippie Scientist`
    description = `Evidence-based comparison of ${n1} and ${n2}. Compare mechanisms, dosing, safety, and which is right for your goals.`
  } else {
    title = `${formatSlug(slug)}: Which Is Better?`
    description = `Compare ${formatSlug(slug)} for benefits, safety, evidence, best use cases, and supplement buying options.`
  }

  const indexable = isFlagshipCompareSlug(slug) || allComparisonSlugs.includes(slug)
  return {
    ...buildPageMetadata({
      title,
      description,
      path: `/compare/${slug}`,
      openGraphType: 'article',
      robots: indexable ? undefined : { index: false, follow: true },
    }),
    alternates: { canonical: `${SITE_URL}/compare/${slug}/` },
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const parsed = parseCompareSlug(slug)
  const [aSlug, bSlug] = slug.split('-vs-')

  const { allRecords } = await getUnifiedRuntimeRecords()
  const stacks = await getStacks()

  const a = config
    ? findCompound(allRecords, config.a.candidates)
    : allRecords.find((c: Record<string, unknown>) => c.slug === (parsed?.item1Slug ?? aSlug))
  const b = config
    ? findCompound(allRecords, config.b.candidates)
    : allRecords.find((c: Record<string, unknown>) => c.slug === (parsed?.item2Slug ?? bSlug))

  if (!a || !b) return notFound()

  // Build typed CompareItem objects for new components
  const item1 = recordToCompareItem(a as Record<string, unknown>)
  const item2 = recordToCompareItem(b as Record<string, unknown>)
  const isHR = item1.isHarmReduction || item2.isHarmReduction

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b
  const loser = winner.slug === a.slug ? b : a
  const title = config?.title || `${displayName(a)} vs ${displayName(b)}`
  const pageSummary = config?.summary || `Compare ${displayName(a)} and ${displayName(b)} by evidence, fit, safety, and practical use.`

  const chooseWinnerIf = `You prioritize a stronger clinical evidence base (${evidenceLabel(evidenceScore(winner))} Evidence), or if your goals align with the primary outcomes of ${firstItems(getSignals(winner), 'general support').slice(0, 2).join(' and ')}.`
  const chooseLoserIf = `You seek an alternative pathway profile, or if your goals focus specifically on ${firstItems(getSignals(loser), 'targeted support').slice(0, 2).join(' and ')}.`

  const relatedStack = stacks.find((s: Record<string, unknown>) =>
    (Array.isArray(s.compounds) ? s.compounds : Array.isArray(s.stack) ? s.stack : []).some((i: Record<string, unknown>) => {
      const compoundSlug = i.compound_slug || i.compound
      return compoundSlug === a.slug || compoundSlug === b.slug
    })
  )

  const relatedComparisons = supplementComparisons
    .filter(item => item.slug !== slug)
    .filter(item =>
      item.a.candidates.includes(asString(a.slug)) || item.b.candidates.includes(asString(a.slug)) ||
      item.b.candidates.includes(asString(b.slug)) || item.b.candidates.includes(asString(b.slug)) ||
      item.a.candidates.some(candidate => normalize(candidate) === normalize(asString(a.slug)) || normalize(candidate) === normalize(asString(b.slug))) ||
      item.b.candidates.some(candidate => normalize(candidate) === normalize(asString(a.slug)) || normalize(candidate) === normalize(asString(b.slug)))
    )
    .slice(0, 3)

  const runtimeComparisonLinks = (
    await Promise.all([
      getComparisonRecommendationEntries(String(a.slug || '')),
      getComparisonRecommendationEntries(String(b.slug || '')),
    ])
  )
    .flat()
    .map((item) => {
      const targetSlug = item.targetSlug || item.slug
      const validSlug = getValidComparisonSlug(item.sourceSlug || '', targetSlug)
      if (!validSlug || validSlug === slug) return null
      return {
        slug: validSlug,
        title: item.title || formatSlug(validSlug),
      }
    })
    .filter((item): item is { slug: string; title: string } => item !== null)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.slug === item.slug) === index)
    .slice(0, 4)

  const relatedBestPages = bestPages
    .filter(page => page.compoundCandidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)))
    .slice(0, 3)

  const evidenceA = evidenceScore(a)
  const evidenceB = evidenceScore(b)
  const cautionA = list(a?.safety_flags || a?.safetyNotes || a?.contraindications).map(formatDisplayLabel).filter(isClean)
  const cautionB = list(b?.safety_flags || b?.safetyNotes || b?.contraindications).map(formatDisplayLabel).filter(isClean)
  const timingA = formatDisplayLabel(a?.time_to_effect) || 'Timing varies'
  const timingB = formatDisplayLabel(b?.time_to_effect) || 'Timing varies'
  const durationA = formatDisplayLabel(a?.duration) || 'Not consistently reported'
  const durationB = formatDisplayLabel(b?.duration) || 'Not consistently reported'
  const costA = formatDisplayLabel(a?.cost) || 'Price varies by product quality'
  const costB = formatDisplayLabel(b?.cost) || 'Price varies by product quality'

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

  const renderVerdictCell = (compound: Record<string, unknown>, verdictText: string) => {
    const shopLinks = getAffiliateShopLinks(compound, displayName(compound), asString(compound.entityType, 'compound') as 'herb' | 'compound')
    const cta = shopLinks.find(l => l.url)
    return (
      <div className="space-y-4">
        <p className="leading-relaxed text-ink bg-surface-subtle p-4 rounded-xl border border-brand-900/5 text-sm">
          {verdictText}
        </p>
        {cta && !isHR ? (
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
        url: a.entityType === 'herb' ? `/herbs/${asString(a.slug)}` : `/compounds/${asString(a.slug)}`,
        type: asString(a.entityType, 'compound') as 'herb' | 'compound',
      },
      {
        name: displayName(b),
        url: b.entityType === 'herb' ? `/herbs/${asString(b.slug)}` : `/compounds/${asString(b.slug)}`,
        type: asString(b.entityType, 'compound') as 'herb' | 'compound',
      },
    ],
  })

  const faqs = buildFAQs(item1, item2)
  const relatedPairs = getRelatedComparisons(item1.slug, item2.slug, COMPARE_COMBINATIONS)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-12">
      <SchemaGraphScript graph={schemaGraph} />
      <CompareSchema item1={item1} item2={item2} slug={slug} faqs={faqs} />

      {/* Hero */}
      <CompareHero item1={item1} item2={item2} />

      {/* Interactive decision widget — client component */}
      <section>
        <CompareDecisionWidget item1={item1} item2={item2} isHarmReduction={isHR} />
      </section>

      {/* Quick summary table */}
      <CompareSummaryTable item1={item1} item2={item2} />

      {/* Mechanism comparison at molecular level */}
      <CompareMechanisms item1={item1} item2={item2} />

      {/* Evidence quality matrix */}
      <CompareEvidenceMatrix item1={item1} item2={item2} />

      {/* Goal-based routing */}
      <CompareGoalRouting item1={item1} item2={item2} />

      {/* Stack / synergy section */}
      <CompareSynergy item1={item1} item2={item2} />

      {/* Safety comparison */}
      <CompareSafety item1={item1} item2={item2} />

      {/* Dosing + cost-per-effective-dose */}
      <CompareDosing item1={item1} item2={item2} />

      {/* Affiliate (zone-gated) */}
      {!isHR && <CompareAffiliate item1={item1} item2={item2} isHR={isHR} />}

      {/* Original comparison table — preserved for detail */}
      <section className="card-premium p-6 sm:p-8 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Side-by-Side</p>
          <h2 className="text-xl font-bold text-ink mt-2">Detailed Comparison</h2>
          <p className="text-sm text-muted mt-1">Tradeoffs, timing, safety, and evidence signals compared.</p>
        </div>
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
            <p>{a.best_for || a.summary}</p>,
            <p>{b.best_for || b.summary}</p>,
            a.best_for || a.summary,
            b.best_for || b.summary
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
          {!isHR && renderRow('Verdict & Sourcing',
            renderVerdictCell(a, winner.slug === a.slug ? chooseWinnerIf : chooseLoserIf),
            renderVerdictCell(b, winner.slug === b.slug ? chooseWinnerIf : chooseLoserIf)
          )}
        </div>
      </section>

      {/* Related comparisons */}
      <CompareRelated comparisons={relatedPairs} currentSlug={slug} />

      {/* FAQ */}
      <CompareFAQ faqs={faqs} />

      {/* Citations */}
      <CompareCitations item1={item1} item2={item2} />

      {/* Navigation cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedStack && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">Use in a routine</h3>
            <p className="text-sm text-muted">These options can be stacked for goal-based synergy.</p>
            <Link href={`/stacks/${relatedStack.slug}`} className="inline-block text-sm font-bold text-brand-700 hover:text-brand-900">
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
        {runtimeComparisonLinks.length > 0 && (
          <article className="card-premium p-5 space-y-2">
            <h3 className="font-bold text-ink">More comparison paths</h3>
            <div className="flex flex-col gap-2">
              {runtimeComparisonLinks.map(item => (
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
                <Link key={page.slug} href={bestPageHref(page.slug)} className="text-sm font-semibold text-brand-850 hover:underline">
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
              { href: '/guides', label: 'Browse supplement guides' },
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
            links: [{ href: '/goals', label: 'Browse goal guides' }],
          },
        ]}
      />
    </div>
  )
}
