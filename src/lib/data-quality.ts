import { hasPlaceholderText, sanitizeSurfaceText } from '@/lib/summary'
import { splitClean } from '@/lib/sanitize'

type SourceLike = { title?: string; url?: string } | string

type QualityFlags = {
  isIncomplete: boolean
  hasPlaceholderText: boolean
  hasWeakSources: boolean
}

export type QualityResult = {
  score: number
  flags: QualityFlags
}

function hasLongText(value: unknown, min = 40) {
  return sanitizeSurfaceText(value).length >= min
}

function normalizedSources(value: unknown): SourceLike[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => {
      if (typeof item === 'string') return sanitizeSurfaceText(item)
      if (!item || typeof item !== 'object') return null
      const source = item as Record<string, unknown>
      return {
        title: sanitizeSurfaceText(source.title),
        url: sanitizeSurfaceText(source.url),
      }
    })
    .filter(Boolean) as SourceLike[]
}

function hasRealSource(source: SourceLike) {
  if (typeof source === 'string') {
    return /^https?:\/\//i.test(source) || source.length > 12
  }
  const title = source.title || ''
  const url = source.url || ''
  return title.length > 8 && /^https?:\/\//i.test(url)
}

function scoreSources(value: unknown) {
  const sources = normalizedSources(value)
  if (sources.length === 0) return { score: -8, hasWeakSources: true }
  const good = sources.filter(hasRealSource).length
  if (good === 0) return { score: -6, hasWeakSources: true }
  if (good < Math.min(2, sources.length)) return { score: 2, hasWeakSources: true }
  return { score: Math.min(16, good * 6), hasWeakSources: false }
}

export function scoreHerbQuality(herb: Record<string, unknown>): QualityResult {
  const coreMissing = [
    sanitizeSurfaceText(herb.name || herb.common),
    sanitizeSurfaceText(herb.scientific || herb.latin),
    sanitizeSurfaceText(herb.description),
    sanitizeSurfaceText(herb.class || herb.category),
  ].filter(Boolean).length

  let score = 0
  score += coreMissing * 8
  if (splitClean(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds).length > 0)
    score += 10
  if (splitClean(herb.effects).length > 0) score += 12
  if (hasLongText(herb.mechanism || herb.mechanismOfAction, 30)) score += 12
  if (splitClean(herb.contraindications).length > 0) score += 8
  if (splitClean(herb.interactions).length > 0) score += 8
  if (hasLongText(herb.description, 70)) score += 8

  const sourceQuality = scoreSources(herb.sources)
  score += sourceQuality.score

  const textFields = [
    herb.description,
    herb.effects,
    herb.mechanism,
    herb.mechanismOfAction,
    herb.therapeuticUses,
  ]
  const hasPlaceholder = textFields.some(hasPlaceholderText)
  if (hasPlaceholder) score -= 35

  if (sanitizeSurfaceText(herb.description).length < 24) score -= 12

  const isIncomplete = coreMissing < 3 || score < 34

  return {
    score,
    flags: {
      isIncomplete,
      hasPlaceholderText: hasPlaceholder,
      hasWeakSources: sourceQuality.hasWeakSources,
    },
  }
}

export function scoreCompoundQuality(compound: Record<string, unknown>): QualityResult {
  let score = 0
  if (sanitizeSurfaceText(compound.name).length > 1) score += 10
  if (sanitizeSurfaceText(compound.category || compound.className || compound.class).length > 1)
    score += 8
  if (splitClean(compound.herbs).length > 0) score += 8
  if (splitClean(compound.effects).length > 0) score += 12
  if (hasLongText(compound.mechanism || compound.mechanismOfAction, 24)) score += 12
  if (splitClean(compound.contraindications).length > 0) score += 8
  if (splitClean(compound.interactions).length > 0) score += 6
  if (hasLongText(compound.description, 50)) score += 8

  const sourceQuality = scoreSources(compound.sources)
  score += sourceQuality.score

  const hasPlaceholder = [
    compound.description,
    compound.effects,
    compound.mechanism,
    compound.mechanismOfAction,
  ].some(hasPlaceholderText)
  if (hasPlaceholder) score -= 35

  const isIncomplete = score < 24

  return {
    score,
    flags: {
      isIncomplete,
      hasPlaceholderText: hasPlaceholder,
      hasWeakSources: sourceQuality.hasWeakSources,
    },
  }
}

export function toQualityBadge(
  quality: QualityResult
): 'High confidence' | 'Needs sources' | 'Incomplete' {
  if (quality.flags.isIncomplete) return 'Incomplete'
  if (quality.flags.hasWeakSources) return 'Needs sources'
  return 'High confidence'
}
