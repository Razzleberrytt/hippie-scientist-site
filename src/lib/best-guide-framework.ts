import type { CanonicalEvidenceGrade } from '../../lib/evidence-grade'

export type BestGuideCandidateType = 'supplement' | 'food-derived-nutrient' | 'prescription-drug'
export type BestGuideDisposition = 'included' | 'insufficient-evidence' | 'excluded-safety' | 'out-of-scope'

export interface BestGuideCandidate {
  slug: string
  name: string
  type: BestGuideCandidateType
  evidenceGrade: CanonicalEvidenceGrade
  outcomeHumanStudyCount: number
  outcomeEvidenceDirectness: 'direct' | 'indirect' | 'mechanistic-only'
  safetyCompleteness: 'complete' | 'partial' | 'unknown'
  cautionCount: number
  disposition: BestGuideDisposition
  rationale: string
  popularOptionReason?: string
}

export const BEST_GUIDE_INCLUSION_CRITERIA = [
  'The option must be a supplement or food-derived nutrient, not a prescription drug presented as a consumer alternative.',
  'The relevant outcome must have direct or clearly bounded indirect human evidence; mechanism alone cannot qualify an option as “best.”',
  'Evidence and safety must be described before any product or retailer module appears.',
  'Studied form, extract, dose, population, and duration must be called out when they materially limit generalization.',
  'Popular options with insufficient evidence stay visible in a not-recommended / insufficient-evidence section rather than disappearing.',
] as const

const gradeRank: Record<CanonicalEvidenceGrade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  'Avoid/Insufficient': 1,
}

export function rankBestGuideIngredients(candidates: BestGuideCandidate[]) {
  return candidates
    .filter((candidate) => candidate.type !== 'prescription-drug')
    .filter((candidate) => candidate.disposition === 'included')
    .filter((candidate) => candidate.outcomeEvidenceDirectness !== 'mechanistic-only')
    .slice()
    .sort((a, b) => {
      const gradeDelta = gradeRank[b.evidenceGrade] - gradeRank[a.evidenceGrade]
      if (gradeDelta) return gradeDelta
      const directnessDelta = Number(b.outcomeEvidenceDirectness === 'direct') - Number(a.outcomeEvidenceDirectness === 'direct')
      if (directnessDelta) return directnessDelta
      const studyDelta = b.outcomeHumanStudyCount - a.outcomeHumanStudyCount
      if (studyDelta) return studyDelta
      return a.name.localeCompare(b.name)
    })
}

export function getBestGuideBuckets(candidates: BestGuideCandidate[]) {
  const ranked = rankBestGuideIngredients(candidates)
  const safetyEligible = ranked
    .filter((candidate) => candidate.safetyCompleteness === 'complete')
    .slice()
    .sort((a, b) => a.cautionCount - b.cautionCount || gradeRank[b.evidenceGrade] - gradeRank[a.evidenceGrade])

  return {
    ranked,
    bestEvidence: ranked[0] ?? null,
    bestSafetyFit: safetyEligible[0] ?? null,
    mostUncertain: ranked.slice().sort((a, b) => gradeRank[a.evidenceGrade] - gradeRank[b.evidenceGrade] || a.outcomeHumanStudyCount - b.outcomeHumanStudyCount)[0] ?? null,
    insufficient: candidates.filter((candidate) => candidate.disposition === 'insufficient-evidence' || candidate.evidenceGrade === 'Avoid/Insufficient'),
    excludedForSafety: candidates.filter((candidate) => candidate.disposition === 'excluded-safety'),
    outOfScope: candidates.filter((candidate) => candidate.type === 'prescription-drug' || candidate.disposition === 'out-of-scope'),
  }
}

export function assertBestGuideCandidate(candidate: BestGuideCandidate) {
  if (candidate.type === 'prescription-drug' && candidate.disposition === 'included') {
    throw new Error(`${candidate.name}: prescription drugs cannot be ranked as consumer supplement choices`)
  }
  if (candidate.outcomeEvidenceDirectness === 'mechanistic-only' && candidate.disposition === 'included') {
    throw new Error(`${candidate.name}: mechanism-only evidence cannot qualify for an evidence-ranked best guide`)
  }
  if (candidate.evidenceGrade === 'Avoid/Insufficient' && candidate.disposition === 'included') {
    throw new Error(`${candidate.name}: Avoid/Insufficient evidence cannot be included in the ranked recommendation set`)
  }
}

export function validateBestGuideCandidates(candidates: BestGuideCandidate[]) {
  for (const candidate of candidates) assertBestGuideCandidate(candidate)
  return true
}
