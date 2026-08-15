import { describe, expect, it } from 'vitest'
import { parseCanonicalPublicationRecord, requireCanonicalPublicationRecord } from '../canonical-content'
import type { RuntimeRecord } from '../../types/content'

describe('canonical publication content boundary', () => {
  it('normalizes legacy aliases into one typed publication shape', () => {
    const record: RuntimeRecord = {
      slug: 'ashwagandha',
      name: 'Ashwagandha',
      scientific_name: 'Withania somnifera',
      synonyms: 'Indian ginseng|winter cherry',
      evidence_grade: 'B+',
      primary_effects: ['stress', 'sleep'],
      mechanisms: 'HPA-axis modulation; GABAergic signaling',
      contraindications: 'pregnancy|thyroid medication review',
      interactions: ['sedatives'],
      dose: '300–600 mg/day standardized extract',
      preparation: 'root extract',
      profile_status: 'complete',
      summary_quality: 'strong',
    }

    const result = parseCanonicalPublicationRecord(record, 'herb')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value).toMatchObject({
      id: 'herb:ashwagandha',
      slug: 'ashwagandha',
      entityType: 'herb',
      name: 'Ashwagandha',
      scientificName: 'Withania somnifera',
      evidence: { grade: 'B' },
      dosing: {
        studiedDose: '300–600 mg/day standardized extract',
        preparation: 'root extract',
      },
    })
    expect(result.value.aliases).toEqual(expect.arrayContaining(['Indian ginseng', 'winter cherry', 'Withania somnifera']))
    expect(result.value.outcomes).toEqual(['stress', 'sleep'])
    expect(result.value.mechanisms).toEqual(['HPA-axis modulation', 'GABAergic signaling'])
    expect(result.value.safety.contraindications).toEqual(['pregnancy', 'thyroid medication review'])
  })

  it('fails closed before rendering malformed canonical slugs', () => {
    const result = parseCanonicalPublicationRecord({ slug: 'Bad Slug', name: 'Bad record' }, 'compound')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'slug', code: 'invalid' }),
    ]))
  })

  it('requires a usable display name', () => {
    const result = parseCanonicalPublicationRecord({ slug: 'unnamed-record', name: '' }, 'herb')
    // The canonical boundary may use the slug as the final human-readable fallback,
    // but it must still return a stable non-empty name rather than undefined.
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.name).toBe('unnamed-record')
  })

  it('throws an auditable validation message when callers require a malformed record', () => {
    expect(() => requireCanonicalPublicationRecord({ slug: '***' }, 'compound')).toThrow(/slug:/i)
  })
})
