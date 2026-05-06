export function enforcePatchLimit(count, max = 500) {
  if (count > max) {
    throw new Error(`Patch limit exceeded: ${count}/${max}`)
  }
}

export function enforceAiBudget({
  aiCalls = 0,
  maxAiCalls = 50,
  enrichments = 0,
  maxEnrichments = 25,
}) {
  if (aiCalls > maxAiCalls) {
    throw new Error('AI call budget exceeded')
  }

  if (enrichments > maxEnrichments) {
    throw new Error('Enrichment budget exceeded')
  }
}

export function buildCommitMessage({
  workflow = 'agent',
  compounds = 0,
  mode = 'fast',
}) {
  return `${workflow}: processed ${compounds} compounds (${mode} mode)`
}
