import type { Herb } from '@/types'
import type { CompoundRecord } from '@/lib/compound-data'
import { slugify } from '@/lib/slug'

export type RelatedHerb = {
  slug: string
  name: string
  descriptor: string
  confidence?: Herb['confidence']
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
  const effects = Array.isArray(herb.effects)
    ? herb.effects.filter(effect => typeof effect === 'string' && effect.trim())
    : []
  if (effects.length > 0) return effects[0]

  const description = String(herb.description || '').trim()
  if (description.length > 0) return description.slice(0, 80)

  const category = String(herb.category || herb.class || '').trim()
  if (category.length > 0) return category

  return 'Profile available'
}

export function mapRelatedHerbsForCompound(compound: CompoundRecord, herbs: Herb[]): RelatedHerb[] {
  const compoundNameKey = normalizeKey(compound.name)

  const herbSlugByName = new Map<string, string>()
  for (const herb of herbs) {
    const slug = String(herb.slug || slugify(pickHerbName(herb)))
    if (!slug) continue

    const labels = [herb.common, herb.name, herb.scientific, herb.slug]
    for (const label of labels) {
      const key = normalizeKey(label)
      if (key && !herbSlugByName.has(key)) {
        herbSlugByName.set(key, slug)
      }
    }
  }

  const fromCompoundDataset = compound.herbs
    .map(name => {
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
        } satisfies RelatedHerb
      }

      return {
        slug: herbSlugByName.get(key) || slugify(String(name)),
        name: String(name),
        descriptor: 'Profile available',
      } satisfies RelatedHerb
    })
    .filter((item): item is RelatedHerb => Boolean(item))

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
    }))

  const merged = new Map<string, RelatedHerb>()
  for (const herb of [...fromCompoundDataset, ...fromHerbCompounds]) {
    const key = normalizeKey(herb.slug || herb.name)
    if (!key) continue
    if (!merged.has(key)) merged.set(key, herb)
  }

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
}
