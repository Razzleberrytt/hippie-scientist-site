import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { rankSemanticRecommendations } from '@/lib/semantic-orchestration'
import type { RuntimeRecord } from '@/types/content'

type EntityType = 'herb' | 'compound'

type ProfileSemanticRailProps = {
  record: RuntimeRecord
  entityType: EntityType
  relatedRecords?: RuntimeRecord[]
  comparisonRecords?: RuntimeRecord[]
  stackRecords?: RuntimeRecord[]
}

function getHref(item: RuntimeRecord, fallbackType: EntityType) {
  const type = item?.entityType === 'herb' || item?.entityType === 'compound' ? item.entityType : fallbackType
  return `/${type === 'herb' ? 'herbs' : 'compounds'}/${item.slug}`
}

function getName(item: RuntimeRecord) {
  return formatDisplayLabel(item?.displayName || item?.name || item?.slug)
}

function getSignals(item: RuntimeRecord) {
  return unique([
    ...list(item?.primary_effects),
    ...list(item?.effects),
    ...list(item?.mechanisms),
    ...list(item?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 3)
}

function RailCard({ item, fallbackType, reason }: { item: RuntimeRecord; fallbackType: EntityType; reason?: string }) {
  if (!item?.slug) return null

  const name = getName(item)
  if (!name || !isClean(name)) return null

  const summary = cleanSummary(item?.summary || item?.description || '', item?.entityType === 'compound' ? 'compound' : fallbackType)
  const signals = getSignals(item)

  return (
    <Link href={getHref(item, fallbackType)} className="semantic-rail-card group">
      <p className="eyebrow-label">{reason || 'Semantic neighbor'}</p>
      <h3 className="mt-2 max-w-none text-base font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-700">
        {name}
      </h3>
      {summary ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#46574d]">
          {summary}
        </p>
      ) : null}
      {signals.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {signals.map((signal) => (
            <span key={signal} className="rounded-full border border-brand-900/10 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-[#33443a]">
              {signal}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function RailSection({ title, description, items, entityType, reason }: {
  title: string
  description: string
  items: RuntimeRecord[]
  entityType: EntityType
  reason: string
}) {
  const visible = items.filter((item) => item?.slug).slice(0, 8)
  if (visible.length === 0) return null

  return (
    <section className="compact-section section-rhythm-compact">
      <div className="space-y-2">
        <p className="eyebrow-label">{title}</p>
        <p className="compact-copy">{description}</p>
      </div>
      <div className="semantic-rail">
        {visible.map((item) => (
          <RailCard key={`${reason}-${item.slug}`} item={item} fallbackType={entityType} reason={reason} />
        ))}
      </div>
    </section>
  )
}

export default function ProfileSemanticRail({
  record,
  entityType,
  relatedRecords = [],
  comparisonRecords = [],
  stackRecords = [],
}: ProfileSemanticRailProps) {
  const rankedRelated = rankSemanticRecommendations(record, relatedRecords, 8).map((candidate) => ({
    ...candidate.record,
    semanticReason: candidate.reasons.slice(0, 2).join(' + '),
  }))

  const compactComparisons = comparisonRecords.slice(0, 8)
  const compactStacks = stackRecords.slice(0, 6)

  if (rankedRelated.length === 0 && compactComparisons.length === 0 && compactStacks.length === 0) return null

  return (
    <div className="section-rhythm-balanced">
      <RailSection
        title="Compare Next"
        description="Compact semantic neighbors ranked by evidence, mechanism overlap, ecosystem continuity, and discovery diversity."
        items={rankedRelated}
        entityType={entityType}
        reason="Compare next"
      />

      <RailSection
        title="Comparison Candidates"
        description="Evidence-informed comparison prompts for side-by-side exploration, not superiority claims."
        items={compactComparisons}
        entityType={entityType}
        reason="Comparison"
      />

      <RailSection
        title="Stack / Synergy Context"
        description="Exploratory graph relationships surfaced as context only, not protocol or dosing advice."
        items={compactStacks}
        entityType={entityType}
        reason="Stack context"
      />
    </div>
  )
}
