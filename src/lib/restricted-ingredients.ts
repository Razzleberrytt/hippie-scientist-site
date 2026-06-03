import { text } from '@/lib/display-utils'

const RESTRICTED_TERMS = [
  '5-meo-dmt',
  '5 meo dmt',
  '7-hydroxymitragynine',
  '7 hydroxymitragynine',
  '7-oh-mitragynine',
  '7 oh mitragynine',
  '7-oh',
  'dmt',
  'hawaiian baby woodrose',
  'harmaline',
  'harmine',
  'ibogaine',
  'ketamine',
  'kratom',
  'lsa',
  'mescaline',
  'morning glory',
  'nicotiana glauca',
  'nicotiana tabacum',
  'psilocybin',
  'salvinorin',
  'sinicuichi',
  'tetrahydroharmine',
]

function normalize(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
  ].some(isRestrictedIngredient)
}
