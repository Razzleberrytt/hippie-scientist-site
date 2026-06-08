import {
  clampScore,
  safeNumber,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

function normalizeTier(value: string) {
  return value.trim().toLowerCase()
}

function tierScore(tier: string) {
  const normalized = normalizeTier(tier)

  if (normalized.includes('strong')) {
    return 92
  }

  if (normalized.includes('moderate')) {
    return 74
  }

  if (normalized.includes('limited')) {
    return 52
  }

  return 38
}

function studyScore(record: any) {
  const humanStudies = safeNumber(record?.human_studies_count)
  const metaAnalyses = safeNumber(record?.meta_analysis_count)
  const clinicalTrials = safeNumber(record?.clinical_trial_count)

  return clampScore(
    humanStudies * 6 +
      metaAnalyses * 18 +
      clinicalTrials * 10,
    35,
  )
}

function citationScore(record: any) {
  return clampScore(
    safeNumber(record?.citation_count) * 4,
    28,
  )
}

export function buildEvidenceConfidence(source: unknown) {
  const record = safeObject(source)

  const evidenceTier = safeText(
    record?.evidence_tier,
    'limited',
  )

  const tierConfidence = tierScore(evidenceTier)
  const studyConfidence = studyScore(record)
  const citationConfidence = citationScore(record)

  const confidenceScore = clampScore(
    Math.round(
      tierConfidence * 0.5 +
        studyConfidence * 0.35 +
        citationConfidence * 0.15,
    ),
    42,
  )

  return {
    evidenceTier,
    confidenceScore,
    tierConfidence,
    studyConfidence,
    citationConfidence,
  }
}
