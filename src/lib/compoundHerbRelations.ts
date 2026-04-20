import type { Herb } from '@/types'
import type { CompoundRecord } from '@/lib/compound-data'

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
  return String(value || '')
    .trim()
    .toLowerCase()
}

function pickHerbName(herb: Herb) {
  return String(herb.common || herb.name || herb.scientific || herb.slug || '').trim()
}

function pickDescriptor(herb: Herb) {
  const primaryActions = Array.isArray(herb.primaryActions)
    ? herb.primaryActions.filter(effect => typeof effect === 'string' && effect.trim())
    : Array.isArray(herb.effects)
      ? herb.effects.filter(effect => typeof effect === 'string' && effect.trim())
      : []
  if (primaryActions.length > 0) return primaryActions[0]

  const description = String(herb.description || '').trim()
  if (description.length > 0) return description.slice(0, 80)

  const category = String(herb.category || herb.class || '').trim()
  if (category.length > 0) return category

  return 'Profile available'
}

export function mapRelatedHerbsForCompound(compound: CompoundRecord, herbs: Herb[]): RelatedHerb[] {
  const compoundNameKey = normalizeKey(compound.name)

  const fromCompoundDataset = compound.herbs
    .map<RelatedHerb | null>(name => {
      const key = normalizeKey(name)
      if (!key) return null

      const existing = herbs.find(herb =>
        [herb.common, herb.name, herb.scientific, herb.slug].some(
          label => normalizeKey(label) === key
        )
      )

      if (existing) {
        return {
          slug: String(existing.slug),
          name: pickHerbName(existing),
          descriptor: pickDescriptor(existing),
          confidence: existing.confidence,
          primaryActions: Array.isArray(existing.primaryActions)
            ? existing.primaryActions
            : Array.isArray(existing.effects)
              ? existing.effects
              : [],
          primaryEffects: Array.isArray(existing.primary_effects)
            ? existing.primary_effects
            : Array.isArray(existing.primaryEffects)
              ? existing.primaryEffects
              : [],
          profileStatus: String(existing.profile_status || existing.profileStatus || '').trim() || undefined,
          summaryQuality: String(existing.summary_quality || existing.summaryQuality || '').trim() || undefined,
        } satisfies RelatedHerb
      }
      
      return null
    })
      .filter((item): item is RelatedHerb => item !== null)

  const fromHerbCompounds = herbs
    .filter(herb => {
      const compounds = Array.isArray(herb.activeCompounds)
        ? herb.activeCompounds
        : Array.isArray(herb.active_compounds)
          ? herb.active_compounds
          : Array.isArray(herb.compounds)
            ? herb.compounds
            : []
      return compounds.some(item => normalizeKey(item) === compoundNameKey)
    })
    .map(herb => ({
      slug: String(herb.slug),
      name: pickHerbName(herb),
      descriptor: pickDescriptor(herb),
      confidence: herb.confidence,
      primaryActions: Array.isArray(herb.primaryActions)
        ? herb.primaryActions
        : Array.isArray(herb.effects)
          ? herb.effects
          : [],
      primaryEffects: Array.isArray(herb.primary_effects)
        ? herb.primary_effects
        : Array.isArray(herb.primaryEffects)
          ? herb.primaryEffects
          : [],
      profileStatus: String(herb.profile_status || herb.profileStatus || '').trim() || undefined,
      summaryQuality: String(herb.summary_quality || herb.summaryQuality || '').trim() || undefined,
    }))

  const merged = new Map<string, RelatedHerb>()
  const relatedHerbs = [...fromCompoundDataset, ...fromHerbCompounds].filter(
    (item): item is RelatedHerb => item !== null,
  )
  for (const herb of relatedHerbs) {
    const key = normalizeKey(herb.slug || herb.name)
    if (!key) continue
    if (!merged.has(key)) merged.set(key, herb)
  }

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
}
