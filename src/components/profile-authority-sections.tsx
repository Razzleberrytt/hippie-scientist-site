import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { classifyDiscoveryGroups, rankEvidenceSensitiveRelatedRecords } from '@/lib/discovery-classification'
import { compressEditorialCopy } from '@/lib/editorial-compression'
import {
  buildVariedEvidenceFraming,
  buildVariedMechanismFraming,
  buildVariedPracticalRelevance,
  buildVariedSummary,
} from '@/lib/editorial-variation'
import {
  decisionChipClass,
  decisionMetadataClusterClass,
  decisionMicroLabelClass,
} from '@/lib/decision-primitives'
import { getSafetyClassifications, getSafetyLabels } from '@/lib/safety-classification'
import { buildSafetyNarratives, buildSafetyNarrativeSummary } from '@/lib/safety-narratives'
import { getSemanticTrustBadges, getSemanticTrustLabels } from '@/lib/semantic-trust-badges'
import { getEvidenceDisciplineSummary, getEvidenceStrata } from '@/lib/evidence-stratification'
import { normalizeEcosystemFields } from '@/lib/ecosystem-intelligence'
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
  comparisonRecords?: any[]
  stackRecords?: any[]
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
    ...list(record?.contraindications),
    ...list(record?.interactions),
    text(record?.safetyNotes),
    text(record?.safety?.notes),
    text(record?.safety),
  ], 5)
}

function getAliases(record: any) {
  const primaryName = formatDisplayLabel(record?.name || record?.slug).toLowerCase()

  return cleanList([
    ...list(record?.aliases),
    text(record?.common),
    text(record?.scientific),
    text(record?.compoundName),
    text(record?.canonicalCompoundName),
    text(record?.displayName),
  ], 6).filter(item => item.toLowerCase() !== primaryName)
}

function getPathwaySignals(record: any) {
  return cleanList([
    ...list(record?.pathways),
    ...list(record?.pathway_bucket),
  ], 6)
}

function getBiologicalTargets(record: any) {
  return cleanList([
    ...list(record?.targets),
    ...list(record?.biologicalTargets),
  ], 6)
}

function getResearchFocus(record: any) {
  return cleanList([
    text(record?.evidenceLevel),
    text(record?.evidence_tier),
    text(record?.evidenceTier),
    text(record?.evidence_grade),
    text(record?.confidenceTier),
    text(record?.confidence),
    record?.sourceCount ? `${record.sourceCount} source signals` : '',
    text(record?.review_status),
    text(record?.source_status),
  ], 6)
}

function getTraditionalContext(record: any) {
  return cleanList([
    ...list(record?.traditionalUses),
    text(record?.preparation),
    text(record?.region),
  ], 6)
}

function getAssociationSignals(record: any, entityType: EntityType) {
  return cleanList([
    ...list(record?.activeCompounds),
    ...list(record?.foundIn),
    ...list(entityType === 'herb' ? record?.relatedHerbs : record?.relatedCompounds),
  ], 8)
}

function getPharmacologyContext(record: any) {
  return cleanList([
    text(record?.compoundClass),
    text(record?.class),
    text(record?.bioavailability),
    text(record?.minimum_effective_dose),
    text(record?.time_to_effect),
    ...list(record?.population_tags),
    text(record?.interaction_type),
  ], 6)
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
  const signals = [
    ...getSemanticTrustLabels(record, 5),
    ...getSafetyLabels(record, 3),
  ]

  if (density === 'comprehensive' && !signals.includes('Evidence-Limited')) {
    signals.push('Publication-Ready Profile')
  }

  return unique(signals).slice(0, 7)
}

function getProfileDensity({
  summary,
  effects,
  mechanisms,
  safetySignals,
  contextualSignals,
}: {
  summary: string
  effects: string[]
  mechanisms: string[]
  safetySignals: string[]
  contextualSignals?: string[]
}) {
  const score =
    (summary ? 2 : 0) +
    Math.min(effects.length, 3) +
    Math.min(mechanisms.length, 2) +
    Math.min(safetySignals.length, 2) +
    Math.min(contextualSignals?.length || 0, 2)

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
    <section className={`card-premium ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7'}`}>
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        <div className="space-y-2">
          <p className={`${decisionMicroLabelClass} text-brand-700`}>{title}</p>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-[#5b6b61]">
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
    <div className={decisionMetadataClusterClass}>
      {items.map(item => (
        <span key={item} className={decisionChipClass}>
          {item}
        </span>
      ))}
    </div>
  )
}

function MicroSection({ title, description, items }: { title: string; description?: string; items: string[] }) {
  if (items.length === 0) return null

  return (
    <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">