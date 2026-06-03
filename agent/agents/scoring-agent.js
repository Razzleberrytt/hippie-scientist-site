const SCORING_RULES = `
Scoring Rules:
- Human meta-analysis > randomized trial > observational > pilot.
- Small sample sizes reduce confidence.
- Missing source attribution reduces confidence.
- Evidence confidence must remain conservative.
- Never output certainty language.
`

export function runScoringAgent(rows = []) {
  let score = 0.25
  const reasoning = [SCORING_RULES.trim()]

  for (const row of rows) {
    const studyType = String(row.study_type || '').toLowerCase()
    const sampleSize = Number.parseInt(row.sample_size || '0', 10)

    if (studyType.includes('meta')) {
      score += 0.35
      reasoning.push('meta_analysis_detected')
    } else if (studyType.includes('randomized')) {
      score += 0.25
      reasoning.push('randomized_trial_detected')
    } else if (studyType.includes('observational')) {
      score += 0.1
      reasoning.push('observational_human_data_detected')
    } else if (studyType.includes('pilot')) {
      score += 0.05
      reasoning.push('pilot_study_detected')
    }

    if (sampleSize > 150) {
      score += 0.2
      reasoning.push('larger_sample_size')
    } else if (sampleSize < 25) {
      score -= 0.15
      reasoning.push('small_sample_size')
    }

    if (!row?.pmid_or_source) {
      score -= 0.15
      reasoning.push('missing_source_attribution')
    }
  }

  score = Math.max(0, Math.min(1, score))

  return {
    confidence_score: Number(score.toFixed(2)),
    evidence_strength:
      score >= 0.75 ? 'high' : score >= 0.45 ? 'moderate' : 'low',
    confidence_reasoning: [...new Set(reasoning)],
  }
}
