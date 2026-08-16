import { getEvidenceLetterGrade } from '../../lib/evidence'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import type { RuntimeRecord } from '../types/content'

export type CanonicalEntityType = 'herb' | 'compound'
export type CanonicalEvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'Avoid/Insufficient' | 'Unassigned'

export type CanonicalPublicationRecord = {
  id: string
  slug: string
  entityType: CanonicalEntityType
  name: string
  scientificName?: string
  aliases: string[]
  summary: string
  outcomes: string[]
  mechanisms: string[]
  evidence: {
    grade: CanonicalEvidenceGrade
    confidence?: string
    summary?: string
  }
  safety: {
    summary?: string
    cautions: string[]
    contraindications: string[]
    interactions: string[]
  }
  dosing: {
    studiedDose?: string
    preparation?: string
    onset?: string
    duration?: string
  }
  visibility: {
    canRender: boolean
    canIndex: boolean
    canFeature: boolean
    canMonetize: boolean
  }
}

export type CanonicalContentIssue = {
  field: string
  code: 'missing' | 'invalid'
  message: string
}

export type CanonicalContentResult =
  | { ok: true; value: CanonicalPublicationRecord; issues: [] }
  | { ok: false; value: null; issues: CanonicalContentIssue[] }

function firstString(record: RuntimeRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function strings(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[|;,]/) : []
  return [...new Set(raw.map(item => String(item).trim()).filter(Boolean))]
}

function stringsFrom(record: RuntimeRecord, keys: string[]): string[] {
  return [...new Set(keys.flatMap(key => strings(record[key])))]
}

function canonicalGrade(record: RuntimeRecord): CanonicalEvidenceGrade {
  return getEvidenceLetterGrade(record)
}

function resolveName(record: RuntimeRecord, entityType: CanonicalEntityType): string {
  if (entityType === 'herb') {
    return firstString(record, ['displayName', 'name', 'commonName', 'common', 'nameNorm', 'slug'])
  }
  return firstString(record, ['displayName', 'name', 'canonicalCompoundName', 'compoundName', 'slug'])
}

function resolveScientificName(record: RuntimeRecord): string {
  return firstString(record, ['scientific_name', 'scientificName', 'scientificname', 'latin_name', 'latinName', 'botanical_name'])
}

function resolveAliases(record: RuntimeRecord, name: string, scientificName: string): string[] {
  return [...new Set([
    ...stringsFrom(record, ['aliases', 'synonyms', 'common_names', 'commonnames', 'historical_names']),
    firstString(record, ['commonName', 'common']),
    scientificName,
  ].map(item => String(item || '').trim()).filter(item => item && item !== name))]
}

export function parseCanonicalPublicationRecord(
  record: RuntimeRecord,
  entityType: CanonicalEntityType,
): CanonicalContentResult {
  const issues: CanonicalContentIssue[] = []
  const slug = typeof record?.slug === 'string' ? record.slug.trim() : ''
  if (!slug) issues.push({ field: 'slug', code: 'missing', message: 'Canonical publication records require a slug.' })
  else if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    issues.push({ field: 'slug', code: 'invalid', message: `Invalid canonical slug: ${slug}` })
  }

  const name = resolveName(record, entityType)
  if (!name) issues.push({ field: 'name', code: 'missing', message: 'Canonical publication records require a display name.' })
  if (issues.length) return { ok: false, value: null, issues }

  const scientificName = resolveScientificName(record)
  const visibility = getRuntimeVisibility(record)
  const summary = firstString(record, ['summary', 'description', 'evidence_summary'])
  const safetySummary = firstString(record, ['safetyNotes', 'safety_notes', 'safety', 'safety_summary'])

  return {
    ok: true,
    issues: [],
    value: {
      id: firstString(record, ['canonical_id', 'canonicalId', 'id']) || `${entityType}:${slug}`,
      slug,
      entityType,
      name,
      scientificName: scientificName || undefined,
      aliases: resolveAliases(record, name, scientificName),
      summary,
      outcomes: stringsFrom(record, ['primary_effects', 'effects', 'clinical_outcomes', 'outcomes']),
      mechanisms: stringsFrom(record, ['mechanisms', 'primary_mechanisms', 'pathways']),
      evidence: {
        grade: canonicalGrade(record),
        confidence: firstString(record, ['evidence_confidence', 'confidence']) || undefined,
        summary: firstString(record, ['evidence_summary', 'evidence_rationale']) || undefined,
      },
      safety: {
        summary: safetySummary || undefined,
        cautions: stringsFrom(record, ['cautions', 'warnings', 'safety_flags']),
        contraindications: stringsFrom(record, ['contraindications', 'avoid_if', 'avoidIf']),
        interactions: stringsFrom(record, ['interactions', 'drugInteractions', 'interactionNotes']),
      },
      dosing: {
        studiedDose: firstString(record, ['studied_dose', 'dose', 'dosage', 'dosing', 'minimum_effective_dose']) || undefined,
        preparation: firstString(record, ['preparation', 'preparationsText', 'extract', 'extract_name']) || undefined,
        onset: firstString(record, ['time_to_effect', 'onset', 'timeline']) || undefined,
        duration: firstString(record, ['duration', 'study_duration']) || undefined,
      },
      visibility: {
        canRender: visibility.canRender,
        canIndex: visibility.canIndex,
        canFeature: visibility.canFeature,
        canMonetize: visibility.canMonetize,
      },
    },
  }
}

export function requireCanonicalPublicationRecord(
  record: RuntimeRecord,
  entityType: CanonicalEntityType,
): CanonicalPublicationRecord {
  const parsed = parseCanonicalPublicationRecord(record, entityType)
  if (parsed.ok) return parsed.value
  throw new Error(parsed.issues.map(issue => `${issue.field}: ${issue.message}`).join('; '))
}
