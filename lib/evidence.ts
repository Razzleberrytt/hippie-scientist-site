import type { RuntimeRecord } from '../src/types/content'
import { extractCitationsFromRecord } from './citations'
import {
  reconcileEvidenceGrade,
  type CanonicalEvidenceGrade,
} from './evidence-grade'
import { isHumanEvidenceClass } from './evidence-study'

type EvidenceTier = 'strong' | 'moderate' | 'limited' | 'preliminary' | 'traditional' | 'mixed' | 'insufficient' | 'review'

type EvidenceColor = 'emerald' | 'blue' | 'amber' | 'sand' | 'violet' | 'slate'

function readPath(record: unknown, path: string[]): unknown {
  return path.reduce(
    (value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined),
    record,
  )
}

function text(value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(' ')
  if (typeof value === 'object')
    return Object.values(value as Record<string, unknown>)
      .map(text)
      .filter(Boolean)
      .join(' ')
  return String(value).trim()
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string')
    return value
      .split(/[|;,]/)
      .map(item => item.trim())
      .filter(Boolean)
  return value ? [value] : []
}

function publicEvidenceBacked(record: RuntimeRecord): boolean {
  const value = record?.evidence_grade_backed
  return value !== false && String(value ?? '').toLowerCase() !== 'false'
}

export function evidenceText(record: RuntimeRecord): string {
  return [
    readPath(record, ['safety', 'confidence']),
    readPath(record, ['safety', 'evidenceTier']),
    record?.evidenceTier,
    record?.evidence_tier,
    record?.evidence_grade,
    record?.evidenceLevel,
    record?.confidenceTier,
    record?.profile_status,
    record?.review_status,
    record?.summary_quality,
    record?.source_status,
  ]
    .map(text)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function authoredEvidenceSignals(record: RuntimeRecord) {
  const rawGrade = record?.evidence_grade ?? record?.evidenceGrade
  const rawTier = record?.evidence_tier ?? record?.evidenceTier ?? record?.evidenceLevel
  return { rawGrade, rawTier, present: Boolean(text(rawGrade) || text(rawTier)) }
}

/**
 * Resolve direct human-evidence presence from normalized structured citations.
 * `null` means the record has no classifiable structured citation evidence and
 * may use the conservative legacy text fallback. Once at least one citation is
 * explicitly classified, non-human classes are authoritative rather than being
 * overridden by grade adjectives or raw source cardinality.
 */
function structuredHumanEvidence(record: RuntimeRecord): boolean | null {
  const citations = extractCitationsFromRecord(record as Record<string, unknown>)
  const classified = citations.flatMap(citation =>
    citation.evidenceClass && citation.evidenceClass !== 'other' ? [citation.evidenceClass] : [],
  )
  if (!classified.length) return null
  return classified.some(evidenceClass => isHumanEvidenceClass(evidenceClass))
}

export function hasHumanEvidence(record: RuntimeRecord): boolean {
  const structured = structuredHumanEvidence(record)
  if (structured !== null) return structured

  const evidence = evidenceText(record)
  if (/\b(no|none|theoretical|traditional|preclinical|in\s*vitro|animal)\b/.test(evidence)) {
    return false
  }

  return /\b(human|clinical|trial|rct|randomi[sz]ed|meta-analysis|meta analysis|systematic review)\b/.test(evidence)
}

export function hasMechanismEvidence(record: RuntimeRecord): boolean {
  return [record?.mechanisms, record?.primary_effects, record?.effects, record?.pathways].some(
    value => list(value).map(text).some(Boolean),
  )
}

export function isPreliminaryResearch(record: RuntimeRecord): boolean {
  const evidence = evidenceText(record)

  return /\b(preliminary|emerging|limited|low|weak|partial|draft|none|preclinical|animal|in\s*vitro|theoretical|grade\s*[cd]|tier\s*[cd])\b/.test(
    evidence,
  )
}

export function getEvidenceTier(record: RuntimeRecord): EvidenceTier {
  // `evidence_grade_backed=false` means the authored A/B judgment is retained
  // only as provenance. No UI/search/schema consumer may reconstruct a settled
  // Strong/Moderate public claim from those source fields.
  if (!publicEvidenceBacked(record)) return 'review'

  const authored = authoredEvidenceSignals(record)
  if (authored.present) {
    const reconciled = reconcileEvidenceGrade(authored.rawGrade, authored.rawTier)
    const rawTierText = text(authored.rawTier).toLowerCase()
    if (reconciled.grade === 'A') return 'strong'
    if (reconciled.grade === 'B') return 'moderate'
    if (reconciled.grade === 'C') {
      return /\b(mixed|conflict|inconsistent|equivocal)\b/.test(rawTierText) ? 'mixed' : 'limited'
    }
    if (reconciled.grade === 'D') {
      return /\b(traditional|ethnobotanical|historical)\b/.test(rawTierText) ? 'traditional' : 'preliminary'
    }
    if (reconciled.grade === 'Avoid/Insufficient') return 'insufficient'
    return 'review'
  }

  const evidence = evidenceText(record)
  if (/\b(needs? review|unknown|tbd|draft|placeholder|profile pending)\b/.test(evidence)) return 'review'
  if (/\b(none|no evidence|insufficient|minimal|not established)\b/.test(evidence)) return 'insufficient'
  if (/\b(mixed|conflict|inconsistent|equivocal)\b/.test(evidence)) return 'mixed'
  if (/\b(strong|high|robust|grade\s*a|tier\s*a)\b/.test(evidence)) return 'strong'
  if (/\b(moderate|medium|grade\s*b|tier\s*b)\b/.test(evidence)) return 'moderate'
  if (/\b(traditional|ethnobotanical|historical)\b/.test(evidence)) return 'traditional'
  if (/\b(emerging|early)\b/.test(evidence)) return 'preliminary'
  if (isPreliminaryResearch(record)) return 'preliminary'
  if (hasHumanEvidence(record)) return 'moderate'
  if (hasMechanismEvidence(record)) return 'limited'

  return 'limited'
}

export function getEvidenceLabel(record: RuntimeRecord): string {
  const labels: Record<EvidenceTier, string> = {
    strong: 'Strong evidence',
    moderate: 'Moderate evidence',
    limited: 'Limited evidence',
    preliminary: 'Preliminary evidence',
    traditional: 'Traditional use',
    mixed: 'Mixed evidence',
    insufficient: 'Insufficient evidence',
    review: 'Needs review',
  }

  return labels[getEvidenceTier(record)]
}

export function getEvidenceColor(record: RuntimeRecord): EvidenceColor {
  const colors: Record<EvidenceTier, EvidenceColor> = {
    strong: 'emerald',
    moderate: 'blue',
    limited: 'slate',
    preliminary: 'amber',
    traditional: 'sand',
    mixed: 'violet',
    insufficient: 'slate',
    review: 'slate',
  }

  return colors[getEvidenceTier(record)]
}

/** Compatibility name retained for UI/data callers. */
export type EvidenceLetterGrade = CanonicalEvidenceGrade | 'Unassigned'

/**
 * Resolve a record through the canonical evidence-grade reconciliation contract.
 * Conflicting grade/tier signals resolve downward. Outcome-dependent,
 * not-applicable, or otherwise unresolved records remain `Unassigned`; they are
 * never converted into an invented single grade by heuristic fallback.
 *
 * Records with no authored grade/tier at all retain the historical tier-derived
 * compatibility fallback so older runtime-only content does not disappear.
 */
export function getEvidenceLetterGrade(record: RuntimeRecord): EvidenceLetterGrade {
  if (!publicEvidenceBacked(record)) return 'Unassigned'

  const authored = authoredEvidenceSignals(record)
  if (authored.present) {
    const reconciled = reconcileEvidenceGrade(authored.rawGrade, authored.rawTier)
    return reconciled.grade ?? 'Unassigned'
  }

  const tierMap: Record<EvidenceTier, EvidenceLetterGrade> = {
    strong: 'A',
    moderate: 'B',
    limited: 'C',
    mixed: 'C',
    preliminary: 'D',
    traditional: 'D',
    insufficient: 'Avoid/Insufficient',
    review: 'Unassigned',
  }

  return tierMap[getEvidenceTier(record)]
}

export function hasStrongSafetyProfile(record: RuntimeRecord): boolean {
  const safety = [
    record?.safety,
    record?.safetyNotes,
    record?.safety_notes,
    record?.contraindications,
    record?.interactions,
  ]
    .map(text)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const confidence = text(
    readPath(record, ['safety', 'confidence']) || record?.confidenceTier,
  ).toLowerCase()

  if (
    /\b(avoid|contraindicat|caution|interaction|pregnan|liver|kidney|risk|toxic)\b/.test(safety)
  ) {
    return false
  }

  return /\b(strong|high|safe|well\s*tolerated|low\s*risk)\b/.test(`${safety} ${confidence}`)
}
