export type EvidenceGradeChange = {
  id: string
  ingredientSlug: string
  ingredientName: string
  ingredientPath: string
  changedAt: string
  quarter: string
  fromGrade: string
  toGrade: string
  reason: string
  sourceIds?: string[]
}

/**
 * Append-only public evidence-grade change ledger.
 *
 * New grade changes should be added as new events with a reason and, when
 * available, the study/source IDs that changed the conclusion. Historical
 * events should not be rewritten merely to simplify the current narrative.
 *
 * The initial empty state is deliberate: do not fabricate historical C→B or
 * B→A events that were not actually recorded at the time of review.
 */
export const evidenceGradeHistory: EvidenceGradeChange[] = []
