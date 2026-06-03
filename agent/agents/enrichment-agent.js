export function runEnrichmentAgent(slug) {
  return {
    summary: `${slug} may have emerging human evidence, but findings remain preliminary and should be interpreted cautiously.`,
    best_for: ['areas with limited early human evidence'],
    avoid_if: [
      'pregnant or breastfeeding',
      'potential medication interactions',
    ],
    mechanism_notes: [
      'proposed mechanisms remain under investigation',
      'human evidence may not confirm mechanistic findings',
    ],
  }
}
