export function rankResearchQueue(items = []) {
  return items.sort((a, b) => {
    const aScore = (a.priority_score || 0) + (a.gap_count || 0)
    const bScore = (b.priority_score || 0) + (b.gap_count || 0)

    return bScore - aScore
  })
}
