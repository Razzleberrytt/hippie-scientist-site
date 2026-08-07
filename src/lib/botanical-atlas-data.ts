import { getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { cache } from '@/lib/react-cache'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import {
  inferAtlasEffectsFromMechanisms,
  normalizeCompoundClass,
  normalizeEffect,
  normalizeEvidence,
  normalizeIntensity,
  normalizeSafetySignals,
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
  'Methylxanthines', 'Alkaloids', 'Flavonoids', 'Terpenes / terpenoids', 'Glycosides', 'Phenolics', 'Lactones', 'Cannabinoids', 'Withanolides',
])

const inferCompoundClasses = (compounds: string[]): string[] =>
  uniqueNormalized(compounds, normalizeCompoundClass).filter((value) => KNOWN_COMPOUND_CLASSES.has(value))

export const toAtlasRecord = (herb: RuntimeRecord): BotanicalAtlasRecord => {
  const explicitEffects = uniqueNormalized(collect(herb.primary_effects, herb.effects, herb.primaryActions, herb.benefits), normalizeEffect)
  const mechanisms = collect(herb.mechanisms, herb.raw_mechanisms, herb.canonical_mechanisms, herb.mechanism_target_systems, herb.mechanism_classes)
  const inferredEffects = inferAtlasEffectsFromMechanisms(mechanisms).filter((effect) => !explicitEffects.includes(effect))
  const effects = [...explicitEffects, ...inferredEffects]
  const compounds = collect(herb.activeCompounds, herb.active_compounds, herb.active_constituents, herb.activeconstituents, herb.compounds, herb.compound_profile, herb.related_compounds)
  const explicitClasses = uniqueNormalized(collect(herb.compoundClasses, herb.pharmCategories, herb.compoundClass), normalizeCompoundClass)
  const compoundClasses = explicitClasses.length ? explicitClasses : inferCompoundClasses(compounds)
  const rawSafety = collect(herb.safety_flags, herb.interactionTags, herb.contraindications, herb.interactions, herb.safety, herb.warnings, herb.side_effects)
  const safety = Array.from(new Set(rawSafety.flatMap(normalizeSafetySignals)))

  return {
    slug: herb.slug,
    name: text(herb.displayName, herb.name, herb.commonName, herb.common, herb.slug.replaceAll('-', ' ')),
    scientificName: text(herb.scientificName, herb.scientificname, herb.scientific_name, herb.latinName, herb.latin_name) || undefined,
    effects,
    explicitEffects,
    inferredEffects,
    compounds,
    compoundClasses,
    evidence: normalizeEvidence(text(herb.evidence_tier, herb.evidenceTier, herb.evidence_grade, herb.evidenceLevel)),
    intensity: normalizeIntensity(text(herb.intensityLabel, herb.intensityClean, herb.intensityLevel, herb.intensity, herb.noticeability, herb.effectIntensity, herb.subjectiveIntensity, herb.strength)),
    safety,
    onset: text(herb.time_to_effect, herb.onset, herb.onsetTime) || undefined,
    duration: text(herb.duration, herb.effectDuration) || undefined,
  }
}

export function buildMappedCompoundsByHerb(rows: RuntimeRecord[]): Map<string, string[]> {
  const compoundsByHerb = new Map<string, string[]>()
  for (const row of rows) {
    const herbSlug = text(row.herb_slug, row.herbSlug)
    const compound = text(row.compound, row.compound_name, row.compoundName, row.compound_slug, row.compoundSlug)
    const relationship = text(row.relationship, row.relationship_type, row.relationshipType).toLowerCase()
    if (!herbSlug || !compound) continue
    if (relationship && !relationship.includes('contains')) continue
    const existing = compoundsByHerb.get(herbSlug) ?? []
    compoundsByHerb.set(herbSlug, collect(existing, compound))
  }
  return compoundsByHerb
}

export function enrichAtlasRecordWithMappedCompounds(record: BotanicalAtlasRecord, mappedCompounds: string[] = []): BotanicalAtlasRecord {
  const compounds = Array.from(new Map(collect(record.compounds, mappedCompounds).map((compound) => [compound.toLowerCase(), compound])).values())
  const compoundClasses = record.compoundClasses.length ? record.compoundClasses : inferCompoundClasses(compounds)
  return { ...record, compounds, compoundClasses }
}

export const getBotanicalAtlasRecords = cache(async (): Promise<BotanicalAtlasRecord[]> => {
  const [rawHerbs, herbCompoundMap] = await Promise.all([getHerbs(), getHerbCompoundMap()])
  const herbRecords = rawHerbs as RuntimeRecord[]
  const compoundMapRows = herbCompoundMap as RuntimeRecord[]
  const mappedCompoundsByHerb = buildMappedCompoundsByHerb(compoundMapRows)

  return herbRecords
    .filter((herb: RuntimeRecord) => {
      try { return getRuntimeVisibility(herb).canRender } catch { return true }
    })
    .map(toAtlasRecord)
    .map((record: BotanicalAtlasRecord) => enrichAtlasRecordWithMappedCompounds(record, mappedCompoundsByHerb.get(record.slug)))
    .filter((herb: BotanicalAtlasRecord) => herb.effects.length || herb.compounds.length || herb.safety.length)
    .sort((a: BotanicalAtlasRecord, b: BotanicalAtlasRecord) => a.name.localeCompare(b.name))
})