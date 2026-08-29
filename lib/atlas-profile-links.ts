import type { RuntimeRecord } from '@/types/content'
import {
  normalizeCompoundClass,
  normalizeEffect,
  normalizeSafetySignal,
  uniqueNormalized,
} from '@/lib/botanical-atlas-taxonomy'
import {
  DEFAULT_ATLAS_URL_STATE,
  serializeAtlasUrlState,
  type AtlasUrlState,
} from '@/lib/botanical-atlas-url-state'

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

const collect = (...values: unknown[]): string[] => values.flatMap(list)
const ATLAS_ROOT = '/tools/botanical-activity-atlas/'

const atlasHref = (path: string, overrides: Partial<AtlasUrlState>) =>
  `${path}${serializeAtlasUrlState({ ...DEFAULT_ATLAS_URL_STATE, ...overrides })}`

const FULL_ATLAS_LINK: AtlasProfileLink = {
  href: ATLAS_ROOT,
  label: 'Open the full activity atlas',
  reason: 'Compare effects, evidence, and safety',
}

export function getAtlasProfileLinks(record: RuntimeRecord): AtlasProfileLink[] {
  const effects = uniqueNormalized(
    collect(record.primary_effects, record.effects, record.primaryActions, record.benefits),
    normalizeEffect,
  )
  const compoundClasses = uniqueNormalized(
    collect(record.compoundClasses, record.pharmCategories, record.compoundClass),
    normalizeCompoundClass,
  )
  const safety = uniqueNormalized(
    collect(
      record.safety_flags,
      record.interactionTags,
      record.contraindications,
      record.interactions,
      record.safety,
      record.warnings,
      record.side_effects,
    ),
    normalizeSafetySignal,
  )

  const specificLinks: AtlasProfileLink[] = []
  const chemistry = compoundClasses.includes('Methylxanthines')
    ? 'Methylxanthines'
    : compoundClasses.includes('Alkaloids')
      ? 'Alkaloids'
      : null

  if (chemistry) {
    specificLinks.push({
      href: atlasHref(`${ATLAS_ROOT}alkaloid-botanicals/`, { compoundClass: chemistry }),
      label: chemistry === 'Methylxanthines' ? 'Compare methylxanthine botanicals' : 'Compare alkaloid botanicals',
      reason: `Filtered to the ${chemistry.toLowerCase()} chemistry family`,
    })
  }

  if (effects.includes('Stimulating / energy')) {
    specificLinks.push({
      href: atlasHref(`${ATLAS_ROOT}natural-stimulants/`, { effect: 'Stimulating / energy' }),
      label: 'Compare natural stimulants',
      reason: 'Filtered to a related effect profile',
    })
  }

  const calmingEffect = effects.includes('Calming')
    ? 'Calming'
    : effects.includes('Sedating / sleep')
      ? 'Sedating / sleep'
      : null

  if (calmingEffect) {
    specificLinks.push({
      href: atlasHref(`${ATLAS_ROOT}calming-botanicals/`, { effect: calmingEffect }),
      label: calmingEffect === 'Calming' ? 'Compare calming botanicals' : 'Compare sleep-supporting botanicals',
      reason: 'Filtered to a related effect profile',
    })
  }

  if (effects.includes('Dream / perception')) {
    specificLinks.push({
      href: atlasHref(`${ATLAS_ROOT}dream-and-perception-herbs/`, { effect: 'Dream / perception' }),
      label: 'Explore dream & perception herbs',
      reason: 'Filtered to a related effect profile',
    })
  }

  if (safety.includes('Serotonergic')) {
    specificLinks.push({
      href: atlasHref(`${ATLAS_ROOT}serotonergic-interaction-risk/`, { safety: 'Serotonergic' }),
      label: 'Review serotonergic risks',
      reason: 'Filtered to the relevant safety signal',
    })
  }

  return [...specificLinks.slice(0, 2), FULL_ATLAS_LINK]
}
