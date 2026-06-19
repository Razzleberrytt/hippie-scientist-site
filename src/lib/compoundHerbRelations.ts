import type { Herb } from '../types'
import type { CompoundRecord } from './compound-data'
import { safeArray, safeLower, safeSlug, safeTrim } from '@/lib/search-safe'

export type RelatedHerb = {
  slug: string
  name: string
  descriptor: string
  confidence?: Herb['confidence']
  primaryActions?: string[]
  primaryEffects?: string[]
  profileStatus?: string
  summaryQuality?: string
}

function normalizeKey(value: unknown) {
  return safeLower(value)
}

function pickHerbName(herb: Herb) {
  return safeTrim(herb.common || herb.name || herb.scientific || herb.slug || '')
}

function pickDescriptor(herb: Herb) {
  const primaryActions = safeArray<string>(
    Array.isArray(herb.primaryActions)
      ? herb.primaryActions
      : Array.isArray(herb.effects)
        ? herb.effects
        : []
  ).filter(effect => safeTrim(effect))

  if (primaryActions.length > 0) return primaryActions[0]

  const description = safeTrim(herb.description)
  if (description.length > 0) return description.slice(0, 80)

  const category = safeTrim(herb.category || herb.class)
  if (category.length > 0) return category

  return 'Profile available'
}

export function mapRelatedHerbsForCompound(compound: CompoundRecord, herbs: Herb[]): RelatedHerb[] {
  const compoundNameKey = normalizeKey(compound?.name)

  const fromCompoundDataset = safeArray<string>(compound?.herbs)
    .map<RelatedHerb | null>(name => {
      const key = normalizeKey(name)
      if (!key) return null

      const existing = safeArray(herbs).find(herb =>
        [herb?.common, herb?.name, herb?.scientific, herb?.slug].some(
          label => normalizeKey(label) === key
        )
      )

      if (!existing) {
        return null
      }

      const slug = safeSlug(existing.slug)
      if (!slug) {
        return null
      }

      return {
        slug,
        name: pickHerbName(existing),
        descriptor: pickDescriptor(existing),
        confidence: existing.confidence,
        primaryActions: safeArray<string>(
          Array.isArray(existing.primaryActions)
            ? existing.primaryActions
            : Array.isArray(existing.effects)
              ? existing.effects
              : []
        ).filter(Boolean),
        primaryEffects: safeArray<string>(
          Array.isArray(existing.primary_effects)
            ? existing.primary_effects
            : Array.isArray(existing.primaryEffects)
              ? existing.primaryEffects
              : []
        ).filter(Boolean),
        profileStatus: safeTrim(existing.profile_status || existing.profileStatus) || undefined,
        summaryQuality: safeTrim(existing.summary_quality || existing.summaryQuality) || undefined,
      } satisfies RelatedHerb
    })
    .filter((item): item is RelatedHerb => item !== null)

  const fromHerbCompounds = safeArray(herbs)
    .filter(herb => {
      const compounds = safeArray<string>(
        Array.isArray(herb.activeCompounds)
          ? herb.activeCompounds
          : Array.isArray(herb.active_compounds)
            ? herb.active_compounds
            : Array.isArray(herb.compounds)
              ? herb.compounds
              : []
      )

      return compounds.some(item => normalizeKey(item) === compoundNameKey)
    })
    .map(herb => {
      const slug = safeSlug(herb.slug)

      return {
        slug,
        name: pickHerbName(herb),
        descriptor: pickDescriptor(herb),
        confidence: herb.confidence,
        primaryActions: safeArray<string>(
          Array.isArray(herb.primaryActions)
            ? herb.primaryActions
            : Array.isArray(herb.effects)
              ? herb.effects
              : []
        ).filter(Boolean),
        primaryEffects: safeArray<string>(
          Array.isArray(herb.primary_effects)
            ? herb.primary_effects
            : Array.isArray(herb.primaryEffects)
              ? herb.primaryEffects
              : []
        ).filter(Boolean),
        profileStatus: safeTrim(herb.profile_status || herb.profileStatus) || undefined,
        summaryQuality: safeTrim(herb.summary_quality || herb.summaryQuality) || undefined,
      }
    })
    .filter(item => item.slug)

  const merged = new Map<string, RelatedHerb>()
  const relatedHerbs = [...fromCompoundDataset, ...fromHerbCompounds]

  for (const herb of relatedHerbs) {
    const key = normalizeKey(herb.slug || herb.name)
    if (!key) continue
    if (!merged.has(key)) merged.set(key, herb)
  }

  return Array.from(merged.values()).sort((a, b) =>
    safeLower(a?.name).localeCompare(safeLower(b?.name))
  )
}
