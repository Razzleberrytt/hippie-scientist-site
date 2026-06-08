import { EvidenceMetrics } from '@/types/relational'

export interface NormalizedEvidence {
  score: number // 0 - 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  label: string
  description: string
  metrics: EvidenceMetrics
}

function getBaselineScore(evidenceTier?: string): number {
  if (!evidenceTier) return 5
  const normalized = evidenceTier.toLowerCase()
  if (normalized.includes('strong')) return 80
  if (normalized.includes('moderate')) return 60
  if (normalized.includes('limited') || normalized.includes('preliminary')) return 40
  if (normalized.includes('mechanistic')) return 20
  if (normalized.includes('traditional')) return 15
  return 5
}

export function normalizeEvidence(entity: any): NormalizedEvidence {
  const clinicalTrialCount = Number(entity?.clinical_trial_count ?? entity?.clinicalTrialCount ?? 0)
  const metaAnalysisCount = Number(entity?.meta_analysis_count ?? entity?.metaAnalysisCount ?? 0)
  const humanStudiesCount = Number(entity?.human_studies_count ?? entity?.humanStudiesCount ?? 0)
  const animalStudiesCount = Number(entity?.animal_studies_count ?? entity?.animalStudiesCount ?? 0)
  const inVitroCount = Number(entity?.in_vitro_count ?? entity?.inVitroCount ?? 0)
  const citationCount = Number(entity?.citation_count ?? entity?.citationCount ?? 0)

  const baseline = getBaselineScore(entity?.evidence_tier ?? entity?.evidenceTier)
  const studiesBonus =
    humanStudiesCount * 4 +
    metaAnalysisCount * 12 +
    clinicalTrialCount * 8 +
    animalStudiesCount * 2 +
    inVitroCount * 1 +
    Math.min(citationCount * 0.5, 10)

  const rawScore = baseline + studiesBonus
  const score = Math.min(Math.max(Math.round(rawScore), 0), 100)

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F'
  let label = 'Evidence-Limited / Theoretical'
  let description = 'No standardized or verifiable human clinical trials are currently registered.'

  if (score >= 85) {
    grade = 'A'
    label = 'High Certainty'
    description = 'Supported by robust human clinical trials, systematic reviews, or meta-analyses.'
  } else if (score >= 65) {
    grade = 'B'
    label = 'Moderate Certainty'
    description = 'Supported by clinical studies showing consistent positive human efficacy outcomes.'
  } else if (score >= 45) {
    grade = 'C'
    label = 'Emerging Certainty'
    description = 'Supported by preliminary, mixed, or early-stage human trials.'
  } else if (score >= 25) {
    grade = 'D'
    label = 'Preclinical Context'
    description = 'Supported primarily by in-vitro models, animal research, or historical context.'
  }

  return {
    score,
    grade,
    label,
    description,
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
