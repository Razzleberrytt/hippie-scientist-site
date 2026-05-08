import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'

type EntityType = 'herb' | 'compound'

type ProfileAuthoritySectionsProps = {
  record: any
  entityType: EntityType
  relatedRecords?: any[]
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|no strong effects established yet|insufficient|needs review|minimal/i

function cleanList(value: unknown, limit = 6) {
  return unique(
    list(value)
      .map(formatDisplayLabel)
      .map(item => item.trim())
      .filter(item => isClean(item) && !WEAK_PATTERN.test(item)),
  ).slice(0, limit)
}

function getSummary(record: any, fallback = '', entityType: EntityType) {
  return cleanSummary(fallback || record?.summary || record?.description || '', entityType)
}

function getPrimaryEffects(record: any, provided: string[] | undefined) {
  return cleanList([
    ...(provided || []),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.primaryActions),
  ], 6)
}

function getMechanisms(record: any, provided: string[] | undefined) {
  return cleanList([
    ...(provided || []),
    ...list(record?.mechanisms),
    ...list(record?.primary_mechanisms),
    ...list(record?.pathways),
  ], 5)
}

function getSafetySignals(record: any) {
  return cleanList([
    ...list(record?.safety?.cautionSignals),
    ...list(record?.cautionSignals),
    ...list(record?.avoid),
    ...list(record?.interactions),
    text(record?.safety?.notes),
    text(record?.safety),
  ], 5)
}

function getEvidenceText(record: any) {
  return formatDisplayLabel(
    record?.evidence_tier ||
      record?.safety?.evidenceTier ||
      record?.evidenceTier ||
      record?.confidence ||
      record?.safety?.confidence ||
      'Evidence context available',
  )
}

function getProfileDensity({
  summary,
  effects,
  mechanisms,
  safetySignals,
}: {
  summary: string
  effects: string[]
  mechanisms: string[]
  safetySignals: string[]
}) {
  const score =
    (summary ? 2 : 0) +
    Math.min(effects.length, 3) +
    Math.min(mechanisms.length, 2) +
    Math.min(safetySignals.length, 2)

  if (score >= 6) return 'comprehensive'
  if (score >= 3) return 'developing'
  return 'concise'
}

function getProfileLabel(density: string) {
  if (density === 'comprehensive') return 'Comprehensive research profile'
  if (density === 'developing') return 'Developing evidence profile'
  return 'Concise mechanistic overview'
}

function getRelatedHref(entityType: EntityType, slug: string) {
  return `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${slug}`
}

function AuthorityCard({
  title,
  description,
  compact = false,
  children,
}: {
  title: string
  description?: string
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={`card-premium ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'}`}>
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="eyebrow-label">{title}</p>
          {description ? (
            <p className="max-w-3xl text-sm leading-7 text-[#5b6b61]">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}

function SignalList({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item} className="chip-readable">
          {item}
        </span>
      ))}
    </div>
  )
}

function ScientificSnapshot({ evidence, effects, mechanisms, safetySignals, density }: any) { return null }

function HighIntentFraming({
  effects,
  mechanisms,
}: {
  effects: string[]
  mechanisms: string[]
}) {
  const sections = [
    {
      title: 'Best Known For',
      items: effects.slice(0, 3),
    },
    {
      title: 'Often Explored For',
      items: effects.slice(3, 6),
    },
    {
      title: 'Commonly Associated With',
      items: mechanisms.slice(0, 3),
    },
  ].filter(section => section.items.length > 0)

  if (sections.length === 0) return null

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map(section => (
        <AuthorityCard
          key={section.title}
          title={section.title}
          compact
        >
          <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
            {section.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AuthorityCard>
      ))}
    </div>
  )
}

export default function ProfileAuthoritySections() { return null }
