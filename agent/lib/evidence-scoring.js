export function scoreEvidenceType(type = '') {
  const value = String(type).toLowerCase()

  if (value.includes('meta')) return 1
  if (value.includes('systematic')) return 0.95
  if (value.includes('rct')) return 0.9
  if (value.includes('clinical')) return 0.75
  if (value.includes('animal')) return 0.35
  if (value.includes('in_vitro')) return 0.2

  return 0.5
}

export function averageEvidenceScore(rows = []) {
  if (!rows.length) return 0

  const total = rows.reduce((sum, row) => {
    return sum + scoreEvidenceType(row.study_type)
  }, 0)

  return Number((total / rows.length).toFixed(2))
}
