import { list, text, unique } from '@/lib/display-utils'

export type EvidenceSourceType =
  | 'meta-analysis'
  | 'systematic-review'
  | 'randomized-controlled-trial'
  | 'human-study'
  | 'animal-study'
  | 'mechanistic'
  | 'traditional-use'
  | 'unknown'

export type EvidenceKnowledgeSignal = {
  label: string
  sourceType: EvidenceSourceType
  weight: number
  confidence: 'high' | 'moderate' | 'exploratory'
  reason: string
}

export type ResearchKnowledgeReport = {
  evidenceWeight: number
  hierarchy: EvidenceKnowledgeSignal[]
  provenanceSignals: string[]
  summary: string
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function title(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function classifyEvidenceSource(value: unknown): EvidenceSourceType {
  const source = normalize(value)

  if (/meta.?analysis|meta analysis/.test(source)) return 'meta-analysis'
  if (/systematic/.test(source)) return 'systematic-review'
  if (/randomized|randomised|rct|placebo|double.?blind/.test(source)) return 'randomized-controlled-trial'
  if (/human|clinical|trial|participants|subjects|patients/.test(source)) return 'human-study'
  if (/animal|mouse|mice|rat|rodent/.test(source)) return 'animal-study'
  if (/mechanism|in vitro|cell|preclinical/.test(source)) return 'mechanistic'
  if (/traditional|ethnobotanical|historical/.test(source)) return 'traditional-use'

  return 'unknown'
}

function weightForType(type: EvidenceSourceType) {
  switch (type) {
    case 'meta-analysis':
      return 10
    case 'systematic-review':
      return 9
    case 'randomized-controlled-trial':
      return 8
    case 'human-study':
      return 6
    case 'animal-study':
      return 3
    case 'mechanistic':
      return 2
    case 'traditional-use':
      return 2
    default:
      return 1
  }
}

function confidenceForWeight(weight: number): EvidenceKnowledgeSignal['confidence'] {
  if (weight >= 8) return 'high'
  if (weight >= 4) return 'moderate'
  return 'exploratory'
}

function collectEvidenceStrings(record: any) {
  return unique([
    record?.evidence_tier,
    record?.evidenceTier,
    record?.evidence_grade,
    record?.summary_quality,
    record?.study_type,
    record?.studyType,
    record?.evidence_summary,
    record?.research_summary,
    ...list(record?.sources),
    ...list(record?.citations),
    ...list(record?.studies),
    ...list(record?.pmids),
    ...list(record?.references),
  ].map(text).filter(Boolean))
}

export function buildResearchKnowledgeReport(record: any): ResearchKnowledgeReport {
  const evidenceStrings = collectEvidenceStrings(record)
  const hierarchy = evidenceStrings.map((entry) => {
    const sourceType = classifyEvidenceSource(entry)
    const weight = weightForType(sourceType)

    return {
      label: title(sourceType),
      sourceType,
      weight,
      confidence: confidenceForWeight(weight),
      reason: entry.length > 180 ? `${entry.slice(0, 180)}…` : entry,
    }
  })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)

  const explicitTier = normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.evidence_grade)
  const tierBonus = /strong|clinical|human|high|complete/.test(explicitTier) ? 8 : /moderate|mixed|limited/.test(explicitTier) ? 4 : 0
  const evidenceWeight = hierarchy.reduce((sum, item) => sum + item.weight, 0) + tierBonus
  const provenanceSignals = unique(hierarchy.map((item) => item.label)).slice(0, 6)

  return {
    evidenceWeight,
    hierarchy,
    provenanceSignals,
    summary: hierarchy.length > 0
      ? `Evidence context includes ${provenanceSignals.join(', ')}. Interpret rankings as research-navigation support, not medical guidance.`
      : 'Evidence provenance is limited in the current runtime record. Treat this profile as requiring additional source review.',
  }
}

export function rankByResearchKnowledge(records: any[] = [], limit = 12) {
  return records
    .map((record) => ({
      record,
      report: buildResearchKnowledgeReport(record),
    }))
    .sort((a, b) => b.report.evidenceWeight - a.report.evidenceWeight || text(a.record?.name || a.record?.slug).localeCompare(text(b.record?.name || b.record?.slug)))
    .slice(0, limit)
}
