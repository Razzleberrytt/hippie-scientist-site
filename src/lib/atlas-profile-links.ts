import type { RuntimeRecord } from '@/types/content'
import {
  normalizeCompoundClass,
  normalizeEffect,
  normalizeSafetySignal,
  uniqueNormalized,
} from '@/lib/botanical-atlas-taxonomy'

export type AtlasProfileLink = {
  href: string
  label: string
  reason: string
}

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(list)
  if (typeof value !== 'string') return []
  return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean)
}

export function getAtlasProfileLinks(record: RuntimeRecord): AtlasProfileLink[] {
  const effects = uniqueNormalized(
    list(record.primary_effects ?? record.effects ?? record.primaryActions),
    normalizeEffect,
  )
  const compoundClasses = uniqueNormalized(
    list(record.compoundClasses ?? record.pharmCategories ?? record.compoundClass),
    normalizeCompoundClass,
  )
  const safety = uniqueNormalized(
    list(record.safety_flags ?? record.interactionTags ?? record.contraindications ?? record.interactions),
    normalizeSafetySignal,
  )

  const links: AtlasProfileLink[] = []

  if (compoundClasses.includes('Alkaloids') || compoundClasses.includes('Methylxanthines')) {
    links.push({
      href: '/tools/botanical-activity-atlas/alkaloid-botanicals/',
      label: 'Compare alkaloid botanicals',
      reason: 'Related active-chemistry family',
    })
  }

  if (effects.includes('Stimulating / energy')) {
    links.push({
      href: '/tools/botanical-activity-atlas/natural-stimulants/',
      label: 'Compare natural stimulants',
      reason: 'Related effect profile',
    })
  }

  if (effects.includes('Calming') || effects.includes('Sedating / sleep')) {
    links.push({
      href: '/tools/botanical-activity-atlas/calming-botanicals/',
      label: 'Compare calming botanicals',
      reason: 'Related effect profile',
    })
  }

  if (effects.includes('Dream / perception')) {
    links.push({
      href: '/tools/botanical-activity-atlas/dream-and-perception-herbs/',
      label: 'Explore dream & perception herbs',
      reason: 'Related effect profile',
    })
  }

  if (safety.includes('Serotonergic')) {
    links.push({
      href: '/tools/botanical-activity-atlas/serotonergic-interaction-risk/',
      label: 'Review serotonergic risks',
      reason: 'Related safety signal',
    })
  }

  links.push({
    href: '/tools/botanical-activity-atlas/',
    label: 'Open the full activity atlas',
    reason: 'Compare effects, evidence, and safety',
  })

  return links.slice(0, 3)
}
