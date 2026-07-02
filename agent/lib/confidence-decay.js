export function confidenceDecay({
  base = 1,
  conflicts = 0,
  replicationIssues = 0,
  lowQuality = 0,
}) {
  let score = Number(base || 1)

  score -= conflicts * 0.15
  score -= replicationIssues * 0.1
  score -= lowQuality * 0.08

  if (score < 0) score = 0

  return Number(score.toFixed(2))
}
