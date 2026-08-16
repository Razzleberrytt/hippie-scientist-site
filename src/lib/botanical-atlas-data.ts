import { getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { cache } from '@/lib/react-cache'
import { getEvidenceLetterGrade, type EvidenceLetterGrade } from '../../lib/evidence'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'
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

const positiveInteger = (...values: unknown[]): number => {
  for (const value of values) {
    if (Array.isArray(value)) return value.length
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.floor(value)
    if (typeof value === 'string') {
      const match = value.match(/\d+/)
      if (match) return Number.parseInt(match[0], 10)
    }
  }
  return 0
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

const atlasEvidenceFromGrade = (grade: EvidenceLetterGrade): string => {
  if (grade === 'A') return 'Strong'
  if (grade === 'B') return 'Moderate'
  if (grade === 'C') return 'Preliminary'
  if (grade === 'D') return 'Traditional / preclinical'
  return 'Unclassified'
}

export const toAtlasRecord = (herb: RuntimeRecord): BotanicalAtlasRecord => {
  const explicitEffects = uniqueNormalized(
    collect(herb.primary_effects, herb.effects, herb.primaryActions, herb.benefits),
    normalizeEffect,
  )
  const mechanisms = Array.from(new Set(collect(
    herb.mechanisms,
    herb.raw_mechanisms,
    herb.canonical_mechanisms,
    herb.mechanism_target_systems,
    herb.mechanism_classes,
  )))
  const inferredEffects = inferAtlasEffectsFromMechanisms(mechanisms)
    .filter((effect) => !explicitEffects.includes(effect))
  const effects = [...explicitEffects, ...inferredEffects]
  const compounds = collect(
    herb.activeCompounds,
    herb.active_compounds,
    herb.active_constituents,
    herb.activeconstituents,
    herb.compounds,
    herb.compound_profile,
    herb.related_compounds,
  )
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
    scientificName: text(
      herb.scientificName,
      herb.scientificname,
      herb.scientific_name,
      herb.latinName,
      herb.latin_name,
    ) || undefined,
    effects,
    explicitEffects,
    inferredEffects,
    mechanisms,
    compounds,
    compoundClasses,
    evidence: normalizeEvidence(text(herb.evidence_tier, herb.evidenceTier, herb.evidence_grade, herb.evidenceLevel)),
    humanEvidenceCount: positiveInteger(
      herb.human_trial_count,
      herb.humanTrialCount,
      herb.human_study_count,
      herb.humanStudyCount,
      herb.clinical_study_count,
      herb.clinicalStudyCount,
      herb.human_trials,
      herb.humanTrials,
      herb.clinical_trials,
      herb.clinicalTrials,
    ),
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
    safety: Array.from(new Set(rawSafety.flatMap(normalizeSafetySignals))),
    onset: text(herb.time_to_effect, herb.onset, herb.onsetTime) || undefined,
    duration: text(herb.duration, herb.effectDuration) || undefined,
    sourceRelationships: [],
  }
}

export interface AtlasCompoundRelationship {
  compound: string
  relationship: string
}

export function buildMappedCompoundsByHerb(rows: RuntimeRecord[]): Map<string, AtlasCompoundRelationship[]> {
  const compoundsByHerb = new Map<string, AtlasCompoundRelationship[]>()

  for (const row of rows) {
    const herbSlug = text(row.herb_slug, row.herbSlug)
    const compound = text(row.compound, row.compound_name, row.compoundName, row.compound_slug, row.compoundSlug)
    const rawRelationship = text(row.relationship, row.relationship_type, row.relationshipType)
    const relationship = rawRelationship.toLowerCase()
    if (!herbSlug || !compound) continue
    if (relationship && !relationship.includes('contains')) continue

    const existing = compoundsByHerb.get(herbSlug) ?? []
    if (!existing.some((item) => item.compound.toLowerCase() === compound.toLowerCase())) {
      existing.push({ compound, relationship: rawRelationship || 'contains' })
    }
    compoundsByHerb.set(herbSlug, existing)
  }

  return compoundsByHerb
}

export function enrichAtlasRecordWithMappedCompounds(
  record: BotanicalAtlasRecord,
  mappedRelationships: AtlasCompoundRelationship[] = [],
): BotanicalAtlasRecord {
  const mappedCompounds = mappedRelationships.map((item) => item.compound)
  const compounds = Array.from(new Map(
    collect(record.compounds, mappedCompounds).map((compound) => [compound.toLowerCase(), compound]),
  ).values())
  const compoundClasses = record.compoundClasses.length
    ? record.compoundClasses
    : inferCompoundClasses(compounds)

  return {
    ...record,
    compounds,
    compoundClasses,
    sourceRelationships: mappedRelationships.map((item) => `${record.name} ${item.relationship} ${item.compound}`),
  }
}

export const getBotanicalAtlasRecords = cache(async (): Promise<BotanicalAtlasRecord[]> => {
  const [rawHerbs, herbCompoundMap] = await Promise.all([
    getHerbs(),
    getHerbCompoundMap(),
  ])
  const herbRecords = rawHerbs as RuntimeRecord[]
  const compoundMapRows = herbCompoundMap as RuntimeRecord[]
  const mappedCompoundsByHerb = buildMappedCompoundsByHerb(compoundMapRows)
  const { topology } = buildResearchQualitySnapshot(process.cwd())
  const canonicalHumanByUrl = new Map(
    topology.underlyingStudyIndependence.profiles.map((profile) => [profile.url, profile] as const),
  )

  return herbRecords
    .filter((herb: RuntimeRecord) => getRuntimeVisibility(herb).canRender)
    .map((herb: RuntimeRecord) => {
      const record = toAtlasRecord(herb)
      const profile = canonicalHumanByUrl.get(`/herbs/${herb.slug}/`)
      return {
        ...record,
        evidence: atlasEvidenceFromGrade(getEvidenceLetterGrade(herb)),
        humanEvidenceCount: profile?.primaryHumanUnderlyingStudyCount ?? record.humanEvidenceCount,
      }
    })
    .map((record: BotanicalAtlasRecord) => enrichAtlasRecordWithMappedCompounds(record, mappedCompoundsByHerb.get(record.slug)))
    .filter((herb: BotanicalAtlasRecord) => herb.effects.length || herb.compounds.length || herb.safety.length)
    .sort((a: BotanicalAtlasRecord, b: BotanicalAtlasRecord) => a.name.localeCompare(b.name))
})
