import type { Compound } from '@/types/compound'

export function getCompoundByName(name: string, compounds: Compound[]): Compound | undefined {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return undefined
  return compounds.find(compound => compound.name.toLowerCase() === normalized)
}
