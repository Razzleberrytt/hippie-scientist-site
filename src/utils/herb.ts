import type { Herb } from '../types'

export function herbName(herb: Herb): string {
  return herb.common ?? herb.commonName ?? herb.name ?? herb.slug
}

export function splitField(value: string[] | string | unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof value !== 'string') return []
  return value
    .split(/[;,|]/)
    .map(item => item.trim())
    .filter(Boolean)
}
