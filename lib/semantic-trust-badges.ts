import { list, text, unique } from '@/lib/display-utils'
import { hasHumanEvidence, hasMechanismEvidence, isPreliminaryResearch } from '@/lib/evidence'

export type SemanticTrustBadge = {
  label: string
  description: string
  tone: 'clinical' | 'mechanistic' | 'caution' | 'traditional' | 'emerging' | 'neutral'
}

function joined(record: Record<string, unknown>): string {
  return [
    record?.evidence_tier,
    record?.evidenceTier,
    record?.evidence_grade,
    record?.confidence,
    record?.profile_status,
    record?.review_status,
    record?.summary,
    record?.description,
    record?.traditional_use,
    record?.traditionalUse,
    record?.safety,
    record?.safetyNotes,
    record?.safety_notes,
    record?.contraindications,
    record?.interactions,
    record?.mechanisms,
    record?.pathways,
    record?.sources,
  ]
    .map(text)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function hasAny(record: Record<string, unknown>, fields: string[]): boolean {
  return fields.some(field => list(record?.[field]).map(text).some(Boolean))
}

function badge(label: string, description: string, tone: SemanticTrustBadge['tone']): SemanticTrustBadge {
  return { label, description, tone }
}

export function getSemanticTrustBadges(record: Record<string, unknown>, limit = 5): SemanticTrustBadge[] {
  const source = joined(record)
  const badges: SemanticTrustBadge[] = []

  if (hasHumanEvidence(record)) {
    badges.push(badge('Human Research', 'Includes human or clinically oriented evidence signals.', 'clinical'))
  }

  if (hasMechanismEvidence(record) || hasAny(record, ['mechanisms', 'primary_mechanisms', 'pathways'])) {
    badges.push(badge('Mechanistic Focus', 'Mechanism or pathway context is available for cautious interpretation.', 'mechanistic'))
  }

  if (isPreliminaryResearch(record) || /\b(limited|weak|insufficient|low|partial|draft|needs review|not established)\b/.test(source)) {
    badges.push(badge('Evidence-Limited', 'Evidence is framed as incomplete rather than clinically settled.', 'caution'))
  }

  if (/\b(traditional|ethnobotanical|historical|ayurveda|ayurvedic|tcm|folk)\b/.test(source)) {
    badges.push(badge('Traditional Medicine Context', 'Traditional-use context is separated from modern clinical evidence.', 'traditional'))
  }

  if (/\b(interaction|interacts|contraindicat|avoid with|cyp|ssri|maoi|warfarin|medication)\b/.test(source)) {
    badges.push(badge('Interaction-Aware', 'Interaction or medication-adjacent caution language is present.', 'caution'))
  }

  if (/\b(caution|warning|avoid|pregnan|breastfeeding|liver|kidney|bleed|anticoagul|hormone|stimulant)\b/.test(source)) {
    badges.push(badge('Safety-Sensitive', 'Safety context should be read alongside any benefit framing.', 'caution'))
  }

  if (/\b(preliminary|preclinical|animal|in\s*vitro|early)\b/.test(source)) {
    badges.push(badge('Preliminary Literature', 'Findings appear early-stage or non-definitive.', 'emerging'))
  }

  if (/\b(emerging|novel|early research|developing literature)\b/.test(source)) {
    badges.push(badge('Emerging Research', 'Research context is developing and should be interpreted conservatively.', 'emerging'))
  }

  const seen = new Set<string>()
  return badges
    .filter(item => {
      if (seen.has(item.label)) return false
      seen.add(item.label)
      return true
    })
    .slice(0, Math.max(0, limit))
}

export function getSemanticTrustLabels(record: Record<string, unknown>, limit = 5): string[] {
  return unique(getSemanticTrustBadges(record, limit).map(item => item.label))
}

export function getEvidenceMaturity(record: Record<string, unknown>): 'mature' | 'moderate' | 'exploratory' {
  const source = joined(record)

  if (hasHumanEvidence(record) && /\b(strong|high|robust|clinical|rct|randomi[sz]ed|meta|systematic|grade\s*a|tier\s*a)\b/.test(source)) {
    return 'mature'
  }

  if (hasHumanEvidence(record) || /\b(moderate|grade\s*b|tier\s*b)\b/.test(source)) {
    return 'moderate'
  }

  return 'exploratory'
}

export function getProfileCompleteness(record: Record<string, unknown>): 'complete' | 'developing' | 'sparse' {
  const filled = [
    record?.summary || record?.description,
    record?.evidence_tier || record?.evidenceTier,
    record?.mechanisms,
    record?.primary_effects || record?.effects,
    record?.safety,
    record?.sources,
  ].filter(value => text(value) || list(value).length > 0).length

  if (/\b(complete|comprehensive|published|ready)\b/i.test(text(record?.profile_status || record?.review_status)) || filled >= 5) {
    return 'complete'
  }

  if (filled >= 3) return 'developing'
  return 'sparse'
}

export function getMechanismDepth(record: Record<string, unknown>): 'deep' | 'mapped' | 'light' {
  const mechanisms = unique([...list(record?.mechanisms), ...list(record?.primary_mechanisms), ...list(record?.pathways)].map(text).filter(Boolean))

  if (mechanisms.length >= 5) return 'deep'
  if (mechanisms.length >= 2 || hasMechanismEvidence(record)) return 'mapped'
  return 'light'
}
