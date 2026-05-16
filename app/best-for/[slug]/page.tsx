import Link from 'next/link'
import { notFound } from 'next/navigation'
import { bestExploredTopics, getBestExploredTopic } from '@/lib/best-explored-topics'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import ComparisonEcosystemRail from '@/components/comparison-ecosystem-rail'

type BestForRouteParams = Promise<{ slug: string }>

type BestForRouteProps = {
  params: BestForRouteParams
}

export function generateStaticParams() {
  return bestExploredTopics.map((topic) => ({ slug: topic.slug }))
}

function normalize(value: unknown) {
  return text(value).toLowerCase()
}

function inferEntityType(record: any) {
  if (record?.entityType === 'compound' || record?.compound_class || record?.compoundClass) return 'compound'
  return 'herb'
}

function corpus(record: any) {
  return [
    record?.name,
    record?.displayName,
    record?.slug,
    record?.summary,
    record?.description,
    record?.evidence_tier,
    record?.evidenceTier,
    record?.summary_quality,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).join(' ')
}

function scoreRecord(record: any, keywords: string[]) {
  const haystack = corpus(record)
  let score = 0

  keywords.forEach((keyword) => {
    if (haystack.includes(keyword.toLowerCase())) score += 2
  })

  if (/strong|clinical|human|high/i.test(text(record?.evidence_tier || record?.evidenceTier || record?.summary_quality))) score += 3
  if (/complete|strong|ready|high/i.test(text(record?.profile_status || record?.summary_quality))) score += 2

  return score
}

function getName(record: any) {
  return formatDisplayLabel(record?.displayName || record?.name || record?.slug)
}

function getSummary(record: any) {
  const entityType = record?.entityType === 'compound' ? 'compound' : 'herb'
  return cleanSummary(record?.summary || record?.description || record?.coreInsight || '', entityType)
}

function getSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 4)
}

function evidenceLabel(record: any) {
  return formatDisplayLabel(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || 'Evidence context')
}

function evidenceClass(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('strong') || normalized.includes('clinical') || normalized.includes('high')) return 'evidence-pill-strong'
  if (normalized.includes('moderate') || normalized.includes('human')) return 'evidence-pill-moderate'
  return 'chip-readable'
}

function href(record: any) {
  return `/${record?.entityType === 'compound' ? 'compounds' : 'herbs'}/${record.slug}`
}

function AuthorityCard({ record }: { record: any }) {
  const signals = getSignals(record)
  const evidence = evidenceLabel(record)

  return (
    <Link href={href(record)} className="compact-card group section-rhythm-compact">
      <div className="flex flex-wrap gap-2">
        <span className={evidenceClass(evidence)}>{evidence}</span>
        <span className="identity-kicker">{record?.entityType === 'compound' ? 'Compound' : 'Herb'}</span>
      </div>

      <div className="space-y-2">
        <h2 className="max-w-none text-lg font-semibold leading-tight tracking-tight text-ink group-hover:text-brand-700">
          {getName(record)}
        </h2>

        <p className="line-clamp-3 text-sm leading-6 text-[#46574d]">
          {getSummary(record) || 'Evidence-aware profile connected to this goal-oriented research hub.'}
        </p>
      </div>

      {signals.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
          {signals.map((signal) => (
            <PathwayVisualChip key={signal} pathway={signal} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <span className="identity-meta">Goal-oriented profile</span>
        <span className="text-sm font-semibold text-brand-800">Open →</span>
      </div>
    </Link>
  )
}

export default async function BestExploredHubPage({ params }: BestForRouteProps) {
  const resolvedParams = await params
  const topic = getBestExploredTopic(resolvedParams.slug)
  if (!topic) notFound()

  const { allRecords } = await getUnifiedRuntimeRecords()
  const records = allRecords
    .filter((record: any) => getRuntimeVisibility(record).canRender)
    .map((record: any) => ({ ...record, entityType: inferEntityType(record) }))
    .map((record: any) => ({ record, score: scoreRecord(record, topic.keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 48)
    .map((item) => item.record)

  const topRecords = records.slice(0, 8)
  const evidenceForward = records.filter((record: any) => /strong|clinical|human|high/i.test(text(record?.evidence_tier || record?.evidenceTier || record?.summary_quality))).slice(0, 8)
  const mechanismDense = records.filter((record: any) => getSignals(record).length >= 3).slice(0, 8)
  const remaining = records.slice(8)

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-10 sm:py-14 lg:py-18">
        <div className="section-spacing">
          <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="max-w-4xl space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow-label">Best Explored For</p>
                <span className="chip-readable">Evidence-aware goal hub</span>
              </div>

              <h1 className="max-w-[14ch]">{topic.title}</h1>

              <p className="detail-reading text-[1.05rem] sm:text-lg">
                {topic.description} Rankings are based on semantic relevance, evidence maturity, and profile completeness rather than promotional claims.
              </p>

              <div className="flex flex-wrap gap-2">
                {topic.keywords.map((keyword) => (
                  <PathwayVisualChip key={keyword} pathway={keyword} />
                ))}
              </div>
            </div>
          </section>

          {topRecords.length > 0 ? (
            <section className="compact-section section-rhythm-compact">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow-label">Top Matches</p>
                  <h2 className="compact-heading mt-2">Highest-signal profiles for this research direction.</h2>
                </div>
                <span className="chip-readable">{records.length} matched profiles</span>
              </div>

              <div className="semantic-rail">
                {topRecords.map((record: any) => (
                  <AuthorityCard key={record.slug} record={record} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="compact-section section-rhythm-balanced">
            <div className="space-y-3">
              <p className="eyebrow-label">How to read this hub</p>
              <h2 className="compact-heading">Evidence first, mechanisms in context.</h2>
              <p className="compact-copy">
                This page is designed for research navigation. It does not claim that every listed herb or compound treats a condition; it organizes profiles by semantic relevance, evidence maturity, and pathway context.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="compact-card">
                <p className="eyebrow-label">Evidence maturity</p>
                <p className="mt-2 text-sm leading-6 text-[#46574d]">Profiles with stronger human or clinical evidence are surfaced when available.</p>
              </div>
              <div className="compact-card">
                <p className="eyebrow-label">Mechanism continuity</p>
                <p className="mt-2 text-sm leading-6 text-[#46574d]">Pathway overlap helps guide exploration without converting mechanisms into clinical proof.</p>
              </div>
              <div className="compact-card">
                <p className="eyebrow-label">Safety restraint</p>
                <p className="mt-2 text-sm leading-6 text-[#46574d]">Population context, interactions, and uncertainty remain important even when semantic relevance is strong.</p>
              </div>
            </div>
          </section>

          <ComparisonEcosystemRail
            title="Evidence-forward profiles"
            description="Profiles in this hub with stronger evidence or profile-readiness signals surfaced first."
            records={evidenceForward}
            variant="evidence"
          />

          <ComparisonEcosystemRail
            title="Mechanism-rich profiles"
            description="Profiles with richer mapped pathways and biological context for deeper research traversal."
            records={mechanismDense}
            variant="mechanism"
          />

          <section className="section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Full Goal Cluster</p>
                <h2 className="compact-heading mt-2">Continue exploring the semantic ecosystem.</h2>
              </div>
              <Link href="/explore" className="button-secondary rounded-full px-4 py-2 text-sm">Back to Explore</Link>
            </div>

            {remaining.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {remaining.map((record: any) => (
                  <AuthorityCard key={record.slug} record={record} />
                ))}
              </div>
            ) : (
              <div className="compact-card">
                <p className="compact-copy">This goal hub is ready for expansion as more workbook fields are enriched.</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
