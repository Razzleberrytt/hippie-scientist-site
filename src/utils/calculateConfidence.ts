export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type ConfidenceEntity = 'herb' | 'compound'

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
  return calculateHerbConfidence(input)
}

function hasStrongMechanism(value: unknown): boolean {
  return hasText(value) && String(value).trim().length >= 30
}

export function calculateHerbConfidence(input: ConfidenceInput): ConfidenceLevel {
  const hasMechanism = hasText(input.mechanism)
  const effectCount = toItems(input.effects).length
  const compoundCount = toItems(input.compounds).length

  if (hasMechanism && effectCount >= 2 && compoundCount >= 1) {
    return 'high'
  }

  if (effectCount > 0 && (!hasMechanism || compoundCount < 1)) {
    return 'medium'
  }

  return 'low'
}

export function calculateCompoundConfidence(input: ConfidenceInput): ConfidenceLevel {
  const hasMechanism = hasText(input.mechanism)
  const effectCount = toItems(input.effects).length

  if (hasMechanism && effectCount >= 2) {
    return 'high'
  }

  if (effectCount > 0 && (!hasStrongMechanism(input.mechanism) || effectCount < 2)) {
    return 'medium'
  }

  return 'low'
}

export function calculateConfidenceFor(
  entity: ConfidenceEntity,
  input: ConfidenceInput
): ConfidenceLevel {
  if (entity === 'compound') return calculateCompoundConfidence(input)
  return calculateHerbConfidence(input)
}
