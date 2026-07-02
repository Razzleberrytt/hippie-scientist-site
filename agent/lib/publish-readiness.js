export function assessPublishReadiness(compound = {}) {
  const checks = {
    has_summary: Boolean(compound.summary),
    has_effects: Boolean(compound.effects?.length || compound.primary_effects?.length),
    has_safety: Boolean(compound.safety),
    has_sources: Boolean(compound.sources?.length || compound.pmids?.length),
    has_mechanisms: Boolean(compound.mechanisms?.length),
  }

  const passed = Object.values(checks).filter(Boolean).length

  let status = 'minimal'
  if (passed >= 4) status = 'strong'
  else if (passed >= 2) status = 'partial'

  return {
    slug: compound.slug,
    status,
    score: passed,
    checks,
  }
}
