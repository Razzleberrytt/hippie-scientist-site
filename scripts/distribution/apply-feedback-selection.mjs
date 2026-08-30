import { applyDistributionFeedback } from './opportunity-feedback.mjs'

function effectiveScore(candidate) {
  const adjusted = Number(candidate?.feedbackAdjustedScore)
  if (Number.isFinite(adjusted)) return adjusted
  const base = Number(candidate?.score)
  return Number.isFinite(base) ? base : Number.NEGATIVE_INFINITY
}

export function applyFeedbackToSelection(selection, history = [], options = {}) {
  const feedbackHistory = Array.isArray(history) ? history : []
  const candidates = (Array.isArray(selection?.candidates) ? selection.candidates : [])
    .map((candidate) => applyDistributionFeedback(candidate, feedbackHistory, options))

  const selectable = candidates.filter((candidate) => candidate?.selectable === true)
  selectable.sort((a, b) =>
    effectiveScore(b) - effectiveScore(a)
    || Number(b?.platformScore || 0) - Number(a?.platformScore || 0)
    || String(a?.id || '').localeCompare(String(b?.id || '')),
  )

  const eligible = candidates.filter((candidate) => candidate?.eligible === true)
  const status = selectable.length
    ? 'selected'
    : eligible.length
      ? 'waiting-for-unsaturated-angle'
      : 'waiting-for-governed-object'

  return {
    ...selection,
    status,
    selected: selectable[0] || null,
    candidates,
  }
}
