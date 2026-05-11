import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

type EntityType = 'herb' | 'compound'

type Props = {
  record: any
  entityType: EntityType
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i

function cleanItems(value: unknown, limit = 6) {
  return unique(
    list(value)
      .map(formatDisplayLabel)
      .map((item) => item.trim())
      .filter((item) => isClean(item) && !WEAK_PATTERN.test(item)),
  ).slice(0, limit)
}

function firstText(...values: unknown[]) {
  return values.map(text).find(Boolean) || ''
}

function evidenceLabel(record: any) {
  return formatDisplayLabel(
    firstText(
      record?.evidence_tier,
      record?.evidenceTier,
      record?.evidence_grade,
      record?.evidenceLevel,
      record?.confidenceTier,
      record?.confidence,
      'Evidence context available',
    ),
  )
}

function safetyLabel(record: any) {
  return formatDisplayLabel(
    firstText(
      record?.safety_level,
      record?.safetyLevel,
      record?.safety_rating,
      record?.safetyRating,
      record?.safety,
      'Safety context available',
    ),
  )
}

function timeLabel(record: any) {
  return formatDisplayLabel(
    firstText(
      record?.time_to_effect,
      record?.timeToEffect,
      record?.onset,
      record?.typical_research_window,
      record?.research_window,
      'Varies by outcome and study context',
    ),
  )
}

function mechanismConfidence(record: any, mechanisms: string[]) {
  const explicit = firstText(record?.mechanism_confidence, record?.mechanismConfidence)
  if (explicit) return formatDisplayLabel(explicit)
  if (mechanisms.length >= 4) return 'Moderate mechanistic context'
  if (mechanisms.length > 0) return 'Preliminary mechanistic context'
  return 'Mechanism context limited'
}

function bestFor(record: any, effects: string[]) {
  return cleanItems([
    ...list(record?.best_for),
    ...list(record?.bestFor),
    ...list(record?.primary_effects),
    ...effects,
  ], 4)
}

function cautionSignals(record: any) {
  return cleanItems([
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.contraindications),
    ...list(record?.interactions),
    text(record?.safetyNotes),
  ], 4)
}

function whyItMattersText(record: any, entityType: EntityType, summary: string, effects: string[]) {
  const focus = bestFor(record, effects)
  if (focus.length > 0) {
    return `Interest in ${formatDisplayLabel(record?.name || record?.slug)} largely centers around ${focus.slice(0, 4).join(', ')}. These signals are framed as research and decision-support context, not broad outcome promises.`
  }
  if (summary) return summary
  return `This ${entityType} profile separates practical interest, mechanism plausibility, evidence maturity, and safety context in a compact editorial layer.`
}

function researchConfidenceText(record: any, effects: string[]) {
  const strongest = cleanItems([
    ...list(record?.strongest_evidence_for),
    ...list(record?.human_evidence_for),
    ...list(record?.primary_effects),
    ...effects,
  ], 3)
  const mixed = cleanItems([
    ...list(record?.less_compelling_for),
    ...list(record?.mixed_evidence_for),
    ...list(record?.research_gaps),
  ], 3)

  const strongText = strongest.length > 0
    ? `Evidence appears most relevant for ${strongest.join(', ')}.`
    : 'Evidence should be interpreted conservatively, especially where mechanism language is stronger than direct outcome data.'

  const mixedText = mixed.length > 0
    ? ` Evidence remains less settled for ${mixed.join(', ')}.`
    : ' Claims outside the primary evidence context should remain measured.'

  return `${strongText}${mixedText}`
}

function mechanismText(mechanisms: string[]) {
  if (mechanisms.length === 0) {
    return 'Mechanism context is limited in the current runtime data, so the profile should lean more heavily on evidence maturity and safety framing.'
  }
  return `Research context points toward ${mechanisms.slice(0, 4).join(', ')}. These mechanisms help explain biological plausibility, but mechanism framing alone is not the same as direct outcome evidence.`
}

function safetyText(signals: string[], safety: string) {
  if (signals.length > 0) {
    return `Safety context highlights ${signals.slice(0, 3).join(', ')}. Interpretation should remain conservative and account for dose, formulation, population, and interaction context.`
  }
  if (safety && !WEAK_PATTERN.test(safety)) {
    return `${safety}. Safety framing is kept separate from benefit framing so the page does not overstate certainty.`
  }
  return 'Safety context is presented conservatively and separately from benefit framing to avoid overstating certainty.'
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#46574d]">{value}</p>
    </div>
  )
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="chip-readable">{item}</span>
      ))}
    </div>
  )
}

function EditorialCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-premium space-y-4 p-5 sm:p-6">
      <p className="eyebrow-label">{title}</p>
      {children}
    </section>
  )
}

export default function AuthorityEditorialLayer({ record, entityType, effects: providedEffects = [], mechanisms: providedMechanisms = [], summary: providedSummary = '' }: Props) {
  const effects = cleanItems([
    ...providedEffects,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.primaryActions),
  ], 6)
  const mechanisms = cleanItems([
    ...providedMechanisms,
    ...list(record?.mechanisms),
    ...list(record?.primary_mechanisms),
    ...list(record?.pathways),
    ...list(record?.mechanism_targets),
  ], 8)
  const summary = cleanSummary(providedSummary || record?.summary || record?.description || '', entityType)
  const evidence = evidenceLabel(record)
  const safety = safetyLabel(record)
  const timeframe = timeLabel(record)
  const mechanismConfidenceValue = mechanismConfidence(record, mechanisms)
  const bestForItems = bestFor(record, effects)
  const cautionItems = cautionSignals(record)

  return (
    <section className="space-y-5">
      <section className="card-premium space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Decision Snapshot</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Fast scientific interpretation</h2>
          <p className="max-w-3xl text-sm leading-7 text-[#5b6b61]">
            A compact, evidence-aware reading of the profile before deeper mechanism and safety context.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SnapshotItem label="Evidence strength" value={evidence} />
          <SnapshotItem label="Safety profile" value={safety} />
          <SnapshotItem label="Research window" value={timeframe} />
          <SnapshotItem label="Mechanism confidence" value={mechanismConfidenceValue} />
          <SnapshotItem label="Best known for" value={bestForItems.length > 0 ? bestForItems.slice(0, 3).join(', ') : 'Outcome context still developing'} />
          <SnapshotItem label="Interpretation stance" value="Conservative, educational, and evidence-calibrated" />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <EditorialCard title="Why It Matters">
          <p className="detail-reading text-[#46574d]">{whyItMattersText(record, entityType, summary, effects)}</p>
          <ChipList items={bestForItems} />
        </EditorialCard>
        <EditorialCard title="Research Confidence">
          <p className="detail-reading text-[#46574d]">{researchConfidenceText(record, effects)}</p>
        </EditorialCard>
        <EditorialCard title="Potential Mechanisms">
          <p className="detail-reading text-[#46574d]">{mechanismText(mechanisms)}</p>
          <ChipList items={mechanisms.slice(0, 6)} />
        </EditorialCard>
        <EditorialCard title="Safety Interpretation">
          <p className="detail-reading text-[#46574d]">{safetyText(cautionItems, safety)}</p>
          <ChipList items={cautionItems} />
        </EditorialCard>
      </div>
    </section>
  )
}
