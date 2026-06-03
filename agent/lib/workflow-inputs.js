export function normalizeWorkflowInputs(input = {}) {
  return {
    mode: input.mode || 'fast',
    batch: Math.min(100, Math.max(1, Number(input.batch || 50))),
    priority_only: Boolean(input.priority_only),
    enrichment: Boolean(input.enrichment),
  }
}
