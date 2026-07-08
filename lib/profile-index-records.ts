import type { RuntimeRecord } from '@/src/types/content'

const INDEX_RECORD_KEYS = [
  'slug',
  'name',
  'displayName',
  'compoundName',
  'canonicalCompoundName',
  'common',
  'scientific',
  'region',
  'short_earthy_summary',
  'shortEarthySummary',
  'summary',
  'coreInsight',
  'hero',
  'description',
  'generated_description',
  'primary_effects',
  'primaryEffects',
  'primaryActions',
  'effects',
  'primaryDomain',
  'mechanisms',
  'primary_mechanisms',
  'pathways',
  'activeCompounds',
  'traditionalUses',
  'traditional_uses',
  'evidence_tier',
  'evidenceTier',
  'evidence_grade',
  'evidenceLevel',
  'humanEvidenceLevel',
  'summary_quality',
  'safety_level',
  'safetyLevel',
  'safetyStatus',
  'contraindicationLevel',
  'confidence',
  'profile_status',
  'status',
  'safetyNotes',
  'safety_notes',
  'safety',
  'interactions',
  'interaction_notes',
  'interaction_cautions',
  'cautions',
  'contraindications',
  'side_effects',
  'targets',
  'compoundClass',
  'class',
  'foundIn',
] as const

function compactString(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 240)
}

function compactValue(value: unknown): unknown {
  if (value === null || value === undefined) return undefined

  if (typeof value === 'string') {
    const compact = compactString(value)
    return compact || undefined
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value

  if (Array.isArray(value)) {
    const compact = value
      .map((item) => compactValue(item))
      .filter((item) => item !== undefined)
      .slice(0, 8)
    return compact.length ? compact : undefined
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [key, nestedValue] of Object.entries(value)) {
      const compactNested = compactValue(nestedValue)
      if (compactNested !== undefined) output[key] = compactNested
    }
    return Object.keys(output).length ? output : undefined
  }

  return undefined
}

export function toLeanProfileIndexRecord(record: RuntimeRecord): RuntimeRecord {
  const output: Record<string, unknown> = {}

  for (const key of INDEX_RECORD_KEYS) {
    const compact = compactValue(record[key])
    if (compact !== undefined) output[key] = compact
  }

  return output as RuntimeRecord
}

export function toLeanProfileIndexRecords(records: RuntimeRecord[]): RuntimeRecord[] {
  return records.map(toLeanProfileIndexRecord)
}
