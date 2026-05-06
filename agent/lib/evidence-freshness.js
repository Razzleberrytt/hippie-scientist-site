export function evidenceFreshnessScore(dateValue = '') {
  if (!dateValue) return 0.5

  const published = new Date(dateValue)
  if (Number.isNaN(published.getTime())) return 0.5

  const ageYears = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

  if (ageYears <= 2) return 1
  if (ageYears <= 5) return 0.85
  if (ageYears <= 10) return 0.65
  if (ageYears <= 20) return 0.45

  return 0.25
}

export function averageFreshnessScore(rows = []) {
  if (!rows.length) return 0

  const total = rows.reduce((sum, row) => {
    return sum + evidenceFreshnessScore(row.published_at || row.year || row.date)
  }, 0)

  return Number((total / rows.length).toFixed(2))
}
