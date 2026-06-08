import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

type EntityType = 'herb' | 'compound'

type ProfileProgressiveDisclosureProps = {
  record: any
  entityType: EntityType
  summary?: string
  effects?: string[]
  mechanisms?: string[]
}

type DisclosureSection = {
  title: string
  eyebrow: string
  summary: string
  items: string[]
  tone?: 'neutral' | 'caution' | 'mechanism' | 'evidence'
}

const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i

function cleanList(value: unknown, limit = 8) {
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

function getEvidenceItems(record: any) {
  return cleanList([
    text(record?.evidence_snapshot),
    text(record?.evidenceSnapshot),
    text(record?.evidence_tier),
    text(record?.evidenceTier),
    text(record?.evidence_grade),
    text(record?.summary_quality),
    text(record?.profile_status),
    text(record?.review_status),
    text(record?.confidence),
    ...list(record?.evidence_notes),
    ...list(record?.study_designs),
    ...list(record?.population_tags),
  ], 7)
}

function getMechanismItems(record: any, provided?: string[]) {
  return cleanList([
    ...(provided || []),
    ...list(record?.mechanism_snapshot),
    ...list(record?.mechanismSnapshot),
    ...list(record?.mechanisms),
    ...list(record?.primary_mechanisms),
    ...list(record?.pathways),
    ...list(record?.targets),
    ...list(record?.biologicalTargets),
  ], 8)
}

function getSafetyItems(record: any) {
  return cleanList([
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.who_should_skip),
    ...list(record?.whoShouldSkip),
    ...list(record?.contraindications),
    ...list(record?.interactions),
    ...list(record?.cautionSignals),
    ...list(record?.safety?.cautionSignals),
    text(record?.safetyNotes),
    text(record?.safety?.notes),
  ], 8)
}

function getContextItems(record: any, effects?: string[]) {
  return cleanList([
    ...(effects || []),
    ...list(record?.best_for),
    ...list(record?.bestFor),
    ...list(record?.works_best_when),
    ...list(record?.worksBestWhen),
    ...list(record?.notable_tradeoffs),
    ...list(record?.notableTradeoffs),
    ...list(record?.common_mistakes),
    ...list(record?.commonMistakes),
    text(record?.time_to_notice),
    text(record?.timeToNotice),
    text(record?.time_to_effect),
  ], 8)
}

function toneClass(tone: DisclosureSection['tone']) {
  if (tone === 'caution') return 'border-amber-700/20 bg-amber-50/75'
  if (tone === 'mechanism') return 'border-blue-700/10 bg-blue-50/45'
  if (tone === 'evidence') return 'border-emerald-700/10 bg-emerald-50/45'
  return 'border-brand-900/10 bg-white/75'
}

function DisclosureBlock({ section }: { section: DisclosureSection }) {
  if (!section.summary && section.items.length === 0) return null

  return (
    <details className={`group rounded-[1.45rem] border p-4 shadow-sm backdrop-blur-xl sm:p-5 ${toneClass(section.tone)}`}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <span className="space-y-2">
          <span className="block text-[0.68rem] font-bold uppercase leading-none tracking-[0.16em] text-brand-800/70">
            {section.eyebrow}
          </span>
          <span className="block text-base font-semibold leading-snug tracking-tight text-ink">
            {section.title}
          </span>
          {section.summary ? (
            <span className="block max-w-2xl text-sm font-normal leading-6 text-[#46574d]">
              {section.summary}
            </span>
          ) : null}
        </span>
        <span className="mt-1 rounded-full border border-brand-900/10 bg-white/70 px-2.5 py-1 text-xs font-bold text-brand-800 transition group-open:rotate-45">
          +
        </span>
      </summary>

      {section.items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-900/10 pt-4">
          {section.items.map((item) => (
            <span key={item} className="chip-readable">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </details>
  )
}

export default function ProfileProgressiveDisclosure({
  record,
  entityType,
  summary = '',
  effects = [],
  mechanisms = [],
}: ProfileProgressiveDisclosureProps) {
  const profileSummary = cleanSummary(summary || record?.summary || record?.description || '', entityType)
  const mechanismItems = getMechanismItems(record, mechanisms)
  const evidenceItems = getEvidenceItems(record)
  const safetyItems = getSafetyItems(record)
  const contextItems = getContextItems(record, effects)
  const safetySummary = safetyItems.length > 0
    ? 'Major caution and interaction signals are kept visible here without forcing every safety detail into the main reading flow.'
    : 'No prominent caution field was found in the current runtime payload; interpretation should still remain educational and context-aware.'

  const sections: DisclosureSection[] = [
    {
      eyebrow: 'Evidence nuance',
      title: 'Show evidence context and limitations',
      summary: firstText(record?.evidence_snapshot, record?.evidenceSnapshot) || 'Evidence details are layered below the quick interpretation so readers can go deeper without being forced through dense context immediately.',
      items: evidenceItems,
      tone: 'evidence',
    },
    {
      eyebrow: 'Mechanism detail',
      title: 'Show pathway and mechanism signals',
      summary: mechanismItems.length > 0
        ? 'Mechanism signals are presented as biological plausibility, not as stand-alone clinical proof.'
        : 'Mechanism detail appears when pathway, target, or mechanistic fields are populated in the workbook.',
      items: mechanismItems,
      tone: 'mechanism',
    },
    {
      eyebrow: 'Safety context',
      title: 'Show caution and avoid-if context',
      summary: safetySummary,
      items: safetyItems,
      tone: CAUTION_PATTERN.test(safetyItems.join(' ')) || safetyItems.length > 0 ? 'caution' : 'neutral',
    },
    {
      eyebrow: 'Practical interpretation',
      title: 'Show use-case and tradeoff context',
      summary: profileSummary
        ? 'This section keeps practical interpretation separate from deeper evidence and mechanism detail.'
        : 'Use-case and timing details appear here when the workbook includes decision-layer fields.',
      items: contextItems,
      tone: 'neutral',
    },
  ]

  if (sections.every((section) => !section.summary && section.items.length === 0)) return null

  return (
    <section className="compact-section section-rhythm-compact">
      <div className="space-y-2">
        <p className="eyebrow-label">Read Deeper</p>
        <h2 className="compact-heading">Details without the wall of text.</h2>
        <p className="compact-copy">
          The main page keeps interpretation first. Expand only when you need deeper evidence, safety, or practical context.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {sections.map((section) => (
          <DisclosureBlock key={section.title} section={section} />
        ))}
      </div>
    </section>
  )
}
