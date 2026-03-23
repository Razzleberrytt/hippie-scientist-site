export type ConfidenceLevel = 'high' | 'medium' | 'low'

type ConfidenceInput = {
  mechanism?: unknown
  effects?: unknown
  compounds?: unknown
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function toItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[\n,;|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceLevel {
  const hasMechanism = hasText(input.mechanism)
  const effectCount = toItems(input.effects).length
  const compoundCount = toItems(input.compounds).length

  if (hasMechanism && effectCount >= 2 && compoundCount >= 1) {
    return 'high'
  }

  if (effectCount > 0 && !hasMechanism) {
    return 'medium'
  }

  return 'low'
}
