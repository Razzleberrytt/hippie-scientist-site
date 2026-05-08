import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { clusterMechanisms } from '@/lib/mechanism-clusters'
import {
  buildDiscoveryNarrative,
  buildEvidenceContext,
  buildMechanismContext,
  buildPracticalRelevance,
  buildScientificSummary,
} from '@/lib/profile-synthesis'

type EntityType = 'herb' | 'compound'

type ProfileAuthoritySectionsProps = {
  record: any
  entityType: EntityType
  relatedRecords?: any[]
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

const WEAK_PATTERN = /research[-\\s]?pending|placeholder|unknown|not specified|not available|no strong effects established yet|insufficient|needs review|minimal/i

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
  ], 8)
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

function getAuthoritySignals(record: any, density: string) {
  const signals = []

  const evidence = text(record?.evidence_tier || record?.evidenceTier)
  const safety = text(record?.safety?.confidence || record?.safety)

  if (/human|clinical|moderate|strong/i.test(evidence)) {
    signals.push('Clinically Studied')
  }

  if (/mechan/i.test(evidence) || density === 'concise') {
    signals.push('Mechanistic Evidence')
  }

  if (/traditional|ayurveda|tcm/i.test(text(record?.traditional_use))) {
    signals.push('Traditional Use Context')
  }

  if (/emerging|preliminary|limited/i.test(evidence)) {
    signals.push('Emerging Research')
  }

  if (/caution|interaction|avoid|warning/i.test(safety)) {
    signals.push('Safety Sensitive')
  }

  if (density === 'comprehensive') {
    signals.push('High Confidence Profile')
  }

  return unique(signals).slice(0, 5)
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

function AuthoritySignals({ signals }: { signals: string[] }) {
  if (signals.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {signals.map(signal => (
        <span
          key={signal}
          className="rounded-full border border-brand-900/10 bg-brand-50/60 px-3 py-1 text-xs font-semibold tracking-wide text-brand-900/70"
        >
          {signal}
        </span>
      ))}
    </div>
  )
}

function MechanismClusters({ mechanisms }: { mechanisms: string[] }) {
  const clusters = clusterMechanisms(mechanisms)

  if (clusters.length === 0) return null

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {clusters.slice(0, 4).map(group => (
        <div
          key={group.cluster}
          className="surface-subtle rounded-2xl border border-brand-900/10 p-4"
        >
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">
            {group.cluster}
          </h3>
          <div className="mt-3">
            <SignalList items={group.items.slice(0, 4)} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ScientificSnapshot({
  evidence,
  effects,
  mechanisms,
  safetySignals,
  density,
  authoritySignals,
  synthesis,
}: {
  evidence: string
  effects: string[]
  mechanisms: string[]
  safetySignals: string[]
  density: string
  authoritySignals: string[]
  synthesis: string
}) {
  return (
    <AuthorityCard
      title="Scientific Snapshot"
      description={synthesis || 'A concise authority-style overview balancing evidence framing, mechanism context, and safety readability.'}
      compact={density === 'concise'}
    >
      <AuthoritySignals signals={authoritySignals} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">
            Profile quality
          </p>
          <p className="mt-2 text-sm leading-7 text-[#46574d]">
            {getProfileLabel(density)}
          </p>
        </div>

        <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">
            Evidence context
          </p>
          <p className="mt-2 text-sm leading-7 text-[#46574d]">
            {evidence}
          </p>
        </div>

        {effects.length > 0 ? (
          <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">
              Best known for
            </p>
            <p className="mt-2 text-sm leading-7 text-[#46574d]">
              {effects.slice(0, 2).join(', ')}
            </p>
          </div>
        ) : null}

        {safetySignals.length > 0 ? (
          <div className="rounded-2xl border border-amber-700/15 bg-amber-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/60">
              Safety snapshot
            </p>
            <p className="mt-2 text-sm leading-7 text-[#5b4632]">
              {safetySignals.slice(0, 2).join(', ')}
            </p>
          </div>
        ) : null}
      </div>

      {mechanisms.length > 0 ? (
        <MechanismClusters mechanisms={mechanisms.slice(0, density === 'concise' ? 3 : 8)} />
      ) : null}
    </AuthorityCard>
  )
}

function HighIntentFraming({ effects, mechanisms }: { effects: string[]; mechanisms: string[] }) {
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
      title: 'Mechanism Signals',
      items: mechanisms.slice(0, 4),
    },
  ].filter(section => section.items.length > 0)

  if (sections.length === 0) return null

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map(section => (
        <AuthorityCard key={section.title} title={section.title} compact>
          <SignalList items={section.items} />
        </AuthorityCard>
      ))}
    </div>
  )
}

function WhyItMatters({
  summary,
  effects,
  mechanisms,
  entityType,
  compact = false,
  practicalRelevance,
  mechanismContext,
}: any) {
  if (!summary && effects.length === 0 && mechanisms.length === 0) return null

  return (
    <AuthorityCard
      title="Why It Matters"
      compact={compact}
      description={practicalRelevance || 'Mechanism-level findings are separated from stronger human-evidence framing to reduce hype and improve scientific credibility.'}
    >
      {summary ? <p className="detail-reading text-[#46574d]">{summary}</p> : null}

      {!compact ? (
        <div className="grid gap-4 pt-2 md:grid-cols-2">
          {effects.length > 0 ? (
            <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">
                Strongest researched applications
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#46574d]">
                {practicalRelevance || `${effects.slice(0, 3).join(', ')} are among the clearest high-interest signals currently associated with this ${entityType} profile.`}
              </p>
            </div>
          ) : null}

          {mechanisms.length > 0 ? (
            <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">
                Mechanism context
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#46574d]">
                {mechanismContext || `Signals such as ${mechanisms.slice(0, 3).join(', ')} may help explain biological plausibility, but mechanism framing alone should not be interpreted as strong clinical proof.`}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </AuthorityCard>
  )
}

function DiscoveryRails({ relatedRecords, entityType, compact = false, narrative = '' }: any) {
  const visible = (relatedRecords || [])
    .filter((item: any) => item?.slug && isClean(formatDisplayLabel(item?.name || item?.slug)))
    .slice(0, compact ? 3 : 6)

  if (visible.length === 0) return null

  return (
    <AuthorityCard
      title="Internal Discovery"
      compact={compact}
      description={narrative || 'Related profiles strengthen semantic authority and internal discovery depth.'}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item: any) => {
          const overlap = cleanList(item.relatedOverlap || item.overlap || item.effects || item.mechanisms, 2)
          const targetType = item.entityType === 'herb' || item.entityType === 'compound'
            ? item.entityType
            : entityType

          return (
            <Link
              key={item.slug}
              href={getRelatedHref(targetType, item.slug)}
              className="surface-subtle group rounded-2xl border border-brand-900/10 p-4 transition hover:border-brand-700/30 hover:bg-white/70"
            >
              <EvidenceBadgeGroup record={item} compact />

              <h3 className="mt-3 text-lg font-semibold text-ink transition group-hover:text-brand-700">
                {formatDisplayLabel(item.name || item.slug)}
              </h3>

              {overlap.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {overlap.map(signal => (
                    <span key={signal} className="chip-readable">
                      {signal}
                    </span>
                  ))}
                </div>
              ) : null}

              <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#46574d]">
                {cleanSummary(item.summary || item.description || '', targetType)}
              </p>
            </Link>
          )
        })}
      </div>
    </AuthorityCard>
  )
}

export function MonetizationInsertionZone({ zone }: { zone: string }) {
  return <div hidden data-profile-insertion-zone={zone} />
}

export default function ProfileAuthoritySections({
  record,
  entityType,
  relatedRecords = [],
  effects: providedEffects,
  mechanisms: providedMechanisms,
  summary: providedSummary,
}: ProfileAuthoritySectionsProps) {
  const summary = getSummary(record, providedSummary, entityType)
  const effects = getPrimaryEffects(record, providedEffects)
  const mechanisms = getMechanisms(record, providedMechanisms)
  const safetySignals = getSafetySignals(record)
  const evidence = getEvidenceText(record)

  const density = getProfileDensity({
    summary,
    effects,
    mechanisms,
    safetySignals,
  })

  const compact = density === 'concise'
  const authoritySignals = getAuthoritySignals(record, density)
  const synthesisInput = {
    summary,
    evidenceTier: evidence,
    effects,
    mechanisms,
    pathways: cleanList(record?.pathways, 5),
    safety: safetySignals,
    density,
  }

  const scientificSummary = buildScientificSummary(synthesisInput)
  const evidenceContext = buildEvidenceContext(synthesisInput)
  const practicalRelevance = buildPracticalRelevance(synthesisInput)
  const mechanismContext = buildMechanismContext(synthesisInput)
  const discoveryNarrative = buildDiscoveryNarrative(relatedRecords.length)

  const hasContent =
    Boolean(summary) ||
    effects.length > 0 ||
    mechanisms.length > 0 ||
    safetySignals.length > 0 ||
    relatedRecords.length > 0

  if (!hasContent) return null

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <ScientificSnapshot
        evidence={evidenceContext || evidence}
        effects={effects}
        mechanisms={mechanisms}
        safetySignals={safetySignals}
        density={density}
        authoritySignals={authoritySignals}
        synthesis={scientificSummary}
      />

      {!compact ? (
        <HighIntentFraming effects={effects} mechanisms={mechanisms} />
      ) : null}

      <WhyItMatters
        summary={summary}
        effects={effects}
        mechanisms={mechanisms}
        entityType={entityType}
        compact={compact}
        practicalRelevance={practicalRelevance}
        mechanismContext={mechanismContext}
      />

      {(effects.length > 0 || mechanisms.length > 0) && !compact ? (
        <AuthorityCard
          title="Primary Effects + Mechanisms"
          description="Grouped mechanism clusters reduce flat tag walls and make the profile read more like a scientific monograph."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {effects.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-ink">
                  Primary effects
                </h2>
                <SignalList items={effects} />
              </div>
            ) : null}

            {mechanisms.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-ink">
                  Mechanism clusters
                </h2>
                <MechanismClusters mechanisms={mechanisms} />
              </div>
            ) : null}
          </div>
        </AuthorityCard>
      ) : null}

      <MonetizationInsertionZone zone="affiliate-product-cards" />
      <MonetizationInsertionZone zone="stack-modules" />
      <MonetizationInsertionZone zone="comparison-modules" />
      <MonetizationInsertionZone zone="protocol-modules" />

      <DiscoveryRails
        relatedRecords={relatedRecords}
        entityType={entityType}
        compact={compact}
        narrative={discoveryNarrative}
      />
    </div>
  )
}
