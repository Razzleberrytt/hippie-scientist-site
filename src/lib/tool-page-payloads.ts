import type { RuntimeRecord } from '@/src/types/content'

type ToolKind = 'herb' | 'compound'

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function firstText(record: RuntimeRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = text(record[key])
    if (value) return value
  }
  return undefined
}

function textList(value: unknown): string[] | undefined {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[;,\n]+/)
      : []
  const cleaned = list.map(text).filter((item): item is string => Boolean(item))
  return cleaned.length ? cleaned : undefined
}

function baseToolRecord(record: RuntimeRecord, type: ToolKind) {
  return {
    slug: firstText(record, ['slug']) || '',
    name: firstText(record, ['displayName', 'name', 'compoundName', 'canonicalCompoundName', 'slug']) || '',
    displayName: firstText(record, ['displayName']),
    type,
  }
}

export function toDosingToolRecord(record: RuntimeRecord, type: ToolKind) {
  return {
    ...baseToolRecord(record, type),
    dosage: firstText(record, ['dosage', 'dose']),
    administration: firstText(record, ['administration', 'time_of_day']),
    cycling: firstText(record, ['cycling', 'cycling_notes']),
  }
}

export function toBuyingToolRecord(record: RuntimeRecord, type: ToolKind) {
  return {
    ...baseToolRecord(record, type),
    buying_criteria: textList(record.buying_criteria ?? record.buyingCriteria),
    amazon_affiliate_url: firstText(record, ['amazon_affiliate_url', 'amazonAffiliateUrl']),
    affiliate_url: firstText(record, ['affiliate_url', 'affiliateUrl']),
    affiliate_query: firstText(record, ['affiliate_query', 'affiliateQuery']),
    affiliate_label: firstText(record, ['affiliate_label', 'affiliateLabel']),
    standardization: firstText(record, ['standardization', 'standardized_extract', 'active_compounds']),
    best_for: firstText(record, ['best_for', 'bestFor']) || textList(record.primary_effects)?.join('; '),
  }
}

export function toSafetyToolRecord(record: RuntimeRecord, type: ToolKind) {
  return {
    ...baseToolRecord(record, type),
    safety: firstText(record, ['safety', 'safetyNotes', 'safety_notes']),
    safety_flags: textList(record.safety_flags ?? record.safetyFlags),
    mechanism: firstText(record, ['mechanism', 'mechanismOfAction']),
    mechanisms: textList(record.mechanisms ?? record.primary_mechanisms ?? record.pathways),
  }
}
