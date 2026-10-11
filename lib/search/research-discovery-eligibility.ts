import { isRestrictedRecord } from '@/lib/restricted-ingredients'
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
  return BATCH8_EDUCATION_SLUGS.has(slug) && getRuntimeVisibility(record).canRender
}
