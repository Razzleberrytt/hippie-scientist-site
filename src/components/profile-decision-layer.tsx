import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, list, text } from '@/lib/display-utils'
import { cleanEditorialText, dedupeEditorialItems, isDuplicateTitleBody, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
import { getSemanticOrchestrationSignals } from '../lib/semantic-orchestration'
import type { RuntimeRecord } from '../types/content'

type EntityType = 'herb' | 'compound'

type ProfileDecisionLayerProps = {
  record: RuntimeRecord
  entityType: EntityType
  relatedRecords?: RuntimeRecord[]
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

type DecisionItem = {
  label: string
  value: string
  tone?: 'neutral' | 'strong' | 'caution' | 'muted'
}

const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i

function cleanList(value: unknown, limit = 6) {
  return dedupeEditorialItems(
    list(value)
      .map(formatDisplayLabel),
    limit,
  )
}

function getName(record: RuntimeRecord) {
  const name = formatDisplayLabel(record?.displayName || record?.name || record?.slug)
  return isRenderableText(name) ? name : ''
}

function getSummary(record: RuntimeRecord, entityType: EntityType, fallback = '') {
  return cleanSummary(
    fallback ||
      (record?.quick_take as string) ||
      (record?.quickTake as string) ||
      (record?.decision_summary as string) ||
      (record?.decisionSummary as string) ||
      record?.summary ||
      record?.description ||
      '',
    entityType,
  )
}

function getBestFor(record: RuntimeRecord, provided?: string[]) {
  return cleanList([
    ...(provided || []),
    ...list(record?.best_for),
    ...list(record?.bestFor),
    ...list(record?.primary_effects),
    ...list(record?.effects),
  ], 4)
}

function getAvoidIf(record: RuntimeRecord) {
  return cleanList([
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.who_should_skip),
    ...list(record?.whoShouldSkip),
    ...list(record?.contraindications),
    ...list(record?.interactions),
    text(record?.safetyNotes),
  ], 3)
}

function getMechanismSnapshot(record: RuntimeRecord, provided?: string[]) {
  return cleanList([
    ...(provided || []),
    ...list(record?.mechanism_snapshot),
    ...list(record?.mechanismSnapshot),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ], 3)
}

function getCompareTo(record: RuntimeRecord, relatedRecords: RuntimeRecord[] = []) {
  const explicit = cleanList([
    ...list(record?.compare_to),
    ...list(record?.compareTo),
    ...list(record?.gentler_alternative),
    ...list(record?.gentlerAlternative),
    ...list(record?.stronger_alternative),
    ...list(record?.strongerAlternative),
  ], 3)

  if (explicit.length > 0) return explicit

  return dedupeEditorialItems(
    relatedRecords.map((item) => formatDisplayLabel(item?.name || item?.slug)),
    3,
  )
}

function getEvidenceText(record: RuntimeRecord) {
  return cleanEditorialText(formatDisplayLabel(
    record?.evidence_snapshot ||
      record?.evidenceSnapshot ||
      record?.evidence_tier ||
      record?.evidenceTier ||
      record?.confidence ||
      record?.summary_quality ||
      'Evidence review available',
  ))
}

function getSafetyText(record: RuntimeRecord, avoidIf: string[]) {
  return cleanEditorialText(formatDisplayLabel(
    record?.safety_snapshot ||
      record?.safetySnapshot ||
      record?.safety_level ||
      record?.safetyLevel ||
      record?.safety?.confidence ||
      (avoidIf.length > 0 ? 'Caution context available' : 'Safety review available'),
  ))
}

function getTimeToNotice(record: RuntimeRecord) {
  return cleanEditorialText(formatDisplayLabel(
    record?.time_to_notice ||
      record?.timeToNotice ||
      record?.time_to_effect ||
      record?.timeToEffect ||
      record?.onset ||
      'Timing varies by context',
  ))
}

function evidenceTone(value: string): DecisionItem['tone'] {
  const normalized = value.toLowerCase()
  if (normalized.includes('strong') || normalized.includes('high') || normalized.includes('clinical')) return 'strong'
  if (normalized.includes('limited') || normalized.includes('early') || normalized.includes('sparse')) return 'muted'
  return 'neutral'
}

function safetyTone(value: string, avoidIf: string[]): DecisionItem['tone'] {
  return CAUTION_PATTERN.test(value) || avoidIf.length > 0 ? 'caution' : 'neutral'
}

function decisionCardClass(tone: DecisionItem['tone'] = 'neutral') {
  if (tone === 'strong') return 'border-emerald-700/15 bg-emerald-50/70 text-emerald-950'
  if (tone === 'caution') return 'border-amber-700/20 bg-amber-50/80 text-amber-950'
  if (tone === 'muted') return 'border-brand-900/10 bg-white/60 text-[#5b6b61]'
  return 'border-brand-900/10 bg-paper-50/80 text-[#33443a]'
}

function DecisionCard({ item }: { item: DecisionItem }) {
  const label = cleanEditorialText(item.label)
  const value = cleanEditorialText(item.value)

  if (!shouldRenderCard(label, value)) return null

  return (
    <div className={`rounded-[0.9rem] border p-3 ${decisionCardClass(item.tone)}`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] opacity-65">{label}</p>
      {isDuplicateTitleBody(label, value) ? null : (
        <p className="mt-1.5 text-sm font-semibold leading-5">{value}</p>
      )}
    </div>
  )
}

function formatListValue(items: string[], fallback: string) {
  const clean = dedupeEditorialItems(items, 3)
  return clean.length > 0 ? clean.join(', ') : fallback
}

function getRelatedHref(entityType: EntityType, slug: string) {
  return `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${slug}`
}

export function ProfileDecisionLayer({
  record,
  entityType,
  relatedRecords = [],
  effects = [],
  mechanisms = [],
  summary = '',
}: ProfileDecisionLayerProps) {
  const name = getName(record)
  const quickTake = getSummary(record, entityType, summary)
  const bestFor = getBestFor(record, effects)
  const avoidIf = getAvoidIf(record)
  const mechanismSnapshot = getMechanismSnapshot(record, mechanisms)
  const compareTo = getCompareTo(record, relatedRecords)
  const evidence = getEvidenceText(record)
  const safety = getSafetyText(record, avoidIf)
  const timing = getTimeToNotice(record)
  const orchestration = getSemanticOrchestrationSignals(record)

  const decisionItems: DecisionItem[] = [
    { label: 'Best For', value: formatListValue(bestFor, 'Context-dependent exploration') },
    { label: 'Evidence Strength', value: evidence, tone: evidenceTone(evidence) },
    { label: 'Safety Snapshot', value: safety, tone: safetyTone(safety, avoidIf) },
    { label: 'Time To Notice', value: timing, tone: 'neutral' },
    { label: 'Mechanism Snapshot', value: formatListValue(mechanismSnapshot, 'Mechanism context available') },
    { label: 'Compared To', value: formatListValue(compareTo, 'Related profiles available') },
    { label: 'Avoid If', value: formatListValue(avoidIf, 'No prominent avoid-if signal in current profile'), tone: avoidIf.length > 0 ? 'caution' : 'muted' },
    {
      label: 'Research Confidence',
      value: orchestration.authorityScore >= 0.65
        ? 'Higher-confidence profile with evidence boundaries preserved'
        : orchestration.discoveryScore >= 0.45
          ? 'Useful discovery profile with context limits visible'
          : 'Exploratory profile; interpret conservatively',
      tone: orchestration.authorityScore >= 0.65 ? 'strong' : orchestration.discoveryScore >= 0.45 ? 'neutral' : 'muted',
    },
  ]

  const topRelated = relatedRecords
    .filter((item) => isRenderableText(item?.slug) && isRenderableText(item?.name || item?.slug))
    .slice(0, 3)

  return (
    <section className="card-premium overflow-hidden p-0 shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1fr_0.7fr]">
        <div className="space-y-4 p-4 sm:p-5 lg:p-6">
          <div className="space-y-2">
            <p className="eyebrow-label">Decision Layer</p>
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {name ? `${name}: quick read` : 'Quick read'}
            </h2>
            {isRenderableText(quickTake) ? (
              <p className="max-w-3xl text-sm leading-6 text-[#46574d]">
                {quickTake}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {decisionItems.map((item) => (
              <DecisionCard key={item.label} item={item} />
            ))}
          </div>
        </div>

        <aside className="border-t border-brand-900/10 bg-brand-50/40 p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="eyebrow-label">Guided Next Step</p>
              <p className="text-sm leading-6 text-[#46574d]">
                Compare nearby profiles before acting on mechanisms or research depth.
              </p>
            </div>

            {topRelated.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-900/55">Compare next</p>
                <div className="space-y-2">
                  {topRelated.map((item) => {
                    const label = cleanEditorialText(formatDisplayLabel(item?.name || item?.slug))
                    const slug = item?.slug
                    const targetType = item?.entityType === 'herb' || item?.entityType === 'compound' ? item.entityType : entityType
                    if (!isRenderableText(label) || !isRenderableText(slug)) return null

                    return (
                      <Link
                        key={slug}
                        href={getRelatedHref(targetType, slug)}
                        className="block rounded-[0.85rem] border border-brand-900/10 bg-white/70 px-3 py-2 text-sm font-semibold text-[#33443a] transition hover:border-brand-700/25 hover:bg-white hover:text-brand-800"
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}
