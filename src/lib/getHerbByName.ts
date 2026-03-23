import type { Herb } from '@/types/herb'

export function getHerbByName(name: string, herbs: Herb[]): Herb | undefined {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return undefined
  return herbs.find(herb => herb.name.toLowerCase() === normalized)
}
