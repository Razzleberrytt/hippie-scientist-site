import { recordDevMessage } from '@/utils/devMessages'

export type SanitizedEntityKind = 'herb' | 'compound'

export type SanitizationIssue = {
  kind: SanitizedEntityKind
  id: string
  issues: string[]
}

type SanitizeOptions = {
  debug?: boolean
}

const NULLISH_STRINGS = new Set(['nan', 'null', 'undefined', 'n/a', 'na'])
const PLACEHOLDER_STRINGS = new Set([
  '[object object]',
  '[objectobject]',
  'placeholder',
  'unknown',
  'none',
  'tbd',
  'to be determined',
  'not established',
  'insufficient data',
  'data pending',
  'no direct data',
])
const NUMERIC_ONLY_NAME = /^\d+(?:[\s.,/-]\d+)*$/

const FIELD_ALIASES: Record<SanitizedEntityKind, Record<string, string>> = {
  herb: {
    commonName: 'common',
    latin: 'scientific',
    latinName: 'scientific',
    scientificName: 'scientific',
    sideEffects: 'sideeffects',
    legalstatus: 'legalStatus',
    mechanismOfAction: 'mechanism',
    summary: 'description',
    class: 'category',
    active_compounds: 'activeCompounds',
    compounds: 'activeCompounds',
  },
  compound: {
    foundIn: 'herbs',
    foundInHerbs: 'herbs',
    associatedHerbs: 'herbs',
    type: 'className',
    class: 'className',
    mechanismOfAction: 'mechanism',
    summary: 'description',
    updatedAt: 'lastUpdated',
  },
}

function sanitizeString(value: unknown): string {
  if (value == null) return ''
  const text = String(value).trim()
  if (!text) return ''
  const lower = text.toLowerCase()
  if (NULLISH_STRINGS.has(lower)) return ''
  if (PLACEHOLDER_STRINGS.has(lower)) return ''
  if (NUMERIC_ONLY_NAME.test(text)) return ''
  return text
}

function getDisplayName(data: Record<string, unknown>): string {
  return sanitizeString(data.name ?? data.common ?? data.commonName ?? data.scientific ?? data.latin)
}

export function hasInvalidEntityName(data: Record<string, unknown>): boolean {
  const name = getDisplayName(data)
  if (!name) return true

  const normalized = name.toLowerCase()
  if (normalized === '[object object]') return true
  if (NUMERIC_ONLY_NAME.test(name)) return true

  return false
}

function normalizeToArray(value: unknown): string[] {
  const out: string[] = []

  const push = (entry: unknown) => {
    const clean = sanitizeString(entry)
    if (clean) out.push(clean)
  }

  const visit = (entry: unknown) => {
    if (Array.isArray(entry)) {
      entry.forEach(visit)
      return
    }

    if (typeof entry === 'string') {
      const parts = entry.split(/[\n,;|]/).map(part => part.trim())
      parts.forEach(push)
      return
    }

    push(entry)
  }

  visit(value)
  return dedupeArray(out)
}

function dedupeArray(values: string[]): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  values.forEach(value => {
    const normalized = value.toLowerCase()
    if (seen.has(normalized)) return
    seen.add(normalized)
    output.push(value)
  })

  return output
}

function normalizeFields(
  raw: Record<string, unknown>,
  kind: SanitizedEntityKind
): Record<string, unknown> {
  const aliases = FIELD_ALIASES[kind]
  const normalized: Record<string, unknown> = { ...raw }

  Object.entries(aliases).forEach(([alias, canonical]) => {
    if (normalized[canonical] == null && normalized[alias] != null) {
      normalized[canonical] = normalized[alias]
    }
  })

  return normalized
}

function reportIssues(kind: SanitizedEntityKind, data: Record<string, unknown>): string[] {
  const issues: string[] = []
  const id = sanitizeString(data.id ?? data.slug ?? data.name)

  if (!id) issues.push('Missing id/slug/name')
  if (!getDisplayName(data)) {
    issues.push('Missing display name')
  }

  if (hasInvalidEntityName(data)) {
    issues.push('Invalid display name')
  }

  if (kind === 'compound' && normalizeToArray(data.herbs).length === 0) {
    issues.push('No linked herbs')
  }

  return issues
}

export function sanitizeEntityRecord<T extends Record<string, unknown>>(
  raw: T,
  kind: SanitizedEntityKind,
  listFields: string[],
  options?: SanitizeOptions
): { data: Record<string, unknown>; issue?: SanitizationIssue } {
  const normalized = normalizeFields(raw, kind)
  const cleaned: Record<string, unknown> = {}

  Object.entries(normalized).forEach(([key, value]) => {
    if (listFields.includes(key)) {
      cleaned[key] = normalizeToArray(value)
      return
    }

    if (Array.isArray(value)) {
      cleaned[key] = normalizeToArray(value)
      return
    }

    if (value == null) {
      cleaned[key] = ''
      return
    }

    if (typeof value === 'string') {
      cleaned[key] = sanitizeString(value)
      return
    }

    cleaned[key] = value
  })

  const issues = reportIssues(kind, cleaned)
  const id = sanitizeString(cleaned.id ?? cleaned.slug ?? cleaned.name) || 'unknown'

  if (options?.debug && issues.length) {
    recordDevMessage('warning', `[sanitizeData] ${kind}:${id}`, issues)
  }

  return {
    data: cleaned,
    issue: issues.length ? { kind, id, issues } : undefined,
  }
}

export function sanitizeHerbRecord(
  raw: Record<string, unknown>,
  options?: SanitizeOptions
): { data: Record<string, unknown>; issue?: SanitizationIssue } {
  return sanitizeEntityRecord(
    raw,
    'herb',
    [
      'effects',
      'contraindications',
      'interactions',
      'sideeffects',
      'sideEffects',
      'interactionTags',
      'interactionNotes',
      'therapeuticUses',
      'activeCompounds',
      'compounds',
      'active_compounds',
    ],
    options
  )
}

export function sanitizeCompoundRecord(
  raw: Record<string, unknown>,
  options?: SanitizeOptions
): { data: Record<string, unknown>; issue?: SanitizationIssue } {
  return sanitizeEntityRecord(
    raw,
    'compound',
    [
      'effects',
      'therapeuticUses',
      'contraindications',
      'interactions',
      'interactionTags',
      'interactionNotes',
      'activeCompounds',
      'sideEffects',
      'herbs',
      'foundIn',
      'foundInHerbs',
      'associatedHerbs',
    ],
    options
  )
}
