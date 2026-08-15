export type MatchScore = 0 | 0.25 | 0.5 | 0.75 | 1
export type StudyDesign =
  | 'meta-analysis'
  | 'systematic-review'
  | 'randomized-controlled-trial'
  | 'controlled-trial'
  | 'observational'
  | 'case-series'
  | 'animal'
  | 'in-vitro'
  | 'other'

export type StudyRelevanceInput = {
  ingredientMatch: MatchScore
  formulationMatch: MatchScore
  populationMatch: MatchScore
  outcomeMatch: MatchScore
  doseMatch: MatchScore
  durationMatch: MatchScore
  studyDesign: StudyDesign
}

const DESIGN_SCORE: Record<StudyDesign, number> = {
  'meta-analysis': 1,
  'systematic-review': 0.95,
  'randomized-controlled-trial': 0.9,
  'controlled-trial': 0.75,
  observational: 0.6,
  'case-series': 0.35,
  animal: 0.25,
  'in-vitro': 0.15,
  other: 0.3,
}

const RELEVANCE_WEIGHTS = {
  ingredient: 0.18,
  formulation: 0.12,
  population: 0.15,
  outcome: 0.2,
  dose: 0.1,
  duration: 0.1,
  design: 0.15,
} as const

export type StudyRelevanceResult = StudyRelevanceInput & {
  designScore: number
  score: number
  eligibleForPrimarySynthesis: boolean
  limitations: string[]
}

export function scoreStudyRelevance(input: StudyRelevanceInput): StudyRelevanceResult {
  const designScore = DESIGN_SCORE[input.studyDesign]
  const score = Math.round(100 * (
    input.ingredientMatch * RELEVANCE_WEIGHTS.ingredient +
    input.formulationMatch * RELEVANCE_WEIGHTS.formulation +
    input.populationMatch * RELEVANCE_WEIGHTS.population +
    input.outcomeMatch * RELEVANCE_WEIGHTS.outcome +
    input.doseMatch * RELEVANCE_WEIGHTS.dose +
    input.durationMatch * RELEVANCE_WEIGHTS.duration +
    designScore * RELEVANCE_WEIGHTS.design
  ))

  const limitations: string[] = []
  if (input.ingredientMatch < 0.75) limitations.push('ingredient mismatch')
  if (input.formulationMatch < 0.5) limitations.push('formulation mismatch')
  if (input.populationMatch < 0.5) limitations.push('population mismatch')
  if (input.outcomeMatch < 0.75) limitations.push('outcome mismatch')
  if (input.doseMatch < 0.5) limitations.push('dose mismatch')
  if (input.durationMatch < 0.5) limitations.push('duration mismatch')
  if (designScore < 0.5) limitations.push('indirect study design')

  return {
    ...input,
    designScore,
    score,
    eligibleForPrimarySynthesis: score >= 60 && input.ingredientMatch >= 0.75 && input.outcomeMatch >= 0.75,
    limitations,
  }
}

export type FundingSource = 'industry' | 'independent' | 'mixed' | 'unknown'

export type StudyIdentity = {
  studyId: string
  publicationId: string
  trialRegistrationId?: string
  cohortId?: string
  researchGroupId?: string
  sponsorId?: string
  fundingSource?: FundingSource
  companyEmployeeAuthors?: string[]
  conflictsOfInterest?: string[]
  reviewPrimaryStudyIds?: string[]
  completedTrial?: boolean
  publicationFound?: boolean
}

function normalizeRegistryId(value: string | undefined) {
  return value?.trim().toUpperCase().replace(/\s+/g, '') || null
}

export type StudyIndependenceRelation = {
  leftStudyId: string
  rightStudyId: string
  independent: boolean
  reason?: 'same-trial-registration' | 'same-cohort' | 'overlapping-review-evidence'
}

export function detectStudyIndependence(studies: StudyIdentity[]): StudyIndependenceRelation[] {
  const relations: StudyIndependenceRelation[] = []

  for (let leftIndex = 0; leftIndex < studies.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < studies.length; rightIndex += 1) {
      const left = studies[leftIndex]
      const right = studies[rightIndex]
      const leftTrial = normalizeRegistryId(left.trialRegistrationId)
      const rightTrial = normalizeRegistryId(right.trialRegistrationId)
      let reason: StudyIndependenceRelation['reason']

      if (leftTrial && rightTrial && leftTrial === rightTrial) {
        reason = 'same-trial-registration'
      } else if (left.cohortId && right.cohortId && left.cohortId === right.cohortId) {
        reason = 'same-cohort'
      } else if (left.reviewPrimaryStudyIds?.length && right.reviewPrimaryStudyIds?.length) {
        const rightIds = new Set(right.reviewPrimaryStudyIds)
        const overlap = left.reviewPrimaryStudyIds.filter((id) => rightIds.has(id)).length
        const smaller = Math.min(left.reviewPrimaryStudyIds.length, right.reviewPrimaryStudyIds.length)
        if (smaller > 0 && overlap / smaller >= 0.6) reason = 'overlapping-review-evidence'
      }

      relations.push({
        leftStudyId: left.studyId,
        rightStudyId: right.studyId,
        independent: !reason,
        reason,
      })
    }
  }

  return relations
}

export function countIndependentTrials(studies: StudyIdentity[]) {
  const trialKeys = new Set<string>()
  for (const study of studies) {
    const trial = normalizeRegistryId(study.trialRegistrationId)
    const key = trial ?? (study.cohortId ? `cohort:${study.cohortId}` : `study:${study.studyId}`)
    trialKeys.add(key)
  }
  return trialKeys.size
}

export type SponsorshipContext = {
  fundingSource: FundingSource
  sponsorId?: string
  companyEmployeeAuthors: string[]
  conflictsOfInterest: string[]
  transparent: boolean
}

export function summarizeSponsorship(study: StudyIdentity): SponsorshipContext {
  return {
    fundingSource: study.fundingSource ?? 'unknown',
    sponsorId: study.sponsorId,
    companyEmployeeAuthors: study.companyEmployeeAuthors ?? [],
    conflictsOfInterest: study.conflictsOfInterest ?? [],
    transparent: Boolean(
      study.fundingSource ||
      study.sponsorId ||
      study.companyEmployeeAuthors?.length ||
      study.conflictsOfInterest?.length
    ),
  }
}

export function hasReplicationOutsideSponsor(studies: StudyIdentity[], sponsorId: string) {
  const sponsored = studies.filter((study) => study.sponsorId === sponsorId)
  const outside = studies.filter((study) => study.sponsorId !== sponsorId)
  if (!sponsored.length || !outside.length) return false

  const sponsoredRegistrations = new Set(sponsored.map((study) => normalizeRegistryId(study.trialRegistrationId)).filter(Boolean))
  return outside.some((study) => {
    const registration = normalizeRegistryId(study.trialRegistrationId)
    return !registration || !sponsoredRegistrations.has(registration)
  })
}

export type PublicationBiasContext = {
  completedTrialCount: number
  unpublishedCompletedTrialCount: number
  risk: 'unknown' | 'low' | 'some-concern' | 'high'
  note: string
}

export function assessPublicationBias(studies: StudyIdentity[]): PublicationBiasContext {
  const completed = studies.filter((study) => study.completedTrial)
  const unpublished = completed.filter((study) => study.publicationFound === false)
  const ratio = completed.length ? unpublished.length / completed.length : null
  const risk = ratio === null
    ? 'unknown'
    : ratio >= 0.4
      ? 'high'
      : ratio > 0
        ? 'some-concern'
        : 'low'

  return {
    completedTrialCount: completed.length,
    unpublishedCompletedTrialCount: unpublished.length,
    risk,
    note: unpublished.length
      ? `${unpublished.length} completed registered trial${unpublished.length === 1 ? '' : 's'} currently lack a linked publication; published evidence may not represent every completed trial.`
      : 'No unpublished completed trials are currently identified, but registry coverage may be incomplete.',
  }
}

export type BiasJudgment = 'low' | 'some-concerns' | 'high' | 'unclear'

export type RiskOfBias = {
  randomization: BiasJudgment
  blinding: BiasJudgment
  allocationConcealment: BiasJudgment
  attrition: BiasJudgment
  selectiveReporting: BiasJudgment
  sampleSize: BiasJudgment
  preregistration: BiasJudgment
  fundingConflict: BiasJudgment
}

const BIAS_VALUE: Record<BiasJudgment, number> = {
  low: 1,
  'some-concerns': 0.65,
  unclear: 0.45,
  high: 0.15,
}

const BIAS_WEIGHTS: Record<keyof RiskOfBias, number> = {
  randomization: 0.16,
  blinding: 0.12,
  allocationConcealment: 0.14,
  attrition: 0.12,
  selectiveReporting: 0.14,
  sampleSize: 0.12,
  preregistration: 0.1,
  fundingConflict: 0.1,
}

export type RiskOfBiasResult = {
  score: number
  overall: BiasJudgment
  domains: RiskOfBias
}

export function scoreRiskOfBias(domains: RiskOfBias): RiskOfBiasResult {
  const score = Math.round(100 * (Object.keys(BIAS_WEIGHTS) as Array<keyof RiskOfBias>).reduce(
    (sum, key) => sum + BIAS_VALUE[domains[key]] * BIAS_WEIGHTS[key],
    0,
  ))
  const hasHighCoreBias = domains.randomization === 'high' || domains.selectiveReporting === 'high' || domains.attrition === 'high'
  const overall: BiasJudgment = hasHighCoreBias || score < 45
    ? 'high'
    : score < 65
      ? 'some-concerns'
      : score < 80
        ? 'unclear'
        : 'low'

  return { score, overall, domains }
}

export type StudySynthesisInput = {
  studyId: string
  relevance: StudyRelevanceResult
  riskOfBias: RiskOfBiasResult
  direction: 'positive' | 'null' | 'negative' | 'mixed'
  independentUnitId: string
  fundingSource?: FundingSource
}

export type StudySetSummary = {
  studyCount: number
  independentTrialCount: number
  eligibleStudyCount: number
  industryFundedCount: number
  independentlyFundedCount: number
  weightedEvidenceMass: number
  directionMass: Record<'positive' | 'null' | 'negative' | 'mixed', number>
}

export function summarizeStudySet(studies: StudySynthesisInput[]): StudySetSummary {
  const directionMass: StudySetSummary['directionMass'] = { positive: 0, null: 0, negative: 0, mixed: 0 }
  let weightedEvidenceMass = 0

  for (const study of studies) {
    if (!study.relevance.eligibleForPrimarySynthesis) continue
    const contribution = (study.relevance.score / 100) * (study.riskOfBias.score / 100)
    weightedEvidenceMass += contribution
    directionMass[study.direction] += contribution
  }

  return {
    studyCount: studies.length,
    independentTrialCount: new Set(studies.map((study) => study.independentUnitId)).size,
    eligibleStudyCount: studies.filter((study) => study.relevance.eligibleForPrimarySynthesis).length,
    industryFundedCount: studies.filter((study) => study.fundingSource === 'industry').length,
    independentlyFundedCount: studies.filter((study) => study.fundingSource === 'independent').length,
    weightedEvidenceMass: Number(weightedEvidenceMass.toFixed(3)),
    directionMass: {
      positive: Number(directionMass.positive.toFixed(3)),
      null: Number(directionMass.null.toFixed(3)),
      negative: Number(directionMass.negative.toFixed(3)),
      mixed: Number(directionMass.mixed.toFixed(3)),
    },
  }
}

export function sponsorshipContextNote(summary: StudySetSummary) {
  if (!summary.industryFundedCount) return null
  if (summary.independentlyFundedCount) {
    return `${summary.industryFundedCount} eligible study${summary.industryFundedCount === 1 ? ' is' : 'ies are'} industry-funded, with independent replication also represented.`
  }
  return `${summary.industryFundedCount} eligible study${summary.industryFundedCount === 1 ? ' is' : 'ies are'} industry-funded; sponsorship is surfaced for context but is not an automatic quality downgrade.`
}
