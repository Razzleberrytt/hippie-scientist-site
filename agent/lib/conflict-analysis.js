export function detectConflicts(rows = []) {
  const positive = rows.filter(r => r.effect_direction === '+').length
  const negative = rows.filter(r => r.effect_direction === '-').length

  if (positive > 0 && negative > 0) {
    return {
      has_conflict: true,
      summary: 'Mixed evidence directions detected.',
    }
  }

  return {
    has_conflict: false,
    summary: 'No major directional conflicts detected.',
  }
}
