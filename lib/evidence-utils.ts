import { normalizeDecisionEvidence, normalizeDecisionSafety } from './decision-primitives'

export function normalizeEvidenceLevel(value?: string) {
  return normalizeDecisionEvidence(value)
}

export function normalizeSafetyLevel(value?: string) {
  return normalizeDecisionSafety(value)
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
