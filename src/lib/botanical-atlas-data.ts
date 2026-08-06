import { getHerbs } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import {
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

const text = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim())
  return typeof value === 'string' ? value.trim() : ''
}

export const toAtlasRecord = (herb: RuntimeRecord): BotanicalAtlasRecord => {
  const rawEffects = list(herb.primary_effects ?? herb.effects ?? herb.primaryActions)
  const rawClasses = list(herb.compoundClasses ?? herb.pharmCategories ?? herb.compoundClass)
  const rawSafety = list(herb.safety_flags ?? herb.interactionTags ?? herb.contraindications ?? herb.interactions)

  return {
    slug: herb.slug,
    name: text(herb.displayName, herb.name, herb.commonName, herb.common, herb.slug.replaceAll('-', ' ')),
    scientificName: text(herb.scientificName, herb.scientificname, herb.latinName) || undefined,
    effects: uniqueNormalized(rawEffects, normalizeEffect),
    compounds: list(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds ?? herb.activeconstituents),
    compoundClasses: uniqueNormalized(rawClasses, normalizeCompoundClass),
    evidence: normalizeEvidence(text(herb.evidence_tier, herb.evidenceTier, herb.evidence_grade, herb.evidenceLevel)),
    intensity: normalizeIntensity(text(herb.intensityLabel, herb.intensityClean, herb.intensityLevel, herb.intensity)),
    safety: uniqueNormalized(rawSafety, normalizeSafetySignal),
    onset: text(herb.time_to_effect, herb.onset) || undefined,
    duration: text(herb.duration) || undefined,
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
