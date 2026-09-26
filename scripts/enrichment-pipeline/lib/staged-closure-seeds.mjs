import { parseWorkpackOwner } from './canonical-owner.mjs'
import { findingTerminalState } from './session-bootstrap.mjs'

export function stagedClosureEntityKeys({ reconciliation, attestations } = {}) {
  const sidecarBySubmission = new Map(
    (attestations?.entries ?? []).map(entry => [entry.submissionId, entry]),
  )
  const keys = new Set()
  const records = [
    ...(reconciliation?.candidates ?? []),
    ...(reconciliation?.blocked ?? []),
  ]

  for (const record of records) {
    if (record?.sourceKind !== 'parallel') continue
    const submission = record?.submission
    if (!submission?.submissionId) continue
    if (findingTerminalState(submission, sidecarBySubmission.get(submission.submissionId)).terminal) continue

    const owner = parseWorkpackOwner(
      record?.reconciliation?.canonicalWorkpackId ?? submission.workpackId,
    )
    if (!owner) continue
    keys.add(`${owner.entityType}:${owner.slug}`)
  }

  return [...keys].sort()
}
