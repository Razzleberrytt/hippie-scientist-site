import { normalizeText } from './normalizeText'
import { asStringArray } from './asStringArray'
import { isNonEmptyString } from './isNonEmptyString'

export type SearchableEntryFields = {
  name?: unknown
  type?: unknown
  mechanism?: unknown
  effects?: unknown
  activeCompounds?: unknown
  contraindications?: unknown
  safety?: unknown
}

export type SearchResult<T> = {
  entry: T
  score: number
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return asStringArray(value)
      .map(item => normalizeText(item))
      .filter(Boolean)
  }
  if (!isNonEmptyString(value)) return []
  return value
    .split(/[\n;,|]/)
    .map(item => normalizeText(item))
    .map(item => item.trim())
    .filter(Boolean)
}

function includesAnyToken(value: string, query: string) {
  const tokens = query.split(' ').filter(Boolean)
  if (tokens.length === 0) return false
  return tokens.every(token => value.includes(token))
}

export function searchEntries<T>(
  entries: T[],
  query: string,
  getFields: (entry: T) => SearchableEntryFields
): SearchResult<T>[] {
  const q = normalizeText(query)
  if (!q) {
    return entries.map(entry => ({ entry, score: 0 }))
  }

  const scored: SearchResult<T>[] = []

  entries.forEach(entry => {
    const fields = getFields(entry)

    const name = normalizeText(fields.name)
    const type = normalizeText(fields.type)
    const mechanism = normalizeText(fields.mechanism)
    const effects = toList(fields.effects)
    const activeCompounds = toList(fields.activeCompounds)
    const contraindications = toList(fields.contraindications)
    const safety = toList(fields.safety)

    let score = 0

    if (name === q) score += 1000
    else if (name.startsWith(q)) score += 700
    else if (name.includes(q)) score += 500

    if (type && includesAnyToken(type, q)) score += 240
    if (mechanism && includesAnyToken(mechanism, q)) score += 220
    if (safety.some(item => includesAnyToken(item, q))) score += 180

    if (effects.some(effect => includesAnyToken(effect, q))) score += 200
    if (activeCompounds.some(compound => includesAnyToken(compound, q))) score += 170
    if (contraindications.some(item => includesAnyToken(item, q))) score += 140

    if (score > 0) {
      scored.push({ entry, score })
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}
