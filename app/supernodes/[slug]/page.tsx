import Link from 'next/link'
import { notFound } from 'next/navigation'
import { semanticSupernodes, getSemanticSupernode } from '@/lib/semantic-supernodes'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import ComparisonEcosystemRail from '@/components/comparison-ecosystem-rail'
import { getEcosystemVisual } from '@/lib/ecosystem-visuals'

export function generateStaticParams() {
  return semanticSupernodes.map((node) => ({ slug: node.slug }))
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
    record?.summary_quality,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).join(' ')
}

function score(record: any, keywords: string[]) {
  const haystack = corpus(record)
  let total = 0

  keywords.forEach((keyword) => {
    if (haystack.includes(keyword.toLowerCase())) total += 2
  })

  if (/strong|clinical|human|high/i.test(text(record?.evidence_tier || record?.summary_quality))) total += 3
  if (/complete|strong|high/i.test(text(record?.profile_status || record?.summary_quality))) total += 2

  return total
}

function getName(record: any) {
  return formatDisplayLabel(record?.displayName || record?.name || record?.slug)
}

function getSummary(record: any) {
  return cleanSummary(record?.summary || record?.description || '', record?.entityType === 'compound' ? 'compound' : 'herb')
}

function getSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 5)
}

function href(record: any) {
  return `/${record?.entityType === 'compound' ? 'compounds' : 'herbs'}/${record.slug}`
}

function evidenceLabel(record: any) {
  return formatDisplayLabel(record?.evidence_tier || record?.summary_quality || 'Evidence context')
}

function evidenceClass(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('strong') || normalized.includes('clinical') || normalized.includes('high')) return 'evidence-pill-strong'
  if (normalized.includes('moderate') || normalized.includes('human')) return 'evidence-pill-moderate'
  return 'chip-readable'
}

function SupernodeCard({ record }: { record: any }) {
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
          {getSummary(record) || 'Evidence-aware semantic profile connected to this supernode.'}
        </p>
      </div>

      {signals.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
          {signals.map((signal) => (
            <PathwayVisualChip key={signal} pathway={signal} />
          ))}
        </div>
      ) : null}
    </Link>
  )
}

export default async function SemanticSupernodePage({ params }: any) {
  const node = getSemanticSupernode(params.slug)
  if (!node) notFound()

  const { allRecords } = await getUnifiedRuntimeRecords()

  const ranked = allRecords
    .filter((record: any) => getRuntimeVisibility(record).canRender)
    .map((record: any) => ({ ...record, entityType: inferEntityType(record) }))
    .map((record: any) => ({ record, score: score(record, node.keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map((item) => item.record)

  const top = ranked.slice(0, 10)
  const evidenceForward = ranked.filter((record: any) => /strong|clinical|human|high/i.test(text(record?.evidence_tier || record?.summary_quality))).slice(0, 8)
  const pathwayDense = ranked.filter((record: any) => getSignals(record).length >= 4).slice(0, 8)
  const visual = getEcosystemVisual(node.slug)

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-10 sm:py-14 lg:py-18">
        <div className="section-spacing">
          <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div className="max-w-4xl space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="eyebrow-label">Semantic Supernode</p>
                  <span className="chip-readable">{node.category}</span>
                </div>

                <h1 className="max-w-[14ch]">{node.title}</h1>

                <p className="detail-reading text-[1.05rem] sm:text-lg">
                  {node.description} This authority hub is organized around semantic continuity, evidence maturity, and pathway relationships rather than simplistic category labels.
                </p>

                <div className="flex flex-wrap gap-2">
                  {node.keywords.map((keyword) => (
                    <PathwayVisualChip key={keyword} pathway={keyword} />
                  ))}
                </div>
              </div>

              <div
                className="flex min-h-[160px] items-center justify-center rounded-[2rem] border border-brand-900/10 shadow-sm"
                style={{ background: visual.gradient, color: visual.accent }}
              >
                <span className="text-6xl">{visual.glyph}</span>
              </div>
            </div>
          </section>

          <section className="compact-section section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Primary Semantic Cluster</p>
                <h2 className="compact-heading mt-2">High-signal profiles in this ecosystem.</h2>
              </div>
              <span className="chip-readable">{ranked.length} connected profiles</span>
            </div>

            <div className="semantic-rail">
              {top.map((record: any) => (
                <SupernodeCard key={record.slug} record={record} />
              ))}
            </div>
          </section>

          <ComparisonEcosystemRail
            title="Evidence-forward ecosystem profiles"
            description="Profiles with stronger evidence maturity and semantic relevance surfaced first."
            records={evidenceForward}
            variant="evidence"
          />

          <ComparisonEcosystemRail
            title="Mechanism-dense profiles"
            description="Profiles with richer mapped pathways, mechanisms, and semantic continuity."
            records={pathwayDense}
            variant="mechanism"
          />

          <section className="section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Extended Ecosystem</p>
                <h2 className="compact-heading mt-2">Continue traversing the authority network.</h2>
              </div>
              <Link href="/explore" className="button-secondary rounded-full px-4 py-2 text-sm">Back to Explore</Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ranked.slice(10, 34).map((record: any) => (
                <SupernodeCard key={record.slug} record={record} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
