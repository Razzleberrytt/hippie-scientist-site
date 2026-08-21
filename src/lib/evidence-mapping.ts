import type { EvidenceMetrics } from '../types/relational'
import type { RuntimeRecord } from '../types/content'
import { getEvidenceLabel, getEvidenceLetterGrade } from '../../lib/evidence'
import type { CanonicalEvidenceGrade } from '../../lib/evidence-grade'

export interface NormalizedEvidence {
  /** Presentation-only score derived from the canonical grade. It never changes the grade. */
  score: number // 0 - 100
  grade: CanonicalEvidenceGrade
  label: string
  description: string
  metrics: EvidenceMetrics
}

const SCORE_BY_GRADE: Record<CanonicalEvidenceGrade, number> = {
  A: 90,
  B: 70,
  C: 50,
  D: 30,
  'Avoid/Insufficient': 5,
}

const DESCRIPTION_BY_GRADE: Record<CanonicalEvidenceGrade, string> = {
  A: 'The canonical evidence system classifies this record as strong evidence.',
  B: 'The canonical evidence system classifies this record as moderate evidence.',
  C: 'The canonical evidence system classifies this record as limited or mixed evidence.',
  D: 'The canonical evidence system classifies this record as preliminary, preclinical, traditional, or theoretical evidence.',
  'Avoid/Insufficient': 'The canonical evidence system does not support a positive evidence grade for this record.',
}

function metric(value: unknown): number {
  const number = Number(value ?? 0)
  return Number.isFinite(number) && number > 0 ? number : 0
}

/**
 * Compatibility adapter for relational UI callers.
 *
 * Evidence grade/label authority lives in `lib/evidence.ts` and the canonical
 * `lib/evidence-grade.ts` contract. Study counts are exposed as metrics only;
 * this adapter must never recompute or upgrade a scientific grade from them.
 */
export function normalizeEvidence(entity: RuntimeRecord): NormalizedEvidence {
  const clinicalTrialCount = metric(entity?.clinical_trial_count ?? entity?.clinicalTrialCount)
  const metaAnalysisCount = metric(entity?.meta_analysis_count ?? entity?.metaAnalysisCount)
  const humanStudiesCount = metric(entity?.human_studies_count ?? entity?.humanStudiesCount)
  const animalStudiesCount = metric(entity?.animal_studies_count ?? entity?.animalStudiesCount)
  const inVitroCount = metric(entity?.in_vitro_count ?? entity?.inVitroCount)
  const citationCount = metric(entity?.citation_count ?? entity?.citationCount)
  const grade = getEvidenceLetterGrade(entity)

  return {
    score: SCORE_BY_GRADE[grade],
    grade,
    label: getEvidenceLabel(entity),
    description: DESCRIPTION_BY_GRADE[grade],
    metrics: {
      clinicalTrialCount,
      metaAnalysisCount,
      humanStudiesCount,
      animalStudiesCount,
      inVitroCount,
      citationCount,
    },
  }
}
