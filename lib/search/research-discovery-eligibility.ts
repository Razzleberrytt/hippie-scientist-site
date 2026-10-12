import { isRestrictedIngredient, isRestrictedRecord } from '@/lib/restricted-ingredients'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

// Safety holds govern shopping and recommendations, not the ability to read
// published educational evidence. This narrowly scoped exception preserves
// the existing hard block for controlled/restricted substances elsewhere.
const BATCH8_EDUCATION_SLUGS = new Set([
  'black-cohosh', 'green-tea-extract', 'green-tea-extract-egcg',
  'holy-basil', 'holy-basil-seed', 'holy-basil-purple', 'damiana',
  'saffron', 'saw-palmetto', 'eleuthero', 'nettle-root',
])

export function canDiscoverResearchProfile(record: Record<string, unknown>): boolean {
  if (!record || typeof record !== 'object') return false
  if (!isRestrictedRecord(record)) return true
  const slug = String(record.slug ?? '').trim().toLowerCase()
  if (BATCH8_EDUCATION_SLUGS.has(slug)) return getRuntimeVisibility(record).canRender

  // The monetization filter scans descriptions and safety text. An otherwise
  // ordinary compound is not a controlled substance merely because its
  // summary mentions a held ingredient (e.g., crocin mentioning saffron).
  // Keep exclusions for restricted primary identities and explicit controls.
  const primaryName = String(record.name ?? record.displayName ?? '')
  if (isRestrictedIngredient(slug) || isRestrictedIngredient(primaryName)) return false
  const explicitHold = [record.doNotPromote, record.do_not_promote,
    record.doNotMonetize, record.do_not_monetize].some(value =>
    value === true || /^(true|yes|y|1|blocked|restricted)$/i.test(String(value ?? '').trim()))
  const regulatory = [record.legal_status, record.legalStatus, record.controlled_status,
    record.controlledStatus, record.schedule, record.dea_status, record.regulatory_status]
    .map(value => String(value ?? '')).join(' ')
  if (explicitHold || /controlled substance|schedule\s*(?:i|1)\b|dea\s*watch\s*list/i.test(regulatory)) return false
  return getRuntimeVisibility(record).canRender
}
