// Whether an approved_for_rollup submission may actually roll up on its source.
//
// Registry presence plus `active` used to be the whole gate. That let a source
// admitted with an explicit "needs separate human editorial adjudication" caveat
// in its free-text `notes` clear the gate anyway, because nothing read `notes`
// — the caveat existed only as prose for a human who might never look. See the
// Iscador mistletoe cancer-survival meta-analysis
// (src_doi-10-1159-000505202): admitting the source as citable silently made a
// supported_use/efficacy_signal survival claim rollup-eligible.
//
// `editorialAdjudication` on the registry row is the machine-readable form of
// that caveat. While it is present and uncleared, in-scope submissions are
// blocked regardless of reviewStatus.

/** True when a human has recorded both halves of the adjudication decision. */
function isCleared(hold) {
  return Boolean(hold?.clearedBy) && Boolean(hold?.clearedAt)
}

/**
 * Does this hold cover this submission? An unscoped hold (neither topicTypes nor
 * claimTypes) covers every claim on the source. A scoped hold covers a
 * submission matching any listed topicType OR claimType — OR, not AND, so a
 * hold written for "supported_use or efficacy_signal" cannot be sidestepped by
 * pairing a held topicType with an unlisted claimType.
 */
function holdCoversSubmission(hold, submission) {
  const topicTypes = Array.isArray(hold.topicTypes) ? hold.topicTypes : []
  const claimTypes = Array.isArray(hold.claimTypes) ? hold.claimTypes : []
  if (topicTypes.length === 0 && claimTypes.length === 0) return true
  return topicTypes.includes(submission?.topicType) || claimTypes.includes(submission?.claimType)
}

export function editorialAdjudicationError(submission, source) {
  const hold = source?.editorialAdjudication
  if (!hold) return null
  if (isCleared(hold)) return null
  if (!holdCoversSubmission(hold, submission)) return null

  const scope = [submission?.topicType, submission?.claimType].filter(Boolean).join('/') || 'this claim'
  return `sourceId ${submission.sourceId} holds ${scope} for human editorial adjudication: ${hold.reason}`
}

export function rollupSourceEligibilityError(submission, sourceById) {
  if (submission?.reviewStatus !== 'approved_for_rollup') return null

  const source = sourceById.get(submission.sourceId)
  if (!source) return `sourceId ${submission.sourceId} is missing from source registry`
  if (source.active !== true) return `sourceId ${submission.sourceId} is not active in source registry`

  return editorialAdjudicationError(submission, source)
}
