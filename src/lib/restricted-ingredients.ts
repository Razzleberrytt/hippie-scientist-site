import { text } from '@/lib/display-utils'

const RESTRICTED_TERMS = [
  '5-meo-dmt',
  '5 meo dmt',
  '7-hydroxymitragynine',
  '7 hydroxymitragynine',
  '7-oh-mitragynine',
  '7 oh mitragynine',
  '7-oh',
  'amanita muscaria',
  'anabasine',
  'anatabine',
  'dmt',
  'fadogia',
  'fadogia agrestis',
  'hawaiian baby woodrose',
  'harmaline',
  'harmine',
  'ibogaine',
  'ketamine',
  'kratom',
  'lobeline',
  'lsa',
  'mescaline',
  'mitragynine',
  'morning glory',
  'nicotiana glauca',
  'nicotiana tabacum',
  'noopept',
  'psilocybin',
  'salvinorin',
  'sinicuichi',
  'tetrahydroharmine',
  'thc',
  'thcv',
]

const RESTRICTED_STATUS_PATTERNS = [
  /schedule\s*i\b/i,
  /schedule\s*1\b/i,
  /dea\s*watch\s*list/i,
  /dea\s*watchlist/i,
  /controlled\s*substance/i,
]

function normalize(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function flagEnabled(value: unknown) {
  if (value === true) return true
  if (value === false || value == null) return false
  const normalized = text(value).toLowerCase()
  return /^(true|yes|y|1|blocked|restricted)$/i.test(normalized)
}

export function isRestrictedIngredient(value: unknown) {
  const normalized = normalize(value)
  if (!normalized) return false

  return RESTRICTED_TERMS.some((term) => {
    const normalizedTerm = normalize(term)
    return normalized === normalizedTerm || normalized.includes(normalizedTerm)
  })
}

export function isRestrictedRecord(record: any) {
  if (!record) return false
  if (flagEnabled(record.doNotMonetize) || flagEnabled(record.do_not_monetize)) return true
  if (flagEnabled(record.doNotPromote) || flagEnabled(record.do_not_promote)) return true

  const governanceStatus = [
    record.governance_status,
    record.governanceStatus,
    record.legal_status,
    record.legalStatus,
    record.controlled_status,
    record.controlledStatus,
    record.controlled_schedule,
    record.controlledSchedule,
    record.schedule,
    record.dea_status,
    record.deaStatus,
    record.dea_watchlist_status,
    record.deaWatchlistStatus,
    record.regulatory_status,
    record.regulatoryStatus,
    record.safety_level,
  ].map(text).join(' ')

  if (RESTRICTED_STATUS_PATTERNS.some((pattern) => pattern.test(governanceStatus))) return true

  return [
    record.slug,
    record.name,
    record.displayName,
    record.compoundName,
    record.canonicalCompoundName,
    record.scientific_name,
    record.botanical_name,
    record.affiliate_query,
    record.affiliateQuery,
    record.amazon_affiliate_url,
    record.amazonAffiliateUrl,
    record.affiliate_url,
    record.affiliateUrl,
    record.product_url,
    record.summary,
    record.description,
    record.safety,
    record.active_constituents,
    record.compound_profile,
  ].some(isRestrictedIngredient)
}
