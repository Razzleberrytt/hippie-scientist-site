export function runScoringAgent(rows) {
  let score = 0.3
  const reasoning = []

  for (const row of rows) {
    const studyType = String(row.study_type || '').toLowerCase()
    const sampleSize = Number.parseInt(row.sample_size || '0', 10)

    if (studyType.includes('meta')) {
      score += 0.4
      reasoning.push('meta_analysis_detected')
    } else if (studyType.includes('randomized')) {
      score += 0.3
      reasoning.push('randomized_trial_detected')
    } else if (studyType.includes('pilot')) {
      score += 0.1
      reasoning.push('pilot_study_detected')
    }

    if (sampleSize > 100) {
      score += 0.2
      reasoning.push('larger_sample_size')
    } else if (sampleSize < 25) {
      score -= 0.1
      reasoning.push('small_sample_size')
    }
  }

  score = Math.max(0, Math.min(1, score))

  return {
    confidence_score: Number(score.toFixed(2)),
    evidence_strength:
      score >= 0.75 ? 'high' : score >= 0.45 ? 'moderate' : 'low',
    confidence_reasoning: reasoning,
  }
}
