/**
 * Typed facade for the runtime-agnostic evidence-grade normalization core.
 *
 * The implementation lives in `evidence-grade-core.js` so browser/Next code,
 * TypeScript, Node build scripts, migrations, and CI all execute the exact same
 * normalization rules.
 */

import {
  BAND_LABEL as CORE_BAND_LABEL,
  BAND_ORDER as CORE_BAND_ORDER,
  CANONICAL_EVIDENCE_GRADES as CORE_CANONICAL_EVIDENCE_GRADES,
  CANONICAL_GRADE_LABEL as CORE_CANONICAL_GRADE_LABEL,
  LETTER_LABEL as CORE_LETTER_LABEL,
  bandFromCanonicalGrade as bandFromCanonicalGradeCore,
  bandFromEvidenceTier as bandFromEvidenceTierCore,
  canonicalGradeFromEvidenceTier as canonicalGradeFromEvidenceTierCore,
  canonicalizePersistedEvidenceGrade as canonicalizePersistedEvidenceGradeCore,
  gradeTierDistance as gradeTierDistanceCore,
  isCanonicalEvidenceGrade as isCanonicalEvidenceGradeCore,
  normalizeEvidenceGrade as normalizeEvidenceGradeCore,
} from './evidence-grade-core.js'

export const CANONICAL_EVIDENCE_GRADES = CORE_CANONICAL_EVIDENCE_GRADES as readonly [
  'A',
  'B',
  'C',
  'D',
  'Avoid/Insufficient',
]

export type CanonicalEvidenceGrade = (typeof CANONICAL_EVIDENCE_GRADES)[number]
export type EvidenceLetter = Exclude<CanonicalEvidenceGrade, 'Avoid/Insufficient'>
export type EvidenceBand = 'strong' | 'moderate' | 'limited' | 'preliminary' | 'insufficient'

export type NormalizedEvidenceGrade = {
  grade: CanonicalEvidenceGrade | null
  letter: EvidenceLetter | null
  band: EvidenceBand | null
  label: string
  raw: string
  canonical: boolean
  outcomeDependent: boolean
}

export const BAND_LABEL = CORE_BAND_LABEL as Readonly<Record<EvidenceBand, string>>
export const BAND_ORDER = CORE_BAND_ORDER as readonly EvidenceBand[]
export const CANONICAL_GRADE_LABEL = CORE_CANONICAL_GRADE_LABEL as Readonly<Record<CanonicalEvidenceGrade, string>>
export const LETTER_LABEL = CORE_LETTER_LABEL as Readonly<Record<EvidenceLetter, string>>

export function isCanonicalEvidenceGrade(value: unknown): value is CanonicalEvidenceGrade {
  return isCanonicalEvidenceGradeCore(value)
}

export function bandFromCanonicalGrade(grade: CanonicalEvidenceGrade): EvidenceBand {
  return bandFromCanonicalGradeCore(grade) as EvidenceBand
}

export function normalizeEvidenceGrade(raw: unknown): NormalizedEvidenceGrade {
  return normalizeEvidenceGradeCore(raw) as NormalizedEvidenceGrade
}

export function canonicalizePersistedEvidenceGrade(raw: unknown): CanonicalEvidenceGrade | null {
  return canonicalizePersistedEvidenceGradeCore(raw) as CanonicalEvidenceGrade | null
}

export function canonicalGradeFromEvidenceTier(tier: unknown): CanonicalEvidenceGrade | null {
  return canonicalGradeFromEvidenceTierCore(tier) as CanonicalEvidenceGrade | null
}

export function bandFromEvidenceTier(tier: unknown): EvidenceBand | null {
  return bandFromEvidenceTierCore(tier) as EvidenceBand | null
}

export function gradeTierDistance(gradeBand: EvidenceBand | null, tierBand: EvidenceBand | null): number | null {
  return gradeTierDistanceCore(gradeBand, tierBand)
}
