export function rollupSourceEligibilityError(submission, sourceById) {
  if (submission?.reviewStatus !== 'approved_for_rollup') return null

  const source = sourceById.get(submission.sourceId)
  if (!source) return `sourceId ${submission.sourceId} is missing from source registry`
  if (source.active !== true) return `sourceId ${submission.sourceId} is not active in source registry`

  return null
}
