import type { CanonicalOutcomeId } from './outcomes'

export type MatrixEvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'Avoid/Insufficient'
export type MatrixEvidenceDirection = 'benefit' | 'no-benefit' | 'mixed' | 'harm'

export type OutcomeEvidenceCell = {
  ingredientId: string
  outcomeId: CanonicalOutcomeId | string
  grade: MatrixEvidenceGrade
  independentTrialCount: number
  publicationCount: number
  participantCount: number
  weightedEvidenceScore: number
  direction: MatrixEvidenceDirection
  popularityScore?: number
  marketingClaims?: string[]
}

export type OutcomeEvidenceMatrixRow = {
  outcomeId: string
  cells: OutcomeEvidenceCell[]
  mostStudied: OutcomeEvidenceCell | null
  bestSupported: OutcomeEvidenceCell | null
  strongestEvidence: OutcomeEvidenceCell[]
  weakOrNoBenefit: OutcomeEvidenceCell[]
  popularButWeakEvidence: OutcomeEvidenceCell[]
}

const GRADE_WEIGHT: Record<MatrixEvidenceGrade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  'Avoid/Insufficient': 1,
}

function supportScore(cell: OutcomeEvidenceCell) {
  const directionModifier = cell.direction === 'benefit' ? 1 : cell.direction === 'mixed' ? 0.65 : cell.direction === 'no-benefit' ? 0.2 : 0
  return GRADE_WEIGHT[cell.grade] * 100 + cell.weightedEvidenceScore * directionModifier
}

export function buildOutcomeEvidenceMatrix(cells: OutcomeEvidenceCell[]): OutcomeEvidenceMatrixRow[] {
  const grouped = new Map<string, OutcomeEvidenceCell[]>()
  for (const cell of cells) {
    const row = grouped.get(cell.outcomeId) ?? []
    row.push(cell)
    grouped.set(cell.outcomeId, row)
  }

  return [...grouped.entries()]
    .map(([outcomeId, rowCells]) => {
      const mostStudied = [...rowCells].sort((a, b) => {
        if (b.independentTrialCount !== a.independentTrialCount) return b.independentTrialCount - a.independentTrialCount
        return b.participantCount - a.participantCount
      })[0] ?? null

      const bestSupported = [...rowCells].sort((a, b) => supportScore(b) - supportScore(a))[0] ?? null
      const strongestEvidence = rowCells.filter((cell) => cell.direction === 'benefit' && (cell.grade === 'A' || cell.grade === 'B'))
      const weakOrNoBenefit = rowCells.filter((cell) =>
        cell.direction === 'no-benefit' || cell.direction === 'harm' || cell.grade === 'D' || cell.grade === 'Avoid/Insufficient',
      )
      const popularButWeakEvidence = rowCells.filter((cell) =>
        (cell.popularityScore ?? 0) >= 70 &&
        (cell.grade === 'D' || cell.grade === 'Avoid/Insufficient' || cell.direction === 'no-benefit' || cell.direction === 'mixed'),
      )

      return { outcomeId, cells: rowCells, mostStudied, bestSupported, strongestEvidence, weakOrNoBenefit, popularButWeakEvidence }
    })
    .sort((a, b) => a.outcomeId.localeCompare(b.outcomeId))
}

export type MarketingClaimAudit = {
  ingredientId: string
  outcomeId: string
  marketingClaimCount: number
  evidenceGrade: MatrixEvidenceGrade
  evidenceDirection: MatrixEvidenceDirection
  mismatchScore: number
  classification: 'aligned' | 'overmarketed' | 'underrecognized' | 'unclear'
  notes: string[]
}

export function auditMarketingAgainstEvidence(cells: OutcomeEvidenceCell[]): MarketingClaimAudit[] {
  return cells.map((cell) => {
    const claimCount = cell.marketingClaims?.length ?? 0
    const strongEvidence = (cell.grade === 'A' || cell.grade === 'B') && cell.direction === 'benefit'
    const weakEvidence = cell.grade === 'D' || cell.grade === 'Avoid/Insufficient' || cell.direction === 'no-benefit' || cell.direction === 'harm'
    const marketingIntensity = Math.min(100, claimCount * 20 + (cell.popularityScore ?? 0) * 0.5)
    const evidenceStrength = Math.min(100, GRADE_WEIGHT[cell.grade] * 18 + Math.max(0, cell.weightedEvidenceScore) * 0.1)
    const mismatchScore = Math.round(Math.abs(marketingIntensity - evidenceStrength))

    let classification: MarketingClaimAudit['classification'] = 'unclear'
    const notes: string[] = []
    // Heavy promotion against evidence that is merely not strong - a middling
    // grade, or a mixed direction - was falling through to `unclear`, so an
    // ingredient with three marketing claims, high popularity and mixed-direction
    // grade C evidence was never flagged. Overmarketing does not require the
    // evidence to be graded D or show harm; it requires the marketing to outrun
    // whatever the evidence actually supports.
    const promotionalOverreach = !strongEvidence && marketingIntensity >= 50 && mismatchScore >= 30

    if ((weakEvidence && marketingIntensity >= 50) || promotionalOverreach) {
      classification = 'overmarketed'
      notes.push('Marketing intensity materially exceeds the strength or direction of the evidence.')
    } else if (strongEvidence && marketingIntensity < 30) {
      classification = 'underrecognized'
      notes.push('Evidence support is stronger than current marketing intensity suggests.')
    } else if ((strongEvidence && marketingIntensity >= 30) || (!weakEvidence && mismatchScore < 30)) {
      classification = 'aligned'
      notes.push('Marketing intensity and evidence support are broadly aligned.')
    }

    if (cell.publicationCount > cell.independentTrialCount * 1.5) {
      notes.push('Publication volume exceeds independent-trial volume; avoid treating publication count as replication.')
    }
    if (cell.direction === 'mixed') notes.push('Evidence direction is mixed; promotional simplification would be misleading.')
    if (cell.direction === 'harm') notes.push('Potential harm signal should take priority over promotional messaging.')

    return {
      ingredientId: cell.ingredientId,
      outcomeId: cell.outcomeId,
      marketingClaimCount: claimCount,
      evidenceGrade: cell.grade,
      evidenceDirection: cell.direction,
      mismatchScore,
      classification,
      notes,
    }
  })
}

export type EvidenceVisualizationDatum = {
  ingredientId: string
  outcomeId: string
  grade: MatrixEvidenceGrade
  independentTrialCount: number
  participantCount: number
  weightedEvidenceScore: number
  direction: MatrixEvidenceDirection
  popularityScore: number
  marketingMismatchScore: number
}

export function buildEvidenceVisualizationData(cells: OutcomeEvidenceCell[]): EvidenceVisualizationDatum[] {
  const audits = new Map(
    auditMarketingAgainstEvidence(cells).map((audit) => [`${audit.ingredientId}:${audit.outcomeId}`, audit]),
  )

  return cells.map((cell) => ({
    ingredientId: cell.ingredientId,
    outcomeId: cell.outcomeId,
    grade: cell.grade,
    independentTrialCount: cell.independentTrialCount,
    participantCount: cell.participantCount,
    weightedEvidenceScore: cell.weightedEvidenceScore,
    direction: cell.direction,
    popularityScore: cell.popularityScore ?? 0,
    marketingMismatchScore: audits.get(`${cell.ingredientId}:${cell.outcomeId}`)?.mismatchScore ?? 0,
  }))
}

export function quarterlyAuditSnapshot(cells: OutcomeEvidenceCell[], asOf: string) {
  const audits = auditMarketingAgainstEvidence(cells)
  return {
    asOf,
    ingredientOutcomePairs: audits.length,
    overmarketedCount: audits.filter((audit) => audit.classification === 'overmarketed').length,
    underrecognizedCount: audits.filter((audit) => audit.classification === 'underrecognized').length,
    highMismatch: audits.filter((audit) => audit.mismatchScore >= 50),
    data: buildEvidenceVisualizationData(cells),
  }
}
