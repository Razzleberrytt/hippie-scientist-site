import type { OutcomeMetadataCoverageAnalysis } from './research-outcome-metadata-coverage'
import type {
  ClaimOutcomeReportingIntegrityFinding,
  OutcomeReportingIntegrityAnalysis,
  OutcomeReportingRisk,
} from './research-outcome-reporting-integrity'

export type OutcomeReviewPriority = 'urgent' | 'high' | 'medium' | 'low'

export type OutcomeReviewQueueItem = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  priority: OutcomeReviewPriority
  integritySeverity: ClaimOutcomeReportingIntegrityFinding['severity'] | null
  risks: OutcomeReportingRisk[]
  outcomeMetadataGap: boolean
  highConfidenceOutcomeMetadataGap: boolean
  primaryHumanStudies: number
  studiesWithOutcomeMetadata: number
  studiesWithNamedAlignmentData: number
  namedAlignmentCoverage: number
  affectedStudyIds: string[]
  reasons: string[]
}

export type OutcomeReviewQueue = {
  items: OutcomeReviewQueueItem[]
  urgent: OutcomeReviewQueueItem[]
  high: OutcomeReviewQueueItem[]
  metadataBackfill: OutcomeReviewQueueItem[]
  summary: {
    items: number
    urgent: number
    high: number
    medium: number
    low: number
    integrityFindings: number
    metadataBackfill: number
  }
}

const PRIORITY_ORDER: Record<OutcomeReviewPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function priorityFor(input: {
  integrity: ClaimOutcomeReportingIntegrityFinding | undefined
  outcomeMetadataGap: boolean
  highConfidenceOutcomeMetadataGap: boolean
  confidence: number
}): OutcomeReviewPriority {
  const { integrity, outcomeMetadataGap, highConfidenceOutcomeMetadataGap, confidence } = input
  if (integrity?.severity === 'high' && confidence >= 0.75) return 'urgent'
  if (integrity?.severity === 'high') return 'high'
  if (integrity?.severity === 'moderate' && confidence >= 0.75) return 'high'
  if (integrity?.severity === 'moderate') return 'medium'
  if (highConfidenceOutcomeMetadataGap) return 'medium'
  if (outcomeMetadataGap) return 'low'
  return 'low'
}

function integrityReasons(integrity: ClaimOutcomeReportingIntegrityFinding | undefined): string[] {
  if (!integrity) return []
  const labels: Record<OutcomeReportingRisk, string> = {
    'registered-reported-primary-mismatch': 'registered and reported primary outcomes do not match',
    'registered-reported-primary-partial-mismatch': 'registered and reported primary outcomes only partially align',
    'explicit-outcome-switch': 'linked evidence explicitly indicates outcome switching',
    'explicit-registered-outcome-nonreporting': 'linked evidence explicitly indicates registered/prespecified outcome non-reporting',
    'null-primary-with-favorable-secondary': 'a not-met primary outcome is paired with favorable secondary/subgroup/exploratory evidence',
  }
  return integrity.risks.map((risk) => labels[risk])
}

/**
 * Build one actionable editorial queue from outcome-reporting integrity findings
 * and outcome-metadata coverage gaps. Integrity concerns outrank backfill work;
 * coverage-only items remain explicitly framed as missing assessability rather
 * than evidence of reporting bias.
 */
export function buildOutcomeReviewQueue(input: {
  outcomeReportingIntegrity: OutcomeReportingIntegrityAnalysis
  outcomeMetadataCoverage: OutcomeMetadataCoverageAnalysis
}): OutcomeReviewQueue {
  const { outcomeReportingIntegrity, outcomeMetadataCoverage } = input
  const integrityByClaim = new Map(
    outcomeReportingIntegrity.claims.map((claim) => [`${claim.url}::${claim.claimId}`, claim]),
  )
  const coverageByClaim = new Map(
    outcomeMetadataCoverage.claims.map((claim) => [`${claim.url}::${claim.claimId}`, claim]),
  )
  const keys = new Set([
    ...integrityByClaim.keys(),
    ...outcomeMetadataCoverage.claimCoverageGaps.map((claim) => `${claim.url}::${claim.claimId}`),
  ])

  const items: OutcomeReviewQueueItem[] = []
  for (const key of keys) {
    const integrity = integrityByClaim.get(key)
    const coverage = coverageByClaim.get(key)
    const url = integrity?.url ?? coverage?.url
    const claimId = integrity?.claimId ?? coverage?.claimId
    if (!url || !claimId) continue
    const predicate = integrity?.predicate ?? coverage?.predicate ?? ''
    const confidence = integrity?.confidence ?? coverage?.confidence ?? 0
    const outcomeMetadataGap = coverage?.outcomeMetadataGap ?? false
    const highConfidenceOutcomeMetadataGap = coverage?.highConfidenceOutcomeMetadataGap ?? false
    const priority = priorityFor({ integrity, outcomeMetadataGap, highConfidenceOutcomeMetadataGap, confidence })
    const reasons = integrityReasons(integrity)
    if (outcomeMetadataGap) {
      reasons.push(
        `outcome-reporting assessability is incomplete (${coverage?.studiesWithNamedAlignmentData ?? 0}/${coverage?.primaryHumanStudies ?? 0} linked primary-human studies have named registered+reported primary outcomes)`,
      )
    }

    items.push({
      url,
      claimId,
      predicate,
      confidence,
      priority,
      integritySeverity: integrity?.severity ?? null,
      risks: integrity?.risks ?? [],
      outcomeMetadataGap,
      highConfidenceOutcomeMetadataGap,
      primaryHumanStudies: coverage?.primaryHumanStudies ?? integrity?.linkedStudyCount ?? 0,
      studiesWithOutcomeMetadata: coverage?.studiesWithOutcomeMetadata ?? 0,
      studiesWithNamedAlignmentData: coverage?.studiesWithNamedAlignmentData ?? 0,
      namedAlignmentCoverage: coverage?.namedAlignmentCoverage ?? 0,
      affectedStudyIds: integrity?.affectedStudyIds ?? [],
      reasons,
    })
  }

  items.sort((a, b) =>
    PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
    || b.confidence - a.confidence
    || b.risks.length - a.risks.length
    || a.namedAlignmentCoverage - b.namedAlignmentCoverage
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )

  const urgent = items.filter((item) => item.priority === 'urgent')
  const high = items.filter((item) => item.priority === 'high')
  const metadataBackfill = items.filter((item) => item.outcomeMetadataGap)

  return {
    items,
    urgent,
    high,
    metadataBackfill,
    summary: {
      items: items.length,
      urgent: urgent.length,
      high: high.length,
      medium: items.filter((item) => item.priority === 'medium').length,
      low: items.filter((item) => item.priority === 'low').length,
      integrityFindings: items.filter((item) => item.integritySeverity !== null).length,
      metadataBackfill: metadataBackfill.length,
    },
  }
}
