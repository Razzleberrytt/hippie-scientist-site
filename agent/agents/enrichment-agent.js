export function runEnrichmentAgent(slug) {
  return {
    summary: `${slug} has limited but emerging human evidence.`,
    best_for: ['general wellness support'],
    avoid_if: ['pregnant', 'medication interactions'],
    mechanism_notes: ['mechanisms remain under investigation'],
  }
}
