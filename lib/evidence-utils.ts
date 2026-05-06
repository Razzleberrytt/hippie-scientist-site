export function normalizeEvidenceLevel(value?: string) {
  const text = String(value || '').toLowerCase()
  if (text.includes('strong') || text.includes('high')) return 'strong'
  if (text.includes('limited') || text.includes('low') || text.includes('weak')) return 'limited'
  return 'moderate'
}

export function normalizeSafetyLevel(value?: string) {
  const text = String(value || '').toLowerCase()
  if (text.includes('avoid') || text.includes('contraindicat')) return 'avoid'
  if (text.includes('caution') || text.includes('interaction') || text.includes('pregnan') || text.includes('liver')) return 'caution'
  return 'safe'
}

export function getEffects(row: any) {
  const effects = row?.effects || row?.primary_effects || []
  if (Array.isArray(effects) && effects.length) return effects.slice(0, 5)
  if (typeof effects === 'string' && effects.trim()) return effects.split(/[|;,]/).map(s => s.trim()).filter(Boolean).slice(0, 5)
  return ['No strong effects established yet']
}

export function getSources(row: any) {
  const sources = row?.sources || row?.references || row?.pmids || []
  if (Array.isArray(sources)) return sources.filter(Boolean)
  if (typeof sources === 'string') return sources.split(/[|;,]/).map(s => s.trim()).filter(Boolean)
  return []
}
