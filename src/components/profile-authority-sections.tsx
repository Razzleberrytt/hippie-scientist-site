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
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-7 text-[#5b6b61]">{description}</p>
      ) : null}
      <div className="mt-3">
        <SignalList items={items} />
      </div>
    </div>
  )
}

function ContextualMicroSections({
  aliases,
  pathways,
  targets,
  researchFocus,
  traditionalContext,
  associations,
  pharmacology,
  safetySignals,
  compact,
}: {
  aliases: string[]
  pathways: string[]
  targets: string[]
  researchFocus: string[]
  traditionalContext: string[]
  associations: string[]
  pharmacology: string[]
  safetySignals: string[]
  compact: boolean
}) {
  const sections = [
    { title: 'Also Known As', description: 'Alias and naming context already present in the runtime payload.', items: aliases },
    { title: 'Biological Context', description: 'Targets and pathway signals are shown as research context, not clinical claims.', items: [...targets, ...pharmacology].slice(0, 6) },
    { title: 'Research Focus', description: 'Evidence metadata and review status signals help calibrate interpretation.', items: researchFocus },
    { title: 'Pathway Associations', description: 'Pathway tags connect this profile to broader mechanism clusters.', items: pathways },
    { title: 'Traditional Context', description: 'Traditional-use and preparation fields are separated from efficacy claims.', items: traditionalContext },
    { title: 'Safety Notes', description: 'Caution fields are elevated when available so sparse pages still carry risk context.', items: safetySignals },
    { title: 'Frequently Associated With', description: 'Related herbs, compounds, or source botanicals from the runtime data.', items: associations },
  ].filter(section => section.items.length > 0)

  if (sections.length === 0) return null

  return (
    <AuthorityCard
      title="Context Map"
      compact={compact}
      description="High-signal runtime fields are surfaced only when populated, giving sparse profiles compact scientific context without filler."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sections.slice(0, compact ? 4 : 7).map(section => (
          <MicroSection key={section.title} {...section} />
        ))}
      </div>
    </AuthorityCard>
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
        <div key={group.cluster} className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
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

function EvidenceOverview({ record }: { record: any }) {
  const strata = getEvidenceStrata(record)
  const disciplineSummary = getEvidenceDisciplineSummary(strata)
  const trustBadges = getSemanticTrustBadges(record, 4)
  const safetyClassifications = getSafetyClassifications(record, 4)
  const safetyNarratives = buildSafetyNarratives(record, 3)
  const narrativeSummary = buildSafetyNarrativeSummary(record)

  if (strata.length === 0) return null

  const toneClass: Record<string, string> = {
    strong: 'border-emerald-700/15 bg-emerald-50/70 text-emerald-950',
    moderate: 'border-brand-900/10 bg-brand-50/60 text-brand-950',
    caution: 'border-amber-700/20 bg-amber-50/80 text-amber-950',
    neutral: 'border-brand-900/10 bg-white/60 text-[#46574d]',
  }

  return (
    <AuthorityCard title="Evidence Overview" description={compressEditorialCopy(narrativeSummary || disciplineSummary)} compact>
      {trustBadges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {trustBadges.map(signal => (
            <span key={signal.label} className="chip-readable" title={signal.description}>
              {signal.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {strata.map(stratum => (
          <div
            key={stratum.label}
            className={`rounded-2xl border p-4 ${toneClass[stratum.tone] || toneClass.neutral}`}
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
              {stratum.label}
            </h3>
            <p className="mt-2 text-sm leading-7 opacity-85">
              {stratum.description}
            </p>
          </div>
        ))}
      </div>

      {safetyClassifications.length > 0 ? (
        <div className="rounded-2xl border border-amber-700/15 bg-amber-50/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-950">
            Safety intelligence
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {safetyClassifications.map(classification => (
              <span key={classification.label} className="rounded-full border border-amber-800/20 bg-white/55 px-3 py-1 text-xs font-semibold text-amber-950">
                {classification.label}
              </span>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {(safetyNarratives.length > 0 ? safetyNarratives : [{ label: 'Safety context', narrative: 'Safety labels are only shown when caution language is present in the profile data.' }]).map(item => (
              <p key={item.label} className="max-w-2xl text-sm leading-7 text-[#5b4632]">
                {item.narrative}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </AuthorityCard>
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
  safetyLabels,
  safetyNarrative,
}: {
  evidence: string
  effects: string[]
  mechanisms: string[]
  safetySignals: string[]
  density: string
  authoritySignals: string[]
  synthesis: string
  safetyLabels: string[]
  safetyNarrative: string
}) {
  return (
    <AuthorityCard
      title="Scientific Snapshot"
      description={compressEditorialCopy(synthesis || 'A concise authority-style overview balancing evidence framing, mechanism context, and safety readability.')}
      compact={density === 'concise'}
    >
      <AuthoritySignals signals={authoritySignals} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">Profile quality</p>
          <p className="mt-2 text-sm leading-7 text-[#46574d]">{getProfileLabel(density)}</p>
        </div>

        <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">Evidence context</p>
          <p className="mt-2 text-sm leading-7 text-[#46574d]">{compressEditorialCopy(evidence)}</p>
        </div>

        {effects.length > 0 ? (
          <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">Best known for</p>
            <p className="mt-2 text-sm leading-7 text-[#46574d]">{effects.slice(0, 2).join(', ')}</p>
          </div>
        ) : null}

        {safetySignals.length > 0 || safetyLabels.length > 0 ? (
          <div className="rounded-2xl border border-amber-700/15 bg-amber-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/60">Safety snapshot</p>
            <p className="mt-2 text-sm leading-7 text-[#5b4632]">
              {compressEditorialCopy(safetyNarrative || (safetyLabels.length > 0 ? safetyLabels : safetySignals).slice(0, 2).join(', '))}
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


function EcosystemIntelligence({ record, relatedRecords, entityType, compact }: { record: any; relatedRecords: any[]; entityType: EntityType; compact: boolean }) {
  const fields = normalizeEcosystemFields(record)
  const ecosystemSections = [
    {
      title: 'Topic Ecosystems',
      description: 'Workbook topic clusters used for discovery and internal linking.',
      items: [...fields.topicClusters, ...fields.ecosystemTags].slice(0, 8),
    },
    {
      title: 'Pathway Ecosystems',
      description: 'Pathway adjacency is presented as biological context, not proof of clinical effect.',
      items: [...fields.pathwayCompanions, ...fields.pathwayEcosystems].slice(0, 8),
    },
    {
      title: 'Mechanism Ecosystems',
      description: 'Mechanism and target language helps connect this profile to broader systems.',
      items: fields.mechanismEcosystems.slice(0, 8),
    },
    {
      title: 'Related Topics',
      description: 'Adjacent topics can guide exploration while keeping claims evidence-informed.',
      items: fields.relatedTopics.slice(0, 8),
    },
  ].filter(section => section.items.length > 0)

  const comparisonRecords = relatedRecords
    .filter(item => fields.comparisonCandidates.includes(String(item?.slug || '').toLowerCase()))
    .slice(0, 3)
  const authorityItems = fields.authoritySignals.length ? fields.authoritySignals : fields.ecosystemAnchors

  if (ecosystemSections.length === 0 && comparisonRecords.length === 0 && fields.synergyRelationships.length === 0 && authorityItems.length === 0) {
    return null
  }

  return (
    <AuthorityCard
      title={fields.authoritySupernode ? 'Authority Ecosystem Anchor' : 'Semantic Ecosystem'}
      compact={compact}
      description={fields.authoritySupernode
        ? 'This profile acts as a high-density navigation anchor in the workbook knowledge graph; relationships remain conservative and evidence-informed.'
        : 'Workbook ecosystem fields are normalized into compact discovery context so profiles connect without creating noisy recommendation grids.'}
    >
      {authorityItems.length > 0 ? <AuthoritySignals signals={authorityItems.slice(0, 6)} /> : null}

      {ecosystemSections.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ecosystemSections.slice(0, compact ? 2 : 4).map(section => (
            <MicroSection key={section.title} {...section} />
          ))}
        </div>
      ) : null}

      {comparisonRecords.length > 0 && !compact ? (
        <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">Comparison Intelligence</h3>
          <p className="mt-2 text-sm leading-7 text-[#5b6b61]">
            Common-comparison signals are shown only as editorial prompts for side-by-side evidence review, not as equivalence claims.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {comparisonRecords.map(item => formatDisplayLabel(item.name || item.slug)).slice(0, 4).map(label => (
              <span key={label} className="chip-readable">{label}</span>
            ))}
          </div>
        </div>
      ) : null}

      {fields.synergyRelationships.length > 0 && !compact ? (
        <div className="rounded-2xl border border-amber-700/15 bg-amber-50/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-950">Stack / synergy context</h3>
          <p className="mt-2 text-sm leading-7 text-[#5b4632]">
            These workbook relationships are framed as complementary exploration signals only; they are not protocol recommendations or efficacy claims.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.synergyRelationships.slice(0, 5).map(item => (
              <span key={item} className="rounded-full border border-amber-800/20 bg-white/55 px-3 py-1 text-xs font-semibold text-amber-950">{item}</span>
            ))}
          </div>
        </div>
      ) : null}

      {fields.semanticNeighbors.length > 0 && compact ? (
        <p className="text-sm leading-7 text-[#5b6b61]">
          Semantic neighbors are available for this {entityType} and are folded into the discovery rail when matching public profiles exist.
        </p>
      ) : null}
    </AuthorityCard>
  )
}

function HighIntentFraming({ effects, mechanisms }: { effects: string[]; mechanisms: string[] }) {
  const sections = [
    { title: 'Best Known For', items: effects.slice(0, 3) },
    { title: 'Often Explored For', items: effects.slice(3, 6) },
    { title: 'Mechanism Signals', items: mechanisms.slice(0, 4) },
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

  const displaySummary = compact ? compressEditorialCopy(summary).split(/(?<=[.!?])\s+/).slice(0, 1).join(' ') : summary

  return (
    <AuthorityCard
      title="Why It Matters"
      compact={compact}
      description={compressEditorialCopy(practicalRelevance || 'Mechanism-level findings are separated from stronger human-evidence framing to reduce hype and improve scientific credibility.')}
    >
      {displaySummary ? <p className="detail-reading max-w-3xl text-[#46574d]">{displaySummary}</p> : null}

      {!compact ? (
        <div className="grid gap-4 pt-2 md:grid-cols-2">
          {effects.length > 0 ? (
            <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">Strongest researched applications</h3>
              <p className="mt-2 text-sm leading-7 text-[#46574d]">
                {compressEditorialCopy(practicalRelevance || `${effects.slice(0, 3).join(', ')} are among the clearest high-interest signals currently associated with this ${entityType} profile.`)}
              </p>
            </div>
          ) : null}

          {mechanisms.length > 0 ? (
            <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-800/70">Mechanism context</h3>
              <p className="mt-2 text-sm leading-7 text-[#46574d]">
                {compressEditorialCopy(mechanismContext || `Signals such as ${mechanisms.slice(0, 3).join(', ')} may help explain biological plausibility, but mechanism framing alone should not be interpreted as strong clinical proof.`)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </AuthorityCard>
  )
}

function DiscoveryCard({ item, entityType }: { item: any; entityType: EntityType }) {
  const overlap = cleanList(item.relatedOverlap || item.overlap || item.effects || item.mechanisms, 2)
  const targetType = item.entityType === 'herb' || item.entityType === 'compound' ? item.entityType : entityType

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
      <div className="mt-3 flex flex-wrap gap-2">
        {getSemanticTrustLabels(item, 2).map(label => (
          <span key={label} className="rounded-full border border-brand-900/10 bg-white/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/65">
            {label}
          </span>
        ))}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#46574d]">
        {cleanSummary(item.summary || item.description || '', targetType)}
      </p>
    </Link>
  )
}


function GraphCandidateCard({ item, entityType, kind }: { item: any; entityType: EntityType; kind: 'comparison' | 'stack' }) {
  const targetType = item.entityType === 'herb' || item.entityType === 'compound' ? item.entityType : entityType
  const mechanismSignals = cleanList(kind === 'stack' ? item.graphMechanismComplementarity : item.graphMechanismOverlap, 3)
  const pathwaySignals = cleanList(kind === 'stack' ? item.graphPathwayComplementarity : item.graphPathwayOverlap, 3)
  const ecosystemSignals = cleanList(item.graphEcosystemOverlap, 2)
  const evidenceContext = text(item.graphEvidenceContext)
  const rationale = text(item.graphCandidateRationale)

  return (
    <Link
      href={getRelatedHref(targetType, item.slug)}
      className="surface-subtle group rounded-2xl border border-brand-900/10 p-4 transition hover:border-brand-700/30 hover:bg-white/70"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-900/50">
        {kind === 'comparison' ? 'Contextual comparison' : 'Exploratory stack context'}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-ink transition group-hover:text-brand-700">
        {formatDisplayLabel(item.name || item.slug)}
      </h3>
      <p className="mt-2 text-sm leading-7 text-[#46574d]">
        {compressEditorialCopy(
          rationale ||
            (kind === 'comparison'
              ? 'Shared graph signals make this a conservative comparison candidate, not an efficacy or superiority claim.'
              : 'Complementary graph signals make this an exploratory research pairing, not dosing or treatment advice.'),
        )}
      </p>
      {evidenceContext ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-900/55">
          {compressEditorialCopy(evidenceContext)}
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        <SignalList items={[...mechanismSignals, ...pathwaySignals, ...ecosystemSignals].slice(0, 6)} />
      </div>
    </Link>
  )
}

function GraphIntelligenceRails({ comparisonRecords, stackRecords, entityType, compact }: {
  comparisonRecords: any[]
  stackRecords: any[]
  entityType: EntityType
  compact: boolean
}) {
  const comparisons = (comparisonRecords || [])
    .filter((item: any) => item?.slug && isClean(formatDisplayLabel(item?.name || item?.slug)))
    .slice(0, 8)
  const stacks = (stackRecords || [])
    .filter((item: any) => item?.slug && isClean(formatDisplayLabel(item?.name || item?.slug)))
    .slice(0, 6)

  if (comparisons.length === 0 && stacks.length === 0) return null

  return (
    <AuthorityCard
      title="Graph Intelligence"
      compact={compact}
      description="Graph candidates are shown as context only. They do not imply superiority, treatment recommendations, or dosing guidance."
    >
      <div className="space-y-6">
        {comparisons.length > 0 ? (
          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight text-ink">Comparison candidates</h3>
              <p className="text-sm leading-7 text-[#5b6b61]">
                Conservative candidates based on relationship, mechanism, pathway, and ecosystem overlap.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {comparisons.slice(0, compact ? 3 : 8).map((item: any) => (
                <GraphCandidateCard key={`comparison-${item.slug}`} item={item} entityType={entityType} kind="comparison" />
              ))}
            </div>
          </section>
        ) : null}

        {stacks.length > 0 ? (
          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight text-ink">Stack and synergy context</h3>
              <p className="text-sm leading-7 text-[#5b6b61]">
                Exploratory pairings require biological adjacency and complementary mechanism or pathway signals before display.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stacks.slice(0, compact ? 3 : 6).map((item: any) => (
                <GraphCandidateCard key={`stack-${item.slug}`} item={item} entityType={entityType} kind="stack" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AuthorityCard>
  )
}

function DiscoveryRails({ relatedRecords, entityType, compact = false, narrative = '', baseRecord }: any) {
  const visible = rankEvidenceSensitiveRelatedRecords(baseRecord, relatedRecords || [], compact ? 3 : 8)
    .filter((item: any) => item?.slug && isClean(formatDisplayLabel(item?.name || item?.slug)))

  if (visible.length === 0) return null

  const classifiedGroups = classifyDiscoveryGroups(baseRecord, visible)
  const fallbackGroups = [
    {
      title: 'Research Context Profiles',
      description: narrative || 'Related profiles strengthen semantic authority and internal discovery depth.',
      items: visible,
    },
  ]
  const groups = classifiedGroups.length > 0 ? classifiedGroups : fallbackGroups

  return (
    <AuthorityCard
      title="Semantic Discovery"
      compact={compact}
      description={compressEditorialCopy(narrative || 'Related profiles are filtered for evidence maturity, mechanism fit, and caution-aware context before they appear in this discovery rail.')}
    >
      <div className="space-y-5">
        {groups.slice(0, compact ? 1 : 4).map(group => (
          <section key={group.title} className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{group.title}</h3>
              <p className="text-sm leading-7 text-[#5b6b61]">{group.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.slice(0, compact ? 3 : 4).map((item: any) => (
                <DiscoveryCard key={item.slug} item={item} entityType={entityType} />
              ))}
            </div>
          </section>
        ))}
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
  comparisonRecords = [],
  stackRecords = [],
  effects: providedEffects,
  mechanisms: providedMechanisms,
  summary: providedSummary,
}: ProfileAuthoritySectionsProps) {
  const summary = getSummary(record, providedSummary, entityType)
  const effects = getPrimaryEffects(record, providedEffects)
  const mechanisms = getMechanisms(record, providedMechanisms)
  const safetySignals = getSafetySignals(record)
  const evidence = getEvidenceText(record)
  const aliases = getAliases(record)
  const pathways = getPathwaySignals(record)
  const targets = getBiologicalTargets(record)
  const researchFocus = getResearchFocus(record)
  const traditionalContext = getTraditionalContext(record)
  const associations = getAssociationSignals(record, entityType)
  const pharmacology = getPharmacologyContext(record)
  const contextualSignals = [
    ...aliases,
    ...pathways,
    ...targets,
    ...researchFocus,
    ...traditionalContext,
    ...associations,
    ...pharmacology,
  ]

  const density = getProfileDensity({ summary, effects, mechanisms, safetySignals, contextualSignals })
  const compact = density === 'concise'
  const authoritySignals = getAuthoritySignals(record, density)
  const synthesisInput = {
    summary,
    evidenceTier: evidence,
    effects,
    mechanisms,
    pathways,
    safety: safetySignals,
    density,
  }

  const variationInput = {
    name: formatDisplayLabel(record?.name || record?.slug),
    evidenceTier: evidence,
    effects,
    mechanisms,
    pathways,
    safety: safetySignals,
    density,
    seed: record?.slug,
  }
  const scientificSummary = buildVariedSummary(variationInput) || buildScientificSummary(synthesisInput)
  const evidenceContext = buildVariedEvidenceFraming(variationInput) || buildEvidenceContext(synthesisInput)
  const practicalRelevance = buildVariedPracticalRelevance(variationInput) || buildPracticalRelevance(synthesisInput)
  const mechanismContext = buildVariedMechanismFraming(variationInput) || buildMechanismContext(synthesisInput)
  const safetyLabels = getSafetyLabels(record, 4)
  const discoveryNarrative = buildDiscoveryNarrative(relatedRecords.length, synthesisInput)

  const hasContent =
    Boolean(summary) ||
    effects.length > 0 ||
    mechanisms.length > 0 ||
    safetySignals.length > 0 ||
    contextualSignals.length > 0 ||
    relatedRecords.length > 0 ||
    comparisonRecords.length > 0 ||
    stackRecords.length > 0

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
        safetyLabels={safetyLabels}
        safetyNarrative={buildSafetyNarrativeSummary(record)}
      />

      <EvidenceOverview record={record} />

      <ContextualMicroSections
        aliases={aliases}
        pathways={pathways}
        targets={targets}
        researchFocus={researchFocus}
        traditionalContext={traditionalContext}
        associations={associations}
        pharmacology={pharmacology}
        safetySignals={safetySignals}
        compact={compact}
      />

      <EcosystemIntelligence record={record} relatedRecords={relatedRecords} entityType={entityType} compact={compact} />

      {!compact ? <HighIntentFraming effects={effects} mechanisms={mechanisms} /> : null}

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
                <h2 className="text-xl font-semibold tracking-tight text-ink">Primary effects</h2>
                <SignalList items={effects} />
              </div>
            ) : null}
            {mechanisms.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-ink">Mechanism clusters</h2>
                <MechanismClusters mechanisms={mechanisms} />
              </div>
            ) : null}
          </div>
        </AuthorityCard>
      ) : null}

      <GraphIntelligenceRails
        comparisonRecords={comparisonRecords}
        stackRecords={stackRecords}
        entityType={entityType}
        compact={compact}
      />

      <MonetizationInsertionZone zone="affiliate-product-cards" />
      <MonetizationInsertionZone zone="stack-modules" />
      <MonetizationInsertionZone zone="comparison-modules" />
      <MonetizationInsertionZone zone="protocol-modules" />

      <DiscoveryRails
        relatedRecords={relatedRecords}
        entityType={entityType}
        compact={compact}
        narrative={discoveryNarrative}
        baseRecord={record}
      />
    </div>
  )
}
