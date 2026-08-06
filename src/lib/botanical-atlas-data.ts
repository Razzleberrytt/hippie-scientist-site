import { getHerbs } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import {
  inferAtlasEffectsFromMechanisms,
  normalizeCompoundClass,
  normalizeEffect,
  normalizeEvidence,
  normalizeIntensity,
  normalizeSafetySignal,
  uniqueNormalized,
} from '@/lib/botanical-atlas-taxonomy'
import type { BotanicalAtlasRecord } from '@/components/atlas/BotanicalActivityAtlasClient'
import type { RuntimeRecord } from '@/types/content'

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean)
  return []
}

const collect = (...values: unknown[]): string[] => values.flatMap(list)

const text = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim())
  return typeof value === 'string' ? value.trim() : ''
}

const KNOWN_COMPOUND_CLASSES = new Set([
  'Methylxanthines',
  'Alkaloids',
  'Flavonoids',
  'Terpenes / terpenoids',
  'Glycosides',
  'Phenolics',
  'Lactones',
  'Cannabinoids',
  'Withanolides',
])

const inferCompoundClasses = (compounds: string[]): string[] =>
  uniqueNormalized(compounds, normalizeCompoundClass).filter((value) => KNOWN_COMPOUND_CLASSES.has(value))

export const toAtlasRecord = (herb: RuntimeRecord): BotanicalAtlasRecord => {
  const explicitEffects = uniqueNormalized(
    collect(herb.primary_effects, herb.effects, herb.primaryActions, herb.benefits),
    normalizeEffect,
  )
  const mechanisms = collect(
    herb.mechanisms,
    herb.raw_mechanisms,
    herb.canonical_mechanisms,
    herb.mechanism_target_systems,
    herb.mechanism_classes,
  )
  const inferredEffects = inferAtlasEffectsFromMechanisms(mechanisms)
  const effects = Array.from(new Set([...explicitEffects, ...inferredEffects]))
  const compounds = collect(herb.activeCompounds, herb.active_compounds, herb.compounds, herb.activeconstituents)
  const explicitClasses = uniqueNormalized(
    collect(herb.compoundClasses, herb.pharmCategories, herb.compoundClass),
    normalizeCompoundClass,
  )
  const compoundClasses = explicitClasses.length ? explicitClasses : inferCompoundClasses(compounds)
  const rawSafety = collect(
    herb.safety_flags,
    herb.interactionTags,
    herb.contraindications,
    herb.interactions,
    herb.safety,
    herb.warnings,
    herb.side_effects,
  )

  return {
    slug: herb.slug,
    name: text(herb.displayName, herb.name, herb.commonName, herb.common, herb.slug.replaceAll('-', ' ')),
    scientificName: text(herb.scientificName, herb.scientificname, herb.latinName) || undefined,
    effects,
    compounds,
    compoundClasses,
    evidence: normalizeEvidence(text(herb.evidence_tier, herb.evidenceTier, herb.evidence_grade, herb.evidenceLevel)),
    intensity: normalizeIntensity(
      text(
        herb.intensityLabel,
        herb.intensityClean,
        herb.intensityLevel,
        herb.intensity,
        herb.noticeability,
        herb.effectIntensity,
        herb.subjectiveIntensity,
        herb.strength,
      ),
    ),
    safety: uniqueNormalized(rawSafety, normalizeSafetySignal),
    onset: text(herb.time_to_effect, herb.onset, herb.onsetTime) || undefined,
    duration: text(herb.duration, herb.effectDuration) || undefined,
  }
}

export async function getBotanicalAtlasRecords(): Promise<BotanicalAtlasRecord[]> {
  const rawHerbs = await getHerbs()
  return rawHerbs
    .filter((herb: RuntimeRecord) => {
      try {
        return getRuntimeVisibility(herb).canRender
      } catch {
        return true
      }
    })
    .map(toAtlasRecord)
    .filter((herb) => herb.effects.length || herb.compounds.length || herb.safety.length)
    .sort((a, b) => a.name.localeCompare(b.name))
}
