import type { Herb } from '../types'

export function herbName(herb: Partial<Herb> | null | undefined): string {
  if (!herb) return ''
  if (typeof herb.common === 'string' && herb.common.trim()) return herb.common.trim()
  if (typeof herb.name === 'string' && herb.name.trim()) return herb.name.trim()
  if (typeof herb.nameNorm === 'string' && herb.nameNorm.trim()) return herb.nameNorm.trim()
  if (typeof (herb as any).commonName === 'string' && (herb as any).commonName.trim())
    return (herb as any).commonName.trim()
  if (typeof herb.commonnames === 'string' && herb.commonnames.trim())
    return herb.commonnames.trim()
  if (typeof herb.scientific === 'string' && herb.scientific.trim()) return herb.scientific.trim()
  if (typeof herb.scientificname === 'string' && herb.scientificname.trim())
    return herb.scientificname.trim()
  return (herb.id as string) || ''
}

export function splitField(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.trim())
  if (typeof value === 'string') {
    return value
      .split(/;|,|\|/)
      .map(s => s.trim())
      .filter(Boolean)
  }
  return []
}
