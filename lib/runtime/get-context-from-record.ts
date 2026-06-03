import type { DiscoveryContext } from '@/lib/runtime/get-discovery-items'

function text(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function list(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(item => text(item))
    .filter(Boolean)
}

export function getContextFromRecord(record: any): DiscoveryContext {
  const combined = [
    text(record?.title),
    text(record?.name),
    text(record?.summary),
    text(record?.description),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.categories),
    ...list(record?.tags),
  ].join(' ')

  if (
    /stress|cortisol|fatigue|burnout|adaptogen|resilience/.test(combined)
  ) {
    return 'stress'
  }

  if (
    /focus|attention|motivation|dopamine|executive|nootropic/.test(combined)
  ) {
    return 'focus'
  }

  if (
    /sleep|insomnia|restoration|recovery/.test(combined)
  ) {
    return 'sleep'
  }

  if (
    /psychedelic|psychoactive|altered|perception|hallucin/.test(combined)
  ) {
    return 'psychoactive'
  }

  if (
    /cognition|memory|learning|neuroplasticity/.test(combined)
  ) {
    return 'cognition'
  }

  return 'default'
}
