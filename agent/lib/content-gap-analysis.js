export function analyzeContentGaps(compound = {}) {
  const gaps = []

  if (!compound.summary) gaps.push('missing_summary')
  if (!compound.safety) gaps.push('missing_safety')
  if (!compound.effects?.length) gaps.push('missing_effects')
  if (!compound.mechanisms?.length) gaps.push('missing_mechanisms')
  if (!compound.sources?.length) gaps.push('missing_sources')

  return {
    slug: compound.slug,
    gaps,
    gap_count: gaps.length,
  }
}
