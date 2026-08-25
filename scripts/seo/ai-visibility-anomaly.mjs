export const AI_VISIBILITY_ANOMALIES = [
  {
    id: 'google-generative-ai-reporting-2026-08-13-17',
    startDate: '2026-08-13',
    endDate: '2026-08-17',
    scope: 'reported-generative-ai-search-impressions',
    disposition: 'exclude-from-trend-comparisons',
    note: 'Known reporting/logging anomaly. Treat as measurement corruption, not a traffic or ranking event.',
  },
]

export function normalizeDate(value) {
  const match = String(value ?? '').match(/\b(\d{4}-\d{2}-\d{2})\b/)
  return match?.[1] || ''
}

export function anomalyForDate(value) {
  const date = normalizeDate(value)
  if (!date) return null
  return AI_VISIBILITY_ANOMALIES.find(anomaly => date >= anomaly.startDate && date <= anomaly.endDate) || null
}

export function isCorruptedAiVisibilityDate(value) {
  return Boolean(anomalyForDate(value))
}

export function partitionDatedRows(rows, getDate) {
  const clean = []
  const excluded = []
  const undated = []

  for (const row of rows) {
    const date = normalizeDate(getDate(row))
    if (!date) {
      undated.push(row)
      clean.push(row)
      continue
    }
    if (isCorruptedAiVisibilityDate(date)) excluded.push(row)
    else clean.push(row)
  }

  return { clean, excluded, undated }
}
