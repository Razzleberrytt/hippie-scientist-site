import type { EvidenceLineageAnalysis } from './research-evidence-lineage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from './research-trial-registration-independence'

export type ClaimUnderlyingStudyIndependence = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  apparentStudyCount: number
  underlyingStudyCount: number
  collapsedPublicationCount: number
  dependentPublicationGroups: string[][]
  independenceReduced: boolean
  pseudoMultiStudySupport: boolean
  highConfidencePseudoMultiStudySupport: boolean
}

export type UnderlyingStudyIndependenceAnalysis = {
  claims: ClaimUnderlyingStudyIndependence[]
  reducedClaims: ClaimUnderlyingStudyIndependence[]
  pseudoMultiStudyClaims: ClaimUnderlyingStudyIndependence[]
  highConfidencePseudoMultiStudyClaims: ClaimUnderlyingStudyIndependence[]
  summary: {
    multiStudyApprovedClaims: number
    independenceReducedClaims: number
    pseudoMultiStudyClaims: number
    highConfidencePseudoMultiStudyClaims: number
    collapsedPublicationCount: number
  }
}

export type UnderlyingStudyIndependenceInputs = {
  analysis: ResearchQualityAnalysis
  trialRegistrationIndependence: TrialRegistrationIndependenceAnalysis
  evidenceLineage: EvidenceLineageAnalysis
}

function createUnion(studyIds: string[]) {
  const parent = new Map(studyIds.map((studyId) => [studyId, studyId]))
  const find = (value: string): string => {
    const current = parent.get(value) ?? value
    if (current === value) return value
    const root = find(current)
    parent.set(value, root)
    return root
  }
  const union = (left: string, right: string) => {
    if (!parent.has(left) || !parent.has(right)) return
    const leftRoot = find(left)
    const rightRoot = find(right)
    if (leftRoot === rightRoot) return
    const [keep, merge] = [leftRoot, rightRoot].sort()
    parent.set(merge, keep)
  }
  return { find, union }
}

/**
 * Collapse publication-level study IDs only when existing canonical lineage
 * analyzers positively prove that publications belong to the same underlying
 * trial/cohort/dataset/parent study. Missing independence metadata is never
 * treated as dependence.
 *
 * Combining the relation systems here also captures transitive dependence: for
 * example A/B may share a trial registration while B/C share an explicit cohort,
 * proving that all three publications represent one underlying evidence unit.
 */
export function analyzeUnderlyingStudyIndependence(
  inputs: UnderlyingStudyIndependenceInputs,
): UnderlyingStudyIndependenceAnalysis {
  const trialByClaim = new Map(
    inputs.trialRegistrationIndependence.claims.map((claim) => [`${claim.url}::${claim.claimId}`, claim] as const),
  )
  const lineageByStudy = new Map(
    inputs.evidenceLineage.studies.map((study) => [`${study.url}::${study.studyId}`, study.lineageIds] as const),
  )

  const claims: ClaimUnderlyingStudyIndependence[] = []
  for (const claim of inputs.analysis.claimAnalyses) {
    if (claim.studyCount < 2) continue
    const { find, union } = createUnion(claim.studyIds)
    const trial = trialByClaim.get(`${claim.url}::${claim.claimId}`)

    for (const pair of trial?.sameRegisteredTrialPairs ?? []) {
      union(pair.leftStudyId, pair.rightStudyId)
    }

    const studiesByLineage = new Map<string, string[]>()
    for (const studyId of claim.studyIds) {
      for (const lineageId of lineageByStudy.get(`${claim.url}::${studyId}`) ?? []) {
        const studies = studiesByLineage.get(lineageId) ?? []
        studies.push(studyId)
        studiesByLineage.set(lineageId, studies)
      }
    }
    for (const studies of studiesByLineage.values()) {
      if (studies.length < 2) continue
      for (let index = 1; index < studies.length; index += 1) union(studies[0], studies[index])
    }

    const groups = new Map<string, string[]>()
    for (const studyId of claim.studyIds) {
      const root = find(studyId)
      const studies = groups.get(root) ?? []
      studies.push(studyId)
      groups.set(root, studies)
    }
    const dependentPublicationGroups = [...groups.values()]
      .filter((studies) => studies.length > 1)
      .map((studies) => [...studies].sort())
      .sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))
    const underlyingStudyCount = groups.size
    const collapsedPublicationCount = Math.max(0, claim.studyCount - underlyingStudyCount)
    const independenceReduced = collapsedPublicationCount > 0
    const pseudoMultiStudySupport = claim.studyCount >= 2 && underlyingStudyCount === 1

    claims.push({
      url: claim.url,
      claimId: claim.claimId,
      predicate: claim.predicate,
      confidence: claim.confidence,
      apparentStudyCount: claim.studyCount,
      underlyingStudyCount,
      collapsedPublicationCount,
      dependentPublicationGroups,
      independenceReduced,
      pseudoMultiStudySupport,
      highConfidencePseudoMultiStudySupport: pseudoMultiStudySupport && claim.confidence >= 0.75,
    })
  }

  claims.sort((a, b) =>
    Number(b.highConfidencePseudoMultiStudySupport) - Number(a.highConfidencePseudoMultiStudySupport)
    || Number(b.pseudoMultiStudySupport) - Number(a.pseudoMultiStudySupport)
    || b.collapsedPublicationCount - a.collapsedPublicationCount
    || b.apparentStudyCount - a.apparentStudyCount
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const reducedClaims = claims.filter((claim) => claim.independenceReduced)
  const pseudoMultiStudyClaims = claims.filter((claim) => claim.pseudoMultiStudySupport)
  const highConfidencePseudoMultiStudyClaims = claims.filter((claim) => claim.highConfidencePseudoMultiStudySupport)

  return {
    claims,
    reducedClaims,
    pseudoMultiStudyClaims,
    highConfidencePseudoMultiStudyClaims,
    summary: {
      multiStudyApprovedClaims: claims.length,
      independenceReducedClaims: reducedClaims.length,
      pseudoMultiStudyClaims: pseudoMultiStudyClaims.length,
      highConfidencePseudoMultiStudyClaims: highConfidencePseudoMultiStudyClaims.length,
      collapsedPublicationCount: reducedClaims.reduce((sum, claim) => sum + claim.collapsedPublicationCount, 0),
    },
  }
}
