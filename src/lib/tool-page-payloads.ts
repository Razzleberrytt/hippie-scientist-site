import type { RuntimeRecord } from '@/src/types/content'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

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

function booleanValue(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase()
  if (['yes', 'true', '1', 'available', 'verified', 'tested'].includes(normalized)) return true
  if (['no', 'false', '0', 'unavailable', 'not verified', 'not tested'].includes(normalized)) return false
  return undefined
}

function firstBoolean(record: RuntimeRecord, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = booleanValue(record[key])
    if (value !== undefined) return value
  }
  return undefined
}

function textList(value: unknown): string[] | undefined {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[;,\n]+/)
      : []
  const seen = new Set<string>()
  const cleaned = list
    .map(text)
    .filter((item): item is string => Boolean(item))
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  return cleaned.length ? cleaned : undefined
}

function mergedTextList(record: RuntimeRecord, keys: string[]): string[] | undefined {
  const values = keys.flatMap((key) => textList(record[key]) || [])
  return textList(values)
}

function safetyContext(record: RuntimeRecord): string | undefined {
  const values = [
    firstText(record, ['safety', 'safetyNotes', 'safety_notes']),
    ...(textList(record.contraindications) || []),
    ...(textList(record.interactions ?? record.drugInteractions) || []),
  ].filter((item): item is string => Boolean(item))

  const seen = new Set<string>()
  const unique = values.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.length ? unique.join('; ') : undefined
}

function baseToolRecord(record: RuntimeRecord, type: ToolKind) {
  return {
    slug: firstText(record, ['slug']) || '',
    name: firstText(record, ['displayName', 'name', 'compoundName', 'canonicalCompoundName', 'slug']) || '',
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
  const standardization = firstText(record, ['standardization', 'standardized_extract', 'active_compounds'])
  const studiedForm = firstText(record, ['studied_form', 'studiedForm', 'clinically_studied_form', 'clinicallyStudiedForm', 'extract_type', 'extractType'])
  const activeMarker = firstText(record, ['active_marker', 'activeMarker', 'marker_compound', 'markerCompound', 'standardized_to', 'standardizedTo'])
  const elementalAmount = firstText(record, ['elemental_amount', 'elementalAmount', 'elemental_mg', 'elementalMg'])

  return {
    ...baseToolRecord(record, type),
    monetization_allowed: getRuntimeVisibility(record).canMonetize,
    buying_criteria: textList(record.buying_criteria ?? record.buyingCriteria),
    amazon_affiliate_url: firstText(record, ['amazon_affiliate_url', 'amazonAffiliateUrl']),
    affiliate_url: firstText(record, ['affiliate_url', 'affiliateUrl']),
    affiliate_query: firstText(record, ['affiliate_query', 'affiliateQuery']),
    affiliate_label: firstText(record, ['affiliate_label', 'affiliateLabel']),
    standardization,
    studied_form: studiedForm,
    active_marker: activeMarker,
    elemental_amount: elementalAmount,
    third_party_testing: firstBoolean(record, ['third_party_testing', 'thirdPartyTesting', 'independent_testing', 'independentTesting']),
    coa_available: firstBoolean(record, ['coa_available', 'coaAvailable', 'certificate_of_analysis', 'certificateOfAnalysis']),
    contaminant_testing: firstBoolean(record, ['contaminant_testing', 'contaminantTesting', 'heavy_metal_testing', 'heavyMetalTesting']),
    adulteration_controls: firstBoolean(record, ['adulteration_controls', 'adulterationControls', 'identity_testing', 'identityTesting']),
    proprietary_blend: firstBoolean(record, ['proprietary_blend', 'proprietaryBlend']),
    formulation_verified: firstBoolean(record, ['formulation_verified', 'formulationVerified', 'current_formulation_verified', 'currentFormulationVerified']),
    best_for: firstText(record, ['best_for', 'bestFor']) || textList(record.primary_effects)?.join('; '),
  }
}

export function toSafetyToolRecord(record: RuntimeRecord, type: ToolKind) {
  const safety = safetyContext(record)
  const safetyFlags = textList(record.safety_flags ?? record.safetyFlags)
  const mechanisms = textList(record.mechanisms ?? record.primary_mechanisms ?? record.pathways)
  const sources = mergedTextList(record, [
    'safety_sources',
    'safetySources',
    'interaction_sources',
    'interactionSources',
    'references',
    'citations',
    'source_urls',
    'sourceUrls',
  ])

  return {
    ...baseToolRecord(record, type),
    safety,
    safety_flags: safetyFlags,
    mechanism: firstText(record, ['mechanism', 'mechanismOfAction']),
    mechanisms,
    interaction_evidence: firstText(record, ['interaction_evidence', 'interactionEvidence', 'interaction_confidence', 'interactionConfidence']),
    interaction_type: firstText(record, ['interaction_type', 'interactionType', 'interaction_mechanism', 'interactionMechanism']),
    sources,
    incomplete_safety_data: !safety && !safetyFlags?.length && !mechanisms?.length,
  }
}
